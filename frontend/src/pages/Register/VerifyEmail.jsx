import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import toast from 'react-hot-toast';
import './Auth.css';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [verified, setVerified] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const verify = async () => {
            const token = searchParams.get('token');
            
            if (!token) {
                toast.error('Token de verificación no encontrado');
                setLoading(false);
                return;
            }

            try {
                const response = await authAPI.verifyEmail(token);
                console.log('Verificación exitosa:', response);
                setVerified(true);
                toast.success('¡Email verificado exitosamente!');
                
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (error) {
                console.error('Error verificando email:', error);
                toast.error(error.response?.data?.detail || 'Error al verificar email');
                setVerified(false);
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [searchParams, navigate]);

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Verificación de Email</h1>
                </div>

                <div className="verification-content">
                    {loading ? (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                            <p>Verificando tu email...</p>
                        </div>
                    ) : verified ? (
                        <div className="success-message">
                            <span className="icon">✅</span>
                            <h2>¡Email Verificado!</h2>
                            <p>Tu cuenta ha sido verificada exitosamente.</p>
                            <p className="redirect-info">Serás redirigido al login en unos segundos...</p>
                        </div>
                    ) : (
                        <div className="error-message">
                            <span className="icon">❌</span>
                            <h2>Error de Verificación</h2>
                            <p>El token de verificación es inválido o ha expirado.</p>
                            <button 
                                onClick={() => navigate('/login')}
                                className="auth-button"
                            >
                                Ir al Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
