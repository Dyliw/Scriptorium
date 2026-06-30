from pydantic import BaseModel, Field
from typing import Optional

class UserSettings(BaseModel):
    notifications: bool = Field(True, description="Recibir notificaciones")
    public_profile: bool = Field(True, description="Perfil público")
    show_stats: bool = Field(True, description="Mostrar estadísticas")
    language: str = Field("es", description="Idioma preferido (es, en, de)")
    theme: str = Field("light", description="Tema (light, dark)")
    typing_sound: bool = Field(True, description="Sonido al tipear")

class UserSettingsUpdate(BaseModel):
    notifications: Optional[bool] = None
    public_profile: Optional[bool] = None
    show_stats: Optional[bool] = None
    language: Optional[str] = Field(None, regex="^(es|en|de)$")
    theme: Optional[str] = Field(None, regex="^(light|dark)$")
    typing_sound: Optional[bool] = None
