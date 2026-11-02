// 1. Imports
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, User, Mail, Lock } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

// 2. Register Component
const Register = () => {

    const navigate = useNavigate();
    const { register, loading } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
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

    // Handle Registration
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (formData.password.length < 8) {
            setError('Password must contain at least 8 characters.');
            return;
        }

        try {
            await register(formData);
            navigate('/chat');

        } catch (error) {
            setError(
                error.response?.data?.message || 'Registration failed. Please try again.'
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

                <h1>Create Account</h1>

                <p className="auth-subtitle">
                    Join Nexus Chat and start connecting
                </p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Username</label>

                        <div className="input-wrapper">
                            <User size={18} />

                            <input
                                type="text"
                                name="username"
                                placeholder="Choose a username"
                                value={formData.username}
                                onChange={handleChange}
                                minLength={3}
                                maxLength={30}
                                required
                            />
                        </div>
                    </div>

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
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                minLength={8}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>

                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/">Sign In</Link>
                </p>

            </div>

        </div>
    );
};

// 4. Export
export default Register;