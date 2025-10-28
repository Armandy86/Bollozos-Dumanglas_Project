import React, { useState } from 'react';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check credentials
        if (formData.email === 'admin' && formData.password === 'admin123') {
            // Store login state in localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', formData.email);
            
            // Redirect to dashboard
            window.location.href = '/';
        } else {
            setError('Invalid email or password. Please try again.');
        }
        
        setIsLoading(false);
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
        }}>
            {/* Left Section - Login Form */}
            <div style={{
                flex: 1,
                background: '#f5f7fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: '20px'
            }}>
                {/* FSUU Logo Watermark */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.1,
                    zIndex: 0,
                    pointerEvents: 'none'
                }}>
                    <img 
                        src="/images/fsuu-logo.png" 
                        alt="FSUU Logo Watermark" 
                        style={{
                            width: '400px',
                            height: '400px',
                            objectFit: 'contain'
                        }}
                    />
                </div>

                {/* Login Card */}
                <div style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '48px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    width: '100%',
                    maxWidth: '400px',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {/* Logo */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '24px'
                    }}>
                        <img 
                            src="/images/fsuu-logo.png" 
                            alt="FSUU Logo" 
                            style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'contain'
                            }}
                        />
                    </div>

                    {/* Title */}
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        color: '#1a1a1a',
                        textAlign: 'center',
                        margin: '0 0 32px 0'
                    }}>
                        Log In
                    </h1>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '24px',
                            color: '#dc2626',
                            fontSize: '14px',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#4a5568',
                                marginBottom: '8px'
                            }}>
                                Username
                            </label>
                            <input
                                type="text"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your username"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s ease',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#2196F3'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                        </div>

                        {/* Password Field */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#4a5568',
                                marginBottom: '8px'
                            }}>
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Create a password"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s ease',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#2196F3'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '32px'
                        }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '14px',
                                color: '#4a5568',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleInputChange}
                                    style={{
                                        marginRight: '8px',
                                        accentColor: '#2196F3'
                                    }}
                                />
                                Remember me
                            </label>
                            <a href="#" style={{
                                fontSize: '14px',
                                color: '#2196F3',
                                textDecoration: 'none',
                                fontWeight: '500'
                            }}>
                                Forgot password?
                            </a>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                background: isLoading ? '#94a3b8' : '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '14px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'background-color 0.2s ease',
                                marginBottom: '24px',
                                opacity: isLoading ? 0.7 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (!isLoading) e.target.style.background = '#1976D2';
                            }}
                            onMouseLeave={(e) => {
                                if (!isLoading) e.target.style.background = '#2196F3';
                            }}
                        >
                            {isLoading ? (
                                <>
                                    {/* Loading Spinner */}
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                                    </svg>
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    {/* User Icon */}
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                    Log In
                                </>
                            )}
                        </button>

                        {/* Sign Up Link */}
                        <div style={{
                            textAlign: 'center',
                            fontSize: '14px',
                            color: '#4a5568'
                        }}>
                            Don't have an account?{' '}
                            <a href="#" style={{
                                color: '#2196F3',
                                textDecoration: 'none',
                                fontWeight: '500'
                            }}>
                                Sign in here
                            </a>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Section - University Information */}
            <div style={{
                flex: 1,
                background: '#2196F3',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    color: 'white',
                    margin: '0 0 16px 0',
                    lineHeight: '1.2'
                }}>
                    Father Saturnino Urios University
                </h1>
                <p style={{
                    fontSize: '20px',
                    fontWeight: '400',
                    color: 'white',
                    margin: '0',
                    opacity: '0.9'
                }}>
                    Student and Faculty Profile Management System
                </p>
            </div>
        </div>
    );
}
