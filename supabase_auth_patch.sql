-- Fix auth/profile drift on an existing project.
-- Run this once in Supabase SQL Editor for already-deployed databases.

-- Recreate the profile trigger function and trigger.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, matricule, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'matricule', 'PENDING_' || substring(NEW.id::text, 1, 8)),
    'voter'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for users that already exist in auth.users.
INSERT INTO public.profiles (id, email, matricule, role)
SELECT
  users.id,
  users.email,
  COALESCE(users.raw_user_meta_data->>'matricule', 'PENDING_' || substring(users.id::text, 1, 8)),
  'voter'::user_role
FROM auth.users AS users
LEFT JOIN public.profiles AS profiles
  ON profiles.id = users.id
WHERE profiles.id IS NULL;

-- Keep public results readable and let each voter read their own confirmation data.
DROP POLICY IF EXISTS "Anyone can view candidates" ON public.candidates;
CREATE POLICY "Anyone can view candidates" ON public.candidates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;
CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view their own vote" ON public.votes;
CREATE POLICY "Users can view their own vote" ON public.votes FOR SELECT TO authenticated
USING (auth.uid() = user_id);
