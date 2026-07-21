import { useState } from 'react';
import { sessionsAPI } from '../api/sessions';
import { useAuth } from '../context/AuthContext';

export const useTypingSession = () => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const saveSession = async (sessionData) => {
    if (!user) {
      console.warn('Usuario no autenticado, no se guardará la sesión');
      return null;
    }

    setIsSaving(true);
    try {
      const data = {
        ...sessionData,
        id_user: user.id_user
      };
      const response = await sessionsAPI.save(data);
      return response;
    } catch (error) {
      console.error('Error al guardar sesión:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const getMySessions = async (params = {}) => {
    try {
      const response = await sessionsAPI.getMySessions(params);
      return response;
    } catch (error) {
      console.error('Error al obtener sesiones:', error);
      throw error;
    }
  };

  return { saveSession, getMySessions, isSaving };
};
