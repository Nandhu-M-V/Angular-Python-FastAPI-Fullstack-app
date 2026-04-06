from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import CartItem
from app.schemas.cart import CartItemCreate, CartItemOut
from sqlalchemy.orm import joinedload
from app.dependency.protectedRoutes import get_current_user


router = APIRouter()


@router.get("/", response_model=list[CartItemOut])
def get_cart(
    # user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(CartItem).options(joinedload(CartItem.product))
        # .filter(CartItem.user_id == int(user["id"]))
        .all()
    )


@router.patch("/{cart_item_id}", response_model=CartItemOut)
def update_cart_item(
    cart_item_id: int,
    data: dict,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    cart_item = db.query(CartItem).filter(CartItem.id == cart_item_id).first()

    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if cart_item.user_id != int(user["id"]):
        raise HTTPException(status_code=403, detail="Not authorized")

    if "quantity" in data:
        cart_item.quantity = data["quantity"]

    db.commit()
    db.refresh(cart_item)

    return (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.id == cart_item.id)
        .first()
    )


# POST /cart
@router.post("/", response_model=CartItemOut)
def add_to_cart(
    item: CartItemCreate, user=Depends(get_current_user), db: Session = Depends(get_db)
):
    existing = (
        db.query(CartItem)
        .filter(
            CartItem.user_id == int(user["id"]), CartItem.product_id == item.product_id
        )
        .first()
    )

    if existing:
        existing.quantity += item.quantity
        db.commit()
        db.refresh(existing)
        cart_item = existing
    else:
        cart_item = CartItem(
            user_id=int(user["id"]),  # 🔥 use current user
            product_id=item.product_id,
            quantity=item.quantity,
        )
        db.add(cart_item)
        db.commit()
        db.refresh(cart_item)

    cart_item = (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.id == cart_item.id)
        .first()
    )

    return cart_item


@router.delete("/{item_id}")
def remove_from_cart(
    item_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)
):

    item = db.query(CartItem).filter(CartItem.id == item_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if item.user_id != int(user["id"]):  # 🔥 security
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(item)
    db.commit()

    return {"message": "Removed"}
