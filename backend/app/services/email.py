import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header
from app.config import settings

def send_email(to_email: str, subject: str, plain_text: str, html_content: str):
    try:
        msg = MIMEMultipart('alternative')
        
        msg['Subject'] = Header(subject, 'utf-8')
        msg['From'] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        msg['To'] = to_email
        part_plain = MIMEText(plain_text, 'plain', 'utf-8')
        part_html = MIMEText(html_content, 'html', 'utf-8')
        
        msg.attach(part_plain)
        msg.attach(part_html)
    
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
            
        print(f"Email enviado a {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ Error enviando email: {e}")
        import traceback
        traceback.print_exc()
        return False

def send_verification_email(to_email: str, username: str, token: str):
    verification_link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    subject = "Verifica tu cuenta - Scriptorium"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{font-family: Arial, sans-serif; line-height: 1.6;}}
            .container {{max-width: 600px; margin: 0 auto; padding: 20px;}}
            .button {{
                background-color: #4CAF50;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 4px;
                display: inline-block;
                margin: 20px 0;
            }}
            .footer {{margin-top: 30px; font-size: 12px; color: #666;}}
            .link {{word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;}}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Bienvenido a Scriptorium, {username}</h1>
            <p>Gracias por registrarte. Por favor, verifica tu direcci&oacute;n de email para activar tu cuenta.</p>
            <p style="text-align: center;">
                <a href="{verification_link}" class="button">Verificar mi cuenta</a>
            </p>
            <p>O copia este enlace en tu navegador:</p>
            <p class="link">{verification_link}</p>
            <div class="footer">
                <p>Si no creaste esta cuenta, ignora este mensaje.</p>
                <p>&copy; 2026 Scriptorium - Mejora tu mecanograf&iacute;a</p>
            </div>
        </div>
    </body>
    </html>
    """
    
Bienvenido a Scriptorium, {username}

Verifica tu cuenta: {verification_link}

Este enlace expirara en 24 horas.

Si no creaste esta cuenta, ignora este mensaje.

© 2026 Scriptorium - Mejora tu mecanografia
    """
    
    return send_email(to_email, subject, plain_text, html_content)

def send_password_reset_email(to_email: str, username: str, token: str):
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    subject = "Recupera tu contraseña - Scriptorium"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{font-family: Arial, sans-serif; line-height: 1.6;}}
            .container {{max-width: 600px; margin: 0 auto; padding: 20px;}}
            .button {{
                background-color: #ff9800;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 4px;
                display: inline-block;
                margin: 20px 0;
            }}
            .footer {{margin-top: 30px; font-size: 12px; color: #666;}}
            .link {{word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;}}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Recupera tu contrase&ntilde;a</h1>
            <p>Hola {username}, recibimos una solicitud para restablecer tu contrase&ntilde;a.</p>
            <p style="text-align: center;">
                <a href="{reset_link}" class="button">Restablecer mi contrase&ntilde;a</a>
            </p>
            <p>Este enlace expirar&aacute; en 1 hora.</p>
            <p>Si no solicitaste esto, ignora este mensaje.</p>
            <div class="footer">
                <p>&copy; 2026 Scriptorium - Mejora tu mecanograf&iacute;a</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_text = f"""
Recupera tu contraseña - Scriptorium

Hola {username},

Recibimos una solicitud para restablecer tu contraseña.

Restablece tu contraseña: {reset_link}

Este enlace expirara en 1 hora.

Si no solicitaste esto, ignora este mensaje.

© 2026 Scriptorium - Mejora tu mecanografia
    """
    
    return send_email(to_email, subject, plain_text, html_content)
