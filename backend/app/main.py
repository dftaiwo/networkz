import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.routers import admin as admin_router
from app.routers import auth as auth_router
from app.routers import profiles as profiles_router
from app.routers import reference as reference_router
from app.routers import stats as stats_router
from app.routers import uploads as uploads_router

settings = get_settings()


def create_app() -> FastAPI:
    app = FastAPI(
        title="NetworkZ API",
        description="Alumni directory for Google for Startups Accelerator graduates.",
        version="0.1.0",
        docs_url="/docs",
        redoc_url=None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth_router.router, prefix="/api")
    app.include_router(profiles_router.router, prefix="/api")
    app.include_router(uploads_router.router, prefix="/api")
    app.include_router(stats_router.router, prefix="/api")
    app.include_router(admin_router.router, prefix="/api")
    app.include_router(reference_router.router, prefix="/api")

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

    @app.get("/health")
    def health():
        return {"status": "ok"}

    @app.get("/api/health")
    def api_health():
        return {"status": "ok"}

    return app


app = create_app()
