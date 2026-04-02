from pydantic import BaseModel
from datetime import datetime


class ReviewBase(BaseModel):
    user_id: int
    product_id: int
    rating: int
    comment: str


class ReviewCreate(ReviewBase):
    pass


class ReviewOut(ReviewBase):
    id: int
    date: datetime

    class Config:
        from_attributes = True
