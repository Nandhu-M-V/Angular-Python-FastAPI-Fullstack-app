from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


#  Base
class ProductBase(BaseModel):
    title: str
    price: float
    brand: Optional[str] = None
    rating: Optional[float] = 0
    stock: Optional[int] = 0
    description: Optional[str] = None
    images: Optional[List[str]] = None
    specs: Optional[Dict[str, Any]] = None
    category_id: int = 1


# Create
class ProductCreate(ProductBase):
    pass


# Update
class ProductUpdate(BaseModel):
    title: Optional[str] = None
    price: Optional[float] = None
    brand: Optional[str] = None
    rating: Optional[float] = None
    stock: Optional[int] = None
    description: Optional[str] = None
    images: Optional[List[str]] = None
    specs: Optional[Dict[str, Any]] = None
    category_id: Optional[int] = 1


# GET
class ProductOut(BaseModel):
    id: int
    title: str
    price: float
    images: Optional[List[str]]

    class Config:
        from_attributes = True
