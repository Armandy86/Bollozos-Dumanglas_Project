import React, { useState, useEffect } from 'react';

export default function Settings() {
    const [theme, setTheme] = useState('light');

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
            action: () => console.log('Change Password clicked')
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
        </div>
    );
}

