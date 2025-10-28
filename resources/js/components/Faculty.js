import React, { useState, useEffect } from 'react';

export default function Faculty({ onSuccess, showForm = true, showList = true, editFaculty = null }) {
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
    const [faculty, setFaculty] = useState([]);
    const [statusMessage, setStatusMessage] = useState('');
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

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

    // Load faculty when list is intended to be shown
    useEffect(() => {
        if (showList) {
            loadFaculty();
        }
    }, [showList]);

    // Handle editFaculty prop - populate form when editing
    useEffect(() => {
        if (editFaculty) {
            setFormData({
                faculty_id: editFaculty.faculty_id || '',
                first_name: editFaculty.first_name || '',
                last_name: editFaculty.last_name || '',
                middle_name: editFaculty.middle_name || '',
                date_of_birth: editFaculty.date_of_birth || '',
                gender: editFaculty.gender || '',
                personal_information: editFaculty.personal_information || '',
                department: editFaculty.department || '',
                position: editFaculty.position || '',
                attainment: editFaculty.attainment || '',
                status: editFaculty.status || '',
                email: editFaculty.email || '',
                phone: editFaculty.phone || '',
                address: editFaculty.address || ''
            });
            setEditingFaculty(editFaculty);
            setIsEditing(true);
            setErrors({});
            setStatusMessage('');
        }
    }, [editFaculty]);

    const loadFaculty = async () => {
        try {
            const response = await fetch('/api/faculty');
            if (response.ok) {
                const data = await response.json();
                setFaculty(data);
            }
        } catch (error) {
            console.error('Error loading faculty:', error);
        }
    };

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
                if (showList) {
                    loadFaculty(); // Reload the faculty list
                }
                if (typeof onSuccess === 'function') {
                    onSuccess();
                }
                
                // Clear success message after 5 seconds
                setTimeout(() => {
                    setStatusMessage('');
                }, 5000);
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setStatusMessage('Error: ' + (data.message || 'Failed to add faculty'));
                }
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setStatusMessage('Error: Failed to submit form');
        }
    };

    const handleEdit = (facultyMember) => {
        setEditingFaculty(facultyMember);
        setFormData({
            faculty_id: facultyMember.faculty_id || '',
            first_name: facultyMember.first_name || '',
            last_name: facultyMember.last_name || '',
            middle_name: facultyMember.middle_name || '',
            date_of_birth: facultyMember.date_of_birth || '',
            gender: facultyMember.gender || '',
            personal_information: facultyMember.personal_information || '',
            department: facultyMember.department || '',
            position: facultyMember.position || '',
            attainment: facultyMember.attainment || '',
            status: facultyMember.status || '',
            email: facultyMember.email || '',
            phone: facultyMember.phone || '',
            address: facultyMember.address || ''
        });
        setIsEditing(true);
        setStatusMessage('');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setErrors({});
        setStatusMessage('');

        try {
            const response = await fetch(`/api/faculty/${editingFaculty.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setStatusMessage('Faculty updated successfully!');
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
                setEditingFaculty(null);
                setIsEditing(false);
                loadFaculty();
                
                setTimeout(() => {
                    setStatusMessage('');
                }, 5000);
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setStatusMessage('Error: ' + (data.message || 'Failed to update faculty'));
                }
            }
        } catch (error) {
            console.error('Error updating faculty:', error);
            setStatusMessage('Error: Failed to update faculty');
        }
    };

    const handleDelete = async (facultyId) => {
        if (window.confirm('Are you sure you want to delete this faculty member?')) {
            try {
                const response = await fetch(`/api/faculty/${facultyId}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    }
                });

                if (response.ok) {
                    setStatusMessage('Faculty deleted successfully!');
                    loadFaculty();
                    
                    setTimeout(() => {
                        setStatusMessage('');
                    }, 3000);
                } else {
                    const data = await response.json();
                    setStatusMessage('Error: ' + (data.message || 'Failed to delete faculty'));
                }
            } catch (error) {
                console.error('Error deleting faculty:', error);
                setStatusMessage('Error: Failed to delete faculty');
            }
        }
    };

    const handleCancelEdit = () => {
        setEditingFaculty(null);
        setIsEditing(false);
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
        setErrors({});
        setStatusMessage('');
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
                {isEditing ? 'Edit Faculty' : 'Add a Faculty'}
            </h2>

            {statusMessage && (
                <p style={successStyle}>{statusMessage}</p>
            )}

            {(showForm || isEditing) && (
            <form onSubmit={isEditing ? handleUpdate : handleSubmit}>
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
                                required
                                style={inputStyle}
                            />
                            {errors.first_name && <div style={errorStyle}>{errors.first_name}</div>}
                            
                            <input
                                placeholder="Last Name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                required
                                style={inputStyle}
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
                                value={formData.email}
                                onChange={handleInputChange}
                                style={inputStyle}
                            />
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

                            <input
                                placeholder="Position"
                                name="position"
                                value={formData.position}
                                onChange={handleInputChange}
                                style={inputStyle}
                            />

                            <input
                                placeholder="Attainment"
                                name="attainment"
                                value={formData.attainment}
                                onChange={handleInputChange}
                                style={inputStyle}
                            />

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                style={inputStyle}
                            >
                                <option value="">Select Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="On Leave">On Leave</option>
                            </select>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '14px',
                                        borderRadius: '10px',
                                        border: '0',
                                        background: '#16a34a',
                                        color: 'white',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        flex: 1
                                    }}
                                >
                                    {isEditing ? 'Update Faculty' : 'Add Faculty'}
                                </button>
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        style={{
                                            padding: '14px',
                                            borderRadius: '10px',
                                            border: '1px solid #dc2626',
                                            background: 'white',
                                            color: '#dc2626',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            flex: 1
                                        }}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            )}

            {showList && faculty && faculty.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#a3a3a3' }}>Submitted Faculty</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {faculty.map((facultyMember, index) => (
                            <div key={index} style={{ background: '#2b2b2b', padding: '12px', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div><strong>{facultyMember.first_name} {facultyMember.last_name}</strong></div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleEdit(facultyMember)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid #3b82f6',
                                                background: '#3b82f6',
                                                color: 'white',
                                                fontSize: '12px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(facultyMember.id)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid #dc2626',
                                                background: '#dc2626',
                                                color: 'white',
                                                fontSize: '12px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <div style={{ fontSize: '14px', color: '#cfcfcf' }}>
                                    ID: {facultyMember.faculty_id || '—'} | Department: {facultyMember.department || '—'} | Position: {facultyMember.position || '—'}
                                </div>
                                <div style={{ fontSize: '14px', color: '#cfcfcf' }}>
                                    Attainment: {facultyMember.attainment || '—'} | Status: {facultyMember.status || '—'}
                                </div>
                                <div style={{ fontSize: '14px', color: '#cfcfcf' }}>
                                    Email: {facultyMember.email || '—'} | Phone: {facultyMember.phone || '—'}
                                </div>
                                <div style={{ fontSize: '14px', color: '#cfcfcf' }}>
                                    Address: {facultyMember.address || '—'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

