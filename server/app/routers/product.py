from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Product, CartItem, Review, OrderItem, Category
from app.schemas.product import ProductOut, ProductCreate, ProductUpdate
from app.dependency.protectedRoutes import require_admin

router = APIRouter()


#  get all  + filter
@router.get("/")
def get_products(
    search: str = "",
    category: str = "",
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
):
    query = db.query(Product)

    if search:
        query = query.filter(Product.title.ilike(f"%{search}%"))

    if category:
        query = query.join(Category).filter(Category.name == category)

    total = query.count()

    products = query.offset(skip).limit(limit).all()

    return {"data": products, "total": total}


#  get by id
@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


#  create
@router.post("/", response_model=ProductOut, status_code=201)
def create_product(
    product: ProductCreate, db: Session = Depends(get_db), user=Depends(require_admin)
):
    new_product = Product(**product.model_dump())

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


#  update
@router.put("/edit-product/{product_id}", response_model=ProductOut)
def update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)

    return product


#  delete
@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int, db: Session = Depends(get_db), user=Depends(require_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if user.get("role") == "admin":
        db.query(CartItem).filter(CartItem.product_id == product_id).delete()
        db.query(Review).filter(Review.product_id == product_id).delete()
        db.query(OrderItem).filter(OrderItem.product_id == product_id).delete()

        db.delete(product)
        db.commit()

    return
