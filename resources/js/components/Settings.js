import React, { useState, useEffect } from 'react';
import ManageDepartments from './ManageDepartments';
import ManageAcademicYears from './ManageAcademicYears';
import { fetchArchivedStudents, fetchArchivedFaculty, restoreStudent, restoreFaculty } from '../utils/api';

export default function Settings() {
    const [theme, setTheme] = useState('light');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showDepartmentsModal, setShowDepartmentsModal] = useState(false);
    const [showAcademicYearsModal, setShowAcademicYearsModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [profileForm, setProfileForm] = useState({
        name: '',
        username: '',
        bio: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [showArchivedModal, setShowArchivedModal] = useState(false);
    const [archivedStudents, setArchivedStudents] = useState([]);
    const [archivedFaculty, setArchivedFaculty] = useState([]);
    const [activeTab, setActiveTab] = useState('students'); // 'students' or 'faculty'
    const [isRestoring, setIsRestoring] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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

    // Function to load archived data
    const loadArchivedData = async () => {
        try {
            const [students, faculty] = await Promise.all([
                fetchArchivedStudents(),
                fetchArchivedFaculty()
            ]);
            setArchivedStudents(students);
            setArchivedFaculty(faculty);
        } catch (error) {
            console.error('Error loading archived data:', error);
        }
    };

    // Function to restore student
    const handleRestoreStudent = async (id) => {
        if (!confirm('Are you sure you want to restore this student?')) return;
        
        setIsRestoring(true);
        try {
            const result = await restoreStudent(id);
            if (result.success) {
                alert('Student restored successfully!');
                await loadArchivedData();
            } else {
                alert('Failed to restore student');
            }
        } catch (error) {
            console.error('Error restoring student:', error);
            alert('Error restoring student');
        } finally {
            setIsRestoring(false);
        }
    };

    // Function to restore faculty
    const handleRestoreFaculty = async (id) => {
        if (!confirm('Are you sure you want to restore this faculty member?')) return;
        
        setIsRestoring(true);
        try {
            const result = await restoreFaculty(id);
            if (result.success) {
                alert('Faculty member restored successfully!');
                await loadArchivedData();
            } else {
                alert('Failed to restore faculty member');
            }
        } catch (error) {
            console.error('Error restoring faculty:', error);
            alert('Error restoring faculty member');
        } finally {
            setIsRestoring(false);
        }
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
                // Show detailed validation errors if available
                if (data.errors) {
                    const errorMessages = Object.values(data.errors).flat().join('. ');
                    setPasswordError(errorMessages || data.message || 'Failed to change password');
                } else {
                    setPasswordError(data.message || 'Failed to change password');
                }
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

    // Function to fetch user profile
    const fetchProfile = async () => {
        try {
            const userEmail = localStorage.getItem('userEmail');
            if (!userEmail) {
                setProfileError('User email not found. Please login again.');
                return;
            }

            const response = await fetch(`/api/profile?email=${encodeURIComponent(userEmail)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setProfileForm({
                    name: data.data.name || '',
                    username: data.data.email || '',
                    bio: data.data.bio || ''
                });
            } else {
                setProfileError(data.message || 'Failed to fetch profile');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfileError('An error occurred while fetching profile');
        }
    };

    // Function to open profile modal
    const openProfileModal = async () => {
        setShowProfileModal(true);
        setProfileError('');
        setProfileSuccess('');
        await fetchProfile();
    };

    // Function to handle profile update
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');

        // Validation
        if (!profileForm.name || !profileForm.username) {
            setProfileError('Name and username are required');
            return;
        }

        setIsProfileLoading(true);

        try {
            const currentEmail = localStorage.getItem('userEmail');
            if (!currentEmail) {
                setProfileError('User email not found. Please login again.');
                setIsProfileLoading(false);
                return;
            }

            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    current_email: currentEmail,
                    name: profileForm.name,
                    email: profileForm.username,
                    bio: profileForm.bio
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setProfileSuccess('Profile updated successfully!');
                // Update username in localStorage if changed
                if (profileForm.username !== currentEmail) {
                    localStorage.setItem('userEmail', profileForm.username);
                }
                setTimeout(() => {
                    setShowProfileModal(false);
                    setProfileSuccess('');
                }, 2000);
            } else {
                setProfileError(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setProfileError('An error occurred while updating profile');
        } finally {
            setIsProfileLoading(false);
        }
    };

    const settingsOptions = [
        {
            id: 'edit-profile',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            ),
            iconBg: theme === 'dark' ? '#374151' : '#DBEAFE',
            title: 'Edit Profile',
            description: 'Update your personal information and profile details.',
            action: openProfileModal
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
            id: 'manage-departments',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
            ),
            iconBg: theme === 'dark' ? '#374151' : '#FED7AA',
            title: 'Manage Departments',
            description: 'Add, edit, and archive department information.',
            action: () => setShowDepartmentsModal(true)
        },
        {
            id: 'manage-academic-years',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
            ),
            iconBg: theme === 'dark' ? '#374151' : '#DBEAFE',
            title: 'Manage Academic Years',
            description: 'Add, edit, and archive academic year information.',
            action: () => setShowAcademicYearsModal(true)
        },
        {
            id: 'archived-items',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
            ),
            iconBg: theme === 'dark' ? '#374151' : '#EDE9FE',
            title: 'Archived Students/Faculty',
            description: 'View and restore archived students and faculty members.',
            action: async () => {
                setShowArchivedModal(true);
                setSearchTerm('');
                await loadArchivedData();
            }
        },
        {
            id: 'change-theme',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2">
                    {theme === 'dark' ? (
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
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('userEmail');
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
                    Manage your profile information, update your account password, 
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

            {/* Profile Edit Modal */}
            {showProfileModal && (
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
                    backdropFilter: 'blur(4px)',
                    overflowY: 'auto'
                }}>
                    <div style={{
                        background: 'var(--card-bg)',
                        borderRadius: 16,
                        padding: 40,
                        maxWidth: 500,
                        width: '90%',
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid var(--border-primary)',
                        transition: 'all 0.3s ease',
                        margin: '20px 0'
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
                                Edit Profile
                            </h2>
                            <button
                                onClick={() => setShowProfileModal(false)}
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
                        {profileSuccess && (
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
                                ✓ {profileSuccess}
                            </div>
                        )}

                        {/* Error Message */}
                        {profileError && (
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
                                ✕ {profileError}
                            </div>
                        )}

                        {/* Profile Form */}
                        <form onSubmit={handleProfileUpdate}>
                            {/* Name */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    marginBottom: 8,
                                    transition: 'color 0.3s ease'
                                }}>
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.name}
                                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                                    placeholder="Enter your name"
                                    required
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

                            {/* Username */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    marginBottom: 8,
                                    transition: 'color 0.3s ease'
                                }}>
                                    Username (Login) *
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.username}
                                    onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                                    placeholder="Enter your username"
                                    required
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

                            {/* Description/Bio */}
                            <div style={{ marginBottom: 28 }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    marginBottom: 8,
                                    transition: 'color 0.3s ease'
                                }}>
                                    Description
                                </label>
                                <textarea
                                    value={profileForm.bio}
                                    onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                                    placeholder="Tell us about yourself"
                                    rows="4"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '1px solid var(--border-primary)',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        transition: 'all 0.3s ease',
                                        outline: 'none',
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
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
                                justifyContent: 'flex-end',
                                marginTop: 28
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setShowProfileModal(false)}
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
                                    disabled={isProfileLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '12px 24px',
                                        border: 'none',
                                        borderRadius: 8,
                                        background: isProfileLoading ? '#9CA3AF' : '#6366F1',
                                        color: 'white',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: isProfileLoading ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isProfileLoading) {
                                            e.currentTarget.style.background = '#4F46E5';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isProfileLoading) {
                                            e.currentTarget.style.background = '#6366F1';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }
                                    }}
                                    disabled={isProfileLoading}
                                >
                                    {isProfileLoading ? 'Updating...' : 'Update Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Management Modals */}
            <ManageDepartments show={showDepartmentsModal} onClose={() => setShowDepartmentsModal(false)} />
            <ManageAcademicYears show={showAcademicYearsModal} onClose={() => setShowAcademicYearsModal(false)} />

            {/* Archived Items Modal */}
            {showArchivedModal && (
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
                    backdropFilter: 'blur(4px)',
                    overflowY: 'auto'
                }}>
                    <div style={{
                        background: 'var(--card-bg)',
                        borderRadius: 16,
                        padding: 40,
                        maxWidth: 900,
                        width: '90%',
                        maxHeight: '90vh',
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid var(--border-primary)',
                        transition: 'all 0.3s ease',
                        margin: '20px 0',
                        overflowY: 'auto'
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
                                Archived Students/Faculty
                            </h2>
                            <button
                                onClick={() => {
                                    setShowArchivedModal(false);
                                    setSearchTerm('');
                                }}
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

                        {/* Tabs */}
                        <div style={{
                            display: 'flex',
                            gap: 8,
                            marginBottom: 24,
                            borderBottom: '1px solid var(--border-primary)'
                        }}>
                            <button
                                onClick={() => {
                                    setActiveTab('students');
                                    setSearchTerm('');
                                }}
                                style={{
                                    padding: '12px 24px',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: activeTab === 'students' ? '2px solid #6366F1' : '2px solid transparent',
                                    color: activeTab === 'students' ? '#6366F1' : 'var(--text-secondary)',
                                    fontSize: 14,
                                    fontWeight: activeTab === 'students' ? 600 : 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Students ({archivedStudents.length})
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('faculty');
                                    setSearchTerm('');
                                }}
                                style={{
                                    padding: '12px 24px',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: activeTab === 'faculty' ? '2px solid #6366F1' : '2px solid transparent',
                                    color: activeTab === 'faculty' ? '#6366F1' : 'var(--text-secondary)',
                                    fontSize: 14,
                                    fontWeight: activeTab === 'faculty' ? 600 : 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Faculty ({archivedFaculty.length})
                            </button>
                        </div>

                        {/* Search Input */}
                        <div style={{ marginBottom: 20 }}>
                            <input
                                type="text"
                                placeholder={`Search ${activeTab === 'students' ? 'students' : 'faculty'} by name...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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

                        {/* Content */}
                        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            {activeTab === 'students' ? (
                                (() => {
                                    const filteredStudents = archivedStudents.filter(student => {
                                        if (!searchTerm) return true;
                                        const searchLower = searchTerm.toLowerCase();
                                        const fullName = `${student.first_name || ''} ${student.last_name || ''}`.toLowerCase();
                                        const studentId = (student.student_id || '').toLowerCase();
                                        const email = (student.email || '').toLowerCase();
                                        const program = (student.program || '').toLowerCase();
                                        return fullName.includes(searchLower) || 
                                               studentId.includes(searchLower) || 
                                               email.includes(searchLower) ||
                                               program.includes(searchLower);
                                    });
                                    
                                    return filteredStudents.length === 0 ? (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '40px 20px',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            <p>{searchTerm ? 'No archived students match your search.' : 'No archived students found.'}</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            {filteredStudents.map((student) => (
                                            <div
                                                key={student.id}
                                                style={{
                                                    background: 'var(--bg-secondary)',
                                                    border: '1px solid var(--border-primary)',
                                                    borderRadius: 8,
                                                    padding: 16,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                <div>
                                                    <div style={{
                                                        fontWeight: 600,
                                                        color: 'var(--text-primary)',
                                                        marginBottom: 4
                                                    }}>
                                                        {student.first_name} {student.last_name}
                                                    </div>
                                                    <div style={{
                                                        fontSize: 13,
                                                        color: 'var(--text-secondary)'
                                                    }}>
                                                        {student.student_id && `ID: ${student.student_id}`}
                                                        {student.email && ` • ${student.email}`}
                                                        {student.program && ` • ${student.program}`}
                                                    </div>
                                                    {student.deleted_at && (
                                                        <div style={{
                                                            fontSize: 12,
                                                            color: 'var(--text-secondary)',
                                                            marginTop: 4
                                                        }}>
                                                            Archived: {new Date(student.deleted_at).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleRestoreStudent(student.id)}
                                                    disabled={isRestoring}
                                                    style={{
                                                        padding: '8px 16px',
                                                        background: '#10B981',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        cursor: isRestoring ? 'not-allowed' : 'pointer',
                                                        opacity: isRestoring ? 0.6 : 1,
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isRestoring) {
                                                            e.currentTarget.style.background = '#059669';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isRestoring) {
                                                            e.currentTarget.style.background = '#10B981';
                                                        }
                                                    }}
                                                >
                                                    Restore
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    );
                                })()
                            ) : (
                                (() => {
                                    const filteredFaculty = archivedFaculty.filter(faculty => {
                                        if (!searchTerm) return true;
                                        const searchLower = searchTerm.toLowerCase();
                                        const fullName = `${faculty.first_name || ''} ${faculty.last_name || ''}`.toLowerCase();
                                        const facultyId = (faculty.faculty_id || '').toLowerCase();
                                        const email = (faculty.email || '').toLowerCase();
                                        const department = (faculty.department || '').toLowerCase();
                                        const position = (faculty.position || '').toLowerCase();
                                        return fullName.includes(searchLower) || 
                                               facultyId.includes(searchLower) || 
                                               email.includes(searchLower) ||
                                               department.includes(searchLower) ||
                                               position.includes(searchLower);
                                    });
                                    
                                    return filteredFaculty.length === 0 ? (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '40px 20px',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            <p>{searchTerm ? 'No archived faculty match your search.' : 'No archived faculty found.'}</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            {filteredFaculty.map((faculty) => (
                                            <div
                                                key={faculty.id}
                                                style={{
                                                    background: 'var(--bg-secondary)',
                                                    border: '1px solid var(--border-primary)',
                                                    borderRadius: 8,
                                                    padding: 16,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                <div>
                                                    <div style={{
                                                        fontWeight: 600,
                                                        color: 'var(--text-primary)',
                                                        marginBottom: 4
                                                    }}>
                                                        {faculty.first_name} {faculty.last_name}
                                                    </div>
                                                    <div style={{
                                                        fontSize: 13,
                                                        color: 'var(--text-secondary)'
                                                    }}>
                                                        {faculty.faculty_id && `ID: ${faculty.faculty_id}`}
                                                        {faculty.email && ` • ${faculty.email}`}
                                                        {faculty.department && ` • ${faculty.department}`}
                                                        {faculty.position && ` • ${faculty.position}`}
                                                    </div>
                                                    {faculty.deleted_at && (
                                                        <div style={{
                                                            fontSize: 12,
                                                            color: 'var(--text-secondary)',
                                                            marginTop: 4
                                                        }}>
                                                            Archived: {new Date(faculty.deleted_at).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleRestoreFaculty(faculty.id)}
                                                    disabled={isRestoring}
                                                    style={{
                                                        padding: '8px 16px',
                                                        background: '#10B981',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        cursor: isRestoring ? 'not-allowed' : 'pointer',
                                                        opacity: isRestoring ? 0.6 : 1,
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isRestoring) {
                                                            e.currentTarget.style.background = '#059669';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isRestoring) {
                                                            e.currentTarget.style.background = '#10B981';
                                                        }
                                                    }}
                                                >
                                                    Restore
                                                </button>
                                            </div>
                                            ))}
                                        </div>
                                    );
                                })()
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

