import json
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database import SessionLocal
from app import models


def parse_date(date_str):
    if not date_str:
        return None
    try:
        return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
    except Exception:
        return None


def seed():
    db: Session = SessionLocal()

    try:
        with open("db.json") as f:
            data = json.load(f)

        # -------------------------
        # PRELOAD EXISTING IDS (for idempotency)
        # -------------------------
        existing_products = {p[0] for p in db.execute(select(models.Product.id))}
        existing_users = {u[0] for u in db.execute(select(models.User.id))}
        existing_categories = {c[0] for c in db.execute(select(models.Category.id))}
        existing_orders = {o[0] for o in db.execute(select(models.Order.id))}

        # -------------------------
        # CATEGORIES
        # -------------------------
        category_map = {}

        for cat in data["categories"]:
            cid = int(cat["id"])
            category_map[cat["name"]] = cid

            if cid in existing_categories:
                continue

            db.add(
                models.Category(
                    id=cid,
                    name=cat["name"],
                    description=cat.get("description"),
                )
            )

        db.flush()

        # -------------------------
        # USERS
        # -------------------------
        for user in data["users"]:
            uid = int(user["id"])

            if uid in existing_users:
                continue

            db.add(
                models.User(
                    id=uid,
                    name=user["name"],
                    email=user["email"],
                    password_hash=None,
                    join_date=parse_date(user.get("join_date")),
                )
            )

        db.flush()

        # -------------------------
        # PRODUCTS
        # -------------------------
        for product in data["products"]:
            pid = int(product["id"])

            if pid in existing_products:
                continue

            category_id = category_map.get(product["category"])
            if not category_id:
                raise ValueError(f"Invalid category: {product['category']}")

            db.add(
                models.Product(
                    id=pid,
                    title=product["title"],
                    price=product["price"],
                    brand=product.get("brand"),
                    rating=product.get("rating", 0),
                    stock=product.get("stock", 0),
                    description=product.get("description"),
                    images=product.get("images", []),
                    specs=product.get("specs", {}),
                    category_id=category_id,
                )
            )

        db.flush()

        # refresh product ids after insert
        existing_products = {p[0] for p in db.execute(select(models.Product.id))}

        # -------------------------
        # CART
        # -------------------------
        for item in data["cart"]:
            product_id = int(item["productId"])

            if product_id not in existing_products:
                continue

            db.add(
                models.CartItem(
                    id=item["id"],
                    user_id=item["userId"],
                    product_id=product_id,
                    quantity=item.get("quantity", 1),
                )
            )

        # -------------------------
        # WISHLIST
        # -------------------------
        for item in data["wishlist"]:
            product_id = int(item["productId"])

            if product_id not in existing_products:
                continue

            db.add(
                models.Wishlist(
                    id=item["id"],  # <-- ensure model uses String
                    user_id=item["userId"],
                    product_id=product_id,
                )
            )

        # -------------------------
        # REVIEWS
        # -------------------------
        for review in data["reviews"]:
            product_id = int(review["productId"])

            if product_id not in existing_products:
                continue

            db.add(
                models.Review(
                    user_id=int(review["userId"]),
                    product_id=product_id,
                    rating=review["rating"],
                    comment=review.get("comment"),
                    date=parse_date(review.get("date")),
                )
            )

        db.flush()

        # -------------------------
        # ORDERS + ITEMS
        # -------------------------
        for order in data["orders"]:
            oid = int(order["id"])

            if oid in existing_orders:
                continue

            db_order = models.Order(
                id=oid,
                user_id=order["userId"],
                total=order["total"],
                status=order["status"],
                date=parse_date(order.get("date")),
            )

            db.add(db_order)
            db.flush()

            for item in order["items"]:
                product_id = int(item["productId"])

                if product_id not in existing_products:
                    continue

                db.add(
                    models.OrderItem(
                        order_id=db_order.id,
                        product_id=product_id,
                        quantity=item["quantity"],
                        price=item["price"],
                    )
                )

        # -------------------------
        # COMMIT
        # -------------------------
        db.commit()
        print("✅ Seeding complete")

    except Exception as e:
        db.rollback()
        print("❌ Seeding failed:", e)
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed()
