import React, { useEffect, useState } from 'react';
import Home from './Home';
import Faculty from './Faculty';
import Students from './Students';
import FacultyList from './FacultyList';
import Courses from './Courses';
import Schedule from './Schedule';
import Settings from './Settings';
import StatCard from './shared/StatCard';
import ListItem from './shared/ListItem';
import { DashboardIcon, StudentsIcon, FacultyIcon, CoursesIcon, ScheduleIcon, SettingsIcon, UserIcon } from './shared/Icons';
import { fetchStudents as apiFetchStudents, fetchFaculty as apiFetchFaculty, fetchDepartments } from '../utils/api';
import { buttonStylePrimary, buttonStyleSecondary, modalOverlay, modalContent, buttonStyleGhost } from '../utils/styles';

export default function Dashboard() {
    const [students, setStudents] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState('dashboard');
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showProfileDropdown && !event.target.closest('[data-profile-dropdown]')) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showProfileDropdown]);

    // Check authentication on component mount
    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            window.location.href = '/login';
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const [studentsData, facultyData] = await Promise.all([
                apiFetchStudents(),
                apiFetchFaculty()
            ]);
            setStudents(studentsData);
            setFaculty(facultyData);
            setLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        const loadDepartments = async () => {
            const data = await fetchDepartments();
            setDepartments(data);
        };
        loadDepartments();
    }, []);

    const [showAdd, setShowAdd] = useState(false);
    const openAddStudent = () => setShowAdd(true);
    const closeAddStudent = () => setShowAdd(false);
    const [showList, setShowList] = useState(false);
    const openList = () => setShowList(true);
    const closeList = () => setShowList(false);

    const [showStudentDetails, setShowStudentDetails] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const openStudentDetails = (student) => {
        setSelectedStudent(student);
        setShowStudentDetails(true);
    };
    const closeStudentDetails = () => {
        setShowStudentDetails(false);
        setSelectedStudent(null);
    };

    const [showEditStudent, setShowEditStudent] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [pendingChanges, setPendingChanges] = useState({});
    
    const openEditStudent = (student) => {
        setStudentToEdit(student);
        setShowEditStudent(true);
    };
    const closeEditStudent = () => {
        setShowEditStudent(false);
        setStudentToEdit(null);
        setEditingField(null);
        setEditValue('');
        setHasUnsavedChanges(false);
        setPendingChanges({});
    };

    const startEditing = (field, currentValue) => {
        setEditingField(field);
        setEditValue(currentValue || '');
    };

    const saveEdit = () => {
        if (!studentToEdit || !editingField) return;
        
        // Store the change in pending changes
        const newPendingChanges = { ...pendingChanges, [editingField]: editValue };
        setPendingChanges(newPendingChanges);
        setHasUnsavedChanges(true);
        
        setEditingField(null);
        setEditValue('');
    };

    const saveAllChanges = async () => {
        if (!studentToEdit || Object.keys(pendingChanges).length === 0) return;
        
        try {
            const updatedStudent = { ...studentToEdit, ...pendingChanges };
            const response = await fetch(`/api/students/${studentToEdit.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(updatedStudent)
            });

            if (response.ok) {
                setStudentToEdit(updatedStudent);
                setPendingChanges({});
                setHasUnsavedChanges(false);
                // Refresh the dashboard data
                fetch('/api/students').then(r=>r.json()).then(d=>setStudents(Array.isArray(d)?d:[]));
                alert('Student updated successfully!');
            }
        } catch (error) {
            console.error('Error updating student:', error);
        }
    };

    const cancelEdit = () => {
        setEditingField(null);
        setEditValue('');
    };

    const discardChanges = () => {
        setPendingChanges({});
        setHasUnsavedChanges(false);
        setEditingField(null);
        setEditValue('');
    };

    const [showAddFaculty, setShowAddFaculty] = useState(false);
    const openAddFaculty = () => setShowAddFaculty(true);
    const closeAddFaculty = () => setShowAddFaculty(false);
    const [showFacultyList, setShowFacultyList] = useState(false);
    const openFacultyList = () => setShowFacultyList(true);
    const closeFacultyList = () => setShowFacultyList(false);

    const [showFacultyDetails, setShowFacultyDetails] = useState(false);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const openFacultyDetails = (facultyMember) => {
        setSelectedFaculty(facultyMember);
        setShowFacultyDetails(true);
    };
    const closeFacultyDetails = () => {
        setShowFacultyDetails(false);
        setSelectedFaculty(null);
    };

    // Function to refresh all data
    const refreshAllData = async () => {
        try {
            const [studentsRes, facultyRes] = await Promise.all([
                fetch('/api/students'),
                fetch('/api/faculty')
            ]);
            
            const studentsData = await studentsRes.json();
            const facultyData = await facultyRes.json();
            
            setStudents(Array.isArray(studentsData) ? studentsData : []);
            setFaculty(Array.isArray(facultyData) ? facultyData : []);
        } catch (e) {
            console.error('Error refreshing data:', e);
        }
    };

    const [showEditFaculty, setShowEditFaculty] = useState(false);
    const [facultyToEdit, setFacultyToEdit] = useState(null);
    const [editingFacultyField, setEditingFacultyField] = useState(null);
    const [editFacultyValue, setEditFacultyValue] = useState('');
    const [hasUnsavedFacultyChanges, setHasUnsavedFacultyChanges] = useState(false);
    const [pendingFacultyChanges, setPendingFacultyChanges] = useState({});
    
    const openEditFaculty = (facultyMember) => {
        setFacultyToEdit(facultyMember);
        setShowEditFaculty(true);
    };
    const closeEditFaculty = () => {
        setShowEditFaculty(false);
        setFacultyToEdit(null);
        setEditingFacultyField(null);
        setEditFacultyValue('');
        setHasUnsavedFacultyChanges(false);
        setPendingFacultyChanges({});
    };

    const startFacultyEditing = (field, currentValue) => {
        setEditingFacultyField(field);
        setEditFacultyValue(currentValue || '');
    };

    const saveFacultyEdit = () => {
        if (!facultyToEdit || !editingFacultyField) return;
        
        // Store the change in pending changes
        const newPendingChanges = { ...pendingFacultyChanges, [editingFacultyField]: editFacultyValue };
        setPendingFacultyChanges(newPendingChanges);
        setHasUnsavedFacultyChanges(true);
        
        setEditingFacultyField(null);
        setEditFacultyValue('');
    };

    const saveAllFacultyChanges = async () => {
        if (!facultyToEdit || Object.keys(pendingFacultyChanges).length === 0) return;
        
        try {
            const updatedFaculty = { ...facultyToEdit, ...pendingFacultyChanges };
            const response = await fetch(`/api/faculty/${facultyToEdit.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(updatedFaculty)
            });

            if (response.ok) {
                setFacultyToEdit(updatedFaculty);
                setPendingFacultyChanges({});
                setHasUnsavedFacultyChanges(false);
                // Refresh the dashboard data
                fetch('/api/faculty').then(r=>r.json()).then(d=>{
                    const activeFaculty = Array.isArray(d) ? d.filter(faculty => faculty.status !== 'archived') : [];
                    setFaculty(activeFaculty);
                });
                alert('Faculty updated successfully!');
            }
        } catch (error) {
            console.error('Error updating faculty:', error);
        }
    };

    const cancelFacultyEdit = () => {
        setEditingFacultyField(null);
        setEditFacultyValue('');
    };

    const discardFacultyChanges = () => {
        setPendingFacultyChanges({});
        setHasUnsavedFacultyChanges(false);
        setEditingFacultyField(null);
        setEditFacultyValue('');
    };

    const goToStudents = () => {
        openList();
    };

    const goToFaculty = () => {
        openFacultyList();
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)', transition: 'background-color 0.3s ease' }}>
            {/* Sidebar */}
            <aside style={{
                width: '210px',
                background: 'var(--card-bg)',
                padding: '24px 16px',
                position: 'fixed',
                height: '100vh',
                overflowY: 'auto',
                borderRight: '1px solid var(--border-primary)',
                transition: 'background-color 0.3s ease, border-color 0.3s ease'
            }}>
                <nav>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        <li style={{ marginBottom: 4 }}>
                            <div 
                                onClick={() => setCurrentView('dashboard')}
                                style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 16px',
                                borderRadius: 8,
                                background: currentView === 'dashboard' ? 'var(--accent-primary)' : 'transparent',
                                color: currentView === 'dashboard' ? 'white' : 'var(--text-secondary)',
                                fontSize: 15,
                                fontWeight: currentView === 'dashboard' ? 600 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (currentView !== 'dashboard') e.currentTarget.style.background = 'var(--hover-bg)';
                            }}
                            onMouseLeave={(e) => {
                                if (currentView !== 'dashboard') e.currentTarget.style.background = 'transparent';
                            }}
                            >
                                <DashboardIcon color={currentView === 'dashboard' ? 'white' : 'var(--text-secondary)'} />
                                <span>Dashboard</span>
                            </div>
                        </li>
                        <li style={{ marginBottom: 4 }}>
                            <div 
                                onClick={() => setCurrentView('students')}
                                style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 16px',
                                borderRadius: 8,
                                background: currentView === 'students' ? 'var(--accent-primary)' : 'transparent',
                                color: currentView === 'students' ? 'white' : 'var(--text-secondary)',
                                fontSize: 15,
                                fontWeight: currentView === 'students' ? 600 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (currentView !== 'students') e.currentTarget.style.background = 'var(--hover-bg)';
                            }}
                            onMouseLeave={(e) => {
                                if (currentView !== 'students') e.currentTarget.style.background = 'transparent';
                            }}
                            >
                                <StudentsIcon color={currentView === 'students' ? 'white' : 'var(--text-secondary)'} />
                                <span>Students</span>
                            </div>
                        </li>
                        <li style={{ marginBottom: 4 }}>
                            <div 
                                onClick={() => setCurrentView('faculty')}
                                style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 16px',
                                borderRadius: 8,
                                background: currentView === 'faculty' ? 'var(--accent-primary)' : 'transparent',
                                color: currentView === 'faculty' ? 'white' : 'var(--text-secondary)',
                                fontSize: 15,
                                fontWeight: currentView === 'faculty' ? 600 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (currentView !== 'faculty') e.currentTarget.style.background = 'var(--hover-bg)';
                            }}
                            onMouseLeave={(e) => {
                                if (currentView !== 'faculty') e.currentTarget.style.background = 'transparent';
                            }}
                            >
                                <FacultyIcon color={currentView === 'faculty' ? 'white' : 'var(--text-secondary)'} />
                                <span>Faculty</span>
                            </div>
                        </li>
                        <li style={{ marginBottom: 4 }}>
                            <div 
                                onClick={() => setCurrentView('courses')}
                                style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 16px',
                                borderRadius: 8,
                                background: currentView === 'courses' ? 'var(--accent-primary)' : 'transparent',
                                color: currentView === 'courses' ? 'white' : 'var(--text-secondary)',
                                fontSize: 15,
                                fontWeight: currentView === 'courses' ? 600 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (currentView !== 'courses') e.currentTarget.style.background = 'var(--hover-bg)';
                            }}
                            onMouseLeave={(e) => {
                                if (currentView !== 'courses') e.currentTarget.style.background = 'transparent';
                            }}
                            >
                                <CoursesIcon color={currentView === 'courses' ? 'white' : 'var(--text-secondary)'} />
                                <span>Courses</span>
                            </div>
                        </li>
                        <li style={{ marginBottom: 4 }}>
                            <div 
                                onClick={() => setCurrentView('schedule')}
                                style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 16px',
                                borderRadius: 8,
                                background: currentView === 'schedule' ? 'var(--accent-primary)' : 'transparent',
                                color: currentView === 'schedule' ? 'white' : 'var(--text-secondary)',
                                fontSize: 15,
                                fontWeight: currentView === 'schedule' ? 600 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (currentView !== 'schedule') e.currentTarget.style.background = 'var(--hover-bg)';
                            }}
                            onMouseLeave={(e) => {
                                if (currentView !== 'schedule') e.currentTarget.style.background = 'transparent';
                            }}
                            >
                                <ScheduleIcon color={currentView === 'schedule' ? 'white' : 'var(--text-secondary)'} />
                                <span>Schedule</span>
                            </div>
                        </li>
                        <li style={{ marginBottom: 4 }}>
                            <div 
                                onClick={() => setCurrentView('settings')}
                                style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 16px',
                                borderRadius: 8,
                                background: currentView === 'settings' ? 'var(--accent-primary)' : 'transparent',
                                color: currentView === 'settings' ? 'white' : 'var(--text-secondary)',
                                fontSize: 15,
                                fontWeight: currentView === 'settings' ? 600 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (currentView !== 'settings') e.currentTarget.style.background = 'var(--hover-bg)';
                            }}
                            onMouseLeave={(e) => {
                                if (currentView !== 'settings') e.currentTarget.style.background = 'transparent';
                            }}
                            >
                                <SettingsIcon color={currentView === 'settings' ? 'white' : 'var(--text-secondary)'} />
                                <span>Settings</span>
                            </div>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <div style={{ marginLeft: '210px', flex: 1, background: 'var(--bg-secondary)', transition: 'background-color 0.3s ease' }}>
                {/* Top Header */}
                <div style={{ 
                    background: 'var(--card-bg)', 
                    padding: '16px 32px', 
                    borderBottom: '1px solid var(--border-primary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background-color 0.3s ease, border-color 0.3s ease'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src="/images/fsuu-logo.png" alt="FSUU Logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', transition: 'color 0.3s ease' }}>Father Saturnino Urios University</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', transition: 'color 0.3s ease' }}>Student and Faculty Profile Management System</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', position: 'relative' }} data-profile-dropdown>
                        <div 
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            style={{ 
                                width: 36, 
                                height: 36, 
                                borderRadius: '50%', 
                                background: 'var(--accent-primary)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            <UserIcon />
                        </div>

                        {/* Profile Dropdown */}
                        {showProfileDropdown && (
                            <div style={{
                                position: 'absolute',
                                top: '50px',
                                right: 0,
                                background: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: 8,
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                minWidth: 180,
                                zIndex: 1000,
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    padding: '12px 16px',
                                    borderBottom: '1px solid #f3f4f6'
                                }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                                        {localStorage.getItem('userEmail') || 'User'}
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (confirm('Are you sure you want to logout?')) {
                                            localStorage.removeItem('isLoggedIn');
                                            localStorage.removeItem('userEmail');
                                            window.location.href = '/login';
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: 'none',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        color: '#dc2626',
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
            </div>
                {/* Dashboard Content */}
                {currentView === 'students' ? (
                    <Students onDataUpdate={refreshAllData} />
                ) : currentView === 'faculty' ? (
                    <FacultyList onDataUpdate={refreshAllData} />
                ) : currentView === 'courses' ? (
                    <Courses />
                ) : currentView === 'schedule' ? (
                    <Schedule />
                ) : currentView === 'settings' ? (
                    <Settings />
                ) : (
                <div style={{ padding: '32px' }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', transition: 'color 0.3s ease' }}>Profile Management Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 0, marginBottom: 24, fontSize: 14, transition: 'color 0.3s ease' }}>Manage student and faculty profiles efficiently</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
                <StatCard title="Total Students" value={students.length} delta="+12% from last semester" iconBg="#e0f2fe" iconDot="#38bdf8" />
                <StatCard title="Faculty Members" value={faculty.length} delta="+5% from last month" iconBg="#ecfccb" iconDot="#84cc16" />
                <StatCard title="Active Courses" value={46} delta="+8% from last month" iconBg="#ede9fe" iconDot="#8b5cf6" />
                <StatCard title="Departments" value={8} delta="No change from last month" iconBg="#ffedd5" iconDot="#f97316" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ fontWeight: 600 }}>Student Profiles</div>
                        <button onClick={openAddStudent} style={buttonStylePrimary}>+ Add Student</button>
                    </div>
                    <div style={{ padding: 16 }}>
                        {loading ? (
                            <div style={{ color: '#6b7280' }}>Loading…</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {students.slice(0, 3).map(s => (
                                    <ListItem 
                                        key={s.id} 
                                        title={`${s.first_name} ${s.last_name}`} 
                                        subtitle={`${s.program || 'Program'} · ${s.year_level || ''} Year`} 
                                        meta={`ID: ${s.student_id || '—'}`}
                                        student={s}
                                        onViewDetails={openStudentDetails}
                                        onEdit={openEditStudent}
                                    />
                                ))}
                                <div style={{ textAlign: 'center', marginTop: 8 }}>
                                    <a onClick={() => setCurrentView('students')} style={{ color: '#16a34a', cursor: 'pointer', textDecoration: 'none' }}>View All Students</a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ fontWeight: 600 }}>Faculty Profiles</div>
                            <button style={buttonStylePrimary} onClick={openAddFaculty}>+ Add Faculty</button>
                    </div>
                    <div style={{ padding: 16 }}>
                        {loading ? (
                            <div style={{ color: '#6b7280' }}>Loading faculty...</div>
                        ) : faculty.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {faculty.slice(0, 3).map(f => (
                                    <ListItem 
                                        key={f.id} 
                                        title={`${f.first_name} ${f.last_name}`} 
                                        subtitle={`${f.department || 'Department'} · ${f.position || 'Position'}`} 
                                        meta={`ID: ${f.faculty_id || '—'}`}
                                        student={f}
                                        onViewDetails={openFacultyDetails}
                                        onEdit={openEditFaculty}
                                    />
                                ))}
                                <div style={{ textAlign: 'center', marginTop: 8 }}>
                                    <a onClick={() => setCurrentView('faculty')} style={{ color: '#16a34a', cursor: 'pointer', textDecoration: 'none' }}>View All Faculty</a>
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: '#6b7280' }}>No faculty members yet. Add your first faculty member!</div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, height: 220, marginTop: 16 }}></div>

            {showAdd && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div style={{ fontWeight: 700, fontSize: 18 }}>Add Student</div>
                            <button onClick={closeAddStudent} style={buttonStyleGhost}>✕</button>
                        </div>
                        <div style={{ maxHeight: '75vh', overflow: 'auto' }}>
                            <Home onSuccess={() => { closeAddStudent(); /* refresh preview */ fetch('/api/students').then(r=>r.json()).then(d=>setStudents(Array.isArray(d)?d:[])); }} showForm={true} showList={false} />
                        </div>
                    </div>
                </div>
            )}

            {showList && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div style={{ fontWeight: 700, fontSize: 18 }}>All Students</div>
                            <button onClick={closeList} style={buttonStyleGhost}>✕</button>
                        </div>
                        <div style={{ maxHeight: '75vh', overflow: 'auto' }}>
                            <Home showForm={false} showList={true} />
                        </div>
                    </div>
                </div>
            )}

            {showStudentDetails && selectedStudent && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div style={{ fontWeight: 700, fontSize: 18 }}>Student Details</div>
                            <button onClick={closeStudentDetails} style={buttonStyleGhost}>✕</button>
                        </div>
                        <div style={{ maxHeight: '75vh', overflow: 'auto' }}>
                            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 16px 0', color: '#374151', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Personal Information</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Student ID:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{selectedStudent.student_id || '—'}</div>
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Full Name:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>
                                                    {selectedStudent.first_name} {selectedStudent.middle_name} {selectedStudent.last_name}
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Date of Birth:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{selectedStudent.date_of_birth || '—'}</div>
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Gender:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{selectedStudent.gender || '—'}</div>
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Personal Information:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{selectedStudent.personal_information || '—'}</div>
                                            </div>
                                        </div>

                                        <h3 style={{ margin: '24px 0 16px 0', color: '#374151', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Contact Information</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Email:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{selectedStudent.email || '—'}</div>
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Phone:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{selectedStudent.phone || '—'}</div>
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Address:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{selectedStudent.address || '—'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 style={{ margin: '0 0 16px 0', color: '#374151', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Academic Information</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Program/Course:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{selectedStudent.program || '—'}</div>
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Year Level:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{selectedStudent.year_level || '—'}</div>
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Section:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{selectedStudent.section || '—'}</div>
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Status:</label>
                                                <div style={{ 
                                                    color: '#374151', 
                                                    marginTop: '4px',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    backgroundColor: selectedStudent.status === 'Active' ? '#dcfce7' : '#fef3c7',
                                                    color: selectedStudent.status === 'Active' ? '#166534' : '#92400e',
                                                    display: 'inline-block',
                                                    fontSize: '12px',
                                                    fontWeight: '600'
                                                }}>
                                                    {selectedStudent.status || '—'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showEditStudent && studentToEdit && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                    zIndex: 1000
                }}>
                    <div style={{
                        width: 'min(1100px, 100%)',
                        background: '#f3f4f6',
                        borderRadius: 12,
                        padding: 16,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div style={{ fontWeight: 700, fontSize: 18 }}>Student Details</div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {hasUnsavedChanges && (
                                    <>
                                        <button
                                            onClick={saveAllChanges}
                                            style={{
                                                background: '#16a34a',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 8,
                                                padding: '8px 16px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={discardChanges}
                                            style={{
                                                background: '#dc2626',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 8,
                                                padding: '8px 16px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Discard
                                        </button>
                                    </>
                                )}
                                <button onClick={closeEditStudent} style={{
                                    background: 'transparent',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: 8,
                                    padding: '6px 10px',
                                    cursor: 'pointer'
                                }}>✕</button>
                            </div>
                        </div>
                        <div style={{ maxHeight: '75vh', overflow: 'auto' }}>
                            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 16px 0', color: '#374151', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Personal Information</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Student ID:</label>
                                                {editingField === 'student_id' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <input
                                                            type="text"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveEdit();
                                                                if (e.key === 'Escape') cancelEdit();
                                                            }}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        />
                                                        <button onClick={saveEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                        </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingChanges.student_id ? '#fef3c7' : 'transparent',
                                                            border: pendingChanges.student_id ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startEditing('student_id', studentToEdit.student_id)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.student_id ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.student_id || studentToEdit.student_id || '—'}
                                                        {pendingChanges.student_id && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>First Name:</label>
                                                {editingField === 'first_name' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <input
                                                            type="text"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveEdit();
                                                                if (e.key === 'Escape') cancelEdit();
                                                            }}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        />
                                                        <button onClick={saveEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingChanges.first_name ? '#fef3c7' : 'transparent',
                                                            border: pendingChanges.first_name ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startEditing('first_name', studentToEdit.first_name)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.first_name ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.first_name || studentToEdit.first_name || '—'}
                                                        {pendingChanges.first_name && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Last Name:</label>
                                                {editingField === 'last_name' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <input
                                                            type="text"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveEdit();
                                                                if (e.key === 'Escape') cancelEdit();
                                                            }}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        />
                                                        <button onClick={saveEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingChanges.last_name ? '#fef3c7' : 'transparent',
                                                            border: pendingChanges.last_name ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startEditing('last_name', studentToEdit.last_name)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.last_name ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.last_name || studentToEdit.last_name || '—'}
                                                        {pendingChanges.last_name && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Date of Birth:</label>
                                                {editingField === 'date_of_birth' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <input
                                                            type="date"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveEdit();
                                                                if (e.key === 'Escape') cancelEdit();
                                                            }}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        />
                                                        <button onClick={saveEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingChanges.date_of_birth ? '#fef3c7' : 'transparent',
                                                            border: pendingChanges.date_of_birth ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startEditing('date_of_birth', studentToEdit.date_of_birth)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.date_of_birth ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.date_of_birth || studentToEdit.date_of_birth || '—'}
                                                        {pendingChanges.date_of_birth && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Gender:</label>
                                                {editingField === 'gender' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <select
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        >
                                                            <option value="">Select Gender</option>
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                        <button onClick={saveEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingChanges.gender ? '#fef3c7' : 'transparent',
                                                            border: pendingChanges.gender ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startEditing('gender', studentToEdit.gender)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.gender ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.gender || studentToEdit.gender || '—'}
                                                        {pendingChanges.gender && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Personal Information:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{studentToEdit.personal_information || '—'}</div>
                                            </div>
                                        </div>

                                        <h3 style={{ margin: '24px 0 16px 0', color: '#374151', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Contact Information</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Email:</label>
                                                {editingField === 'email' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <input
                                                            type="email"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveEdit();
                                                                if (e.key === 'Escape') cancelEdit();
                                                            }}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        />
                                                        <button onClick={saveEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingChanges.email ? '#fef3c7' : 'transparent',
                                                            border: pendingChanges.email ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startEditing('email', studentToEdit.email)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.email ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.email || studentToEdit.email || '—'}
                                                        {pendingChanges.email && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Phone:</label>
                                                {editingField === 'phone' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <input
                                                            type="tel"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveEdit();
                                                                if (e.key === 'Escape') cancelEdit();
                                                            }}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        />
                                                        <button onClick={saveEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingChanges.phone ? '#fef3c7' : 'transparent',
                                                            border: pendingChanges.phone ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startEditing('phone', studentToEdit.phone)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.phone ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.phone || studentToEdit.phone || '—'}
                                                        {pendingChanges.phone && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Address:</label>
                                                {editingField === 'address' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <input
                                                            type="text"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveEdit();
                                                                if (e.key === 'Escape') cancelEdit();
                                                            }}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        />
                                                        <button onClick={saveEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingChanges.address ? '#fef3c7' : 'transparent',
                                                            border: pendingChanges.address ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startEditing('address', studentToEdit.address)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.address ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.address || studentToEdit.address || '—'}
                                                        {pendingChanges.address && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 style={{ margin: '0 0 16px 0', color: '#374151', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Academic Information</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Program/Course:</label>
                                                {editingField === 'program' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <select
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        >
                                                            <option value="">Select Program/Course</option>
                                                            {departments.map((dept, index) => (
                                                                <option key={index} value={dept}>{dept}</option>
                                                            ))}
                                                        </select>
                                                        <button onClick={saveEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingChanges.program ? '#fef3c7' : 'transparent',
                                                            border: pendingChanges.program ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startEditing('program', studentToEdit.program)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.program ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.program || studentToEdit.program || '—'}
                                                        {pendingChanges.program && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Year Level:</label>
                                                {editingField === 'year_level' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <select
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        >
                                                            <option value="">Select Year Level</option>
                                                            <option value="1st Year">1st Year</option>
                                                            <option value="2nd Year">2nd Year</option>
                                                            <option value="3rd Year">3rd Year</option>
                                                            <option value="4th Year">4th Year</option>
                                                            <option value="5th Year">5th Year</option>
                                                        </select>
                                                        <button onClick={saveEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingChanges.year_level ? '#fef3c7' : 'transparent',
                                                            border: pendingChanges.year_level ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startEditing('year_level', studentToEdit.year_level)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.year_level ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.year_level || studentToEdit.year_level || '—'}
                                                        {pendingChanges.year_level && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Section:</label>
                                                {editingField === 'section' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <input
                                                            type="text"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveEdit();
                                                                if (e.key === 'Escape') cancelEdit();
                                                            }}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        />
                                                        <button onClick={saveEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingChanges.section ? '#fef3c7' : 'transparent',
                                                            border: pendingChanges.section ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startEditing('section', studentToEdit.section)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.section ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.section || studentToEdit.section || '—'}
                                                        {pendingChanges.section && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Status:</label>
                                                {editingField === 'status' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <select
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        >
                                                            <option value="">Select Status</option>
                                                            <option value="Active">Active</option>
                                                            <option value="Inactive">Inactive</option>
                                                            <option value="Graduated">Graduated</option>
                                                            <option value="Transferred">Transferred</option>
                                                        </select>
                                                        <button onClick={saveEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingChanges.status ? '#fef3c7' : 'transparent',
                                                            border: pendingChanges.status ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startEditing('status', studentToEdit.status)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.status ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        <div style={{ 
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            backgroundColor: (pendingChanges.status || studentToEdit.status) === 'Active' ? '#dcfce7' : '#fef3c7',
                                                            color: (pendingChanges.status || studentToEdit.status) === 'Active' ? '#166534' : '#92400e',
                                                            display: 'inline-block',
                                                            fontSize: '12px',
                                                            fontWeight: '600'
                                                        }}>
                                                            {pendingChanges.status || studentToEdit.status || '—'}
                                                        </div>
                                                        {pendingChanges.status && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showAddFaculty && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div style={{ fontWeight: 700, fontSize: 18 }}>Add Faculty</div>
                            <button onClick={closeAddFaculty} style={buttonStyleGhost}>✕</button>
                        </div>
                        <div style={{ maxHeight: '75vh', overflow: 'auto' }}>
                            <Faculty 
                                onSuccess={() => { 
                                    closeAddFaculty(); 
                                    /* refresh preview */ 
                                    fetch('/api/faculty').then(r=>r.json()).then(d=>{
                    const activeFaculty = Array.isArray(d) ? d.filter(faculty => faculty.status !== 'archived') : [];
                    setFaculty(activeFaculty);
                }); 
                                }} 
                                showForm={true} 
                                showList={false} 
                            />
                        </div>
                    </div>
                </div>
            )}

            {showFacultyList && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div style={{ fontWeight: 700, fontSize: 18 }}>All Faculty</div>
                            <button onClick={closeFacultyList} style={buttonStyleGhost}>✕</button>
                        </div>
                        <div style={{ maxHeight: '75vh', overflow: 'auto' }}>
                            <Faculty showForm={false} showList={true} />
                        </div>
                    </div>
                </div>
            )}

            {showFacultyDetails && selectedFaculty && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div style={{ fontWeight: 700, fontSize: 18 }}>Faculty Details</div>
                            <button onClick={closeFacultyDetails} style={buttonStyleGhost}>✕</button>
                        </div>
                        <div style={{ maxHeight: '75vh', overflow: 'auto' }}>
                            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 16px 0', color: '#374151', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Personal Information</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Faculty ID:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{selectedFaculty.faculty_id || '—'}</div>
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Full Name:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>
                                                    {selectedFaculty.first_name} {selectedFaculty.middle_name} {selectedFaculty.last_name}
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Date of Birth:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{selectedFaculty.date_of_birth || '—'}</div>
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Gender:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{selectedFaculty.gender || '—'}</div>
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Personal Information:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{selectedFaculty.personal_information || '—'}</div>
                                            </div>
                                        </div>

                                        <h3 style={{ margin: '24px 0 16px 0', color: '#374151', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Contact Information</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Email:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{selectedFaculty.email || '—'}</div>
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Phone:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{selectedFaculty.phone || '—'}</div>
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Address:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{selectedFaculty.address || '—'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 style={{ margin: '0 0 16px 0', color: '#374151', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Professional Information</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Department:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{selectedFaculty.department || '—'}</div>
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Position:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{selectedFaculty.position || '—'}</div>
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Attainment:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{selectedFaculty.attainment || '—'}</div>
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Status:</label>
                                                <div style={{ 
                                                    color: '#374151', 
                                                    marginTop: '4px',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    backgroundColor: selectedFaculty.status === 'Active' ? '#dcfce7' : '#fef3c7',
                                                    color: selectedFaculty.status === 'Active' ? '#166534' : '#92400e',
                                                    display: 'inline-block',
                                                    fontSize: '12px',
                                                    fontWeight: '600'
                                                }}>
                                                    {selectedFaculty.status || '—'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showEditFaculty && facultyToEdit && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                    zIndex: 1000
                }}>
                    <div style={{
                        width: 'min(1100px, 100%)',
                        background: '#f3f4f6',
                        borderRadius: 12,
                        padding: 16,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div style={{ fontWeight: 700, fontSize: 18 }}>Faculty Details</div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {hasUnsavedFacultyChanges && (
                                    <>
                                        <button
                                            onClick={saveAllFacultyChanges}
                                            style={{
                                                background: '#16a34a',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 8,
                                                padding: '8px 16px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={discardFacultyChanges}
                                            style={{
                                                background: '#dc2626',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 8,
                                                padding: '8px 16px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Discard
                                        </button>
                                    </>
                                )}
                                <button onClick={closeEditFaculty} style={{
                                    background: 'transparent',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: 8,
                                    padding: '6px 10px',
                                    cursor: 'pointer'
                                }}>✕</button>
                            </div>
                        </div>
                        <div style={{ maxHeight: '75vh', overflow: 'auto' }}>
                            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 16px 0', color: '#374151', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Personal Information</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Faculty ID:</label>
                                                {editingFacultyField === 'faculty_id' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <input
                                                            type="text"
                                                            value={editFacultyValue}
                                                            onChange={(e) => setEditFacultyValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveFacultyEdit();
                                                                if (e.key === 'Escape') cancelFacultyEdit();
                                                            }}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        />
                                                        <button onClick={saveFacultyEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelFacultyEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                        </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingFacultyChanges.faculty_id ? '#fef3c7' : 'transparent',
                                                            border: pendingFacultyChanges.faculty_id ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startFacultyEditing('faculty_id', facultyToEdit.faculty_id)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingFacultyChanges.faculty_id ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingFacultyChanges.faculty_id || facultyToEdit.faculty_id || '—'}
                                                        {pendingFacultyChanges.faculty_id && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>First Name:</label>
                                                {editingFacultyField === 'first_name' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <input
                                                            type="text"
                                                            value={editFacultyValue}
                                                            onChange={(e) => setEditFacultyValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveFacultyEdit();
                                                                if (e.key === 'Escape') cancelFacultyEdit();
                                                            }}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        />
                                                        <button onClick={saveFacultyEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelFacultyEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingFacultyChanges.first_name ? '#fef3c7' : 'transparent',
                                                            border: pendingFacultyChanges.first_name ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startFacultyEditing('first_name', facultyToEdit.first_name)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingFacultyChanges.first_name ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingFacultyChanges.first_name || facultyToEdit.first_name || '—'}
                                                        {pendingFacultyChanges.first_name && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                </div>
            )}
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Last Name:</label>
                                                {editingFacultyField === 'last_name' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <input
                                                            type="text"
                                                            value={editFacultyValue}
                                                            onChange={(e) => setEditFacultyValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveFacultyEdit();
                                                                if (e.key === 'Escape') cancelFacultyEdit();
                                                            }}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        />
                                                        <button onClick={saveFacultyEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelFacultyEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingFacultyChanges.last_name ? '#fef3c7' : 'transparent',
                                                            border: pendingFacultyChanges.last_name ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startFacultyEditing('last_name', facultyToEdit.last_name)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingFacultyChanges.last_name ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingFacultyChanges.last_name || facultyToEdit.last_name || '—'}
                                                        {pendingFacultyChanges.last_name && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Date of Birth:</label>
                                                {editingFacultyField === 'date_of_birth' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <input
                                                            type="date"
                                                            value={editFacultyValue}
                                                            onChange={(e) => setEditFacultyValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveFacultyEdit();
                                                                if (e.key === 'Escape') cancelFacultyEdit();
                                                            }}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        />
                                                        <button onClick={saveFacultyEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelFacultyEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingFacultyChanges.date_of_birth ? '#fef3c7' : 'transparent',
                                                            border: pendingFacultyChanges.date_of_birth ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startFacultyEditing('date_of_birth', facultyToEdit.date_of_birth)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingFacultyChanges.date_of_birth ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingFacultyChanges.date_of_birth || facultyToEdit.date_of_birth || '—'}
                                                        {pendingFacultyChanges.date_of_birth && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Gender:</label>
                                                {editingFacultyField === 'gender' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <select
                                                            value={editFacultyValue}
                                                            onChange={(e) => setEditFacultyValue(e.target.value)}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        >
                                                            <option value="">Select Gender</option>
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                        <button onClick={saveFacultyEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelFacultyEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingFacultyChanges.gender ? '#fef3c7' : 'transparent',
                                                            border: pendingFacultyChanges.gender ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startFacultyEditing('gender', facultyToEdit.gender)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingFacultyChanges.gender ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingFacultyChanges.gender || facultyToEdit.gender || '—'}
                                                        {pendingFacultyChanges.gender && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Personal Information:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{facultyToEdit.personal_information || '—'}</div>
                                            </div>
                                        </div>

                                        <h3 style={{ margin: '24px 0 16px 0', color: '#374151', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Contact Information</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Email:</label>
                                                {editingFacultyField === 'email' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <input
                                                            type="email"
                                                            value={editFacultyValue}
                                                            onChange={(e) => setEditFacultyValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveFacultyEdit();
                                                                if (e.key === 'Escape') cancelFacultyEdit();
                                                            }}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        />
                                                        <button onClick={saveFacultyEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelFacultyEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingFacultyChanges.email ? '#fef3c7' : 'transparent',
                                                            border: pendingFacultyChanges.email ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startFacultyEditing('email', facultyToEdit.email)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingFacultyChanges.email ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingFacultyChanges.email || facultyToEdit.email || '—'}
                                                        {pendingFacultyChanges.email && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Phone:</label>
                                                {editingFacultyField === 'phone' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <input
                                                            type="tel"
                                                            value={editFacultyValue}
                                                            onChange={(e) => setEditFacultyValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveFacultyEdit();
                                                                if (e.key === 'Escape') cancelFacultyEdit();
                                                            }}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        />
                                                        <button onClick={saveFacultyEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelFacultyEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingFacultyChanges.phone ? '#fef3c7' : 'transparent',
                                                            border: pendingFacultyChanges.phone ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startFacultyEditing('phone', facultyToEdit.phone)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingFacultyChanges.phone ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingFacultyChanges.phone || facultyToEdit.phone || '—'}
                                                        {pendingFacultyChanges.phone && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Address:</label>
                                                {editingFacultyField === 'address' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <input
                                                            type="text"
                                                            value={editFacultyValue}
                                                            onChange={(e) => setEditFacultyValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveFacultyEdit();
                                                                if (e.key === 'Escape') cancelFacultyEdit();
                                                            }}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        />
                                                        <button onClick={saveFacultyEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelFacultyEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingFacultyChanges.address ? '#fef3c7' : 'transparent',
                                                            border: pendingFacultyChanges.address ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startFacultyEditing('address', facultyToEdit.address)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingFacultyChanges.address ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingFacultyChanges.address || facultyToEdit.address || '—'}
                                                        {pendingFacultyChanges.address && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 style={{ margin: '0 0 16px 0', color: '#374151', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Professional Information</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Department:</label>
                                                {editingFacultyField === 'department' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <select
                                                            value={editFacultyValue}
                                                            onChange={(e) => setEditFacultyValue(e.target.value)}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        >
                                                            <option value="">Select Department</option>
                                                            {departments.map((dept, index) => (
                                                                <option key={index} value={dept}>{dept}</option>
                                                            ))}
                                                        </select>
                                                        <button onClick={saveFacultyEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelFacultyEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingFacultyChanges.department ? '#fef3c7' : 'transparent',
                                                            border: pendingFacultyChanges.department ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startFacultyEditing('department', facultyToEdit.department)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingFacultyChanges.department ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingFacultyChanges.department || facultyToEdit.department || '—'}
                                                        {pendingFacultyChanges.department && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Position:</label>
                                                {editingFacultyField === 'position' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <input
                                                            type="text"
                                                            value={editFacultyValue}
                                                            onChange={(e) => setEditFacultyValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveFacultyEdit();
                                                                if (e.key === 'Escape') cancelFacultyEdit();
                                                            }}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        />
                                                        <button onClick={saveFacultyEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelFacultyEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingFacultyChanges.position ? '#fef3c7' : 'transparent',
                                                            border: pendingFacultyChanges.position ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startFacultyEditing('position', facultyToEdit.position)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingFacultyChanges.position ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingFacultyChanges.position || facultyToEdit.position || '—'}
                                                        {pendingFacultyChanges.position && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Status:</label>
                                                {editingFacultyField === 'status' ? (
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <select
                                                            value={editFacultyValue}
                                                            onChange={(e) => setEditFacultyValue(e.target.value)}
                                                            style={{
                                                                padding: '4px 8px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                width: '200px'
                                                            }}
                                                            autoFocus
                                                        >
                                                            <option value="">Select Status</option>
                                                            <option value="Full Time">Full Time</option>
                                                            <option value="Part Time">Part Time</option>
                                                        </select>
                                                        <button onClick={saveFacultyEdit} style={{ padding: '4px 8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                                                        <button onClick={cancelFacultyEdit} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: '#374151',
                                                            marginTop: '4px',
                                                            cursor: 'pointer',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px',
                                                            backgroundColor: pendingFacultyChanges.status ? '#fef3c7' : 'transparent',
                                                            border: pendingFacultyChanges.status ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startFacultyEditing('status', facultyToEdit.status)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingFacultyChanges.status ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingFacultyChanges.status || facultyToEdit.status || '—'}
                                                        {pendingFacultyChanges.status && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
                </div>
                )}
            </div>
        </div>
    );
}
