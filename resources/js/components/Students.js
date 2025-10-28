import React, { useState, useEffect } from 'react';
import Home from './Home';

export default function Students({ onDataUpdate }) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRow, setSelectedRow] = useState(null);
    const [showEditStudent, setShowEditStudent] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState(null);
    const [showStudentDetails, setShowStudentDetails] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [pendingChanges, setPendingChanges] = useState({});
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [showDeleteStudent, setShowDeleteStudent] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);

    const fetchStudents = async () => {
        try {
            const response = await fetch('/api/students');
            const data = await response.json();
            setStudents(Array.isArray(data) ? data : []);
        } catch (error) {
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

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

    const refreshStudents = () => {
        fetchStudents();
    };

    const openStudentDetails = (student) => {
        setSelectedStudent(student);
        setShowStudentDetails(true);
    };

    const closeStudentDetails = () => {
        setShowStudentDetails(false);
        setSelectedStudent(null);
        setEditingField(null);
        setEditValue('');
        setHasUnsavedChanges(false);
        setPendingChanges({});
    };

    const startEditing = (field, currentValue) => {
        setEditingField(field);
        setEditValue(currentValue || '');
    };

    const saveEdit = async () => {
        const currentStudent = selectedStudent || studentToEdit;
        if (!currentStudent || !editingField) return;
        
        // Store the change in pending changes
        const newPendingChanges = { ...pendingChanges, [editingField]: editValue };
        setPendingChanges(newPendingChanges);
        setHasUnsavedChanges(true);
        
        setEditingField(null);
        setEditValue('');
    };

    const saveAllChanges = async () => {
        const currentStudent = selectedStudent || studentToEdit;
        if (!currentStudent || Object.keys(pendingChanges).length === 0) return;
        
        try {
            const updatedStudent = { ...currentStudent, ...pendingChanges };
            const response = await fetch(`/api/students/${currentStudent.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(updatedStudent)
            });

            if (response.ok) {
                if (selectedStudent) {
                    setSelectedStudent(updatedStudent);
                }
                if (studentToEdit) {
                    setStudentToEdit(updatedStudent);
                }
                setPendingChanges({});
                setHasUnsavedChanges(false);
                refreshStudents();
                if (onDataUpdate) {
                    onDataUpdate();
                }
                alert('Student details updated successfully!');
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

    const openAddStudent = () => {
        setShowAddStudent(true);
    };

    const closeAddStudent = () => {
        setShowAddStudent(false);
    };

    const openDeleteStudent = (student) => {
        setStudentToDelete(student);
        setShowDeleteStudent(true);
    };

    const closeDeleteStudent = () => {
        setShowDeleteStudent(false);
        setStudentToDelete(null);
    };

    const deleteStudent = async () => {
        if (!studentToDelete) return;
        
        try {
            const response = await fetch(`/api/students/${studentToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });

            if (response.ok) {
                alert('Student deleted successfully!');
                refreshStudents();
                if (onDataUpdate) {
                    onDataUpdate();
                }
                closeDeleteStudent();
            } else {
                alert('Error deleting student');
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('Error deleting student');
        }
    };

    const filteredStudents = students.filter(student => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (student.first_name + ' ' + student.last_name).toLowerCase().includes(searchLower) ||
            (student.email || '').toLowerCase().includes(searchLower) ||
            (student.student_id || '').toLowerCase().includes(searchLower)
        );
    });

    return (
        <div style={{ padding: '32px', background: '#f5f7fa', minHeight: '100vh' }}>
            {/* Search and Filter Bar */}
            <div style={{ 
                background: 'white', 
                padding: '20px 24px', 
                borderRadius: '12px 12px 0 0',
                border: '1px solid #e5e7eb',
                borderBottom: 'none',
                display: 'flex',
                gap: 16,
                alignItems: 'center'
            }}>
                <div style={{ position: 'relative' }}>
                    <select style={{
                        padding: '10px 36px 10px 14px',
                        borderRadius: 8,
                        border: '1px solid #d1d5db',
                        fontSize: 14,
                        color: '#6b7280',
                        background: 'white',
                        cursor: 'pointer',
                        appearance: 'none'
                    }}>
                        <option>Add filter</option>
                        <option>Department</option>
                        <option>Gender</option>
                        <option>Year Level</option>
                    </select>
                    <svg 
                        style={{ 
                            position: 'absolute', 
                            right: 12, 
                            top: '50%', 
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none'
                        }}
                        width="12" 
                        height="12" 
                        viewBox="0 0 12 12" 
                        fill="none"
                    >
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>

                <div style={{ 
                    flex: 1, 
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <svg 
                        style={{ 
                            position: 'absolute', 
                            left: 14,
                            pointerEvents: 'none'
                        }}
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none"
                    >
                        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
                            stroke="#9ca3af" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search for a student by name or email"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 14px 10px 44px',
                            borderRadius: 8,
                            border: '1px solid #d1d5db',
                            fontSize: 14,
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {/* Add Student Button */}
            <div style={{ 
                background: 'white', 
                padding: '16px 24px', 
                border: '1px solid #e5e7eb',
                borderTop: 'none',
                borderBottom: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                    Students ({filteredStudents.length})
                </div>
                <button 
                    onClick={openAddStudent}
                    style={{
                        background: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 20px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#15803d'}
                    onMouseLeave={(e) => e.target.style.background = '#16a34a'}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Add Student
                </button>
            </div>

            {/* Table */}
            <div style={{ 
                background: 'white',
                borderRadius: '0 0 12px 12px',
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
                            <th style={tableHeaderStyle}>Name</th>
                            <th style={tableHeaderStyle}>Student ID</th>
                            <th style={tableHeaderStyle}>Email address</th>
                            <th style={tableHeaderStyle}>Department</th>
                            <th style={tableHeaderStyle}>Gender</th>
                            <th style={tableHeaderStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" style={{ 
                                    padding: 40, 
                                    textAlign: 'center',
                                    color: '#6b7280'
                                }}>
                                    Loading students...
                                </td>
                            </tr>
                        ) : filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ 
                                    padding: 40, 
                                    textAlign: 'center',
                                    color: '#6b7280'
                                }}>
                                    {searchTerm ? 'No students found matching your search.' : 'No students found.'}
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map((student, index) => (
                                <tr 
                                    key={student.id}
                                    onClick={() => openStudentDetails(student)}
                                    onMouseEnter={() => setSelectedRow(index)}
                                    onMouseLeave={() => setSelectedRow(null)}
                                    style={{
                                        background: selectedRow === index ? '#dbeafe' : 'white',
                                        borderBottom: '1px solid #f3f4f6',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s'
                                    }}
                                >
                                    <td style={tableCellStyle}>
                                        {student.first_name} {student.last_name}
                                    </td>
                                    <td style={tableCellStyle}>
                                        {student.student_id || '—'}
                                    </td>
                                    <td style={tableCellStyle}>
                                        {student.email || '—'}
                                    </td>
                                    <td style={tableCellStyle}>
                                        {student.program || '—'}
                                    </td>
                                    <td style={tableCellStyle}>
                                        {student.gender || '—'}
                                    </td>
                                    <td style={tableCellStyle}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditStudent(student);
                                                }}
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
                                                title="Edit"
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#dcfce7'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#f0fdf4'}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#16a34a"/>
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openDeleteStudent(student);
                                                }}
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: 6,
                                                    border: 'none',
                                                    background: '#fef2f2',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                title="Delete"
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#fef2f2'}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                    <path d="M3 6h18l-2 13H5L3 6zM8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Student Modal */}
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
                            <div style={{ fontWeight: 700, fontSize: 18 }}>Edit Student</div>
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
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.student_id ? '#fef3c7' : 'transparent'}
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
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.first_name ? '#fef3c7' : 'transparent'}
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
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.last_name ? '#fef3c7' : 'transparent'}
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
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.date_of_birth ? '#fef3c7' : 'transparent'}
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
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.gender ? '#fef3c7' : 'transparent'}
                                                    >
                                                        {pendingChanges.gender || studentToEdit.gender || '—'}
                                                        {pendingChanges.gender && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
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
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.email ? '#fef3c7' : 'transparent'}
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
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.phone ? '#fef3c7' : 'transparent'}
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
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.address ? '#fef3c7' : 'transparent'}
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
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.program ? '#fef3c7' : 'transparent'}
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
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.year_level ? '#fef3c7' : 'transparent'}
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
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.section ? '#fef3c7' : 'transparent'}
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
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            backgroundColor: pendingChanges.status ? '#fef3c7' : (studentToEdit.status === 'Active' ? '#dcfce7' : '#fef3c7'),
                                                            color: pendingChanges.status ? '#92400e' : (studentToEdit.status === 'Active' ? '#166534' : '#92400e'),
                                                            display: 'inline-block',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            border: pendingChanges.status ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startEditing('status', studentToEdit.status)}
                                                        onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                                                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                                                    >
                                                        {pendingChanges.status || studentToEdit.status || '—'}
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
                                                        onDoubleClick={() => startEditing('student_id', selectedStudent.student_id)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.student_id ? '#fef3c7' : 'transparent'}
                                                    >
                                                        {pendingChanges.student_id || selectedStudent.student_id || '—'}
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
                                                        onDoubleClick={() => startEditing('first_name', selectedStudent.first_name)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.first_name ? '#fef3c7' : 'transparent'}
                                                    >
                                                        {pendingChanges.first_name || selectedStudent.first_name || '—'}
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
                                                        onDoubleClick={() => startEditing('last_name', selectedStudent.last_name)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.last_name ? '#fef3c7' : 'transparent'}
                                                    >
                                                        {pendingChanges.last_name || selectedStudent.last_name || '—'}
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
                                                        onDoubleClick={() => startEditing('date_of_birth', selectedStudent.date_of_birth)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.date_of_birth ? '#fef3c7' : 'transparent'}
                                                    >
                                                        {pendingChanges.date_of_birth || selectedStudent.date_of_birth || '—'}
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
                                                        onDoubleClick={() => startEditing('gender', selectedStudent.gender)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.gender ? '#fef3c7' : 'transparent'}
                                                    >
                                                        {pendingChanges.gender || selectedStudent.gender || '—'}
                                                        {pendingChanges.gender && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
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
                                                        onDoubleClick={() => startEditing('email', selectedStudent.email)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.email ? '#fef3c7' : 'transparent'}
                                                    >
                                                        {pendingChanges.email || selectedStudent.email || '—'}
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
                                                        onDoubleClick={() => startEditing('phone', selectedStudent.phone)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.phone ? '#fef3c7' : 'transparent'}
                                                    >
                                                        {pendingChanges.phone || selectedStudent.phone || '—'}
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
                                                        onDoubleClick={() => startEditing('address', selectedStudent.address)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.address ? '#fef3c7' : 'transparent'}
                                                    >
                                                        {pendingChanges.address || selectedStudent.address || '—'}
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
                                                        onDoubleClick={() => startEditing('program', selectedStudent.program)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.program ? '#fef3c7' : 'transparent'}
                                                    >
                                                        {pendingChanges.program || selectedStudent.program || '—'}
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
                                                        onDoubleClick={() => startEditing('year_level', selectedStudent.year_level)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.year_level ? '#fef3c7' : 'transparent'}
                                                    >
                                                        {pendingChanges.year_level || selectedStudent.year_level || '—'}
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
                                                        onDoubleClick={() => startEditing('section', selectedStudent.section)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.section ? '#fef3c7' : 'transparent'}
                                                    >
                                                        {pendingChanges.section || selectedStudent.section || '—'}
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
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            backgroundColor: pendingChanges.status ? '#fef3c7' : (selectedStudent.status === 'Active' ? '#dcfce7' : '#fef3c7'),
                                                            color: pendingChanges.status ? '#92400e' : (selectedStudent.status === 'Active' ? '#166534' : '#92400e'),
                                                            display: 'inline-block',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            border: pendingChanges.status ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startEditing('status', selectedStudent.status)}
                                                        onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                                                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                                                    >
                                                        {pendingChanges.status || selectedStudent.status || '—'}
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

            {/* Add Student Modal */}
            {showAddStudent && (
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
                            <div style={{ fontWeight: 700, fontSize: 18 }}>Add Student</div>
                            <button onClick={closeAddStudent} style={{
                                background: 'transparent',
                                border: '1px solid #e5e7eb',
                                borderRadius: 8,
                                padding: '6px 10px',
                                cursor: 'pointer'
                            }}>✕</button>
                        </div>
                        <div style={{ maxHeight: '75vh', overflow: 'auto' }}>
                            <AddStudentForm 
                                onSuccess={() => { 
                                    closeAddStudent(); 
                                    refreshStudents();
                                    if (onDataUpdate) {
                                        onDataUpdate();
                                    }
                                }} 
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Student Confirmation Modal */}
            {showDeleteStudent && studentToDelete && (
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
                        background: 'white',
                        borderRadius: 12,
                        padding: 24,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        maxWidth: '400px',
                        width: '100%'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <div style={{ 
                                width: 48, 
                                height: 48, 
                                borderRadius: '50%', 
                                background: '#fef2f2',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                                Delete Student
                            </h3>
                            <p style={{ color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
                                Are you sure you want to delete <strong>{studentToDelete.first_name} {studentToDelete.last_name}</strong>? 
                                This action cannot be undone.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={closeDeleteStudent}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #d1d5db',
                                    borderRadius: 8,
                                    padding: '10px 20px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    color: '#374151'
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={deleteStudent}
                                style={{
                                    background: '#dc2626',
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '10px 20px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    color: 'white'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const tableHeaderStyle = {
    padding: '14px 20px',
    textAlign: 'left',
    fontSize: 13,
    fontWeight: 600,
    color: '#4b5563',
    textTransform: 'none'
};

const tableCellStyle = {
    padding: '16px 20px',
    fontSize: 14,
    color: '#1f2937'
};

// Add Student Form Component
function AddStudentForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        student_id: '',
        first_name: '',
        last_name: '',
        middle_name: '',
        date_of_birth: '',
        gender: '',
        personal_information: '',
        email: '',
        phone: '',
        address: '',
        program: '',
        year_level: '',
        section: '',
        status: ''
    });
    const [errors, setErrors] = useState({});
    const [statusMessage, setStatusMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Define programs list
    const programs = [
        'Nursing Program',
        'Teachers Education Program', 
        'Engineering Program',
        'Criminal Justice Program',
        'Computer Science Program',
        'Arts and Sciences Program',
        'Business Administration Program',
        'Accountancy Program'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setStatusMessage('');
        setIsLoading(true);

        console.log('Form submitted with data:', formData);

        try {
            const response = await fetch('/api/students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log('Response status:', response.status);
            console.log('Response data:', data);

            if (response.ok) {
                setStatusMessage('Student added successfully!');
                setFormData({
                    student_id: '',
                    first_name: '',
                    last_name: '',
                    middle_name: '',
                    date_of_birth: '',
                    gender: '',
                    personal_information: '',
                    email: '',
                    phone: '',
                    address: '',
                    program: '',
                    year_level: '',
                    section: '',
                    status: ''
                });
                
                if (typeof onSuccess === 'function') {
                    onSuccess();
                }
                
                // Clear success message after 3 seconds
                setTimeout(() => {
                    setStatusMessage('');
                }, 3000);
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setStatusMessage('Error: ' + (data.message || 'Failed to add student'));
                }
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setStatusMessage('Error: Failed to submit form');
        } finally {
            setIsLoading(false);
        }
    };

    const containerStyle = {
        maxWidth: '1200px',
        margin: '24px auto',
        padding: '24px',
        background: '#ffffff',
        borderRadius: '12px',
        color: '#e7e7e7',
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
    };

    const inputStyle = {
        padding: '12px',
        borderRadius: '8px',
        border: '0',
        background: '#e8ebef'
    };

    const errorStyle = {
        color: '#fca5a5',
        fontSize: '14px',
        marginTop: '4px'
    };

    const successStyle = {
        color: '#3cb043',
        margin: '8px 0 16px 0',
        padding: '12px 16px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid rgb(0, 0, 0)',
        fontWeight: '500'
    };

    return (
        <div style={containerStyle}>
            <h2 style={{
                margin: '0 0 16px 0',
                padding: '16px 24px',
                background: '#fff',
                color: '#1a1a1a',
                borderRadius: '10px',
                display: 'inline-block'
            }}>
                Add a Student
            </h2>
            
            {statusMessage && (
                <p style={successStyle}>{statusMessage}</p>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                        <h3 style={{ margin: '0 0 8px 0', color: '#a3a3a3' }}>Personal Information</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input
                                placeholder="Student ID"
                                name="student_id"
                                value={formData.student_id}
                                onChange={handleInputChange}
                                style={inputStyle}
                            />
                            <input
                                placeholder="First Name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleInputChange}
                                style={inputStyle}
                                required
                            />
                            {errors.first_name && <div style={errorStyle}>{errors.first_name}</div>}
                            
                            <input
                                placeholder="Last Name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                style={inputStyle}
                                required
                            />
                            {errors.last_name && <div style={errorStyle}>{errors.last_name}</div>}
                            
                            <input
                                placeholder="Middle Name"
                                name="middle_name"
                                value={formData.middle_name}
                                onChange={handleInputChange}
                                style={inputStyle}
                            />
                            <input
                                type="date"
                                placeholder="Date of Birth"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleInputChange}
                                style={inputStyle}
                            />
                            <input
                                placeholder="Gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                style={inputStyle}
                            />
                            <input
                                placeholder="Personal Information"
                                name="personal_information"
                                value={formData.personal_information}
                                onChange={handleInputChange}
                                style={inputStyle}
                            />
                        </div>

                        <h3 style={{ margin: '24px 0 8px 0', color: '#a3a3a3' }}>Contact Information</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input
                                placeholder="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                style={inputStyle}
                            />
                            {errors.email && <div style={errorStyle}>{errors.email}</div>}
                            
                            <input
                                placeholder="Phone Number"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                style={inputStyle}
                            />
                            
                            <input
                                placeholder="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 style={{ margin: '0 0 8px 0', color: '#a3a3a3' }}>Academic Information</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <select
                                name="program"
                                value={formData.program}
                                onChange={handleInputChange}
                                style={inputStyle}
                            >
                                <option value="">Select Program/Course</option>
                                {programs.map((program, index) => (
                                    <option key={index} value={program}>{program}</option>
                                ))}
                            </select>
                            
                            <input
                                placeholder="Year Level"
                                name="year_level"
                                value={formData.year_level}
                                onChange={handleInputChange}
                                style={inputStyle}
                            />
                            
                            <input
                                placeholder="Section"
                                name="section"
                                value={formData.section}
                                onChange={handleInputChange}
                                style={inputStyle}
                            />
                            
                            <input
                                placeholder="Status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                style={inputStyle}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            padding: '14px',
                            borderRadius: '10px',
                            border: '0',
                            background: isLoading ? '#94a3b8' : '#16a34a',
                            color: 'white',
                            fontWeight: '600',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            flex: 1
                        }}
                    >
                        {isLoading ? 'Adding Student...' : 'Add Student'}
                    </button>
                </div>
            </form>
        </div>
    );
}

