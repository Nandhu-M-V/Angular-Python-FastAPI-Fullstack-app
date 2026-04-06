from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Wishlist
from app.schemas.wishlist import WishlistCreate
from app.dependency.protectedRoutes import get_current_user
from fastapi import HTTPException


router = APIRouter()


@router.get("/")
def get_wishlist(
    # user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Wishlist)
        # .filter(Wishlist.user_id == int(user["id"]))
        .all()
    )


@router.post("/")
def add_to_wishlist(
    item: WishlistCreate, user=Depends(get_current_user), db: Session = Depends(get_db)
):

    existing = (
        db.query(Wishlist)
        .filter(
            Wishlist.user_id == int(user["id"]), Wishlist.product_id == item.product_id
        )
        .first()
    )

    if existing:
        return existing  # avoid duplicates

    new_item = Wishlist(
        user_id=int(user["id"]), product_id=item.product_id  # 🔥 from JWT
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item


@router.delete("/{id}")
def remove_wishlist(
    id: int, user=Depends(get_current_user), db: Session = Depends(get_db)
):

    item = db.query(Wishlist).filter(Wishlist.id == id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if item.user_id != int(user["id"]):  # 🔥 security
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(item)
    db.commit()

    return {"message": "Removed"}
