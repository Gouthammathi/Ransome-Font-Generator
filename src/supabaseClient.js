import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug environment variables
console.log('Environment variables:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 10)}...` : 'missing',
  key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'missing'
})

// Create Supabase client
let supabase

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚨 SUPABASE CONFIGURATION MISSING 🚨')
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.error('Your Supabase credentials are not configured.')
  console.error('')
  console.error('TO FIX THIS ISSUE:')
  console.error('1. Create a .env file in your project root directory')
  console.error('2. Add these lines to the .env file:')
  console.error('   VITE_SUPABASE_URL=your_actual_supabase_url')
  console.error('   VITE_SUPABASE_ANON_KEY=your_actual_anon_key')
  console.error('')
  console.error('HOW TO GET YOUR CREDENTIALS:')
  console.error('1. Go to https://supabase.com')
  console.error('2. Create a new project or select an existing one')
  console.error('3. Go to Settings → API')
  console.error('4. Copy the "Project URL" and "anon public" key')
  console.error('')
  console.error('EXAMPLE .env FILE:')
  console.error('VITE_SUPABASE_URL=https://your-project-id.supabase.co')
  console.error('VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
  console.error('')
  console.error('After creating the .env file, restart your development server!')
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  // Provide a default client that will fail gracefully
  supabase = {
    storage: {
      from: () => ({
        getPublicUrl: () => ({ data: { publicUrl: null } }),
        upload: async () => ({ data: null, error: new Error('Supabase not configured') }),
        list: async () => ({ data: [], error: new Error('Supabase not configured') })
      })
    }
  }
} else {
  console.log('✅ Supabase client initialized successfully')
  // Create the Supabase client with the provided credentials
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }

// Function to get image URL from Supabase Storage
export const getImageUrl = (path) => {
  if (!path) return null
  
  // Check if Supabase is properly configured
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('🚨 Cannot generate image URL: Supabase not configured')
    return null
  }
  
  try {
    // Get the public URL from Supabase
    // The Supabase client will handle adding the bucket and public path
    const { data } = supabase.storage.from('images').getPublicUrl(path)
    
    // Return the public URL
    return data?.publicUrl || null
  } catch (error) {
    console.error('Error getting image URL:', error)
    return null
  }
}

// Function to upload image to Supabase Storage
export const uploadImage = async (file, path) => {
  if (!file || !path) return null
  
  try {
    const { data, error } = await supabase.storage
      .from('images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) {
      console.error('Error uploading image:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error in uploadImage:', error)
    return null
  }
}

// Function to list all images in a directory
export const listImages = async (path) => {
  if (!path) return []
  
  try {
    const { data, error } = await supabase.storage
      .from('images')
      .list(path)
    
    if (error) {
      console.error('Error listing images:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error in listImages:', error)
    return []
  }
} 