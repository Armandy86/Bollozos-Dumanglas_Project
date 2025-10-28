import React, { useEffect, useState } from 'react';
import Home from './Home';
import Faculty from './Faculty';
import Students from './Students';
import FacultyList from './FacultyList';
import Courses from './Courses';
import Schedule from './Schedule';
import Settings from './Settings';

export default function Dashboard() {
    const [students, setStudents] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState('dashboard');

    // Initialize theme on component mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    // Check authentication on component mount
    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            window.location.href = '/login';
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsRes, facultyRes] = await Promise.all([
                    fetch('/api/students'),
                    fetch('/api/faculty')
                ]);
                
                const studentsData = await studentsRes.json();
                const facultyData = await facultyRes.json();
                
                setStudents(Array.isArray(studentsData) ? studentsData : []);
                // Filter out archived faculty members
                const activeFaculty = Array.isArray(facultyData) ? facultyData.filter(faculty => faculty.status !== 'archived') : [];
                setFaculty(activeFaculty);
            } catch (e) {
                setStudents([]);
                setFaculty([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ 
                            width: 36, 
                            height: 36, 
                            borderRadius: '50%', 
                            background: 'var(--bg-tertiary)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease'
                        }}>
                            <BellIcon />
                        </div>
                        <div style={{ 
                            width: 36, 
                            height: 36, 
                            borderRadius: '50%', 
                            background: 'var(--accent-primary)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease'
                        }}>
                            <UserIcon />
                        </div>
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
                                                            <option value="Nursing Program">Nursing Program</option>
                                                            <option value="Teachers Education Program">Teachers Education Program</option>
                                                            <option value="Engineering Program">Engineering Program</option>
                                                            <option value="Criminal Justice Program">Criminal Justice Program</option>
                                                            <option value="Computer Science Program">Computer Science Program</option>
                                                            <option value="Arts and Sciences Program">Arts and Sciences Program</option>
                                                            <option value="Business Administration Program">Business Administration Program</option>
                                                            <option value="Accountancy Program">Accountancy Program</option>
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
                                        <h3 style={{ margin: '0 0 16px 0', color: '#374151', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Academic Information</h3>
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
                                                            <option value="Nursing Program">Nursing Program</option>
                                                            <option value="Teachers Education Program">Teachers Education Program</option>
                                                            <option value="Engineering Program">Engineering Program</option>
                                                            <option value="Criminal Justice Program">Criminal Justice Program</option>
                                                            <option value="Computer Science Program">Computer Science Program</option>
                                                            <option value="Arts and Sciences Program">Arts and Sciences Program</option>
                                                            <option value="Business Administration Program">Business Administration Program</option>
                                                            <option value="Accountancy Program">Accountancy Program</option>
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

const buttonStylePrimary = {
    background: '#16a34a',
    color: 'white',
    padding: '10px 14px',
    borderRadius: 8,
    border: 0,
    fontWeight: 600,
    cursor: 'pointer'
};

const buttonStyleSecondary = {
    background: 'white',
    color: '#374151',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontWeight: 600,
    cursor: 'pointer'
};

function StatCard({ title, value, delta, iconBg, iconDot }) {
    return (
        <div style={{ 
            background: '#fff', 
            borderRadius: 12, 
            padding: '20px', 
            border: '1px solid #e5e7eb', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'flex-start'
        }}>
            <div>
                <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 8 }}>{title}</div>
                <div style={{ fontWeight: 700, fontSize: 32, marginBottom: 8, color: '#1a1a1a' }}>{value}</div>
                <div style={{ color: '#16a34a', fontSize: 12, fontWeight: 500 }}>{delta}</div>
            </div>
            <div style={{ 
                width: 48, 
                height: 48, 
                background: iconBg, 
                borderRadius: 10, 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                <div style={{ 
                    width: 24, 
                    height: 24, 
                    background: iconDot, 
                    borderRadius: 6
                }}></div>
            </div>
        </div>
    );
}

function ListItem({ title, subtitle, meta, student, onViewDetails, onEdit }) {
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [pendingChanges, setPendingChanges] = useState({});

    const startEditing = (field, currentValue) => {
        setEditingField(field);
        setEditValue(currentValue || '');
    };

    const saveEdit = async () => {
        if (!student || !editingField) return;
        
        // Store the change in pending changes
        const newPendingChanges = { ...pendingChanges, [editingField]: editValue };
        setPendingChanges(newPendingChanges);
        setHasUnsavedChanges(true);
        
        setEditingField(null);
        setEditValue('');
    };

    const saveAllChanges = async () => {
        if (!student || Object.keys(pendingChanges).length === 0) return;
        
        try {
            const updatedStudent = { ...student, ...pendingChanges };
            const response = await fetch(`/api/students/${student.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(updatedStudent)
            });

            if (response.ok) {
                setPendingChanges({});
                setHasUnsavedChanges(false);
                // Refresh the dashboard data
                window.location.reload(); // Simple refresh for now
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

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '16px 20px',
            borderBottom: '1px solid #f3f4f6',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flex: 1 }}>
                <div style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    background: '#e0f2fe',
                    border: '2px solid #bfdbfe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#3b82f6"/>
                    </svg>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a', marginBottom: 4 }}>
                        {editingField === 'title' ? (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                                        fontSize: '15px',
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
                                    cursor: 'pointer', 
                                    padding: '2px 4px', 
                                    borderRadius: '4px',
                                    backgroundColor: pendingChanges.first_name || pendingChanges.last_name ? '#fef3c7' : 'transparent',
                                    border: pendingChanges.first_name || pendingChanges.last_name ? '1px solid #f59e0b' : '1px solid transparent'
                                }}
                                onDoubleClick={() => startEditing('title', title)}
                                onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                onMouseLeave={(e) => e.target.style.background = pendingChanges.first_name || pendingChanges.last_name ? '#fef3c7' : 'transparent'}
                            >
                                {pendingChanges.first_name && pendingChanges.last_name ? `${pendingChanges.first_name} ${pendingChanges.last_name}` : title}
                                {(pendingChanges.first_name || pendingChanges.last_name) && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
            </div>
                        )}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 2 }}>
                        {editingField === 'subtitle' ? (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                                        fontSize: '13px',
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
                                    cursor: 'pointer', 
                                    padding: '2px 4px', 
                                    borderRadius: '4px',
                                    backgroundColor: pendingChanges.program || pendingChanges.year_level ? '#fef3c7' : 'transparent',
                                    border: pendingChanges.program || pendingChanges.year_level ? '1px solid #f59e0b' : '1px solid transparent'
                                }}
                                onDoubleClick={() => startEditing('subtitle', subtitle)}
                                onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                onMouseLeave={(e) => e.target.style.background = pendingChanges.program || pendingChanges.year_level ? '#fef3c7' : 'transparent'}
                            >
                                {pendingChanges.program && pendingChanges.year_level ? `${pendingChanges.program} · ${pendingChanges.year_level} Year` : subtitle}
                                {(pendingChanges.program || pendingChanges.year_level) && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                            </div>
                        )}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: 12 }}>
                        {editingField === 'meta' ? (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                                        fontSize: '12px',
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
                                    cursor: 'pointer', 
                                    padding: '2px 4px', 
                                    borderRadius: '4px',
                                    backgroundColor: pendingChanges.student_id ? '#fef3c7' : 'transparent',
                                    border: pendingChanges.student_id ? '1px solid #f59e0b' : '1px solid transparent'
                                }}
                                onDoubleClick={() => startEditing('meta', meta)}
                                onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                onMouseLeave={(e) => e.target.style.background = pendingChanges.student_id ? '#fef3c7' : 'transparent'}
                            >
                                {pendingChanges.student_id ? `ID: ${pendingChanges.student_id}` : meta}
                                {pendingChanges.student_id && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {hasUnsavedChanges && (
                    <>
                        <button 
                            onClick={saveAllChanges}
                            style={{
                                background: '#16a34a',
                                color: 'white',
                                border: 'none',
                                borderRadius: 6,
                                padding: '6px 12px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '12px'
                            }}
                        >
                            Save
                        </button>
                        <button 
                            onClick={discardChanges}
                            style={{
                                background: '#dc2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: 6,
                                padding: '6px 12px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '12px'
                            }}
                        >
                            Discard
                        </button>
                    </>
                )}
                <button 
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        border: 'none',
                        background: '#eff6ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }} 
                    onClick={() => onViewDetails(student)}
                    title="View Details"
                    onMouseEnter={(e) => e.currentTarget.style.background = '#dbeafe'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#eff6ff'}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#3b82f6"/>
                    </svg>
                </button>
                <button 
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        border: 'none',
                        background: '#f0fdf4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }} 
                    onClick={() => onEdit(student)}
                    title="Edit"
                    onMouseEnter={(e) => e.currentTarget.style.background = '#dcfce7'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#f0fdf4'}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#16a34a"/>
                    </svg>
                </button>
            </div>
        </div>
    );
}

const iconAction = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 6,
    background: '#f3f4f6',
    cursor: 'pointer'
};

const modalOverlay = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 1000
};

const modalContent = {
    width: 'min(1100px, 100%)',
    background: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
};

const buttonStyleGhost = {
    background: 'transparent',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '6px 10px',
    cursor: 'pointer'
};

// Icon Components
function DashboardIcon({ color = '#4a5568' }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill={color}/>
        </svg>
    );
}

function StudentsIcon({ color = '#4a5568' }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill={color}/>
        </svg>
    );
}

function FacultyIcon({ color = '#4a5568' }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM9 10c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm6 8.59c0-2.5-3.97-3.58-6-3.58s-6 1.08-6 3.58V17h12v-2.41zM5.48 15c.88-.55 2.58-1.08 3.52-1.08s2.64.53 3.52 1.08H5.48zM19 12h-6v-2h6v2zm0-4h-6V6h6v2z" fill={color}/>
        </svg>
    );
}

function CoursesIcon({ color = '#4a5568' }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" fill={color}/>
        </svg>
    );
}

function ScheduleIcon({ color = '#4a5568' }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" fill={color}/>
        </svg>
    );
}

function SettingsIcon({ color = '#4a5568' }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill={color}/>
        </svg>
    );
}

function BellIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" fill="#6b7280"/>
        </svg>
    );
}

function UserIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="white"/>
        </svg>
    );
}


