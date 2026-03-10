-- Promote an existing user to admin.
-- Step 1: create the account normally via /register or Supabase Auth.
-- Step 2: replace the email or matricule below, then run this in Supabase SQL Editor.

-- Option A: promote by email
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@example.com';

-- Option B: promote by matricule
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE matricule = '2024ABC';

-- Verify the result
SELECT id, email, matricule, role, has_voted
FROM public.profiles
WHERE email = 'admin@example.com';
