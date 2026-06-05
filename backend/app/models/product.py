import datetime
from sqlalchemy import Column, Integer, String, Numeric, DateTime
from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    price = Column(Numeric(12, 2), nullable=False)
    quantity_in_stock = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
