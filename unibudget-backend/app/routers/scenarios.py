# app/routers/scenarios.py
# Scenario snapshot CRUD — JSONB payload storage in PostgreSQL
# JSONB column directly satisfies project objective 3 (non-relational data storage)
# Storage pattern inspired by maybe-finance/maybe snapshot architecture

from fastapi import APIRouter, Depends, HTTPException
from fastapi_cache.decorator import cache
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.database import get_db
from app.models import ScenarioDB, ScenarioCreate, ScenarioOut

router = APIRouter()


@router.get("/", response_model=List[ScenarioOut])
@cache(expire=60)
async def get_scenarios(db: AsyncSession = Depends(get_db)):
    """
    Return all saved scenario snapshots ordered by most recent first.
    The 'values' column is stored as JSONB in PostgreSQL — satisfies project objective 3.
    Inspired by maybe-finance/maybe JSONB snapshot storage pattern.
    """
    result = await db.execute(
        select(ScenarioDB).order_by(ScenarioDB.saved_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=ScenarioOut, status_code=201)
async def save_scenario(scenario: ScenarioCreate, db: AsyncSession = Depends(get_db)):
    """
    Persist a named scenario snapshot.
    The slider values dict is serialised as JSONB, allowing flexible schema evolution
    without database migrations — a key advantage of the JSONB column type.
    """
    new_scenario = ScenarioDB(
        name=scenario.name,
        values=scenario.values.model_dump(),
    )
    db.add(new_scenario)
    await db.commit()
    await db.refresh(new_scenario)
    return new_scenario


@router.delete("/{scenario_id}")
async def delete_scenario(scenario_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a saved scenario by ID."""
    result = await db.execute(
        select(ScenarioDB).filter(ScenarioDB.id == scenario_id)
    )
    scenario = result.scalar_one_or_none()

    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario snapshot not found")

    await db.delete(scenario)
    await db.commit()
    return {"status": "success", "message": "Scenario snapshot erased"}