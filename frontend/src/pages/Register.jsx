import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    MessageCircle,
    User,
    Mail,
    Lock,
    Camera,
    LoaderCircle
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register, loading } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const [profilePicture, setProfilePicture] = useState(null);
    const [preview, setPreview] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!profilePicture) {
            setPreview('');
            return;
        }

        const imageUrl = URL.createObjectURL(profilePicture);
        setPreview(imageUrl);

        return () => URL.revokeObjectURL(imageUrl);
    }, [profilePicture]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        setError('');

        if (!file) {
            setProfilePicture(null);
            return;
        }

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (!allowedTypes.includes(file.type)) {
            setError('Choose a JPG, PNG, or WEBP image.');
            event.target.value = '';
            setProfilePicture(null);
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError('The profile picture must not exceed 2 MB.');
            event.target.value = '';
            setProfilePicture(null);
            return;
        }

        setProfilePicture(file);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        const username = formData.username.trim();
        const email = formData.email.trim().toLowerCase();

        if (!username || !email || !formData.password) {
            setError('Please fill in all required fields.');
            return;
        }

        if (formData.password.length < 8) {
            setError('Your password must contain at least 8 characters.');
            return;
        }

        const registrationData = new FormData();

        registrationData.append('username', username);
        registrationData.append('email', email);
        registrationData.append('password', formData.password);

        if (profilePicture) {
            registrationData.append('profilePicture', profilePicture);
        }

        try {
            await register(registrationData);
            navigate('/chat');
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Registration failed. Please try again.'
            );
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <MessageCircle size={30} />
                    </div>

                    <h1>Create your account</h1>

                    <p>
                        Join Nexus Chat and start connecting.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="profile-picture-picker">
                        <label
                            htmlFor="profilePicture"
                            className="profile-picture-label"
                            title="Choose a profile picture"
                        >
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Profile preview"
                                    className="profile-picture-preview"
                                />
                            ) : (
                                <User size={38} />
                            )}

                            <span className="profile-picture-camera">
                                <Camera size={16} />
                            </span>
                        </label>

                        <input
                            id="profilePicture"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                            hidden
                        />

                        <p>Profile picture (optional)</p>
                        <small>JPG, PNG or WEBP · Maximum 2 MB</small>
                    </div>

                    {error && (
                        <div className="auth-error" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="username">Username</label>

                        <div className="input-wrapper">
                            <User size={18} />

                            <input
                                id="username"
                                type="text"
                                name="username"
                                placeholder="Choose a username"
                                value={formData.username}
                                onChange={handleChange}
                                autoComplete="username"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email address</label>

                        <div className="input-wrapper">
                            <Mail size={18} />

                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>

                        <div className="input-wrapper">
                            <Lock size={18} />

                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="At least 8 characters"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="new-password"
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
                        {loading ? (
                            <>
                                <LoaderCircle size={18} className="spin" />
                                Creating account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;