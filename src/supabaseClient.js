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
  console.error('Supabase credentials not found in environment variables.')
  console.error('Please create a .env file in your project root with:')
  console.error('VITE_SUPABASE_URL=your_supabase_project_url')
  console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key')
  console.error('You can find these values in your Supabase project settings → API')
  console.error('After creating the file, restart your development server')
  
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
  // Create the Supabase client with the provided credentials
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }

// Function to get image URL from Supabase Storage
export const getImageUrl = (path) => {
  if (!path) return null
  
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