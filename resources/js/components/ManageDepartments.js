import React, { useState, useEffect } from 'react';

export default function ManageDepartments({ show, onClose }) {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (show) {
            fetchDepartments();
        }
    }, [show]);

    const fetchDepartments = async () => {
        try {
            const response = await fetch('/api/departments');
            const data = await response.json();
            setDepartments(data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const url = editingDepartment ? `/api/departments/${editingDepartment.id}` : '/api/departments';
            const method = editingDepartment ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setMessage({ type: 'success', text: data.message });
                fetchDepartments();
                resetForm();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Operation failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        }
    };

    const handleEdit = (department) => {
        setEditingDepartment(department);
        setFormData({
            name: department.name,
            description: department.description || ''
        });
        setShowForm(true);
    };

    const handleArchive = async (id) => {
        if (!confirm('Are you sure you want to archive/unarchive this department?')) return;

        try {
            const response = await fetch(`/api/departments/${id}/archive`, {
                method: 'PATCH'
            });
            const data = await response.json();

            if (response.ok && data.success) {
                setMessage({ type: 'success', text: data.message });
                fetchDepartments();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Operation failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '' });
        setEditingDepartment(null);
        setShowForm(false);
    };

    if (!show) return null;

    return (
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
            overflowY: 'auto',
            padding: '20px'
        }}>
            <div style={{
                background: 'var(--card-bg)',
                borderRadius: 16,
                padding: 32,
                maxWidth: 800,
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-primary)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        Manage Departments
                    </h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 24 }}>
                        ×
                    </button>
                </div>

                {message.text && (
                    <div style={{
                        background: message.type === 'success' ? '#D1FAE5' : '#FEE2E2',
                        border: `1px solid ${message.type === 'success' ? '#10B981' : '#EF4444'}`,
                        color: message.type === 'success' ? '#065F46' : '#991B1B',
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 20
                    }}>
                        {message.text}
                    </div>
                )}

                {!showForm ? (
                    <>
                        <button
                            onClick={() => setShowForm(true)}
                            style={{
                                padding: '10px 20px',
                                background: '#6366F1',
                                color: 'white',
                                border: 'none',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 600,
                                marginBottom: 20
                            }}
                        >
                            + Add New Department
                        </button>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-primary)' }}>
                                        <th style={{ padding: 12, textAlign: 'left', color: 'var(--text-primary)', fontWeight: 600 }}>Name</th>
                                        <th style={{ padding: 12, textAlign: 'left', color: 'var(--text-primary)', fontWeight: 600 }}>Description</th>
                                        <th style={{ padding: 12, textAlign: 'left', color: 'var(--text-primary)', fontWeight: 600 }}>Status</th>
                                        <th style={{ padding: 12, textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {departments.map(dept => (
                                        <tr key={dept.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                            <td style={{ padding: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{dept.name}</td>
                                            <td style={{ padding: 12, color: 'var(--text-secondary)', fontSize: 13, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {dept.description || '—'}
                                            </td>
                                            <td style={{ padding: 12 }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: 4,
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    background: dept.is_archived ? '#FEE2E2' : '#D1FAE5',
                                                    color: dept.is_archived ? '#991B1B' : '#065F46'
                                                }}>
                                                    {dept.is_archived ? 'Archived' : 'Active'}
                                                </span>
                                            </td>
                                            <td style={{ padding: 12, textAlign: 'right' }}>
                                                <button onClick={() => handleEdit(dept)} style={{ padding: '6px 12px', marginRight: 8, background: '#6366F1', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Edit</button>
                                                <button onClick={() => handleArchive(dept.id)} style={{ padding: '6px 12px', background: dept.is_archived ? '#10B981' : '#F59E0B', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                                                    {dept.is_archived ? 'Unarchive' : 'Archive'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>Department Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-primary)', borderRadius: 8, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="3"
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-primary)', borderRadius: 8, background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <button type="button" onClick={resetForm} style={{ padding: '10px 20px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                                Cancel
                            </button>
                            <button type="submit" style={{ padding: '10px 20px', background: '#6366F1', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                                {editingDepartment ? 'Update Department' : 'Create Department'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

