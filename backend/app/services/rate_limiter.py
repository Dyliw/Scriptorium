from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timedelta
from app.database.db import get_db
from app.database.models import RateLimit

def check_rate_limit(db: Session, ip_address: str, action: str, max_attempts: int, window_minutes: int) -> bool:
    # Buscar registro existente
    rate_limit = db.query(RateLimit).filter(
        and_(
            RateLimit.ip_address == ip_address,
            RateLimit.action == action
        )
    ).first()
    
    if not rate_limit:
        # Crear nuevo registro
        rate_limit = RateLimit(
            ip_address=ip_address,
            action=action,
            attempts=1,
            first_attempt=datetime.now(),
            last_attempt=datetime.now()
        )
        db.add(rate_limit)
        db.commit()
        return True
    
    # Verificar si está dentro de la ventana de tiempo
    time_window = datetime.now() - timedelta(minutes=window_minutes)
    
    if rate_limit.first_attempt < time_window:
        # Resetear ventana
        rate_limit.attempts = 1
        rate_limit.first_attempt = datetime.now()
        rate_limit.last_attempt = datetime.now()
        db.commit()
        return True
    
    # Verificar intentos
    if rate_limit.attempts >= max_attempts:
        return False
    
    # Incrementar intentos
    rate_limit.attempts += 1
    rate_limit.last_attempt = datetime.now()
    db.commit()
    return True

def get_client_ip(request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0]
    return request.client.host
