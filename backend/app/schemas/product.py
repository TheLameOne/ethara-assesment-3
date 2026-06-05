from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, field_validator


class ProductBase(BaseModel):
    name: str
    sku: str
    price: Decimal
    quantity_in_stock: int

    @field_validator("price")
    @classmethod
    def price_positive(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @field_validator("quantity_in_stock")
    @classmethod
    def qty_non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Quantity cannot be negative")
        return v


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    sku: str | None = None
    price: Decimal | None = None
    quantity_in_stock: int | None = None

    @field_validator("price")
    @classmethod
    def price_positive(cls, v: Decimal | None) -> Decimal | None:
        if v is not None and v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @field_validator("quantity_in_stock")
    @classmethod
    def qty_non_negative(cls, v: int | None) -> int | None:
        if v is not None and v < 0:
            raise ValueError("Quantity cannot be negative")
        return v


class ProductResponse(ProductBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
