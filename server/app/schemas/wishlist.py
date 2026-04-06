from pydantic import BaseModel


# Base schema
class WishlistBase(BaseModel):
    product_id: int


# Create schema
class WishlistCreate(WishlistBase):
    pass


# Response schema
class WishlistOut(WishlistBase):
    id: int

    class Config:
        from_attributes = True
