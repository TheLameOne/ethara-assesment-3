from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, field_validator
from app.schemas.customer import CustomerResponse
from app.schemas.product import ProductResponse


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

    @field_validator("quantity")
    @classmethod
    def qty_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Quantity must be at least 1")
        return v


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    product: ProductResponse

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    customer_id: int
    items: list[OrderItemCreate]

    @field_validator("items")
    @classmethod
    def items_not_empty(cls, v: list) -> list:
        if not v:
            raise ValueError("Order must contain at least one item")
        return v


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    total_amount: Decimal
    created_at: datetime
    customer: CustomerResponse
    items: list[OrderItemResponse]

    model_config = {"from_attributes": True}


class OrderSummary(BaseModel):
    id: int
    customer_id: int
    total_amount: Decimal
    created_at: datetime
    customer: CustomerResponse

    model_config = {"from_attributes": True}
