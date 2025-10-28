import React, { useState, useEffect } from 'react';

export default function Home({ onSuccess, showForm = true, showList = true, editStudent = null }) {
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
    const [students, setStudents] = useState([]);
    const [statusMessage, setStatusMessage] = useState('');
    const [editingStudent, setEditingStudent] = useState(null);
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

    // Load students when list is intended to be shown
    useEffect(() => {
        if (showList) {
            loadStudents();
        }
    }, [showList]);

    // Handle editStudent prop - populate form when editing
    useEffect(() => {
        if (editStudent) {
            setFormData({
                student_id: editStudent.student_id || '',
                first_name: editStudent.first_name || '',
                last_name: editStudent.last_name || '',
                middle_name: editStudent.middle_name || '',
                date_of_birth: editStudent.date_of_birth || '',
                gender: editStudent.gender || '',
                personal_information: editStudent.personal_information || '',
                email: editStudent.email || '',
                phone: editStudent.phone || '',
                address: editStudent.address || '',
                program: editStudent.program || '',
                year_level: editStudent.year_level || '',
                section: editStudent.section || '',
                status: editStudent.status || ''
            });
            setEditingStudent(editStudent);
            setIsEditing(true);
            setErrors({});
            setStatusMessage('');
        }
    }, [editStudent]);

    const loadStudents = async () => {
        try {
            const response = await fetch('/api/students');
            if (response.ok) {
                const data = await response.json();
            console.log('Response status:', response.status);
            console.log('Response data:', data);
                setStudents(data);
            }
        } catch (error) {
            console.error('Error loading students:', error);
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
                if (showList) {
                    loadStudents(); // Reload the students list
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
                    setStatusMessage('Error: ' + (data.message || 'Failed to add student'));
                }
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setStatusMessage('Error: Failed to submit form');
        }
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setFormData({
            student_id: student.student_id || '',
            first_name: student.first_name || '',
            last_name: student.last_name || '',
            middle_name: student.middle_name || '',
            date_of_birth: student.date_of_birth || '',
            gender: student.gender || '',
            personal_information: student.personal_information || '',
            email: student.email || '',
            phone: student.phone || '',
            address: student.address || '',
            program: student.program || '',
            year_level: student.year_level || '',
            section: student.section || '',
            status: student.status || ''
        });
        setIsEditing(true);
        setStatusMessage('');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setErrors({});
        setStatusMessage('');

        try {
            const response = await fetch(`/api/students/${editingStudent.id}`, {
                method: 'PUT',
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
                setStatusMessage('Student updated successfully!');
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
                setEditingStudent(null);
                setIsEditing(false);
                loadStudents();
                
                setTimeout(() => {
                    setStatusMessage('');
                }, 5000);
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setStatusMessage('Error: ' + (data.message || 'Failed to update student'));
                }
            }
        } catch (error) {
            console.error('Error updating student:', error);
            setStatusMessage('Error: Failed to update student');
        }
    };

    const handleDelete = async (studentId) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                const response = await fetch(`/api/students/${studentId}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    }
                });

                if (response.ok) {
                    setStatusMessage('Student deleted successfully!');
                    loadStudents();
                    
                    setTimeout(() => {
                        setStatusMessage('');
                    }, 3000);
                } else {
                    const data = await response.json();
            console.log('Response status:', response.status);
            console.log('Response data:', data);
                    setStatusMessage('Error: ' + (data.message || 'Failed to delete student'));
                }
            } catch (error) {
                console.error('Error deleting student:', error);
                setStatusMessage('Error: Failed to delete student');
            }
        }
    };

    const handleCancelEdit = () => {
        setEditingStudent(null);
        setIsEditing(false);
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
        border: '1px solidrgb(0, 0, 0)',
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
                {isEditing ? 'Edit Student' : 'Add a Student'}
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
                            />
                            {errors.first_name && <div style={errorStyle}>{errors.first_name}</div>}
                            
                            <input
                                placeholder="Last Name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleInputChange}
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
                                    {isEditing ? 'Update Student' : 'Add Student'}
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

            {showList && students && students.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#a3a3a3' }}>Submitted Students</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {students.map((student, index) => (
                            <div key={index} style={{ background: '#2b2b2b', padding: '12px', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div><strong>{student.first_name} {student.last_name}</strong></div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleEdit(student)}
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
                                            onClick={() => handleDelete(student.id)}
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
                                    ID: {student.student_id || '—'} | Program: {student.program || '—'} | Year: {student.year_level || '—'}
                                </div>
                                <div style={{ fontSize: '14px', color: '#cfcfcf' }}>
                                    Section: {student.section || '—'} | Status: {student.status || '—'}
                                </div>
                                <div style={{ fontSize: '14px', color: '#cfcfcf' }}>
                                    Email: {student.email || '—'} | Phone: {student.phone || '—'}
                                </div>
                                <div style={{ fontSize: '14px', color: '#cfcfcf' }}>
                                    Address: {student.address || '—'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

