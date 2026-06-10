from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.database import engine, Base
from routes import speks, simulator, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Health Twin AI",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(speks.router)
app.include_router(simulator.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "Health Twin AI API v2 is running"}
