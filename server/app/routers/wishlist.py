from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Wishlist
from app.schemas.wishlist import WishlistCreate


router = APIRouter()


@router.get("/{user_id}")
def get_wishlist(user_id: int, db: Session = Depends(get_db)):
    return db.query(Wishlist).filter(Wishlist.user_id == user_id).all()


@router.post("/")
def add_to_wishlist(item: WishlistCreate, db: Session = Depends(get_db)):
    new_item = Wishlist(**item.model_dump())
    db.add(new_item)
    db.commit()
    return new_item


@router.delete("/{id}")
def remove_wishlist(id: int, db: Session = Depends(get_db)):
    item = db.query(Wishlist).get(id)
    db.delete(item)
    db.commit()
    return {"message": "Removed"}
