import React, { useState, useEffect } from 'react';

export default function Schedule({ selectedPerson = null, onBack = null }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [students, setStudents] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [selectedPersonState, setSelectedPersonState] = useState(selectedPerson);

    // Fetch students and faculty for search
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
                setFaculty(Array.isArray(facultyData) ? facultyData.filter(f => f.status !== 'archived') : []);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedPerson) {
            setSelectedPersonState(selectedPerson);
        }
    }, [selectedPerson]);

    // Time slots from 6 AM to 9 PM
    const timeSlots = [
        '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM',
        '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM'
    ];

    // Schedule items with their properties
    const scheduleItems = [
        {
            id: 1,
            title: 'IPT2',
            time: '8:00 - 8:30 AM',
            startHour: 8,
            duration: 0.5, // hours
            color: '#DBEAFE',
            textColor: '#1E40AF',
            borderColor: '#3B82F6'
        },
        {
            id: 2,
            title: 'GE-119',
            time: '9:00 - 10:00 AM',
            startHour: 9,
            duration: 1,
            color: '#D1FAE5',
            textColor: '#065F46',
            borderColor: '#10B981'
        },
        {
            id: 3,
            title: 'CISDP 2',
            time: '10:30 AM',
            startHour: 10.5,
            duration: 1,
            color: '#FEF3C7',
            textColor: '#92400E',
            borderColor: '#F59E0B'
        },
        {
            id: 4,
            title: 'PE-4',
            time: '12:00 - 1:15 PM',
            startHour: 12,
            duration: 1.25,
            color: '#EDE9FE',
            textColor: '#5B21B6',
            borderColor: '#8B5CF6'
        },
        {
            id: 5,
            title: 'PLATFORM TECHNOLOGIES',
            time: '2:00 - 2:30 PM',
            startHour: 14,
            duration: 0.5,
            color: '#FFEDD5',
            textColor: '#9A3412',
            borderColor: '#F97316'
        },
        {
            id: 6,
            title: 'SIA 1',
            time: '4:00 - 5:00 PM',
            startHour: 16,
            duration: 1,
            color: '#FECACA',
            textColor: '#991B1B',
            borderColor: '#EF4444'
        },
        {
            id: 7,
            title: 'SIA 2',
            time: '6:00 - 6:30 PM',
            startHour: 18,
            duration: 0.5,
            color: '#DBEAFE',
            textColor: '#1E40AF',
            borderColor: '#3B82F6'
        },
        {
            id: 8,
            title: 'IT ERA',
            time: '7:00 - 7:30 PM',
            startHour: 19,
            duration: 0.5,
            color: '#FCE7F3',
            textColor: '#9F1239',
            borderColor: '#EC4899'
        }
    ];

    // Calculate position for schedule items
    const getItemPosition = (startHour, duration) => {
        const startIndex = startHour - 6; // 6 AM is index 0
        const top = startIndex * 55; // 55px per hour slot
        const height = duration * 55; // height based on duration
        return { top, height };
    };

    // Filter search results
    const filteredResults = searchQuery.trim() !== '' ? [
        ...students.filter(s => 
            `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (s.student_id && s.student_id.includes(searchQuery))
        ).map(s => ({ ...s, type: 'student' })),
        ...faculty.filter(f =>
            `${f.first_name} ${f.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (f.email && f.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (f.faculty_id && f.faculty_id.includes(searchQuery))
        ).map(f => ({ ...f, type: 'faculty' }))
    ] : [];

    return (
        <div style={{ 
            padding: '32px 48px', 
            background: '#ffffff', 
            minHeight: '100vh',
            width: '100%'
        }}>
            {/* Header with Back Button */}
            {selectedPersonState && (
                <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button
                        onClick={() => {
                            setSelectedPersonState(null);
                            if (onBack) onBack();
                        }}
                        style={{
                            background: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: 8,
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: 14,
                            color: '#374151',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}
                    >
                        ← Back
                    </button>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#111827' }}>
                            Schedule for {selectedPersonState.first_name} {selectedPersonState.last_name}
                        </h2>
                        <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#6b7280' }}>
                            {selectedPersonState.type === 'student' 
                                ? `Student ID: ${selectedPersonState.student_id || 'N/A'} • ${selectedPersonState.program || 'N/A'}`
                                : `Faculty ID: ${selectedPersonState.faculty_id || 'N/A'} • ${selectedPersonState.department || 'N/A'}`
                            }
                        </p>
                    </div>
                </div>
            )}

            {/* Search Bar - Only show if no person is selected */}
            {!selectedPersonState && (
                <div style={{
                    marginBottom: 32,
                    position: 'relative'
                }}>
                    <h1 style={{ margin: '0 0 16px 0', fontSize: 32, fontWeight: 700, color: '#111827' }}>
                        Schedule
                    </h1>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        padding: '12px 16px',
                        gap: 12
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search for a student or faculty member to view their schedule..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                fontSize: 14,
                                color: '#374151',
                                width: '100%',
                                fontFamily: 'system-ui, -apple-system, sans-serif'
                            }}
                        />
                    </div>

                    {/* Search Results Dropdown */}
                    {searchQuery && filteredResults.length > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: 8,
                            marginTop: 8,
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            maxHeight: 400,
                            overflowY: 'auto',
                            zIndex: 10
                        }}>
                            {filteredResults.map((person, index) => (
                                <div
                                    key={`${person.type}-${person.id}`}
                                    onClick={() => {
                                        setSelectedPersonState(person);
                                        setSearchQuery('');
                                    }}
                                    style={{
                                        padding: 16,
                                        borderBottom: index < filteredResults.length - 1 ? '1px solid #f3f4f6' : 'none',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                >
                                    <div style={{ fontWeight: 600, color: '#111827', marginBottom: 4 }}>
                                        {person.first_name} {person.last_name}
                                    </div>
                                    <div style={{ fontSize: 13, color: '#6b7280' }}>
                                        {person.type === 'student' 
                                            ? `Student • ID: ${person.student_id || 'N/A'} • ${person.program || 'N/A'}`
                                            : `Faculty • ID: ${person.faculty_id || 'N/A'} • ${person.department || 'N/A'}`
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {searchQuery && filteredResults.length === 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: 8,
                            marginTop: 8,
                            padding: 24,
                            textAlign: 'center',
                            color: '#6b7280',
                            fontSize: 14
                        }}>
                            No results found for "{searchQuery}"
                        </div>
                    )}
                </div>
            )}

            {/* Show message if no person selected */}
            {!selectedPersonState && !searchQuery && (
                <div style={{
                    textAlign: 'center',
                    padding: 60,
                    color: '#6b7280'
                }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ margin: '0 auto 16px' }}>
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                    </svg>
                    <h3 style={{ fontSize: 20, fontWeight: 600, color: '#374151', margin: '0 0 8px 0' }}>
                        No Schedule Selected
                    </h3>
                    <p style={{ margin: 0, fontSize: 14 }}>
                        Search for a student or faculty member above to view their schedule
                    </p>
                </div>
            )}

            {/* Schedule Grid - Only show if person is selected */}
            {selectedPersonState && (
            <div style={{
                display: 'flex',
                gap: 0,
                position: 'relative',
                maxWidth: 1200
            }}>
                {/* Time Column */}
                <div style={{
                    width: 80,
                    flexShrink: 0
                }}>
                    {timeSlots.map((time, index) => (
                        <div
                            key={index}
                            style={{
                                height: 55,
                                display: 'flex',
                                alignItems: 'flex-start',
                                paddingTop: 4,
                                fontSize: 12,
                                color: '#6b7280',
                                fontWeight: 500,
                                borderTop: index === 0 ? 'none' : '1px solid #f3f4f6'
                            }}
                        >
                            {time}
                        </div>
                    ))}
                </div>

                {/* Schedule Content */}
                <div style={{
                    flex: 1,
                    position: 'relative',
                    borderLeft: '1px solid #e5e7eb',
                    minHeight: timeSlots.length * 55
                }}>
                    {/* Grid Lines */}
                    {timeSlots.map((_, index) => (
                        <div
                            key={index}
                            style={{
                                position: 'absolute',
                                top: index * 55,
                                left: 0,
                                right: 0,
                                height: 55,
                                borderTop: index === 0 ? 'none' : '1px solid #f3f4f6'
                            }}
                        />
                    ))}

                    {/* Schedule Items */}
                    {scheduleItems.map((item) => {
                        const { top, height } = getItemPosition(item.startHour, item.duration);
                        return (
                            <div
                                key={item.id}
                                style={{
                                    position: 'absolute',
                                    top: top + 2,
                                    left: 12,
                                    right: 12,
                                    height: height - 4,
                                    background: item.color,
                                    borderRadius: 8,
                                    padding: '12px 16px',
                                    borderLeft: `4px solid ${item.borderColor}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateX(0)';
                                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                                }}
                            >
                                <div style={{
                                    color: item.textColor,
                                    fontWeight: 700,
                                    fontSize: 14,
                                    marginBottom: 2
                                }}>
                                    {item.title}
                                </div>
                                <div style={{
                                    color: item.textColor,
                                    fontSize: 11,
                                    fontWeight: 500,
                                    opacity: 0.8
                                }}>
                                    {item.time}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            )}
        </div>
    );
}

