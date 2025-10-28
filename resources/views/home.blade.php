<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home</title>
</head>
<body>
    <div style="max-width:1200px;margin:24px auto;padding:24px;background:#ffffff;border-radius:12px;color:#e7e7e7;font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
        <h2 style="margin:0 0 16px 0;padding:16px 24px;background:#fff;color:#1a1a1a;border-radius:10px;display:inline-block;">Add a Student</h2>

        @if (session('status'))
        <p style="color:#6ee7b7;margin:8px 0 16px 0;">{{ session('status') }}</p>
        @endif

        <form method="POST" action="{{ route('students.store') }}">
            @csrf
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
                <div>
                    <h3 style="margin:0 0 8px 0;color:#a3a3a3;">Personal Information</h3>
                    <div style="display:flex;flex-direction:column;gap:12px;">
                        <input placeholder="Student ID" name="student_id" value="{{ old('student_id') }}" style="padding:12px;border-radius:8px;border:0;background:#e8ebef;">
                        <input placeholder="First Name" name="first_name" value="{{ old('first_name') }}" style="padding:12px;border-radius:8px;border:0;background:#e8ebef;">
                        @error('first_name')<div style="color:#fca5a5;">{{ $message }}</div>@enderror
                        <input placeholder="Last Name" name="last_name" value="{{ old('last_name') }}" style="padding:12px;border-radius:8px;border:0;background:#e8ebef;">
                        @error('last_name')<div style="color:#fca5a5;">{{ $message }}</div>@enderror
                        <input placeholder="Middle Name" name="middle_name" value="{{ old('middle_name') }}" style="padding:12px;border-radius:8px;border:0;background:#e8ebef;">
                        <input type="date" placeholder="Date of Birth" name="date_of_birth" value="{{ old('date_of_birth') }}" style="padding:12px;border-radius:8px;border:0;background:#e8ebef;">
                        <input placeholder="Gender" name="gender" value="{{ old('gender') }}" style="padding:12px;border-radius:8px;border:0;background:#e8ebef;">
                        <input placeholder="Personal Information" name="personal_information" value="{{ old('personal_information') }}" style="padding:12px;border-radius:8px;border:0;background:#e8ebef;">
                    </div>

                    <h3 style="margin:24px 0 8px 0;color:#a3a3a3;">Contact Information</h3>
                    <div style="display:flex;flex-direction:column;gap:12px;">
                        <input placeholder="Email Address" name="email" value="{{ old('email') }}" style="padding:12px;border-radius:8px;border:0;background:#e8ebef;">
                        <input placeholder="Phone Number" name="phone" value="{{ old('phone') }}" style="padding:12px;border-radius:8px;border:0;background:#e8ebef;">
                        <input placeholder="Address" name="address" value="{{ old('address') }}" style="padding:12px;border-radius:8px;border:0;background:#e8ebef;">
                    </div>
                </div>
                <div>
                    <h3 style="margin:0 0 8px 0;color:#a3a3a3;">Academic Information</h3>
                    <div style="display:flex;flex-direction:column;gap:12px;">
                        <input placeholder="Program/Course" name="program" value="{{ old('program') }}" style="padding:12px;border-radius:8px;border:0;background:#e8ebef;">
                        <input placeholder="Year Level" name="year_level" value="{{ old('year_level') }}" style="padding:12px;border-radius:8px;border:0;background:#e8ebef;">
                        <input placeholder="Section" name="section" value="{{ old('section') }}" style="padding:12px;border-radius:8px;border:0;background:#e8ebef;">
                        <input placeholder="Status" name="status" value="{{ old('status') }}" style="padding:12px;border-radius:8px;border:0;background:#e8ebef;">
                        <button type="submit" style="margin-top:8px;padding:14px;border-radius:10px;border:0;background:#16a34a;color:white;font-weight:600;">Confirm</button>
                    </div>
                </div>
            </div>
        </form>

        @if(isset($students) && $students->count())
        <div style="margin-top:24px;">
            <h3 style="margin:0 0 8px 0;color:#a3a3a3;">Submitted Students</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                @foreach($students as $student)
                <div style="background:#2b2b2b;padding:12px;border-radius:8px;">
                    <div><strong>{{ $student->first_name }} {{ $student->last_name }}</strong></div>
                    <div style="font-size:14px;color:#cfcfcf;">ID: {{ $student->student_id ?? '—' }} | Program: {{ $student->program ?? '—' }} | Year: {{ $student->year_level ?? '—' }}</div>
                    <div style="font-size:14px;color:#cfcfcf;">Section: {{ $student->section ?? '—' }} | Status: {{ $student->status ?? '—' }}</div>
                    <div style="font-size:14px;color:#cfcfcf;">Email: {{ $student->email ?? '—' }} | Phone: {{ $student->phone ?? '—' }}</div>
                    <div style="font-size:14px;color:#cfcfcf;">Address: {{ $student->address ?? '—' }}</div>
                </div>
                @endforeach
            </div>
        </div>
        @endif
    </div>
</body>
</html>