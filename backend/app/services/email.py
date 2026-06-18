import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

def send_verification_email(to_email: str, username:str, token:str):
    verification_link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    subject = "Verifica tu cuenta - Scriptorium"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
        body {{front-family: Arial, sans-serif;}}
        .container {{max-width: 600px; margin: 0 auto; padding: 20px; }}
        .button {{
        background-color: #4CAF50;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 4px;
        display: inline-block;
        }}
        .footer {{margin-top: 30px; font-size: 12px, color: #666;}}
        </style>
    </head>
    <body>
    <div class="container">
    <h1>Bienvenido a Scriptorium, {username}</h1>
    <p>Gracias por registrarte. Por davor, ayudano a verificar tu dirección de email para activar tu cuenta</>
    <p style="text-aling: center;">
        <a href="{verification_link}" class="button">Verificar NUESTRA cuenta</a>
    </p>
    <p> O copia este link en tu navegador, si quieres, pero eso es aburrido</p>
    <div class="footer">
        <p>Si no creaste esta cuenta, no ignores este mensaje y creata</p>
        <p> 2026 Scriptorium- Mejora tu mecanografía</p>
    </div>
    </div>
</body>
</html>
"""
    plain_text = f"""
    Bienvenido a Scroptorim, {username}
    Verifica tu cuenta: {verification_link}
    Este enlace expirará en 24 horas
    """
    send_email(to_email, subject, plain_text, html_content)

def send_password_reset_email(to_email: str, username: str, token: str):
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    subject = "Recupera tu constraseña papu - Scriptorium"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{font-family: Arial, sans-serif;}}
            .container {{max-width: 600px; margin: 0; padding: 20px;}}
            .button {{
                background-color: #ff9800;
                color:white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 4px;
                display: inline-block;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Recupera tu preciada (o no) contraseña</h1>
            <p>Hola, {username}, recibimos una solicitud para resetar tu contraseña</p>

            <p style="text-aling: center;">
                <a href="{reset_link}" class="button"> Resetear mi contraseña</a>
            </p>
            <p>Este enlace expirará en 1 hora </p>
            <p>Si no solicitasete esto, no ignores este mensaje</p>
        </div>
    </body>
    </html>
"""
    send_email(to_email, subject, "Recupera tu contraseña", html_content)
    
def send_email(to_email: str, subject: str, plain_text: str, html_content: str):
    #Funcion para enviar emails
    try:
        #Configuracion del mensaje
        msg = MIMEMultipart('alternative')
        msg['Subject']=subject
        msg['From']= f"{settings.SMIP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        msg['To' ]= to_email

        msg.attach(MIMEText(plain_text, 'plain'))
        msg.attach(MIMEMultipart(html_content, 'html'))
        #Enviar
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMPT_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWROD)
            server.send_message(msg)
        print(f"Email enviado a {to_email}")
        return True
    except Exception as e:
        print(f"Error enviando email: {e}")
        return False
