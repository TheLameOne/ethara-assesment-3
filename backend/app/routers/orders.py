from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, with_for_update

from app.database import get_db
from app.models.customer import Customer
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderResponse, OrderSummary

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    # Verify customer exists
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    total = Decimal("0")
    order_items = []

    # Lock products for update to prevent race conditions
    for item_in in payload.items:
        product = (
            db.execute(
                select(Product)
                .where(Product.id == item_in.product_id)
                .with_for_update()
            )
            .scalars()
            .first()
        )
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product with id {item_in.product_id} not found",
            )
        if product.quantity_in_stock < item_in.quantity:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Insufficient stock for '{product.name}': "
                    f"available {product.quantity_in_stock}, requested {item_in.quantity}"
                ),
            )
        line_total = Decimal(str(product.price)) * item_in.quantity
        total += line_total
        product.quantity_in_stock -= item_in.quantity
        order_items.append(
            OrderItem(
                product_id=product.id,
                quantity=item_in.quantity,
                unit_price=product.price,
            )
        )

    order = Order(customer_id=payload.customer_id, total_amount=total)
    db.add(order)
    db.flush()  # get order.id before adding items

    for oi in order_items:
        oi.order_id = order.id
        db.add(oi)

    db.commit()
    db.refresh(order)

    # Return with relationships loaded
    order = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .filter(Order.id == order.id)
        .first()
    )
    return order


@router.get("", response_model=list[OrderSummary])
def list_orders(db: Session = Depends(get_db)):
    return (
        db.query(Order)
        .options(joinedload(Order.customer))
        .order_by(Order.id.desc())
        .all()
    )


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Restore stock
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.quantity_in_stock += item.quantity

    db.delete(order)
    db.commit()
