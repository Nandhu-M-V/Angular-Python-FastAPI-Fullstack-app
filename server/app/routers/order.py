from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Order, OrderItem, Product
from app.schemas.order import OrderCreate, OrderOut

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("/{user_id}", response_model=list[OrderOut])
def get_orders(user_id: int, db: Session = Depends(get_db)):
    return db.query(Order).filter(Order.user_id == user_id).all()


@router.post("/", response_model=OrderOut)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    items_data = order.items

    db_order = Order(user_id=order.user_id, status="pending", total=0)

    total = 0

    for item in items_data:
        product = db.query(Product).filter(Product.id == item.product_id).first()

        if not product:
            raise HTTPException(
                status_code=404, detail=f"Product {item.product_id} not found"
            )

        price = product.price
        item_total = price * item.quantity
        total += item_total

        db_order.items.append(
            OrderItem(product_id=item.product_id, quantity=item.quantity, price=price)
        )

    db_order.total = total

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    return db_order
