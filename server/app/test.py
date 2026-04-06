from app.auth import hash_password
from app.models.models import User
from app.database import SessionLocal

db = SessionLocal()

user = User(
    name="Nandhu",
    email="test@gmail.com",
    password_hash=hash_password("1234"),  # ✅ correct
    role="admin",
)
db.add(user)
db.commit()
db.close()
