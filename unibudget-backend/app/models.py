# app/models.py
# Combines SQLAlchemy ORM Models (Database layer) and Pydantic Schemas (API Validation layer).
# Dual-schema design pattern inspired by Tiangolo's FastAPI template.

from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Literal, List, Dict, Any
from app.database import Base

# ==========================================
# SQLALCHEMY ORM MODELS (DATABASE SCHEMA)
# ==========================================

class TransactionDB(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)
    description = Column(String)
    category = Column(String)
    amount = Column(Float)
    type = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ScenarioDB(Base):
    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    values = Column(JSON)
    saved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

# ==========================================
# PYDANTIC SCHEMAS (API VALIDATION)
# ==========================================

# --- Transactions ---
class TransactionCreate(BaseModel):
    date: str
    description: str
    category: str
    amount: float
    type: Literal["income", "expense"]

class TransactionOut(TransactionCreate):
    id: int
    
    class Config:
        from_attributes = True

# --- Scenarios ---
class ScenarioValues(BaseModel):
    income: float
    partTimeHours: float = 0.0
    rent: float
    food: float
    transport: float

class ScenarioCreate(BaseModel):
    name: str
    values: ScenarioValues

class ScenarioOut(ScenarioCreate):
    id: int
    saved_at: datetime

    class Config:
        from_attributes = True

# --- Monte Carlo Simulation Engine ---
class ExpenseItem(BaseModel):
    id: str
    name: str
    type: Literal["fixed", "variable", "sporadic"]
    amount: float = 0.0
    min: float = 0.0
    max: float = 0.0
    frequency: Literal["daily", "monthly"] = "daily"
    dayOfCharge: int = 1
    probabilityPerDay: float = 0.0

class ScenarioConfig(BaseModel):
    initialBalance: float
    daysToSimulate: int = 30
    expenses: List[ExpenseItem]

class SimulationResult(BaseModel):
    status: str
    bankruptcy_probability: float
    median_balance: float
    worst_case: float
    best_case: float
    health_score: int
    chart_data: Dict[str, Any]