-- Add sample tasks for the test user
-- Test User ID: 5bc7aa06-c593-45f6-bb3b-381c210fa57c

INSERT INTO public.tasks (title, description, status, order_index, user_id)
VALUES 
    ('Design Kanban Board UI', 'Create initial sketches and wireframes for the board.', 'DONE', 0, '5bc7aa06-c593-45f6-bb3b-381c210fa57c'),
    ('Implement Drag and Drop', 'Use dnd-kit to enable task movement between columns.', 'DONE', 1, '5bc7aa06-c593-45f6-bb3b-381c210fa57c'),
    ('Add User Profile Page', 'Create a page for users to manage their account settings.', 'DONE', 2, '5bc7aa06-c593-45f6-bb3b-381c210fa57c'),
    ('Refactor Navigation Bar', 'Implement a modern dropdown menu for user settings.', 'IN_PROGRESS', 0, '5bc7aa06-c593-45f6-bb3b-381c210fa57c'),
    ('Write Unit Tests', 'Increase coverage for frontend components and server actions.', 'IN_PROGRESS', 1, '5bc7aa06-c593-45f6-bb3b-381c210fa57c'),
    ('Implement Dark Mode', 'Add theme switching capability using CSS variables.', 'TODO', 0, '5bc7aa06-c593-45f6-bb3b-381c210fa57c'),
    ('Integrate Storage for Avatars', 'Allow users to upload custom images to Supabase Storage.', 'TODO', 1, '5bc7aa06-c593-45f6-bb3b-381c210fa57c'),
    ('Add Social Login', 'Enable Google and GitHub authentication.', 'TODO', 2, '5bc7aa06-c593-45f6-bb3b-381c210fa57c');
