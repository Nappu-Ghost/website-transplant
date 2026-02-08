import sys
import os


project_root = os.path.abspath(os.path.dirname(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.db import Base, engine
from app import models 

def initialize_database():
    print("Attempting to create database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully (or already exist).")
    except Exception as e:
        print(f"An error occurred during database table creation: {e}")

if __name__ == "__main__":
    initialize_database()