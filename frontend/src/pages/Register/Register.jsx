import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name || formData.name.length < 3) {
            newErrors.name = 'El nombre debe tener al menos 3 caracteres';
        }
        if (!formData.email) {
            newErrors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }
        if (!formData.password || formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }
        if (!formData.confirm_password) {
            newErrors.confirm_password = 'Confirma tu contraseña';
        } else if (formData.password !== formData.confirm_password) {
            newErrors.confirm_password = 'Las contraseñas no coinciden';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        
        try {
            const response = await authAPI.register(formData);
            console.log('Registro exitoso:', response);
            
            toast.success('¡Registro exitoso! Revisa tu email para verificar tu cuenta.');
            
            setTimeout(() => {
                navigate('/login');
            }, 3000);
            
        } catch (error) {
            console.error('Error en registro:', error);
            
            const errorMessage = error.response?.data?.detail || 'Error al registrarse';
          
            if (Array.isArray(errorMessage)) {
                errorMessage.forEach(err => {
                    toast.error(err.msg || err);
                });
            } else {
                toast.error(errorMessage);
            }
            if (error.response?.data?.detail) {
                setErrors(prev => ({
                    ...prev,
                    general: error.response.data.detail
                }));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Crear Cuenta</h1>
                    <p>Únete a Scriptorium y mejora tu mecanografía</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Nombre de usuario</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ej: juan_perez"
                            className={errors.name ? 'error' : ''}
                            disabled={loading}
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="ejemplo@correo.com"
                            className={errors.email ? 'error' : ''}
                            disabled={loading}
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Mínimo 6 caracteres"
                            className={errors.password ? 'error' : ''}
                            disabled={loading}
                        />
                        {errors.password && <span className="error-message">{errors.password}</span>}
                        <div className="password-hint">
                            <small>• Mínimo 6 caracteres</small>
                            <small>• Al menos una mayúscula</small>
                            <small>• Al menos un número</small>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm_password">Confirmar contraseña</label>
                        <input
                            type="password"
                            id="confirm_password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            placeholder="Repite tu contraseña"
                            className={errors.confirm_password ? 'error' : ''}
                            disabled={loading}
                        />
                        {errors.confirm_password && <span className="error-message">{errors.confirm_password}</span>}
                    </div>

                    {errors.general && (
                        <div className="error-message general-error">
                            {errors.general}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="auth-link">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>

                <div className="auth-features">
                    <div className="feature">
                        <p>Practica con libros</p>
                    </div>
                    <div className="feature">
                        <p>Sigue tu progreso</p>
                    </div>
                    <div className="feature">
                        <p>Logros y estadísticas</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
