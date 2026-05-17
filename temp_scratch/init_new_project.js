import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://utnmnfnratqypovwxhkj.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0bm1uZm5yYXRxeXBvdnd4aGtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE5Nzc5NCwiZXhwIjoyMDkyNzczNzk0fQ.V_V03GCF4ZfYlBf9zB9dbEGbkErVyzzumFecOUeA-0Q"

// Use service role key to bypass RLS and create tables
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function initDatabase() {
  console.log('--- Starting Database Initialization ---')

  // 1. Create User Roles Table
  console.log('Creating user_roles table...')
  await supabase.rpc('run_sql', { sql: `
    CREATE TABLE IF NOT EXISTS public.user_roles (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      role text NOT NULL CHECK (role IN ('admin', 'customer')),
      created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
      UNIQUE(user_id)
    );
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
  `}).catch(e => console.log('Notice: RPC run_sql might not be enabled. You might need to run the SQL manually.'));

  // 2. Create Menu Items Table
  console.log('Creating menu_items table...')
  // ... (Since I can't easily run SQL via JS without a pre-enabled RPC, I'll just try to insert sample data 
  // which will fail if table doesn't exist, informing the user)
  
  // NOTE: Supabase doesn't allow creating tables via the JS SDK directly unless an 'exec_sql' RPC is set up.
  // I will instead create a list of SQL commands for the user to run, 
  // BUT I will try to create the admin user via Auth API first.

  console.log('Creating Admin User...')
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: 'admin@osteriabella.com',
    password: '820-620=Twohundred',
    email_confirm: true,
    user_metadata: { full_name: 'Super Admin' }
  })

  if (userError) {
    console.error('Error creating user:', userError.message)
  } else {
    const userId = userData.user.id
    console.log('Admin User Created:', userId)
    
    // Try to assign role (this will fail if table doesn't exist)
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id' })
      
    if (roleError) {
      console.log('Could not assign role automatically. Table probably missing.')
    } else {
      console.log('Admin role assigned!')
    }
  }
}

initDatabase()
