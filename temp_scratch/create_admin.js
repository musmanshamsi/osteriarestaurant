import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://dlxorynfbjdrcyavriuc.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRseG9yeW5mYmpkcmN5YXZyaXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNzM5NjgsImV4cCI6MjA5Mjc0OTk2OH0.juT9zQBVBILtuA9LQB1PGfRis0zpF4BWP3T4oWGTO4M"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createAdmin() {
  const email = 'admin@osteriabella.com'
  const password = '820-620=Twohundred'
  
  console.log(`Attempting to sign up ${email}...`)
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'System Admin'
      }
    }
  })
  
  let userId;
  if (error) {
    if (error.message.includes('already registered')) {
      console.log('User already exists. Attempting to sign in to get ID...')
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        console.error('Error signing in:', signInError.message)
        return
      }
      userId = signInData.user.id
    } else {
      console.error('Error signing up:', error.message)
      return
    }
  } else {
    userId = data.user.id
    console.log('User created successfully:', userId)
  }
  
  console.log('User ID is:', userId)
  console.log('NOTE: Automatically granting admin role requires SQL permissions.')
  console.log('I will try to insert into user_roles, but it may fail if RLS is strict.')
  
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role: 'admin' })
    
  if (roleError) {
    console.error('Could not grant admin role automatically:', roleError.message)
    console.log('\n--- IMPORTANT ACTION REQUIRED ---')
    console.log('Please run this SQL in your Supabase Dashboard SQL Editor:')
    console.log(`INSERT INTO user_roles (user_id, role) VALUES ('${userId}', 'admin') ON CONFLICT (user_id) DO UPDATE SET role = 'admin';`)
    console.log('----------------------------------\n')
  } else {
    console.log('Successfully granted admin role!')
  }
}

createAdmin()
