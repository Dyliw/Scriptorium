import { useState, useCallback } from 'react';
import { sessionsAPI } from '../api/sessions';

export const useSessionStats = () => {
    const [sessions, setSessions] = useState([]);
    const [stats, setStats] = useState(null);
    const [chapterStats, setChapterStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Guardar una sesión de práctica
    const saveSession = useCallback(async (sessionData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await sessionsAPI.save(sessionData);
            return response.data;
        } catch (err) {
            setError(err.message || 'Error al guardar sesión');
            console.error('Error saving session:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener mis sesiones
    const loadMySessions = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await sessionsAPI.getMySessions(params);
            setSessions(response.data || []);
            return response.data;
        } catch (err) {
            setError(err.message || 'Error al cargar sesiones');
            console.error('Error loading sessions:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener estadísticas generales
    const loadMyStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await sessionsAPI.getMyStats();
            setStats(response.data);
            return response.data;
        } catch (err) {
            setError(err.message || 'Error al cargar estadísticas');
            console.error('Error loading stats:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener estadísticas de un capítulo específico
    const loadChapterStats = useCallback(async (chapterId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await sessionsAPI.getChapterStats(chapterId);
            setChapterStats(response.data);
            return response.data;
        } catch (err) {
            setError(err.message || 'Error al cargar estadísticas del capítulo');
            console.error('Error loading chapter stats:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Eliminar una sesión
    const deleteSession = useCallback(async (sessionId) => {
        setLoading(true);
        setError(null);
        try {
            await sessionsAPI.delete(sessionId);
            // Actualizar lista
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            return true;
        } catch (err) {
            setError(err.message || 'Error al eliminar sesión');
            console.error('Error deleting session:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        // Estado
        sessions,
        stats,
        chapterStats,
        loading,
        error,
        
        // Acciones
        saveSession,
        loadMySessions,
        loadMyStats,
        loadChapterStats,
        deleteSession,
    };
};
