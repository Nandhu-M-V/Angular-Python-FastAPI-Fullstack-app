from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import product, review, user, cart, order, wishlist

app = FastAPI()


Base.metadata.create_all(bind=engine)

origins = [
    "http://localhost:4200",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(product.router, prefix="/products", tags=["Products"])
app.include_router(review.router, prefix="/reviews", tags=["Reviews"])
app.include_router(user.router, prefix="/users", tags=["Users"])
app.include_router(cart.router, prefix="/cart", tags=["Cart"])
app.include_router(order.router, prefix="/orders", tags=["Orders"])
app.include_router(wishlist.router, prefix="/wishlist", tags=["Wishlist"])
