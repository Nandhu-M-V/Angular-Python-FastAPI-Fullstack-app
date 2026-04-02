from pydantic import BaseModel
from typing import List
from datetime import datetime


class OrderItemBase(BaseModel):
    product_id: int
    quantity: int


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemOut(OrderItemBase):
    id: int
    price: float

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    user_id: int
    items: List[OrderItemCreate]


class OrderOut(BaseModel):
    id: int
    user_id: int
    total: float
    status: str
    date: datetime
    items: List[OrderItemOut]

    class Config:
        from_attributes = True
