from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

LOW_STOCK_THRESHOLD = 10


@router.get("")
def dashboard_summary(db: Session = Depends(get_db)):
    total_products = db.query(Product).count()
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()
    low_stock = db.query(Product).filter(Product.quantity_in_stock < LOW_STOCK_THRESHOLD).count()
    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products": low_stock,
    }
