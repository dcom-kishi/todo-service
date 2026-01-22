-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username text,
    avatar_url text,
    updated_at timestamp with time zone DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    status text DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),
    order_index int DEFAULT 0,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS (Disable for this simple test to make it easier, but set up for later)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Simple policies for development (allow all for now)
CREATE POLICY "Allow all for profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow all for tasks" ON public.tasks FOR ALL USING (true);

-- Insert dummy data for Hello World test
-- Note: user_id is null for this global hello world message
INSERT INTO public.tasks (title, description, status) 
VALUES ('Hello World', 'Data from Supabase via Backend API', 'DONE');
