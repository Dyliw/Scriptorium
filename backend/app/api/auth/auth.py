from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import session
from sqlalchemy import text
from app.database.db import get_db
