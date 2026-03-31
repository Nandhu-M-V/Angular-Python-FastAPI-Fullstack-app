import json
from datetime import datetime

from app.database import SessionLocal
from app.models.models import (
    User,
    Product,
    Category,
    CartItem,
    Review,
    Order,
    OrderItem,
)


def exists(db, model, id):
    return db.query(model).filter(model.id == id).first() is not None


def seed():
    db = SessionLocal()

    with open("db.json") as f:
        data = json.load(f)

    category_map = {}

    for cat in data["categories"]:
        cid = int(cat["id"])

        if exists(db, Category, cid):
            continue

        db.add(Category(id=cid, name=cat["name"], description=cat.get("description")))

        category_map[cat["name"]] = cid

    db.commit()

    for user in data["users"]:
        uid = int(user["id"])

        if exists(db, User, uid):
            continue

        db.add(
            User(
                id=uid,
                name=user["name"],
                email=user["email"],
                password_hash="hashedpassword",
                join_date=datetime.fromisoformat(user["join_date"]),
            )
        )

    db.commit()

    for product in data["products"]:
        pid = int(product["id"])

        if exists(db, Product, pid):
            continue

        db.add(
            Product(
                id=pid,
                title=product["title"],
                price=product["price"],
                brand=product.get("brand"),
                rating=product.get("rating", 0),
                stock=product.get("stock", 0),
                description=product.get("description"),
                images=product.get("images"),
                specs=product.get("specs"),
                category_id=category_map.get(product["category"]),
            )
        )

    db.commit()

    for item in data["cart"]:
        product_id = int(item["productId"])

        if not exists(db, Product, product_id):
            print(f"⚠️ Skipping cart item (product_id={product_id})")
            continue

        if exists(db, CartItem, item["id"]):
            continue

        db.add(
            CartItem(
                id=item["id"],
                user_id=item["userId"],
                product_id=product_id,
                quantity=item["quantity"],
            )
        )

    db.commit()

    for review in data["reviews"]:
        product_id = int(review["productId"])

        if not exists(db, Product, product_id):
            print(f"⚠️ Skipping review {review['id']} (product_id={product_id})")
            continue

        if exists(db, Review, str(review["id"])):
            continue

        db.add(
            Review(
                id=str(review["id"]),
                user_id=int(review["userId"]),
                product_id=product_id,
                rating=review["rating"],
                comment=review.get("comment"),
                date=datetime.fromisoformat(review["date"].replace("Z", "")),
            )
        )

    db.commit()

    for order in data["orders"]:
        oid = int(order["id"])

        if exists(db, Order, oid):
            continue

        db_order = Order(
            id=oid,
            user_id=order["userId"],
            total=order["total"],
            status=order["status"],
            date=datetime.fromisoformat(order["date"]),
        )

        db.add(db_order)
        db.commit()

        for item in order["items"]:
            product_id = int(item["productId"])

            if not exists(db, Product, product_id):
                print(f"⚠️ Skipping order item (product_id={product_id})")
                continue

            db.add(
                OrderItem(
                    order_id=db_order.id,
                    product_id=product_id,
                    quantity=item["quantity"],
                    price=item["price"],
                )
            )

        db.commit()

    print("✅ Seeding complete!")


if __name__ == "__main__":
    seed()
