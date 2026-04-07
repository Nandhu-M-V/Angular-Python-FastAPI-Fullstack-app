from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import product, review, user, cart, order, wishlist, login
from fastapi.responses import JSONResponse
import shutil
from pathlib import Path
from fastapi.staticfiles import StaticFiles


app = FastAPI()

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


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

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"uploaded_file": str(file_path)}


app.include_router(product.router, prefix="/products", tags=["Products"])
app.include_router(review.router, prefix="/reviews", tags=["Reviews"])
app.include_router(user.router, prefix="/users", tags=["Users"])
app.include_router(cart.router, prefix="/cart", tags=["Cart"])
app.include_router(order.router, prefix="/orders", tags=["Orders"])
app.include_router(wishlist.router, prefix="/wishlist", tags=["Wishlist"])
app.include_router(login.router, prefix="/auth", tags=["Auth"])
