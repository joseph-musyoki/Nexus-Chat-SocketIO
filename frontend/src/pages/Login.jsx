// 1. Imports
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Lock, Mail } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

// 2. Login Component
const Login = () => {

    const navigate = useNavigate();
    const { login, loading } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');

    // Handle Input Changes
    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    // Handle Login
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        try {
            await login(formData);
            navigate('/chat');

        } catch (error) {
            setError(
                error.response?.data?.message || 'Login failed. Please try again.'
            );
        }
    };

    // 3. UI
    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="auth-logo">
                    <MessageCircle size={34} />
                </div>

                <h1>Welcome Back</h1>

                <p className="auth-subtitle">
                    Sign in to continue to Nexus Chat
                </p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Email Address</label>

                        <div className="input-wrapper">
                            <Mail size={18} />

                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <div className="input-wrapper">
                            <Lock size={18} />

                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Create Account</Link>
                </p>

            </div>

        </div>
    );
};

// 4. Export
export default Login;