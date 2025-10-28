import React, { useState, useEffect } from 'react';

export default function Courses() {
    const [expandedProgram, setExpandedProgram] = useState(null);
    const [students, setStudents] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(false);

    const programs = [
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
            const activeFaculty = Array.isArray(data) ? data.filter(faculty => faculty.status !== 'archived') : [];
            setFaculty(activeFaculty);
        } catch (error) {
            console.error('Error fetching faculty:', error);
            setFaculty([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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

    return (
        <>
            <style>
                {`
                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}
            </style>
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
                                fontSize: '40px',
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
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        opacity: 0,
                        transform: 'translateY(20px)',
                        animation: 'fadeInUp 0.6s ease-out forwards'
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

                        {/* Debug Information */}
                        <div style={{ 
                            background: '#f9fafb', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '8px', 
                            padding: '12px', 
                            marginBottom: '16px',
                            fontSize: '12px',
                            color: '#6b7280'
                        }}>
                            <strong>Debug Info:</strong><br/>
                            Program DB Name: {program?.dbName}<br/>
                            Total Students: {students.length}<br/>
                            Total Faculty: {faculty.length}<br/>
                            Program Students: {programStudents.length}<br/>
                            Program Faculty: {programFaculty.length}
                        </div>

                        {allMembers.length === 0 ? (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '40px 20px',
                                color: '#6b7280'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                                <p style={{ margin: 0, fontSize: '16px' }}>
                                    No students or faculty members found for this program.
                                </p>
                            </div>
                        ) : (
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                                gap: '16px',
                                maxHeight: '500px',
                                overflowY: 'auto'
                            }}>
                                {allMembers.map((member, index) => (
                                    <div
                                        key={`${member.type}-${member.id || index}`}
                                        style={{
                                            background: member.type === 'student' ? '#f0f9ff' : '#fef3c7',
                                            border: member.type === 'student' ? '1px solid #0ea5e9' : '1px solid #f59e0b',
                                            borderRadius: '8px',
                                            padding: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            opacity: 0,
                                            transform: 'translateY(20px)',
                                            animation: `fadeInUp 0.4s ease-out ${index * 0.1}s forwards`,
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: member.type === 'student' ? '#0ea5e9' : '#f59e0b',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: '600',
                                            fontSize: '16px'
                                        }}>
                                            {member.type === 'student' ? '👨‍🎓' : '👨‍🏫'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ 
                                                fontWeight: '600', 
                                                color: '#1a1a1a',
                                                marginBottom: '4px'
                                            }}>
                                                {member.first_name} {member.last_name}
                                            </div>
                                            <div style={{ 
                                                fontSize: '14px', 
                                                color: '#6b7280',
                                                marginBottom: '2px'
                                            }}>
                                                {member.type === 'student' ? `Student ID: ${member.student_id}` : `Faculty ID: ${member.faculty_id}`}
                                            </div>
                                            <div style={{ 
                                                fontSize: '12px', 
                                                color: '#9ca3af'
                                            }}>
                                                {member.type === 'student' 
                                                    ? `${member.program} • ${member.year_level || 'N/A'} • ${member.section || 'N/A'}`
                                                    : `${member.department} • ${member.position || 'N/A'}`
                                                }
                                            </div>
                                            {member.email && (
                                                <div style={{ 
                                                    fontSize: '12px', 
                                                    color: '#6b7280',
                                                    marginTop: '4px'
                                                }}>
                                                    📧 {member.email}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{
                                            background: member.type === 'student' ? '#dcfce7' : '#fef3c7',
                                            color: member.type === 'student' ? '#166534' : '#92400e',
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase'
                                        }}>
                                            {member.type}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })()}
            </div>
        </>
    );
}

