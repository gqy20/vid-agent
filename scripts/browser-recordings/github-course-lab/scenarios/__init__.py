from __future__ import annotations

from .base import Scenario
from .smoke import SmokeScenario


SCENARIOS: dict[str, Scenario] = {
    "smoke": SmokeScenario(),
}


def get_scenario(scenario_id: str) -> Scenario:
    try:
        return SCENARIOS[scenario_id]
    except KeyError as exc:
        choices = ", ".join(sorted(SCENARIOS))
        raise KeyError(f"Unknown scenario '{scenario_id}'. Available: {choices}") from exc
