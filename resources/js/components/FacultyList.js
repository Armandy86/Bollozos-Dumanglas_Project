import React, { useState, useEffect } from 'react';
import Faculty from './Faculty';

export default function FacultyList({ onDataUpdate }) {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRow, setSelectedRow] = useState(null);
    const [showAddFaculty, setShowAddFaculty] = useState(false);
    const [showEditFaculty, setShowEditFaculty] = useState(false);
    const [facultyToEdit, setFacultyToEdit] = useState(null);
    const [showFacultyDetails, setShowFacultyDetails] = useState(false);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [showDeleteFaculty, setShowDeleteFaculty] = useState(false);
    const [facultyToDelete, setFacultyToDelete] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [pendingChanges, setPendingChanges] = useState({});
    const [showReportLogs, setShowReportLogs] = useState(false);
    const [departments, setDepartments] = useState([]);

    const fetchFaculty = async () => {
        try {
            const response = await fetch('/api/faculty');
            const data = await response.json();
            // Filter out archived faculty members (using soft deletes)
            const activeFaculty = Array.isArray(data) ? data.filter(faculty => !faculty.deleted_at) : [];
            setFaculty(activeFaculty);
        } catch (error) {
            setFaculty([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaculty();
    }, []);

    // Load departments from API
    useEffect(() => {
        const loadDepartments = async () => {
            try {
                const response = await fetch('/api/departments');
                if (response.ok) {
                    const data = await response.json();
                    const deptNames = Array.isArray(data) ? data.map(dept => dept.name || dept) : [];
                    if (deptNames.length > 0) {
                        setDepartments(deptNames);
                    } else {
                        // Fallback to hardcoded list if API returns empty
                        setDepartments([
                            'Nursing Program',
                            'Teachers Education Program', 
                            'Engineering Program',
                            'Criminal Justice Program',
                            'Computer Science Program',
                            'Arts and Sciences Program',
                            'Business Administration Program',
                            'Accountancy Program'
                        ]);
                    }
                } else {
                    // Fallback to hardcoded list if API fails
                    setDepartments([
                        'Nursing Program',
                        'Teachers Education Program', 
                        'Engineering Program',
                        'Criminal Justice Program',
                        'Computer Science Program',
                        'Arts and Sciences Program',
                        'Business Administration Program',
                        'Accountancy Program'
                    ]);
                }
            } catch (error) {
                console.error('Error loading departments:', error);
                // Fallback to hardcoded list if API fails
                setDepartments([
                    'Nursing Program',
                    'Teachers Education Program', 
                    'Engineering Program',
                    'Criminal Justice Program',
                    'Computer Science Program',
                    'Arts and Sciences Program',
                    'Business Administration Program',
                    'Accountancy Program'
                ]);
            }
        };
        loadDepartments();
    }, []);

    const filteredFaculty = faculty.filter(member => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (member.first_name + ' ' + member.last_name).toLowerCase().includes(searchLower) ||
            (member.email || '').toLowerCase().includes(searchLower) ||
            (member.faculty_id || '').toLowerCase().includes(searchLower) ||
            (member.department || '').toLowerCase().includes(searchLower)
        );
    });

    const openAddFaculty = () => {
        setShowAddFaculty(true);
    };
    const closeAddFaculty = () => {
        setShowAddFaculty(false);
    };

    const openDeleteFaculty = (faculty) => {
        setFacultyToDelete(faculty);
        setShowDeleteFaculty(true);
    };
    const closeDeleteFaculty = () => {
        setShowDeleteFaculty(false);
        setFacultyToDelete(null);
    };

    const deleteFaculty = async () => {
        if (!facultyToDelete) return;
        
        try {
            // Soft delete the faculty (archive)
            const response = await fetch(`/api/faculty/${facultyToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });

            if (response.ok) {
                closeDeleteFaculty();
                refreshFaculty();
                if (onDataUpdate) {
                    onDataUpdate();
                }
                alert('Faculty archived successfully!');
            } else {
                alert('Failed to archive faculty. Please try again.');
            }
        } catch (error) {
            console.error('Error archiving faculty:', error);
            alert('Error archiving faculty. Please try again.');
        }
    };

    const openEditFaculty = (member) => {
        setFacultyToEdit(member);
        setShowEditFaculty(true);
    };

    const closeEditFaculty = () => {
        setShowEditFaculty(false);
        setFacultyToEdit(null);
    };

    const refreshFaculty = () => {
        fetchFaculty();
    };

    const openFacultyDetails = (member) => {
        setSelectedFaculty(member);
        setShowFacultyDetails(true);
    };

    const closeFacultyDetails = () => {
        setShowFacultyDetails(false);
        setSelectedFaculty(null);
        setEditingField(null);
        setEditValue('');
    };

    const startEditing = (field, value) => {
        setEditingField(field);
        setEditValue(value || '');
    };

    const saveEdit = async () => {
        const currentFaculty = selectedFaculty || facultyToEdit;
        if (!currentFaculty || !editingField) return;
        
        // Store the change in pending changes
        const newPendingChanges = { ...pendingChanges, [editingField]: editValue };
        setPendingChanges(newPendingChanges);
        setHasUnsavedChanges(true);
        
        setEditingField(null);
        setEditValue('');
    };

    const saveAllChanges = async () => {
        const currentFaculty = selectedFaculty || facultyToEdit;
        if (!currentFaculty || Object.keys(pendingChanges).length === 0) return;
        
        try {
            const updatedFaculty = { ...currentFaculty, ...pendingChanges };
            const response = await fetch(`/api/faculty/${currentFaculty.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(updatedFaculty)
            });

            if (response.ok) {
                if (selectedFaculty) {
                    setSelectedFaculty(updatedFaculty);
                }
                if (facultyToEdit) {
                    setFacultyToEdit(updatedFaculty);
                }
                setPendingChanges({});
                setHasUnsavedChanges(false);
                refreshFaculty();
                // Notify parent component (Dashboard) to refresh its data
                if (onDataUpdate) {
                    onDataUpdate();
                }
                // Show success message
                alert('Faculty details updated successfully!');
            }
        } catch (error) {
            console.error('Error updating faculty:', error);
        }
    };

    const discardChanges = () => {
        setPendingChanges({});
        setHasUnsavedChanges(false);
        setEditingField(null);
        setEditValue('');
    };

    const cancelEdit = () => {
        setEditingField(null);
        setEditValue('');
    };

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
                        <option>Position</option>
                        <option>Status</option>
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
                        placeholder="Search for a faculty member by name or email"
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

            {/* Add Faculty Button */}
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
                    Faculty ({filteredFaculty.length})
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={() => setShowReportLogs(true)}
                        style={{
                            background: '#3b82f6',
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
                        onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Report Logs
                    </button>
                    <button 
                        onClick={openAddFaculty}
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
                        onMouseEnter={(e) => e.currentTarget.style.background = '#15803d'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#16a34a'}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Add Faculty
                    </button>
                </div>
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
                            <th style={tableHeaderStyle}>Faculty ID</th>
                            <th style={tableHeaderStyle}>Email address</th>
                            <th style={tableHeaderStyle}>Department</th>
                            <th style={tableHeaderStyle}>Position</th>
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
                                    Loading faculty members...
                                </td>
                            </tr>
                        ) : filteredFaculty.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ 
                                    padding: 40, 
                                    textAlign: 'center',
                                    color: '#6b7280'
                                }}>
                                    {searchTerm ? 'No faculty members found matching your search.' : 'No faculty members found.'}
                                </td>
                            </tr>
                        ) : (
                            filteredFaculty.map((member, index) => (
                                <tr 
                                    key={member.id}
                                    onClick={() => openFacultyDetails(member)}
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
                                        {member.first_name} {member.last_name}
                                    </td>
                                    <td style={tableCellStyle}>
                                        {member.faculty_id || '—'}
                                    </td>
                                    <td style={tableCellStyle}>
                                        {member.email || '—'}
                                    </td>
                                    <td style={tableCellStyle}>
                                        {member.department || '—'}
                                    </td>
                                    <td style={tableCellStyle}>
                                        {member.position || '—'}
                                    </td>
                                    <td style={tableCellStyle}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditFaculty(member);
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
                                                    openDeleteFaculty(member);
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

            {/* Edit Faculty Modal */}
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
                                                {editingField === 'faculty_id' ? (
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
                                                            backgroundColor: pendingChanges.faculty_id ? '#fef3c7' : 'transparent',
                                                            border: pendingChanges.faculty_id ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startEditing('faculty_id', facultyToEdit.faculty_id)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.faculty_id ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.faculty_id || facultyToEdit.faculty_id || '—'}
                                                        {pendingChanges.faculty_id && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
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
                                                        onDoubleClick={() => startEditing('first_name', facultyToEdit.first_name)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.first_name ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.first_name || facultyToEdit.first_name || '—'}
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
                                                        onDoubleClick={() => startEditing('last_name', facultyToEdit.last_name)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.last_name ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.last_name || facultyToEdit.last_name || '—'}
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
                                                        onDoubleClick={() => startEditing('date_of_birth', facultyToEdit.date_of_birth)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.date_of_birth ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.date_of_birth || facultyToEdit.date_of_birth || '—'}
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
                                                        onDoubleClick={() => startEditing('gender', facultyToEdit.gender)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.gender ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.gender || facultyToEdit.gender || '—'}
                                                        {pendingChanges.gender && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
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
                                                        onDoubleClick={() => startEditing('email', facultyToEdit.email)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.email ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.email || facultyToEdit.email || '—'}
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
                                                        onDoubleClick={() => startEditing('phone', facultyToEdit.phone)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.phone ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.phone || facultyToEdit.phone || '—'}
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
                                                        onDoubleClick={() => startEditing('address', facultyToEdit.address)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.address ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.address || facultyToEdit.address || '—'}
                                                        {pendingChanges.address && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
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
                                                {editingField === 'department' ? (
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
                                                            <option value="">Select Department</option>
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
                                                            backgroundColor: pendingChanges.department ? '#fef3c7' : 'transparent',
                                                            border: pendingChanges.department ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startEditing('department', facultyToEdit.department)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.department ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.department || facultyToEdit.department || '—'}
                                                        {pendingChanges.department && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Position:</label>
                                                {editingField === 'position' ? (
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
                                                            backgroundColor: pendingChanges.position ? '#fef3c7' : 'transparent',
                                                            border: pendingChanges.position ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startEditing('position', facultyToEdit.position)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.position ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.position || facultyToEdit.position || '—'}
                                                        {pendingChanges.position && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
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
                                                            <option value="Full Time">Full Time</option>
                                                            <option value="Part Time">Part Time</option>
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
                                                        onDoubleClick={() => startEditing('status', facultyToEdit.status)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.status ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.status || facultyToEdit.status || '—'}
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
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Faculty ID:</label>
                                                {editingField === 'faculty_id' ? (
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
                                                            backgroundColor: pendingChanges.faculty_id ? '#fef3c7' : 'transparent',
                                                            border: pendingChanges.faculty_id ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startEditing('faculty_id', selectedFaculty.faculty_id)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.faculty_id ? '#fef3c7' : 'transparent'}
                                                    >
                                                        {pendingChanges.faculty_id || selectedFaculty.faculty_id || '—'}
                                                        {pendingChanges.faculty_id && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
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
                                                        onDoubleClick={() => startEditing('first_name', selectedFaculty.first_name)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.first_name ? '#fef3c7' : 'transparent'}
                                                    >
                                                        {pendingChanges.first_name || selectedFaculty.first_name || '—'}
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
                                                        onDoubleClick={() => startEditing('last_name', selectedFaculty.last_name)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.last_name ? '#fef3c7' : 'transparent'}
                                                    >
                                                        {pendingChanges.last_name || selectedFaculty.last_name || '—'}
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
                                                        onDoubleClick={() => startEditing('date_of_birth', selectedFaculty.date_of_birth)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.date_of_birth ? '#fef3c7' : 'transparent'}
                                                    >
                                                        {pendingChanges.date_of_birth || selectedFaculty.date_of_birth || '—'}
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
                                                        onDoubleClick={() => startEditing('gender', selectedFaculty.gender)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.gender ? '#fef3c7' : 'transparent'}
                                                    >
                                                        {pendingChanges.gender || selectedFaculty.gender || '—'}
                                                        {pendingChanges.gender && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
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
                                                        onDoubleClick={() => startEditing('email', selectedFaculty.email)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.email ? '#fef3c7' : 'transparent'}
                                                    >
                                                        {pendingChanges.email || selectedFaculty.email || '—'}
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
                                                        onDoubleClick={() => startEditing('phone', selectedFaculty.phone)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.phone ? '#fef3c7' : 'transparent'}
                                                    >
                                                        {pendingChanges.phone || selectedFaculty.phone || '—'}
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
                                                        onDoubleClick={() => startEditing('address', selectedFaculty.address)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.address ? '#fef3c7' : 'transparent'}
                                                    >
                                                        {pendingChanges.address || selectedFaculty.address || '—'}
                                                        {pendingChanges.address && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
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
                                                {editingField === 'department' ? (
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
                                                            <option value="">Select Department</option>
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
                                                            backgroundColor: pendingChanges.department ? '#fef3c7' : 'transparent',
                                                            border: pendingChanges.department ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startEditing('department', selectedFaculty.department)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.department ? '#fef3c7' : 'transparent'}
                                                    >
                                                        {pendingChanges.department || selectedFaculty.department || '—'}
                                                        {pendingChanges.department && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Position:</label>
                                                {editingField === 'position' ? (
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
                                                            backgroundColor: pendingChanges.position ? '#fef3c7' : 'transparent',
                                                            border: pendingChanges.position ? '1px solid #f59e0b' : '1px solid transparent'
                                                        }}
                                                        onDoubleClick={() => startEditing('position', selectedFaculty.position)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.position ? '#fef3c7' : 'transparent'}
                                                    >
                                                        {pendingChanges.position || selectedFaculty.position || '—'}
                                                        {pendingChanges.position && <span style={{ color: '#f59e0b', marginLeft: '8px', fontSize: '12px' }}>●</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ fontWeight: '600', color: '#6b7280', fontSize: '14px' }}>Attainment:</label>
                                                <div style={{ color: '#374151', marginTop: '4px' }}>{selectedFaculty.attainment || '—'}</div>
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
                                                            <option value="Full Time">Full Time</option>
                                                            <option value="Part Time">Part Time</option>
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
                                                        onDoubleClick={() => startEditing('status', selectedFaculty.status)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = pendingChanges.status ? '#fef3c7' : 'transparent'
                                                        }
                                                    >
                                                        {pendingChanges.status || selectedFaculty.status || '—'}
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

            {/* Add Faculty Modal */}
            {showAddFaculty && (
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
                            <div style={{ fontWeight: 700, fontSize: 18 }}>Add Faculty</div>
                            <button onClick={closeAddFaculty} style={{
                                background: 'transparent',
                                border: '1px solid #e5e7eb',
                                borderRadius: 8,
                                padding: '6px 10px',
                                cursor: 'pointer'
                            }}>✕</button>
                        </div>
                        <div style={{ maxHeight: '75vh', overflow: 'auto' }}>
                            <AddFacultyForm 
                                onSuccess={() => { 
                                    closeAddFaculty(); 
                                    refreshFaculty();
                                    if (onDataUpdate) {
                                        onDataUpdate();
                                    }
                                }} 
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Faculty Confirmation Modal */}
            {showDeleteFaculty && facultyToDelete && (
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
                                Delete Faculty
                            </h3>
                            <p style={{ color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
                                Are you sure you want to delete <strong>{facultyToDelete.first_name} {facultyToDelete.last_name}</strong>? 
                                This action cannot be undone.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={closeDeleteFaculty}
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
                                onClick={deleteFaculty}
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

            {/* Report Logs Modal */}
            {showReportLogs && (
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
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: 12,
                        padding: 32,
                        maxWidth: 900,
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                                Faculty Report Logs
                            </h2>
                            <button
                                onClick={() => setShowReportLogs(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#6b7280'
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <p style={{ color: '#6b7280', margin: 0, lineHeight: '1.6' }}>
                                View and export faculty activity logs including additions, modifications, and deletions.
                            </p>
                        </div>

                        {/* Stats Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                            <div style={{
                                background: '#f0fdf4',
                                border: '1px solid #86efac',
                                borderRadius: 8,
                                padding: 16,
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#16a34a', marginBottom: 4 }}>
                                    {faculty.length}
                                </div>
                                <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                                    Total Faculty
                                </div>
                            </div>
                            <div style={{
                                background: '#dbeafe',
                                border: '1px solid #93c5fd',
                                borderRadius: 8,
                                padding: 16,
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#2563eb', marginBottom: 4 }}>
                                    {faculty.filter(f => {
                                        if (!f.status) return false;
                                        const status = f.status.toString().toLowerCase();
                                        return status === 'full time';
                                    }).length}
                                </div>
                                <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                                    Full Time
                                </div>
                            </div>
                            <div style={{
                                background: '#fef3c7',
                                border: '1px solid #fcd34d',
                                borderRadius: 8,
                                padding: 16,
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#d97706', marginBottom: 4 }}>
                                    {faculty.filter(f => {
                                        if (!f.status) return false;
                                        const status = f.status.toString().toLowerCase();
                                        return status === 'part time';
                                    }).length}
                                </div>
                                <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                                    Part Time
                                </div>
                            </div>
                        </div>

                        {/* Department Distribution */}
                        <div style={{
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: 8,
                            padding: 20,
                            marginBottom: 24
                        }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 16px 0' }}>
                                Department Distribution
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {[...new Set(faculty.map(f => f.department))].filter(d => d).map((department, index) => {
                                    const count = faculty.filter(f => f.department === department).length;
                                    const percentage = ((count / faculty.length) * 100).toFixed(1);
                                    return (
                                        <div key={index}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>{department}</span>
                                                <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>{count} ({percentage}%)</span>
                                            </div>
                                            <div style={{ width: '100%', height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                                                <div style={{ width: `${percentage}%`, height: '100%', background: '#8b5cf6', borderRadius: 4 }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Export Button */}
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    const csvContent = [
                                        ['Faculty ID', 'Name', 'Email', 'Department', 'Position', 'Attainment', 'Phone'],
                                        ...faculty.map(f => [
                                            f.faculty_id,
                                            `${f.first_name} ${f.last_name}`,
                                            f.email || '',
                                            f.department || '',
                                            f.position || '',
                                            f.attainment || '',
                                            f.phone || ''
                                        ])
                                    ].map(row => row.join(',')).join('\n');
                                    
                                    const blob = new Blob([csvContent], { type: 'text/csv' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `faculty_report_${new Date().toISOString().split('T')[0]}.csv`;
                                    a.click();
                                }}
                                style={{
                                    background: '#10b981',
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
                                onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Export to CSV
                            </button>
                            <button
                                onClick={() => setShowReportLogs(false)}
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
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Add Faculty Form Component
function AddFacultyForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        faculty_id: '',
        first_name: '',
        last_name: '',
        middle_name: '',
        date_of_birth: '',
        gender: '',
        personal_information: '',
        department: '',
        position: '',
        attainment: '',
        status: '',
        email: '',
        phone: '',
        address: ''
    });
    const [errors, setErrors] = useState({});
    const [statusMessage, setStatusMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [departments, setDepartments] = useState([]);

    // Load departments from API
    useEffect(() => {
        const loadDepartments = async () => {
            try {
                const response = await fetch('/api/departments');
                if (response.ok) {
                    const data = await response.json();
                    const deptNames = Array.isArray(data) ? data.map(dept => dept.name || dept) : [];
                    if (deptNames.length > 0) {
                        setDepartments(deptNames);
                    } else {
                        // Fallback to hardcoded list if API returns empty
                        setDepartments([
                            'Nursing Program',
                            'Teachers Education Program', 
                            'Engineering Program',
                            'Criminal Justice Program',
                            'Computer Science Program',
                            'Arts and Sciences Program',
                            'Business Administration Program',
                            'Accountancy Program'
                        ]);
                    }
                } else {
                    // Fallback to hardcoded list if API fails
                    setDepartments([
                        'Nursing Program',
                        'Teachers Education Program', 
                        'Engineering Program',
                        'Criminal Justice Program',
                        'Computer Science Program',
                        'Arts and Sciences Program',
                        'Business Administration Program',
                        'Accountancy Program'
                    ]);
                }
            } catch (error) {
                console.error('Error loading departments:', error);
                // Fallback to hardcoded list if API fails
                setDepartments([
                    'Nursing Program',
                    'Teachers Education Program', 
                    'Engineering Program',
                    'Criminal Justice Program',
                    'Computer Science Program',
                    'Arts and Sciences Program',
                    'Business Administration Program',
                    'Accountancy Program'
                ]);
            }
        };
        loadDepartments();
    }, []);

    // Use departments for programs
    const programs = departments;

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

        console.log('Faculty form submitted with data:', formData);

        try {
            const response = await fetch('/api/faculty', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log('Faculty response status:', response.status);
            console.log('Faculty response data:', data);

            if (response.ok) {
                setStatusMessage('Faculty added successfully!');
                setFormData({
                    faculty_id: '',
                    first_name: '',
                    last_name: '',
                    middle_name: '',
                    date_of_birth: '',
                    gender: '',
                    personal_information: '',
                    department: '',
                    position: '',
                    attainment: '',
                    status: '',
                    email: '',
                    phone: '',
                    address: ''
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
                    setStatusMessage('Error: ' + (data.message || 'Failed to add faculty'));
                }
            }
        } catch (error) {
            console.error('Error submitting faculty form:', error);
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
                Add Faculty
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
                                placeholder="Faculty ID"
                                name="faculty_id"
                                value={formData.faculty_id}
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
                        <h3 style={{ margin: '0 0 8px 0', color: '#a3a3a3' }}>Professional Information</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleInputChange}
                                style={inputStyle}
                            >
                                <option value="">Select Department/Program</option>
                                {programs.map((program, index) => (
                                    <option key={index} value={program}>{program}</option>
                                ))}
                            </select>
                            
                            <select
                                name="position"
                                value={formData.position}
                                onChange={handleInputChange}
                                style={inputStyle}
                            >
                                <option value="">Select Position</option>
                                <option value="Full Time Instructor">Full Time Instructor</option>
                                <option value="Part Time Instructor">Part Time Instructor</option>
                            </select>
                            
                            <input
                                placeholder="Educational Attainment"
                                name="attainment"
                                value={formData.attainment}
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
                        {isLoading ? 'Adding Faculty...' : 'Add Faculty'}
                    </button>
                </div>
            </form>
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


