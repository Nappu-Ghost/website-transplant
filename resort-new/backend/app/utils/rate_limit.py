# app/utils/rate_limit.py
from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Dict, Tuple, Optional


@dataclass
class LimitConfig:
    max_attempts: int = 5
    window_seconds: int = 15 * 60 
    lock_seconds: int = 15 * 60 


class InMemoryRateLimiter:
    """Simple in-memory limiter for dev/single-process deployments.

    For production (multiple workers/instances), replace with Redis or DB-based limiter.
    """

    def __init__(self, cfg: Optional[LimitConfig] = None):
        self.cfg = cfg or LimitConfig()
        self._state: Dict[str, Tuple[int, float, float]] = {}

    def _now(self) -> float:
        return time.time()

    def check(self, key: str) -> Tuple[bool, int, int]:
        """Return (allowed, remaining_attempts, lock_remaining_seconds)."""
        now = self._now()
        count, first_ts, locked_until = self._state.get(key, (0, now, 0.0))

        if locked_until and now < locked_until:
            return False, 0, int(locked_until - now)

        if now - first_ts > self.cfg.window_seconds:
            count, first_ts, locked_until = 0, now, 0.0

        remaining = max(self.cfg.max_attempts - count, 0)
        return True, remaining, 0

    def record_failure(self, key: str) -> Tuple[int, int]:
        """Increment failures. Returns (remaining_attempts, lock_remaining_seconds)."""
        now = self._now()
        count, first_ts, locked_until = self._state.get(key, (0, now, 0.0))

        if now - first_ts > self.cfg.window_seconds:
            count, first_ts, locked_until = 0, now, 0.0

        count += 1
        lock_remaining = 0
        if count >= self.cfg.max_attempts:
            locked_until = now + self.cfg.lock_seconds
            lock_remaining = int(self.cfg.lock_seconds)

        self._state[key] = (count, first_ts, locked_until)
        remaining = max(self.cfg.max_attempts - count, 0)
        return remaining, lock_remaining

    def record_success(self, key: str) -> None:
        if key in self._state:
            del self._state[key]
