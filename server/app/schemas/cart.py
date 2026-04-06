# app/schemas/cart.py
from pydantic import BaseModel
from app.schemas.product import ProductOut


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int


class CartItemOut(BaseModel):
    id: int
    user_id: int
    quantity: int
    product: ProductOut

    class Config:
        from_attributes = True
