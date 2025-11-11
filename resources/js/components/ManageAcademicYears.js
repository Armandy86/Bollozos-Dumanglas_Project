import React, { useState, useEffect } from 'react';

export default function ManageAcademicYears({ show, onClose }) {
    const [academicYears, setAcademicYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingAcademicYear, setEditingAcademicYear] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        year_start: '',
        year_end: '',
        description: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (show) {
            fetchAcademicYears();
        }
    }, [show]);

    const fetchAcademicYears = async () => {
        try {
            const response = await fetch('/api/academic-years');
            const data = await response.json();
            setAcademicYears(data);
        } catch (error) {
            console.error('Error fetching academic years:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const url = editingAcademicYear ? `/api/academic-years/${editingAcademicYear.id}` : '/api/academic-years';
            const method = editingAcademicYear ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setMessage({ type: 'success', text: data.message });
                fetchAcademicYears();
                resetForm();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Operation failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        }
    };

    const handleEdit = (academicYear) => {
        setEditingAcademicYear(academicYear);
        setFormData({
            year_start: academicYear.year_start,
            year_end: academicYear.year_end,
            description: academicYear.description || ''
        });
        setShowForm(true);
    };

    const handleArchive = async (id) => {
        if (!confirm('Are you sure you want to archive/unarchive this academic year?')) return;

        try {
            const response = await fetch(`/api/academic-years/${id}/archive`, {
                method: 'PATCH'
            });
            const data = await response.json();

            if (response.ok && data.success) {
                setMessage({ type: 'success', text: data.message });
                fetchAcademicYears();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Operation failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        }
    };

    const resetForm = () => {
        setFormData({ year_start: '', year_end: '', description: '' });
        setEditingAcademicYear(null);
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
                        Manage Academic Years
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
                            + Add New Academic Year
                        </button>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-primary)' }}>
                                        <th style={{ padding: 12, textAlign: 'left', color: 'var(--text-primary)', fontWeight: 600 }}>Year Start</th>
                                        <th style={{ padding: 12, textAlign: 'left', color: 'var(--text-primary)', fontWeight: 600 }}>Year End</th>
                                        <th style={{ padding: 12, textAlign: 'left', color: 'var(--text-primary)', fontWeight: 600 }}>Description</th>
                                        <th style={{ padding: 12, textAlign: 'left', color: 'var(--text-primary)', fontWeight: 600 }}>Status</th>
                                        <th style={{ padding: 12, textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {academicYears.map(ay => (
                                        <tr key={ay.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                            <td style={{ padding: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{ay.year_start}</td>
                                            <td style={{ padding: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{ay.year_end}</td>
                                            <td style={{ padding: 12, color: 'var(--text-secondary)', fontSize: 13, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {ay.description || '—'}
                                            </td>
                                            <td style={{ padding: 12 }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: 4,
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    background: ay.is_archived ? '#FEE2E2' : '#D1FAE5',
                                                    color: ay.is_archived ? '#991B1B' : '#065F46'
                                                }}>
                                                    {ay.is_archived ? 'Archived' : 'Active'}
                                                </span>
                                            </td>
                                            <td style={{ padding: 12, textAlign: 'right' }}>
                                                <button onClick={() => handleEdit(ay)} style={{ padding: '6px 12px', marginRight: 8, background: '#6366F1', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Edit</button>
                                                <button onClick={() => handleArchive(ay.id)} style={{ padding: '6px 12px', background: ay.is_archived ? '#10B981' : '#F59E0B', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                                                    {ay.is_archived ? 'Unarchive' : 'Archive'}
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
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>Year Start *</label>
                            <input
                                type="text"
                                placeholder="e.g., 2024"
                                value={formData.year_start}
                                onChange={(e) => setFormData({ ...formData, year_start: e.target.value })}
                                required
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-primary)', borderRadius: 8, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>Year End *</label>
                            <input
                                type="text"
                                placeholder="e.g., 2025"
                                value={formData.year_end}
                                onChange={(e) => setFormData({ ...formData, year_end: e.target.value })}
                                required
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-primary)', borderRadius: 8, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Optional description for this academic year"
                                rows="3"
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-primary)', borderRadius: 8, background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <button type="button" onClick={resetForm} style={{ padding: '10px 20px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                                Cancel
                            </button>
                            <button type="submit" style={{ padding: '10px 20px', background: '#6366F1', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                                {editingAcademicYear ? 'Update Academic Year' : 'Create Academic Year'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

