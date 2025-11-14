import React, { useState, useEffect } from 'react';

export default function Courses() {
    const [expandedProgram, setExpandedProgram] = useState(null);
    const [students, setStudents] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showStudentDetails, setShowStudentDetails] = useState(false);
    const [showFacultyDetails, setShowFacultyDetails] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [pendingChanges, setPendingChanges] = useState({});

    const hardcodedPrograms = [
        {
            id: 1,
            name: 'NURSING PROGRAM',
            dbName: 'Nursing Program',
            color: 'linear-gradient(180deg, rgba(0, 0, 209, 0.80) 0%, rgba(17, 24, 39, 0.80) 100%)',
            logo: '/images/nursing-logo.png'
        },
        {
            id: 2,
            name: 'TEACHER EDUCATION PROGRAM',
            dbName: 'Teachers Education Program',
            color: 'linear-gradient(180deg, rgba(0, 0, 209, 0.80) 0%, rgba(17, 24, 39, 0.80) 100%)',
            logo: '/images/teacher-education-logo.png'
        },
        {
            id: 3,
            name: 'ENGINEERING TECHNOLOGY PROGRAM',
            dbName: 'Engineering Program',
            color: 'linear-gradient(180deg, rgba(217, 115, 71, 0.80) 0%, rgba(17, 24, 39, 0.80) 100%)',
            logo: '/images/engineering-logo.png'
        },
        {
            id: 4,
            name: 'CRIMINAL JUSTICE EDUCATION PROGRAM',
            dbName: 'Criminal Justice Program',
            color: 'linear-gradient(180deg, rgba(200, 78, 60, 0.80) 0%, rgba(17, 24, 39, 0.80) 100%)',
            logo: '/images/criminal-justice-logo.png'
        },
        {
            id: 5,
            name: 'COMPUTER STUDIES PROGRAM',
            dbName: 'Computer Science Program',
            color: 'linear-gradient(180deg, rgba(139, 93, 199, 0.80) 0%, rgba(17, 24, 39, 0.80) 100%)',
            logo: '/images/computer-studies-logo.png'
        },
        {
            id: 6,
            name: 'ARTS AND SCIENCES PROGRAM',
            dbName: 'Arts and Sciences Program',
            color: 'linear-gradient(180deg, rgba(76, 175, 80, 0.80) 0%, rgba(17, 24, 39, 0.80) 100%)',
            logo: '/images/arts-sciences-logo.png'
        },
        {
            id: 7,
            name: 'BUSINESS ADMINISTRATION PROGRAM',
            dbName: 'Business Administration Program',
            color: 'linear-gradient(180deg, rgba(224, 160, 78, 0.80) 0%, rgba(17, 24, 39, 0.80) 100%)',
            logo: '/images/business-admin-logo.png'
        },
        {
            id: 8,
            name: 'ACCOUNTANCY PROGRAM',
            dbName: 'Accountancy Program',
            color: 'linear-gradient(180deg, rgba(127, 196, 216, 0.80) 0%, rgba(17, 24, 39, 0.80) 100%)',
            logo: '/images/accountancy-logo.png'
        }
    ];

    const defaultColors = [
        'linear-gradient(180deg, rgba(0, 0, 209, 0.80) 0%, rgba(17, 24, 39, 0.80) 100%)',
        'linear-gradient(180deg, rgba(217, 115, 71, 0.80) 0%, rgba(17, 24, 39, 0.80) 100%)',
        'linear-gradient(180deg, rgba(200, 78, 60, 0.80) 0%, rgba(17, 24, 39, 0.80) 100%)',
        'linear-gradient(180deg, rgba(139, 93, 199, 0.80) 0%, rgba(17, 24, 39, 0.80) 100%)',
        'linear-gradient(180deg, rgba(76, 175, 80, 0.80) 0%, rgba(17, 24, 39, 0.80) 100%)',
        'linear-gradient(180deg, rgba(224, 160, 78, 0.80) 0%, rgba(17, 24, 39, 0.80) 100%)',
        'linear-gradient(180deg, rgba(127, 196, 216, 0.80) 0%, rgba(17, 24, 39, 0.80) 100%)',
        'linear-gradient(180deg, rgba(233, 30, 99, 0.80) 0%, rgba(17, 24, 39, 0.80) 100%)'
    ];

    const fetchDepartments = async () => {
        try {
            const response = await fetch('/api/departments');
            const allDepartments = await response.json();
            const departmentsArray = Array.isArray(allDepartments) ? allDepartments : [];
            
            const mergedPrograms = [];
            
            hardcodedPrograms.forEach((program) => {
                const correspondingDept = departmentsArray.find(
                    dept => dept.name.toLowerCase() === program.dbName.toLowerCase()
                );
                
                if (!correspondingDept || !correspondingDept.is_archived) {
                    mergedPrograms.push(program);
                }
            });
            
            const activeDepartments = departmentsArray.filter(dept => !dept.is_archived);
            
            activeDepartments.forEach((dept, index) => {
                const existingProgram = hardcodedPrograms.find(
                    p => p.dbName.toLowerCase() === dept.name.toLowerCase()
                );
                
                if (!existingProgram) {
                    mergedPrograms.push({
                        id: `dept-${dept.id}`,
                        name: dept.name.toUpperCase(),
                        dbName: dept.name,
                        color: defaultColors[(hardcodedPrograms.length + index) % defaultColors.length],
                        logo: '/images/fsuu-logo.png'
                    });
                }
            });
            
            setPrograms(mergedPrograms);
        } catch (error) {
            console.error('Error fetching departments:', error);
            setPrograms(hardcodedPrograms);
        }
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/students');
            const data = await response.json();
            console.log('Fetched students:', data);
            setStudents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching students:', error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchFaculty = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/faculty');
            const data = await response.json();
            console.log('Fetched faculty:', data);
            const activeFaculty = Array.isArray(data) ? data.filter(faculty => !faculty.deleted_at) : [];
            setFaculty(activeFaculty);
        } catch (error) {
            console.error('Error fetching faculty:', error);
            setFaculty([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
        fetchStudents();
        fetchFaculty();
    }, []);

    const toggleProgram = (id) => {
        console.log('Toggling program:', id);
        setExpandedProgram(expandedProgram === id ? null : id);
    };

    const getProgramMembers = (programId) => {
        const program = programs.find(p => p.id === programId);
        if (!program) return { students: [], faculty: [] };

        console.log('Program:', program);
        console.log('All students:', students);
        console.log('All faculty:', faculty);

        const programStudents = students.filter(student => 
            student.program === program.dbName
        );

        const programFaculty = faculty.filter(member => 
            member.department === program.dbName
        );

        console.log('Filtered students:', programStudents);
        console.log('Filtered faculty:', programFaculty);

        return { students: programStudents, faculty: programFaculty };
    };

    const getTotalMembers = (programId) => {
        const { students, faculty } = getProgramMembers(programId);
        return students.length + faculty.length;
    };

    const openStudentDetails = (student) => {
        setSelectedStudent(student);
        setShowStudentDetails(true);
        setPendingChanges({});
        setHasUnsavedChanges(false);
        setEditingField(null);
        setEditValue('');
    };

    const closeStudentDetails = () => {
        setShowStudentDetails(false);
        setSelectedStudent(null);
        setPendingChanges({});
        setHasUnsavedChanges(false);
        setEditingField(null);
        setEditValue('');
    };

    const openFacultyDetails = (faculty) => {
        setSelectedFaculty(faculty);
        setShowFacultyDetails(true);
        setPendingChanges({});
        setHasUnsavedChanges(false);
        setEditingField(null);
        setEditValue('');
    };

    const closeFacultyDetails = () => {
        setShowFacultyDetails(false);
        setSelectedFaculty(null);
        setPendingChanges({});
        setHasUnsavedChanges(false);
        setEditingField(null);
        setEditValue('');
    };

    const startEdit = (field, currentValue) => {
        setEditingField(field);
        setEditValue(currentValue || '');
    };

    const cancelEdit = () => {
        setEditingField(null);
        setEditValue('');
    };

    const saveEdit = () => {
        const currentRecord = selectedStudent || selectedFaculty;
        if (!currentRecord || !editingField) return;
        
        const newPendingChanges = { ...pendingChanges, [editingField]: editValue };
        setPendingChanges(newPendingChanges);
        setHasUnsavedChanges(true);
        
        setEditingField(null);
        setEditValue('');
    };

    const saveAllChanges = async () => {
        const currentRecord = selectedStudent || selectedFaculty;
        const isStudent = !!selectedStudent;
        
        if (!currentRecord || Object.keys(pendingChanges).length === 0) return;

        try {
            const endpoint = isStudent ? `/api/students/${currentRecord.id}` : `/api/faculty/${currentRecord.id}`;
            const updatedData = { ...currentRecord, ...pendingChanges };

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                if (isStudent) {
                    await fetchStudents();
                    setSelectedStudent({ ...selectedStudent, ...pendingChanges });
                } else {
                    await fetchFaculty();
                    setSelectedFaculty({ ...selectedFaculty, ...pendingChanges });
                }
                
                setPendingChanges({});
                setHasUnsavedChanges(false);
            } else {
                console.error('Failed to save changes');
            }
        } catch (error) {
            console.error('Error saving changes:', error);
        }
    };

    const discardChanges = () => {
        setPendingChanges({});
        setHasUnsavedChanges(false);
        setEditingField(null);
        setEditValue('');
    };

    const renderEditableField = (label, field, currentRecord, type = 'text', options = null) => {
        const displayValue = pendingChanges[field] !== undefined ? pendingChanges[field] : (currentRecord[field] || '—');
        const isEditing = editingField === field;

        return (
            <div>
                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>{label}:</label>
                {isEditing ? (
                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {type === 'select' && options ? (
                            <select
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEdit();
                                    if (e.key === 'Escape') cancelEdit();
                                }}
                                style={{
                                    flex: 1,
                                    padding: '6px 10px',
                                    border: '2px solid #3b82f6',
                                    borderRadius: '6px',
                                    outline: 'none',
                                    fontSize: '14px'
                                }}
                                autoFocus
                            >
                                {options.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        ) : type === 'textarea' ? (
                            <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                rows="2"
                                style={{
                                    flex: 1,
                                    padding: '6px 10px',
                                    border: '2px solid #3b82f6',
                                    borderRadius: '6px',
                                    outline: 'none',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                }}
                                autoFocus
                            />
                        ) : (
                            <input
                                type={type}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEdit();
                                    if (e.key === 'Escape') cancelEdit();
                                }}
                                style={{
                                    flex: 1,
                                    padding: '6px 10px',
                                    border: '2px solid #3b82f6',
                                    borderRadius: '6px',
                                    outline: 'none',
                                    fontSize: '14px'
                                }}
                                autoFocus
                            />
                        )}
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
                            backgroundColor: pendingChanges[field] !== undefined ? '#fef3c7' : 'transparent',
                            transition: 'background-color 0.2s'
                        }}
                        onClick={() => startEdit(field, currentRecord[field])}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = pendingChanges[field] !== undefined ? '#fef3c7' : 'transparent'}
                    >
                        {displayValue}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <div style={{ 
                padding: '48px 80px', 
                background: '#f5f7fa', 
                minHeight: '100vh' 
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                <h1 style={{ 
                    fontSize: 50,
                    fontWeight: 900,
                    color: '#1a1a1a',
                    margin: 0,
                    letterSpacing: '1px',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
                }}>
                    PROGRAMS
                </h1>
                {loading && (
                    <div style={{ 
                        background: '#f3f4f6', 
                        padding: '8px 16px', 
                        borderRadius: '20px',
                        fontSize: '14px',
                        color: '#6b7280'
                    }}>
                        Loading...
                    </div>
                )}
            </div>

            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 24,
                maxWidth: 900,
                paddingLeft: 70
            }}>
                {programs.map((program) => {
                    // Hide other programs when one is expanded
                    if (expandedProgram && expandedProgram !== program.id) {
                        return null;
                    }
                    
                    return (
                    <div
                        key={program.id}
                        style={{
                            position: 'relative',
                            marginLeft: 0,
                            opacity: expandedProgram && expandedProgram !== program.id ? 0 : 1,
                            transform: expandedProgram && expandedProgram !== program.id ? 'translateX(-100px)' : 'translateX(0)',
                            transition: 'all 0.5s ease-in-out'
                        }}
                    >
                        {/* Logo Circle - Positioned to overlap the left edge */}
                        <div style={{
                            position: 'absolute',
                            left: -70,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 130,
                            height: 130,
                            borderRadius: '50%',
                            background: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                            padding: 10,
                            border: '6px solid rgba(255, 255, 255, 0.3)',
                            zIndex: 10
                        }}>
                            <img 
                                src={program.logo} 
                                alt={program.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                }}
                                onError={(e) => {
                                    // Fallback if image doesn't exist
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `
                                        <div style="
                                            width: 100%;
                                            height: 100%;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            font-size: 42px;
                                            font-weight: bold;
                                            color: #5a67d8;
                                        ">
                                            ${program.name.charAt(0)}
                                        </div>
                                    `;
                                }}
                            />
                        </div>

                        {/* Program Card */}
                        <div
                            onClick={() => toggleProgram(program.id)}
                            style={{
                                width: '643px',
                                height: '76px',
                                flexShrink: 0,
                                background: program.color,
                                borderRadius: '10px',
                                boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingLeft: '90px',
                                paddingRight: '30px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 8px 0 rgba(0, 0, 0, 0.35)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 4px 0 rgba(0, 0, 0, 0.25)';
                            }}
                        >
                            {/* Program Name */}
                            <div style={{
                                width: '451px',
                                height: '41px',
                                flexShrink: 0,
                                color: '#FFF',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '32px',
                                fontStyle: 'italic',
                                fontWeight: 800,
                                lineHeight: '24px',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                {program.name}
                            </div>

                            {/* Dropdown Arrow */}
                            <svg 
                                width="28" 
                                height="28" 
                                viewBox="0 0 24 24" 
                                fill="none"
                                style={{
                                    transform: expandedProgram === program.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s ease',
                                    flexShrink: 0
                                }}
                            >
                                <path 
                                    d="M6 9L12 15L18 9" 
                                    stroke="white" 
                                    strokeWidth="3" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    </div>
                    );
                })}
            </div>

            {/* Expanded Program Content */}
            {expandedProgram && (() => {
                const program = programs.find(p => p.id === expandedProgram);
                const { students: programStudents, faculty: programFaculty } = getProgramMembers(expandedProgram);
                const allMembers = [
                    ...programStudents.map(student => ({ ...student, type: 'student' })),
                    ...programFaculty.map(member => ({ ...member, type: 'faculty' }))
                ].sort((a, b) => {
                    // Sort by type (students first, then faculty), then by name
                    if (a.type !== b.type) {
                        return a.type === 'student' ? -1 : 1;
                    }
                    const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim();
                    const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim();
                    return nameA.localeCompare(nameB);
                });

                return (
                    <div style={{
                        marginTop: 20,
                        padding: 24,
                        background: 'white',
                        borderRadius: 12,
                        maxWidth: 1200,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <button 
                                    onClick={() => setExpandedProgram(null)}
                                    style={{
                                        background: '#f3f4f6',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        padding: '8px 16px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        color: '#374151',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.3s ease',
                                        transform: 'translateX(0)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#e5e7eb';
                                        e.currentTarget.style.transform = 'translateX(-4px)';
                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#f3f4f6';
                                        e.currentTarget.style.transform = 'translateX(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    ← Back to Programs
                                </button>
                                <h3 style={{ margin: 0, color: '#1a1a1a', fontSize: '24px', fontWeight: '600' }}>
                                    {program?.name} Members
                                </h3>
                            </div>
                            <div style={{ 
                                background: '#f3f4f6', 
                                padding: '8px 16px', 
                                borderRadius: '20px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151'
                            }}>
                                {programStudents.length} Students • {programFaculty.length} Faculty • {allMembers.length} Total
                            </div>
                        </div>

                        {/* Table */}
                        <div style={{ 
                            background: 'white',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            overflow: 'hidden'
                        }}>
                            <table style={{ 
                                width: '100%', 
                                borderCollapse: 'collapse'
                            }}>
                                <thead>
                                    <tr style={{ 
                                        background: '#f9fafb',
                                        borderBottom: '1px solid #e5e7eb'
                                    }}>
                                        <th style={{
                                            padding: '14px 20px',
                                            textAlign: 'left',
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: '#4b5563',
                                            textTransform: 'none'
                                        }}>Name</th>
                                        <th style={{
                                            padding: '14px 20px',
                                            textAlign: 'left',
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: '#4b5563',
                                            textTransform: 'none'
                                        }}>ID</th>
                                        <th style={{
                                            padding: '14px 20px',
                                            textAlign: 'left',
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: '#4b5563',
                                            textTransform: 'none'
                                        }}>Email address</th>
                                        <th style={{
                                            padding: '14px 20px',
                                            textAlign: 'left',
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: '#4b5563',
                                            textTransform: 'none'
                                        }}>Type</th>
                                        <th style={{
                                            padding: '14px 20px',
                                            textAlign: 'left',
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: '#4b5563',
                                            textTransform: 'none'
                                        }}>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allMembers.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ 
                                                padding: 40, 
                                                textAlign: 'center',
                                                color: '#6b7280',
                                                fontSize: 14
                                            }}>
                                                No students or faculty members found for this program.
                                            </td>
                                        </tr>
                                    ) : (
                                        allMembers.map((member, index) => (
                                            <tr 
                                                key={`${member.type}-${member.id || index}`}
                                                onDoubleClick={() => member.type === 'student' ? openStudentDetails(member) : openFacultyDetails(member)}
                                                style={{
                                                    background: 'white',
                                                    borderBottom: '1px solid #f3f4f6',
                                                    transition: 'background 0.15s',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                                title="Double-click to edit"
                                            >
                                                <td style={{
                                                    padding: '16px 20px',
                                                    fontSize: 14,
                                                    color: '#1f2937',
                                                    fontWeight: 500
                                                }}>
                                                    {member.first_name} {member.last_name}
                                                </td>
                                                <td style={{
                                                    padding: '16px 20px',
                                                    fontSize: 14,
                                                    color: '#1f2937'
                                                }}>
                                                    {member.type === 'student' ? member.student_id : member.faculty_id}
                                                </td>
                                                <td style={{
                                                    padding: '16px 20px',
                                                    fontSize: 14,
                                                    color: '#1f2937'
                                                }}>
                                                    {member.email || '—'}
                                                </td>
                                                <td style={{
                                                    padding: '16px 20px',
                                                    fontSize: 14,
                                                    color: '#1f2937'
                                                }}>
                                                    <span style={{
                                                        background: member.type === 'student' ? '#dbeafe' : '#fef3c7',
                                                        color: member.type === 'student' ? '#1e40af' : '#92400e',
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {member.type}
                                                    </span>
                                                </td>
                                                <td style={{
                                                    padding: '16px 20px',
                                                    fontSize: 13,
                                                    color: '#6b7280'
                                                }}>
                                                    {member.type === 'student' 
                                                        ? `${member.year_level || 'N/A'} • ${member.section || 'N/A'}`
                                                        : `${member.position || 'N/A'}`
                                                    }
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })()}
            </div>

            {/* Student Details Modal */}
            {showStudentDetails && selectedStudent && (
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
                                <button 
                                    onClick={closeStudentDetails} 
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 8,
                                        padding: '6px 10px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ✕
                                </button>
                        </div>
                        </div>
                        <div style={{ maxHeight: '75vh', overflow: 'auto' }}>

                            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                        <h3 style={{ margin: '0 0 16px 0', color: '#374151', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Personal Information</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {renderEditableField('Student ID', 'student_id', selectedStudent)}
                                            {renderEditableField('First Name', 'first_name', selectedStudent)}
                                            {renderEditableField('Last Name', 'last_name', selectedStudent)}
                                            {renderEditableField('Date of Birth', 'date_of_birth', selectedStudent, 'date')}
                                            {renderEditableField('Gender', 'gender', selectedStudent, 'select', [
                                                { value: '', label: 'Select Gender' },
                                                { value: 'Male', label: 'Male' },
                                                { value: 'Female', label: 'Female' },
                                                { value: 'Other', label: 'Other' }
                                            ])}
                                    </div>

                                        <h3 style={{ margin: '24px 0 16px 0', color: '#374151', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Contact Information</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {renderEditableField('Email', 'email', selectedStudent, 'email')}
                                            {renderEditableField('Phone', 'phone', selectedStudent)}
                                            {renderEditableField('Address', 'address', selectedStudent, 'textarea')}
                                    </div>
                                </div>

                                <div>
                                        <h3 style={{ margin: '0 0 16px 0', color: '#374151', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Academic Information</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {renderEditableField('Program/Course', 'program', selectedStudent, 'select', [
                                                { value: '', label: 'Select Program' },
                                                { value: 'Nursing Program', label: 'Nursing Program' },
                                                { value: 'Teachers Education Program', label: 'Teachers Education Program' },
                                                { value: 'Engineering Program', label: 'Engineering Program' },
                                                { value: 'Criminal Justice Program', label: 'Criminal Justice Program' },
                                                { value: 'Computer Science Program', label: 'Computer Science Program' },
                                                { value: 'Arts and Sciences Program', label: 'Arts and Sciences Program' },
                                                { value: 'Business Administration Program', label: 'Business Administration Program' },
                                                { value: 'Accountancy Program', label: 'Accountancy Program' }
                                            ])}
                                            {renderEditableField('Year Level', 'year_level', selectedStudent, 'select', [
                                                { value: '', label: 'Select Year Level' },
                                                { value: '1st Year', label: '1st Year' },
                                                { value: '2nd Year', label: '2nd Year' },
                                                { value: '3rd Year', label: '3rd Year' },
                                                { value: '4th Year', label: '4th Year' }
                                            ])}
                                            {renderEditableField('Section', 'section', selectedStudent)}
                                            {renderEditableField('Status', 'status', selectedStudent, 'select', [
                                                { value: '', label: 'Select Status' },
                                                { value: 'Active', label: 'Active' },
                                                { value: 'Inactive', label: 'Inactive' }
                                            ])}
                                            </div>
                                        </div>
                                            </div>
                                        </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Faculty Details Modal */}
            {showFacultyDetails && selectedFaculty && (
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
                                <button 
                                    onClick={closeFacultyDetails} 
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 8,
                                        padding: '6px 10px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ✕
                                </button>
                        </div>
                                            </div>
                        <div style={{ maxHeight: '75vh', overflow: 'auto' }}>
                            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        <div>
                                        <h3 style={{ margin: '0 0 16px 0', color: '#374151', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Personal Information</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {renderEditableField('Faculty ID', 'faculty_id', selectedFaculty)}
                                            {renderEditableField('First Name', 'first_name', selectedFaculty)}
                                            {renderEditableField('Last Name', 'last_name', selectedFaculty)}
                                            {renderEditableField('Date of Birth', 'date_of_birth', selectedFaculty, 'date')}
                                            {renderEditableField('Gender', 'gender', selectedFaculty, 'select', [
                                                { value: '', label: 'Select Gender' },
                                                { value: 'Male', label: 'Male' },
                                                { value: 'Female', label: 'Female' },
                                                { value: 'Other', label: 'Other' }
                                            ])}
                                    </div>

                                        <h3 style={{ margin: '24px 0 16px 0', color: '#374151', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Contact Information</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {renderEditableField('Email', 'email', selectedFaculty, 'email')}
                                            {renderEditableField('Phone', 'phone', selectedFaculty)}
                                            {renderEditableField('Address', 'address', selectedFaculty, 'textarea')}
                                    </div>
                                </div>

                                <div>
                                        <h3 style={{ margin: '0 0 16px 0', color: '#374151', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>Professional Information</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {renderEditableField('Department', 'department', selectedFaculty, 'select', [
                                                { value: '', label: 'Select Department' },
                                                { value: 'Nursing Program', label: 'Nursing Program' },
                                                { value: 'Teachers Education Program', label: 'Teachers Education Program' },
                                                { value: 'Engineering Program', label: 'Engineering Program' },
                                                { value: 'Criminal Justice Program', label: 'Criminal Justice Program' },
                                                { value: 'Computer Science Program', label: 'Computer Science Program' },
                                                { value: 'Arts and Sciences Program', label: 'Arts and Sciences Program' },
                                                { value: 'Business Administration Program', label: 'Business Administration Program' },
                                                { value: 'Accountancy Program', label: 'Accountancy Program' }
                                            ])}
                                            {renderEditableField('Position', 'position', selectedFaculty)}
                                            {renderEditableField('Educational Attainment', 'attainment', selectedFaculty)}
                                            {renderEditableField('Status', 'status', selectedFaculty, 'select', [
                                                { value: '', label: 'Select Status' },
                                                { value: 'Full Time', label: 'Full Time' },
                                                { value: 'Part Time', label: 'Part Time' }
                                            ])}
                                            </div>
                                        </div>
                                            </div>
                                        </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
