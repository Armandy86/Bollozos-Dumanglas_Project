import React, { useState } from 'react';

export default function ListItem({ title, subtitle, meta, student, onViewDetails, onEdit }) {
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
                window.location.reload();
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
                        {title}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 2 }}>
                        {subtitle}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: 12 }}>
                        {meta}
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

