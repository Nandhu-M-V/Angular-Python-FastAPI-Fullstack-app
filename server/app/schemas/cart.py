from pydantic import BaseModel
from app.schemas.product import ProductOut


class CartItemBase(BaseModel):
    user_id: int
    product_id: int
    quantity: int


class CartItemCreate(CartItemBase):
    pass


class CartItemOut(BaseModel):
    id: int
    user_id: int
    quantity: int
    product: ProductOut

    class Config:
        from_attributes = True
