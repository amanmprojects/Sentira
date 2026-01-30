"""
Database module for storing analyzed reel URLs.
Uses PostgreSQL via psycopg2 with connection pooling for better performance.
"""

import os
import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import streamlit as st

# Load environment variables from parent directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

DATABASE_URL = os.getenv("DATABASE_URL")


@st.cache_resource
def get_pool():
    """Get or create the connection pool. Cached so it's only created once."""
    return pool.ThreadedConnectionPool(
        minconn=1,
        maxconn=5,
        dsn=DATABASE_URL,
        connect_timeout=10
    )


def get_connection():
    """Get a connection from the pool."""
    return get_pool().getconn()


def release_connection(conn):
    """Return a connection to the pool."""
    p = get_pool()
    if p and conn:
        p.putconn(conn)


@st.cache_resource
def init_database():
    """Initialize the database table if it doesn't exist. Only runs once."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS analyzed_reels (
                    id SERIAL PRIMARY KEY,
                    url TEXT NOT NULL,
                    name VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            # Create index on created_at for faster ordering
            cur.execute("""
                CREATE INDEX IF NOT EXISTS idx_reels_created_at 
                ON analyzed_reels(created_at DESC)
            """)
        conn.commit()
        return True
    finally:
        release_connection(conn)


def save_reel(url: str, name: str = None) -> int:
    """
    Save a reel URL to the database.
    
    Args:
        url: The Instagram reel URL
        name: Optional name/label for the reel
        
    Returns:
        The ID of the inserted record
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO analyzed_reels (url, name) VALUES (%s, %s) RETURNING id",
                (url, name)
            )
            reel_id = cur.fetchone()[0]
        conn.commit()
        return reel_id
    finally:
        release_connection(conn)


@st.cache_data(ttl=5)  # Cache for 5 seconds to avoid repeated queries on reruns
def get_recent_reels(limit: int = 20) -> list:
    """
    Get the most recently analyzed reels.
    
    Args:
        limit: Maximum number of reels to return
        
    Returns:
        List of reel dictionaries with id, url, name, created_at
    """
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, url, name, created_at 
                FROM analyzed_reels 
                ORDER BY created_at DESC 
                LIMIT %s
                """,
                (limit,)
            )
            # Convert to list of regular dicts for caching
            return [dict(row) for row in cur.fetchall()]
    finally:
        release_connection(conn)


def update_reel_name(reel_id: int, name: str) -> bool:
    """
    Update the name of an existing reel.
    
    Args:
        reel_id: The ID of the reel to update
        name: The new name for the reel
        
    Returns:
        True if update was successful
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE analyzed_reels SET name = %s WHERE id = %s",
                (name, reel_id)
            )
        conn.commit()
        return True
    finally:
        release_connection(conn)


def delete_reel(reel_id: int) -> bool:
    """
    Delete a reel from the database.
    
    Args:
        reel_id: The ID of the reel to delete
        
    Returns:
        True if deletion was successful
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM analyzed_reels WHERE id = %s", (reel_id,))
        conn.commit()
        # Clear the cache so the sidebar updates
        get_recent_reels.clear()
        return True
    finally:
        release_connection(conn)


def check_url_exists(url: str) -> dict:
    """
    Check if a URL already exists in the database.
    
    Args:
        url: The URL to check
        
    Returns:
        The reel record if found, None otherwise
    """
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT id, url, name, created_at FROM analyzed_reels WHERE url = %s",
                (url,)
            )
            result = cur.fetchone()
            return dict(result) if result else None
    finally:
        release_connection(conn)


def invalidate_cache():
    """Clear the reels cache to force a refresh."""
    get_recent_reels.clear()
