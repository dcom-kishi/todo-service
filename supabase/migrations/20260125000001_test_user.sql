-- Create a test user in auth.users
-- Note: password is 'Password123!'
-- We use crypt from pgcrypto to hash the password. 
-- Supabase uses bcrypt for password hashing.
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '5bc7aa06-c593-45f6-bb3b-381c210fa57c',
    'authenticated',
    'authenticated',
    'test@example.com',
    crypt('Password123!', gen_salt('bf')),
    now(),
    NULL,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"testuser"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- Insert corresponding profile
INSERT INTO public.profiles (id, username, avatar_url)
VALUES (
    '5bc7aa06-c593-45f6-bb3b-381c210fa57c',
    'testuser',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
) ON CONFLICT (id) DO NOTHING;
