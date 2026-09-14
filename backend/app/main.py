from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1 import api_v1_router
from app.core.config import settings
from app.db.session import engine
# আপনার মডেলগুলোর Base ইমপোর্ট করা হচ্ছে (যাতে সব টেবিল স্বয়ংক্রিয় তৈরি হতে পারে)
try:
    from app.models.base import Base
except ImportError:
    from app.db.base import Base

openapi_tags = [
    {
        "name": "Authentication",
        "description": "User registration, JWT login, profile endpoints.",
    },
    {
        "name": "API Keys",
        "description": "Secure SHA-256 API Key lifecycle management.",
    },
    {
        "name": "Telemetry Ingestion",
        "description": "High-throughput telemetry ingestion & subscription quota enforcement.",
    },
    {
        "name": "Executive Analytics & Green FinOps",
        "description": "Executive BI summary metrics, algorithm rankings, and department carbon footprints.",
    },
]

# Lifespan: অ্যাপ চালু হওয়ার সময় ডাটাবেসে টেবিল না থাকলে অটোমেটিক তৈরি করবে
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title="EcoCode Analytics API",
    description="Multi-tenant B2B SaaS platform for code-level carbon telemetry and green FinOps.",
    version="1.0.0",
    openapi_tags=openapi_tags,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "https://ecocode-amber.vercel.app",       # আপনার লাইভ Vercel ডোমেন
        "https://ecocode-analytics.vercel.app",   # সেকেন্ডারি Vercel ডোমেন
    ],
    allow_origin_regex=r"^https://.*\.vercel\.app$",  # vercel-এর সব ডোমেন ও প্রিভিউ ব্রাঞ্চ
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check():
    """Service health check endpoint."""
    return {
        "status": "healthy",
        "service": "EcoCode Analytics API",
        "environment": settings.ENVIRONMENT
    }


# Global Exception Handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
                "path": request.url.path
            }
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": status.HTTP_422_UNPROCESSABLE_ENTITY,
                "message": "Validation Error",
                "details": exc.errors(),
                "path": request.url.path
            }
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "message": "Internal Server Error",
                "detail": str(exc) if settings.ENVIRONMENT == "development" else "An unexpected error occurred",
                "path": request.url.path
            }
        },
    )

# Include API Router under /api
app.include_router(api_v1_router, prefix="/api")