from pydantic import BaseModel
from datetime import datetime


class UserBase(BaseModel):
    name: str
    email: str


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: int
    join_date: datetime

    class Config:
        from_attributes = True
