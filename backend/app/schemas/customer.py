from datetime import datetime
from pydantic import BaseModel, EmailStr


class CustomerBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str | None = None


class CustomerCreate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
