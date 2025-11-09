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
        return Array.isArray(data) ? data.filter(f => f.status !== 'archived') : [];
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
            const deptNames = Array.isArray(data) ? data.map(dept => dept.name || dept) : [];
            return deptNames.length > 0 ? deptNames : fallbackDepartments;
        }
        return fallbackDepartments;
    } catch (error) {
        console.error('Error fetching departments:', error);
        return fallbackDepartments;
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

