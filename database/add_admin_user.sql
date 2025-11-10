-- Simple insert for admin user
-- This creates a user with email 'admin' and password 'admin123'
-- Run this in your database or use tinker command below

INSERT INTO users (name, email, password, created_at, updated_at) 
VALUES (
    'Administrator',
    'admin',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    NOW(),
    NOW()
);

-- OR run this in PowerShell:
-- php artisan tinker
-- Then paste: \App\Models\User::create(['name' => 'Administrator', 'email' => 'admin', 'password' => bcrypt('admin123')]);
-- Then type: exit

