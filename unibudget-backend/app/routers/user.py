# app/routers/user.py
# GDPR compliance endpoints
# Art.20 — Right to Data Portability: export all user data
# Art.17 — Right to Erasure: permanently delete account

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi.responses import JSONResponse
from datetime import datetime

from app.database import get_db
from app.models import TransactionDB, ScenarioDB

router = APIRouter()


@router.get("/export")
async def export_user_data(db: AsyncSession = Depends(get_db)):
    """
    GDPR Article 20 — Right to Data Portability.
    Returns all user data as a downloadable JSON payload.
    """
    tx_result = await db.execute(select(TransactionDB))
    transactions = tx_result.scalars().all()

    sc_result = await db.execute(select(ScenarioDB))
    scenarios = sc_result.scalars().all()

    export_payload = {
        "exported_at": datetime.utcnow().isoformat(),
        "notice": "Exported under GDPR Article 20 — Right to Data Portability.",
        "transactions": [
            {
                "id": tx.id,
                "date": tx.date,
                "description": tx.description,
                "category": tx.category,
                "amount": tx.amount,
                "type": tx.type,
            }
            for tx in transactions
        ],
        "scenarios": [
            {
                "id": sc.id,
                "name": sc.name,
                "values": sc.values,
                "saved_at": sc.saved_at.isoformat() if sc.saved_at else None,
            }
            for sc in scenarios
        ],
    }

    return JSONResponse(
        content=export_payload,
        headers={"Content-Disposition": "attachment; filename=unibudget_export.json"}
    )


@router.delete("/")
async def delete_account(db: AsyncSession = Depends(get_db)):
    """
    GDPR Article 17 — Right to Erasure.
    Permanently deletes all transactions and scenarios for the current user.
    """
    tx_result = await db.execute(select(TransactionDB))
    for tx in tx_result.scalars().all():
        await db.delete(tx)

    sc_result = await db.execute(select(ScenarioDB))
    for sc in sc_result.scalars().all():
        await db.delete(sc)

    await db.commit()

    return {
        "status": "success",
        "message": "All user data permanently erased. GDPR Article 17 fulfilled."
    }