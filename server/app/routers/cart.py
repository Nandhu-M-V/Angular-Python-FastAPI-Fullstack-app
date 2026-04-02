from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import CartItem
from app.schemas.cart import CartItemCreate, CartItemOut
from sqlalchemy.orm import joinedload


router = APIRouter()


@router.get("/{user_id}", response_model=list[CartItemOut])
def get_cart(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(CartItem)
        .options(joinedload(CartItem.product))  # 🔥 THIS is key
        .filter(CartItem.user_id == user_id)
        .all()
    )


@router.post("/")
def add_to_cart(item: CartItemCreate, db: Session = Depends(get_db)):
    new_item = CartItem(**item.model_dump())
    db.add(new_item)
    db.commit()
    return new_item


@router.delete("/{item_id}")
def remove_from_cart(item_id: int, db: Session = Depends(get_db)):
    item = db.query(CartItem).get(item_id)
    db.delete(item)
    db.commit()
    return {"message": "Removed"}
