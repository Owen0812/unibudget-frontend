# app/routers/analytics.py
# Advanced financial analytics endpoints
# Inspired by ghostfolio/ghostfolio high-level wealth management insights
# Uses pandas for statistical aggregation over the transaction ledger

import pandas as pd
from fastapi import APIRouter, Depends
from fastapi_cache.decorator import cache
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models import TransactionDB

router = APIRouter()


@router.get("/insights")
@cache(expire=120)
async def get_financial_insights(db: AsyncSession = Depends(get_db)):
    """
    Derive high-level financial insights from the transaction ledger.
    Inspired by ghostfolio/ghostfolio advanced portfolio analytics.

    Returns:
    - FIRE countdown: years to financial independence at current savings rate
    - Inflation erosion: real purchasing power after 5 years at 3% inflation
    - Peer percentile: estimated health score ranking among university students
    - Spending breakdown: percentage split across expense categories
    - Monthly trend: net cash flow over the last 6 recorded months
    """
    result = await db.execute(select(TransactionDB))
    transactions = result.scalars().all()

    if not transactions:
        return {
            "fire_years":         None,
            "inflation_erosion":  None,
            "peer_percentile":    None,
            "spending_breakdown": {},
            "monthly_trend":      [],
            "message":            "No transaction data available. Add records in Bookkeeping first.",
        }

    # Build a pandas DataFrame from the ledger
    df = pd.DataFrame([{
        "date":     tx.date,
        "category": tx.category,
        "amount":   tx.amount,
        "type":     tx.type,
    } for tx in transactions])

    df["date"] = pd.to_datetime(df["date"], errors="coerce")

    # ---------------------------------------------------------------------------
    # 1. Income vs expense totals
    # ---------------------------------------------------------------------------
    total_income  = float(df[df["amount"] > 0]["amount"].sum())
    total_expense = float(df[df["amount"] < 0]["amount"].abs().sum())
    monthly_savings = max(0, total_income - total_expense)
    savings_rate    = (monthly_savings / total_income) if total_income > 0 else 0

    # ---------------------------------------------------------------------------
    # 2. FIRE countdown — years to financial independence
    # Assumes 25x annual expenses target (4% withdrawal rule)
    # Inspired by ghostfolio FIRE projection methodology
    # ---------------------------------------------------------------------------
    annual_expense = total_expense * 12
    fire_target    = annual_expense * 25
    fire_years     = None

    if monthly_savings > 0:
        fire_years = round(fire_target / (monthly_savings * 12), 1)
        fire_years = min(fire_years, 99)

    # ---------------------------------------------------------------------------
    # 3. Inflation erosion — purchasing power after 5 years at 3% annual inflation
    # ---------------------------------------------------------------------------
    inflation_rate   = 0.03
    current_savings  = max(0, total_income - total_expense)
    inflation_erosion = round(current_savings * ((1 - inflation_rate) ** 5), 2)

    # ---------------------------------------------------------------------------
    # 4. Peer percentile — mock benchmark against university student population
    # Real implementation would query anonymised aggregate data
    # ---------------------------------------------------------------------------
    peer_percentile = min(99, max(1, round(savings_rate * 100 + 40)))

    # ---------------------------------------------------------------------------
    # 5. Spending breakdown by category (percentages)
    # ---------------------------------------------------------------------------
    expense_df = df[df["amount"] < 0].copy()
    expense_df["amount"] = expense_df["amount"].abs()

    breakdown = {}
    if not expense_df.empty and total_expense > 0:
        by_category = expense_df.groupby("category")["amount"].sum()
        breakdown   = {
            cat: round((amt / total_expense) * 100, 1)
            for cat, amt in by_category.items()
        }

    # ---------------------------------------------------------------------------
    # 6. Monthly net cash flow trend (last 6 months)
    # ---------------------------------------------------------------------------
    monthly_trend = []
    if not df["date"].isna().all():
        df["month"] = df["date"].dt.to_period("M")
        monthly_net = df.groupby("month")["amount"].sum().tail(6)
        monthly_trend = [
            {"month": str(period), "net": round(float(net), 2)}
            for period, net in monthly_net.items()
        ]

    return {
        "fire_years":         fire_years,
        "current_savings":    round(current_savings, 2),
        "fire_target":        round(fire_target, 2),
        "inflation_erosion":  inflation_erosion,
        "peer_percentile":    peer_percentile,
        "savings_rate_pct":   round(savings_rate * 100, 1),
        "spending_breakdown": breakdown,
        "monthly_trend":      monthly_trend,
    }