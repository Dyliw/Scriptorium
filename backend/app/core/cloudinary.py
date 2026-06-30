import cloudinary
import cloudinary.uploader
from app.config import settings

def init_cloudinary():
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret = settings.CLOUDINARY_API_SECRET,
        secure=True
    )
def upload_image(file, folder: str=None)->dict:
    try:
        result = cloudinary.uploader.upload(
            file.file,
            folder=folder or settings.CLOUDINARY_FOLDER,
            transformation=[
                {"width": 500, "height": 500, "crop": "limit"},
                {"quality": auto}
            ]
        )
        return{
            "url": result["secure_url"],
            "public_id": result["public_id"],
            "width": result["width"],
            "height": result["height"]
        }
        except Exception as e:
            raise ValueError(f"Error al subir la imagen: {str(e)}")
            
def delete_imagen(public_id: str)->bool:
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
        except Exception:
            return False
            
