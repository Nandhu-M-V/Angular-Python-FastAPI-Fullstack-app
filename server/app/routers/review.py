from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Review, Product, User
from app.schemas.review import ReviewCreate, ReviewOut

router = APIRouter()


@router.get("/", response_model=list[ReviewOut])
def get_reviews(product_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Review, User).join(User, Review.user_id == User.id)

    if product_id is not None:
        query = query.filter(Review.product_id == product_id)

    results = query.all()

    return [
        {
            "id": review.id,
            "comment": review.comment,
            "rating": review.rating,
            "product_id": review.product_id,
            "user_id": user.id,
            "username": user.name,  # ✅ KEY FIX
            "date": review.date,
        }
        for review, user in results
    ]


@router.post("/", response_model=ReviewOut, status_code=201)
def create_review(review: ReviewCreate, db: Session = Depends(get_db)):

    product = db.query(Product).filter(Product.id == review.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    user = db.query(User).filter(User.id == review.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_review = Review(**review.model_dump())

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return {
        "id": new_review.id,
        "comment": new_review.comment,
        "rating": new_review.rating,
        "product_id": new_review.product_id,
        "user_id": new_review.user_id,
        "username": user.name,
        "date": new_review.date,
    }
