import sqlite3
import os

# Define the database file location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "medical.db")


def ensure_account_status_column(conn):
    """
    Add account_status to the users table if it does not already exist.

    This keeps older demo databases working while supporting the new
    account approval workflow.
    """
    users_table = conn.execute("""
        SELECT name FROM sqlite_master
        WHERE type = 'table' AND name = 'users'
    """).fetchone()

    if not users_table:
        return

    columns = conn.execute("PRAGMA table_info(users)").fetchall()
    column_names = [column["name"] for column in columns]

    if "account_status" not in column_names:
        conn.execute("""
            ALTER TABLE users
            ADD COLUMN account_status TEXT DEFAULT 'approved'
        """)
        conn.commit()


# Create and return a database connection
def get_db_connection():
    conn = sqlite3.connect(DATABASE)

    # Allow database rows to be accessed like dictionaries
    conn.row_factory = sqlite3.Row

    # Make sure the database supports account approval status
    ensure_account_status_column(conn)

    return conn
