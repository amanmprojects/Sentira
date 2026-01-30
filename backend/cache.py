"""
Simple in-memory cache with file persistence for URL-based analysis results.
"""

import hashlib
import json
import time
import os
from typing import Optional, Any
from pathlib import Path

CACHE_DIR = Path(__file__).parent.parent / "cache"
CACHE_DIR.mkdir(exist_ok=True)
CACHE_TTL = 3600  # 1 hour


class AnalysisCache:
    def __init__(self):
        self.memory_cache: dict[str, tuple[Any, float]] = {}

    def _get_cache_key(self, url: str) -> str:
        """Generate cache key from URL."""
        return hashlib.md5(url.encode()).hexdigest()

    def _get_cache_file(self, cache_key: str) -> Path:
        """Get cache file path for key."""
        return CACHE_DIR / f"{cache_key}.json"

    def get(self, url: str) -> Optional[Any]:
        """Get cached analysis for URL."""
        cache_key = self._get_cache_key(url)

        # Check memory cache first
        if cache_key in self.memory_cache:
            result, timestamp = self.memory_cache[cache_key]
            if time.time() - timestamp < CACHE_TTL:
                print(f"CACHE HIT (memory): {url}")
                return result
            else:
                del self.memory_cache[cache_key]

        # Check file cache
        cache_file = self._get_cache_file(cache_key)
        if cache_file.exists():
            try:
                with open(cache_file, "r") as f:
                    cached = json.load(f)
                    # Validate TTL
                    if time.time() - cached.get("timestamp", 0) < CACHE_TTL:
                        # Store in memory for faster access
                        self.memory_cache[cache_key] = (
                            cached["data"],
                            cached["timestamp"],
                        )
                        print(f"CACHE HIT (file): {url}")
                        return cached["data"]
                    else:
                        # Remove stale file
                        cache_file.unlink()
            except Exception as e:
                print(f"Cache read error: {e}")

        return None

    def set(self, url: str, result: Any) -> None:
        """Cache analysis result for URL."""
        cache_key = self._get_cache_key(url)
        timestamp = time.time()

        # Store in memory
        self.memory_cache[cache_key] = (result, timestamp)

        # Persist to file
        cache_file = self._get_cache_file(cache_key)
        try:
            with open(cache_file, "w") as f:
                json.dump(
                    {"url": url, "timestamp": timestamp, "data": result}, f, default=str
                )
        except Exception as e:
            print(f"Cache write error: {e}")
        print(f"CACHE SET: {url}")

    def invalidate(self, url: str) -> None:
        """Remove cached result for URL."""
        cache_key = self._get_cache_key(url)

        # Remove from memory
        if cache_key in self.memory_cache:
            del self.memory_cache[cache_key]

        # Remove file
        cache_file = self._get_cache_file(cache_key)
        if cache_file.exists():
            cache_file.unlink()

    def clear_expired(self) -> None:
        """Clear all expired cache entries."""
        now = time.time()
        for cache_file in CACHE_DIR.glob("*.json"):
            try:
                with open(cache_file, "r") as f:
                    cached = json.load(f)
                    if now - cached.get("timestamp", 0) >= CACHE_TTL:
                        cache_file.unlink()
            except Exception:
                cache_file.unlink()


# Singleton instance
_cache = AnalysisCache()


def get_cache() -> AnalysisCache:
    return _cache
