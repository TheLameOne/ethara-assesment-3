from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import products, customers, orders, dashboard

# Import models so SQLAlchemy registers them before create_all
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Inventory & Order Management API",
    version="1.0.0",
    lifespan=lifespan,
)

# Build origins list at startup; also always allow localhost for local dev
_origins = settings.cors_origins_list
if "http://localhost:3000" not in _origins:
    _origins.append("http://localhost:3000")
if "http://localhost:5173" not in _origins:
    _origins.append("http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)


@app.get("/health")
def health():
    return {"status": "ok"}
