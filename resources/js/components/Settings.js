import React, { useState, useEffect } from 'react';

export default function Settings() {
    const [theme, setTheme] = useState('light');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Load theme from localStorage on component mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    // Function to toggle theme
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    // Function to handle password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        // Validation
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setPasswordError('All fields are required');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters long');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (passwordForm.currentPassword === passwordForm.newPassword) {
            setPasswordError('New password must be different from current password');
            return;
        }

        setIsLoading(true);

        try {
            const userEmail = localStorage.getItem('userEmail');
            if (!userEmail) {
                setPasswordError('User email not found. Please login again.');
                setIsLoading(false);
                return;
            }

            const response = await fetch('/api/user/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userEmail,
                    current_password: passwordForm.currentPassword,
                    new_password: passwordForm.newPassword,
                    new_password_confirmation: passwordForm.confirmPassword
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setPasswordSuccess('Password changed successfully!');
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setTimeout(() => {
                    setShowPasswordModal(false);
                    setPasswordSuccess('');
                }, 2000);
            } else {
                setPasswordError(data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setPasswordError('An error occurred while changing password');
        } finally {
            setIsLoading(false);
        }
    };

    // Function to open password modal
    const openPasswordModal = () => {
        setShowPasswordModal(true);
        setPasswordError('');
        setPasswordSuccess('');
        setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    const settingsOptions = [
        {
            id: 'edit-profile',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            ),
            iconBg: theme === 'dark' ? '#374151' : '#EEF2FF',
            title: 'Edit Profile',
            description: 'Update your personal information like name, contact details, and profile picture.',
            action: () => console.log('Edit Profile clicked')
        },
        {
            id: 'change-password',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
            ),
            iconBg: theme === 'dark' ? '#374151' : '#D1FAE5',
            title: 'Change Password',
            description: 'Update your account password for enhanced security.',
            action: openPasswordModal
        },
        {
            id: 'change-theme',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2">
                    {theme === 'dark' ? (
                        // Sun icon for dark mode
                        <>
                            <circle cx="12" cy="12" r="5"/>
                            <line x1="12" y1="1" x2="12" y2="3"/>
                            <line x1="12" y1="21" x2="12" y2="23"/>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                            <line x1="1" y1="12" x2="3" y2="12"/>
                            <line x1="21" y1="12" x2="23" y2="12"/>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                        </>
                    ) : (
                        // Moon icon for light mode
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    )}
                </svg>
            ),
            iconBg: theme === 'dark' ? '#374151' : '#EDE9FE',
            title: 'Change Theme',
            description: `Switch to ${theme === 'light' ? 'dark' : 'light'} mode for ${theme === 'light' ? 'better' : 'brighter'} viewing experience.`,
            action: toggleTheme
        },
        {
            id: 'logout',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
            ),
            iconBg: theme === 'dark' ? '#374151' : '#FEF3C7',
            title: 'Logout',
            description: 'Securely sign out of your account.',
            action: () => {
                if (confirm('Are you sure you want to logout?')) {
                    // Clear authentication data
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('userEmail');
                    // Redirect to login page
                    window.location.href = '/login';
                }
            }
        }
    ];

    return (
        <div style={{ 
            padding: '48px 64px', 
            background: 'var(--bg-secondary)', 
            minHeight: '100vh',
            width: '100%',
            transition: 'background-color 0.3s ease'
        }}>
            {/* Header */}
            <div style={{ marginBottom: 48 }}>
                <h1 style={{ 
                    fontSize: 36,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: 12,
                    margin: 0,
                    transition: 'color 0.3s ease'
                }}>
                    Settings
                </h1>
                <p style={{ 
                    fontSize: 15,
                    color: 'var(--text-secondary)',
                    lineHeight: '24px',
                    maxWidth: 700,
                    margin: '12px 0 0 0',
                    transition: 'color 0.3s ease'
                }}>
                    Allows the user to update profile information, change their account password, 
                    switch between light and dark themes, and securely log out of the system.
                </p>
            </div>

            {/* Settings Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 24,
                maxWidth: 1000
            }}>
                {settingsOptions.map((option) => (
                    <div
                        key={option.id}
                        onClick={option.action}
                        style={{
                            background: 'var(--card-bg)',
                            border: '1px solid var(--border-primary)',
                            borderRadius: 12,
                            padding: 28,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                            e.currentTarget.style.borderColor = 'var(--border-secondary)';
                            e.currentTarget.style.background = 'var(--hover-bg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                            e.currentTarget.style.borderColor = 'var(--border-primary)';
                            e.currentTarget.style.background = 'var(--card-bg)';
                        }}
                    >
                        {/* Icon */}
                        <div style={{
                            width: 56,
                            height: 56,
                            borderRadius: 12,
                            background: option.iconBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 20,
                            transition: 'background-color 0.3s ease'
                        }}>
                            {option.icon}
                        </div>

                        {/* Title */}
                        <h3 style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            margin: '0 0 8px 0',
                            transition: 'color 0.3s ease'
                        }}>
                            {option.title}
                        </h3>

                        {/* Description */}
                        {option.description && (
                            <p style={{
                                fontSize: 13,
                                color: 'var(--text-secondary)',
                                lineHeight: '20px',
                                margin: 0,
                                transition: 'color 0.3s ease'
                            }}>
                                {option.description}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: 'var(--card-bg)',
                        borderRadius: 16,
                        padding: 40,
                        maxWidth: 480,
                        width: '90%',
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid var(--border-primary)',
                        transition: 'all 0.3s ease'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 24
                        }}>
                            <h2 style={{
                                fontSize: 24,
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                margin: 0,
                                transition: 'color 0.3s ease'
                            }}>
                                Change Password
                            </h2>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-secondary)',
                                    transition: 'color 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {/* Success Message */}
                        {passwordSuccess && (
                            <div style={{
                                background: '#D1FAE5',
                                border: '1px solid #10B981',
                                color: '#065F46',
                                padding: 12,
                                borderRadius: 8,
                                marginBottom: 20,
                                fontSize: 14,
                                fontWeight: 500
                            }}>
                                ✓ {passwordSuccess}
                            </div>
                        )}

                        {/* Error Message */}
                        {passwordError && (
                            <div style={{
                                background: '#FEE2E2',
                                border: '1px solid #EF4444',
                                color: '#991B1B',
                                padding: 12,
                                borderRadius: 8,
                                marginBottom: 20,
                                fontSize: 14,
                                fontWeight: 500
                            }}>
                                ✕ {passwordError}
                            </div>
                        )}

                        {/* Password Form */}
                        <form onSubmit={handlePasswordChange}>
                            {/* Current Password */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    marginBottom: 8,
                                    transition: 'color 0.3s ease'
                                }}>
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                    placeholder="Enter current password"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '1px solid var(--border-primary)',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        transition: 'all 0.3s ease',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'var(--accent-primary)';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'var(--border-primary)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            {/* New Password */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    marginBottom: 8,
                                    transition: 'color 0.3s ease'
                                }}>
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                    placeholder="Enter new password (min. 6 characters)"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '1px solid var(--border-primary)',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        transition: 'all 0.3s ease',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'var(--accent-primary)';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'var(--border-primary)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            {/* Confirm New Password */}
                            <div style={{ marginBottom: 28 }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    marginBottom: 8,
                                    transition: 'color 0.3s ease'
                                }}>
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                    placeholder="Re-enter new password"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '1px solid var(--border-primary)',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        transition: 'all 0.3s ease',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'var(--accent-primary)';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'var(--border-primary)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            {/* Form Actions */}
                            <div style={{
                                display: 'flex',
                                gap: 12,
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    style={{
                                        padding: '12px 24px',
                                        border: '1px solid var(--border-primary)',
                                        borderRadius: 8,
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--hover-bg)';
                                        e.currentTarget.style.borderColor = 'var(--border-secondary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'var(--bg-secondary)';
                                        e.currentTarget.style.borderColor = 'var(--border-primary)';
                                    }}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '12px 24px',
                                        border: 'none',
                                        borderRadius: 8,
                                        background: isLoading ? '#9CA3AF' : '#6366F1',
                                        color: 'white',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isLoading) {
                                            e.currentTarget.style.background = '#4F46E5';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isLoading) {
                                            e.currentTarget.style.background = '#6366F1';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }
                                    }}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

