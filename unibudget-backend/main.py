# main.py
# Application entry point — modular router architecture
# Inspired by Netflix Dispatch enterprise FastAPI structure and Firefly III modular design

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from dotenv import load_dotenv

from app.database import engine, Base
from app.routers import simulate, transactions, scenarios, auth, user, analytics

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    FastAPICache.init(InMemoryBackend(), prefix="unibudget-cache")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="UniBudget Lab API",
    description=(
        "Stochastic Financial Resilience Engine — COMP208 Group Project\n\n"
        "Architecture inspired by: Netflix Dispatch (modular routing), "
        "Firefly III (double-entry ledger), Tiangolo FastAPI Template (dual-schema pattern), "
        "ghostfolio/ghostfolio (advanced financial analytics)."
    ),
    version="2.1.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS — allow frontend dev server and Vercel deployment
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://unibudget-frontend.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Router registration
# ---------------------------------------------------------------------------
app.include_router(auth.router,         prefix="/auth",             tags=["Authentication"])
app.include_router(simulate.router,     prefix="/api",              tags=["Simulation Engine"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Ledger Transactions"])
app.include_router(scenarios.router,    prefix="/api/scenarios",    tags=["Scenario Snapshots"])
app.include_router(user.router,         prefix="/api/user",         tags=["User & GDPR"])
app.include_router(analytics.router,    prefix="/api/analytics",    tags=["Advanced Analytics"])


@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "version": "2.1.0",
        "service": "UniBudget Lab API Engine",
        "docs": "/docs",
    }