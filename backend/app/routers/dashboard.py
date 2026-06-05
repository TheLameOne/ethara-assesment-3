from datetime import datetime, timedelta
from collections import defaultdict
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order, OrderItem

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

LOW_STOCK_THRESHOLD = 10


@router.get("")
def dashboard_summary(db: Session = Depends(get_db)):
    total_products = db.query(Product).count()
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()
    low_stock = db.query(Product).filter(Product.quantity_in_stock < LOW_STOCK_THRESHOLD).count()
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or Decimal("0")
    avg_order_value = db.query(func.avg(Order.total_amount)).scalar() or Decimal("0")
    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products": low_stock,
        "total_revenue": float(total_revenue),
        "avg_order_value": float(avg_order_value),
    }


def _last_6_months():
    """Return list of YYYY-MM strings for last 6 months (oldest first)."""
    months = []
    now = datetime.utcnow()
    year, month = now.year, now.month
    for _ in range(6):
        months.append(f"{year}-{month:02d}")
        month -= 1
        if month == 0:
            month = 12
            year -= 1
    return list(reversed(months))


@router.get("/analytics")
def dashboard_analytics(db: Session = Depends(get_db)):
    # --- Monthly revenue + order count (last 6 months, Python-side grouping) ---
    six_months_ago = datetime.utcnow() - timedelta(days=183)
    orders = (
        db.query(Order.created_at, Order.total_amount)
        .filter(Order.created_at >= six_months_ago)
        .all()
    )

    monthly_map = defaultdict(lambda: {"revenue": 0.0, "order_count": 0})
    for created_at, total_amount in orders:
        key = created_at.strftime("%Y-%m")
        monthly_map[key]["revenue"] += float(total_amount)
        monthly_map[key]["order_count"] += 1

    monthly_revenue = []
    for key in _last_6_months():
        monthly_revenue.append(
            {
                "month": key,
                "revenue": round(monthly_map[key]["revenue"], 2),
                "order_count": monthly_map[key]["order_count"],
            }
        )

    # --- Top 5 products by revenue ---
    top_rows = (
        db.query(
            Product.name,
            func.sum(OrderItem.quantity).label("total_sold"),
            func.sum(OrderItem.unit_price * OrderItem.quantity).label("total_revenue"),
        )
        .join(OrderItem, OrderItem.product_id == Product.id)
        .group_by(Product.id, Product.name)
        .order_by(func.sum(OrderItem.unit_price * OrderItem.quantity).desc())
        .limit(5)
        .all()
    )

    top_products = [
        {
            "name": row.name,
            "total_sold": int(row.total_sold),
            "total_revenue": float(row.total_revenue),
        }
        for row in top_rows
    ]

    # --- Low stock items ---
    low_stock_items = (
        db.query(Product.name, Product.sku, Product.quantity_in_stock)
        .filter(Product.quantity_in_stock < LOW_STOCK_THRESHOLD)
        .order_by(Product.quantity_in_stock.asc())
        .all()
    )

    low_stock = [
        {"name": row.name, "sku": row.sku, "quantity_in_stock": row.quantity_in_stock}
        for row in low_stock_items
    ]

    return {
        "monthly_revenue": monthly_revenue,
        "top_products": top_products,
        "low_stock_items": low_stock,
    }
