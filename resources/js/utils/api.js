export const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
};

export const fetchStudents = async () => {
    try {
        const response = await fetch('/api/students');
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching students:', error);
        return [];
    }
};

export const fetchFaculty = async () => {
    try {
        const response = await fetch('/api/faculty');
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching faculty:', error);
        return [];
    }
};

export const fetchDepartments = async () => {
    const fallbackDepartments = [
        'Nursing Program',
        'Teachers Education Program',
        'Engineering Program',
        'Criminal Justice Program',
        'Computer Science Program',
        'Arts and Sciences Program',
        'Business Administration Program',
        'Accountancy Program'
    ];

    try {
        const response = await fetch('/api/departments');
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                // Return full department objects with name and is_archived
                return data.map(dept => ({
                    name: dept.name || dept,
                    is_archived: dept.is_archived || false
                }));
            }
            // Return fallback as objects
            return fallbackDepartments.map(name => ({ name, is_archived: false }));
        }
        return fallbackDepartments.map(name => ({ name, is_archived: false }));
    } catch (error) {
        console.error('Error fetching departments:', error);
        return fallbackDepartments.map(name => ({ name, is_archived: false }));
    }
};

export const updateStudent = async (id, data) => {
    try {
        const response = await fetch(`/api/students/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken()
            },
            body: JSON.stringify(data)
        });
        return { success: response.ok, data: await response.json() };
    } catch (error) {
        console.error('Error updating student:', error);
        return { success: false, error };
    }
};

export const updateFaculty = async (id, data) => {
    try {
        const response = await fetch(`/api/faculty/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken()
            },
            body: JSON.stringify(data)
        });
        return { success: response.ok, data: await response.json() };
    } catch (error) {
        console.error('Error updating faculty:', error);
        return { success: false, error };
    }
};

export const deleteStudent = async (id) => {
    try {
        const response = await fetch(`/api/students/${id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': getCsrfToken()
            }
        });
        return { success: response.ok };
    } catch (error) {
        console.error('Error deleting student:', error);
        return { success: false, error };
    }
};

export const deleteFaculty = async (id) => {
    try {
        const response = await fetch(`/api/faculty/${id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': getCsrfToken()
            }
        });
        return { success: response.ok };
    } catch (error) {
        console.error('Error deleting faculty:', error);
        return { success: false, error };
    }
};

export const createStudent = async (data) => {
    try {
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken()
            },
            body: JSON.stringify(data)
        });
        return { success: response.ok, data: await response.json() };
    } catch (error) {
        console.error('Error creating student:', error);
        return { success: false, error };
    }
};

export const createFaculty = async (data) => {
    try {
        const response = await fetch('/api/faculty', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken()
            },
            body: JSON.stringify(data)
        });
        return { success: response.ok, data: await response.json() };
    } catch (error) {
        console.error('Error creating faculty:', error);
        return { success: false, error };
    }
};

export const fetchArchivedStudents = async () => {
    try {
        const response = await fetch('/api/students/archived/list');
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching archived students:', error);
        return [];
    }
};

export const fetchArchivedFaculty = async () => {
    try {
        const response = await fetch('/api/faculty/archived/list');
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching archived faculty:', error);
        return [];
    }
};

export const restoreStudent = async (id) => {
    try {
        const response = await fetch(`/api/students/${id}/restore`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': getCsrfToken()
            }
        });
        return { success: response.ok, data: await response.json() };
    } catch (error) {
        console.error('Error restoring student:', error);
        return { success: false, error };
    }
};

export const restoreFaculty = async (id) => {
    try {
        const response = await fetch(`/api/faculty/${id}/restore`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': getCsrfToken()
            }
        });
        return { success: response.ok, data: await response.json() };
    } catch (error) {
        console.error('Error restoring faculty:', error);
        return { success: false, error };
    }
};

export const fetchAcademicYears = async () => {
    try {
        const response = await fetch('/api/academic-years');
        const data = await response.json();
        return Array.isArray(data) ? data.filter(ay => !ay.is_archived) : [];
    } catch (error) {
        console.error('Error fetching academic years:', error);
        return [];
    }
};

