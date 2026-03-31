from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import user
from app.database import engine, Base
from app.models import models

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(user.router, prefix="/users", tags=["Users"])


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

app.include_router(user.router)
