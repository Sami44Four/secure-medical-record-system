import sqlite3
import os

# Define the database file location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "medical.db")

# Create and return a database connection
def get_db_connection():
    conn = sqlite3.connect(DATABASE)

    # Allow database rows to be accessed like dictionaries
    conn.row_factory = sqlite3.Row

    return conn