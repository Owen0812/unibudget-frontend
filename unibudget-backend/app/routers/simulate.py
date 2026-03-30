# app/routers/simulate.py
# Core Monte Carlo simulation engine
# NumPy vectorisation runs 10,000 iterations in parallel — satisfies project requirement
# Health score algorithm inspired by mahfuzurrahman98/financial-health-calculator
# Weighted formula: Savings rate (40%) + Expense ratio (35%) + Solvency outlook (25%)

import numpy as np
from fastapi import APIRouter
from app.models import ScenarioConfig, SimulationResult

router = APIRouter()


def calculate_health_score(income: float, total_expense: float, bankruptcy_prob: float) -> int:
    """
    Weighted financial health score (0-100).
    Savings capacity (40%) + Expense ratio (35%) + Solvency outlook (25%).
    Inspired by mahfuzurrahman98/financial-health-calculator weighting methodology.
    """
    if income <= 0:
        return 0

    savings_rate  = max(0, (income - total_expense) / income)
    savings_score = min(savings_rate / 0.3, 1) * 40

    expense_ratio  = total_expense / income
    expense_score  = max(0, min((1 - expense_ratio) / 0.4, 1)) * 35

    solvency_score = max(0, min((1 - bankruptcy_prob / 100) / 0.9, 1)) * 25

    return round(savings_score + expense_score + solvency_score)


@router.post("/simulate", response_model=SimulationResult)
def simulate_budget(config: ScenarioConfig):
    """
    Run 10,000 Monte Carlo simulations using NumPy vectorisation.
    Supports fixed, variable, and sporadic expense classifications.
    Returns P5 / P50 / P95 daily balance trajectories for fan chart rendering.

    Planned upgrade: offload to arq + Redis async task queue to eliminate
    main-thread blocking under high concurrency (Phase 2 enhancement).
    """
    conf       = config.model_dump()
    iterations = 10_000
    days       = conf["daysToSimulate"]

    daily_balances  = np.zeros((iterations, days))
    current_balance = np.full(iterations, conf["initialBalance"], dtype=float)

    for day in range(days):
        daily_expense = np.zeros(iterations)

        for exp in conf["expenses"]:
            if exp["type"] == "fixed":
                if (day + 1) == exp["dayOfCharge"] and exp["frequency"] == "monthly":
                    daily_expense += exp["amount"]

            elif exp["type"] == "variable":
                if exp["frequency"] == "daily":
                    daily_expense += np.random.uniform(
                        exp["min"], exp["max"], iterations
                    )

            elif exp["type"] == "sporadic":
                trigger = np.random.random(iterations) < exp["probabilityPerDay"]
                amount  = np.random.uniform(exp["min"], exp["max"], iterations)
                daily_expense += trigger * amount

        current_balance -= daily_expense
        daily_balances[:, day] = current_balance

    # Bankruptcy: any simulation path that goes below £0 at any point
    bankrupt_mask   = np.any(daily_balances < 0, axis=1)
    bankruptcy_prob = float(np.mean(bankrupt_mask) * 100)

    final_balances = daily_balances[:, -1]

    # Percentile trajectories for P5 / P50 / P95 confidence band fan chart
    p5_trajectory  = np.percentile(daily_balances, 5,  axis=0)
    p50_trajectory = np.percentile(daily_balances, 50, axis=0)
    p95_trajectory = np.percentile(daily_balances, 95, axis=0)

    # Derive total expense from the median trajectory for accurate health scoring
    total_monthly_expense = conf["initialBalance"] - float(p50_trajectory[-1])
    health_score = calculate_health_score(
        conf["initialBalance"], total_monthly_expense, bankruptcy_prob
    )

    return {
        "status": "success",
        "bankruptcy_probability": round(bankruptcy_prob, 2),
        "median_balance":         round(float(np.median(final_balances)), 2),
        "worst_case":             round(float(np.min(final_balances)), 2),
        "best_case":              round(float(np.max(final_balances)), 2),
        "health_score":           health_score,
        "chart_data": {
            "days": list(range(1, days + 1)),
            "p5":  [round(x, 2) for x in p5_trajectory],
            "p50": [round(x, 2) for x in p50_trajectory],
            "p95": [round(x, 2) for x in p95_trajectory],
        },
    }