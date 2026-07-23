import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../api/users';
import { useState } from 'react';

const EditProfile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    description: user?.description || '',
    settings_language: user?.settings_language || 'es',
    settings_theme: user?.settings_theme || 'light'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await usersAPI.updateProfile(user.id_user, formData);
      setUser(updatedUser); // Actualizar el contexto
      toast.success('Perfil actualizado!');
    } catch (error) {
      toast.error('Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar formulario...
};
