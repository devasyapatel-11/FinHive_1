import { supabase } from '@/integrations/supabase/client';

// User profile types
export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

// User preferences types
export interface UserPreferences {
  id: string;
  user_id: string;
  currency: string;
  date_format: string;
  email_notifications: boolean;
  push_notifications: boolean;
  created_at?: string;
  updated_at?: string;
}

// Get user profile - using localStorage for reliability
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    // First try to get from localStorage
    const profileJSON = localStorage.getItem('finhive_user_profile');
    if (profileJSON) {
      const profile = JSON.parse(profileJSON);
      if (profile.id === userId) {
        return profile;
      }
    }
    
    // Fallback to Supabase
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile from Supabase:', error);
        return null;
      }
      
      if (data) {
        // Store in localStorage for future use
        localStorage.setItem('finhive_user_profile', JSON.stringify(data));
        return data as UserProfile;
      }
      
      return null;
    } catch (supabaseError) {
      console.error('Supabase error getting profile:', supabaseError);
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Update user profile - using localStorage for reliability
export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const updatedProfile = {
      id: userId,
      ...profile,
      updated_at: new Date().toISOString()
    };
    
    // First update localStorage
    const profileJSON = localStorage.getItem('finhive_user_profile');
    if (profileJSON) {
      const existingProfile = JSON.parse(profileJSON);
      const mergedProfile = { ...existingProfile, ...updatedProfile };
      localStorage.setItem('finhive_user_profile', JSON.stringify(mergedProfile));
    } else {
      localStorage.setItem('finhive_user_profile', JSON.stringify(updatedProfile));
    }
    
    // Then try to update Supabase
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(updatedProfile)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile in Supabase:', error);
        // Continue anyway since we updated localStorage
      }
      
      // Return the updated profile from localStorage to ensure UI consistency
      const updatedProfileJSON = localStorage.getItem('finhive_user_profile');
      return updatedProfileJSON ? JSON.parse(updatedProfileJSON) : null;
    } catch (supabaseError) {
      console.error('Supabase error updating profile:', supabaseError);
      // Return the localStorage version anyway
      const updatedProfileJSON = localStorage.getItem('finhive_user_profile');
      return updatedProfileJSON ? JSON.parse(updatedProfileJSON) : null;
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};

// Get user preferences - using localStorage only for reliability
export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  try {
    // Try to get from localStorage
    const preferencesJSON = localStorage.getItem('finhive_user_preferences');
    if (preferencesJSON) {
      const preferences = JSON.parse(preferencesJSON);
      if (preferences.user_id === userId) {
        return preferences;
      }
    }
    
    // Create default preferences if not found
    const defaultPreferences: UserPreferences = {
      id: `pref_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      user_id: userId,
      currency: 'INR',
      date_format: 'DD/MM/YYYY',
      email_notifications: true,
      push_notifications: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('finhive_user_preferences', JSON.stringify(defaultPreferences));
    
    return defaultPreferences;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
};

// Update user preferences - using localStorage only for reliability
export const updateUserPreferences = async (userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences | null> => {
  try {
    // First get current preferences
    const currentPreferencesJSON = localStorage.getItem('finhive_user_preferences');
    let currentPreferences: UserPreferences;
    
    if (currentPreferencesJSON) {
      currentPreferences = JSON.parse(currentPreferencesJSON);
    } else {
      // Create default preferences if none exist
      currentPreferences = {
        id: `pref_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        user_id: userId,
        currency: 'INR',
        date_format: 'DD/MM/YYYY',
        email_notifications: true,
        push_notifications: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    
    // Merge with new preferences
    const updatedPreferences = {
      ...currentPreferences,
      ...preferences,
      user_id: userId, // Ensure user_id is set correctly
      updated_at: new Date().toISOString()
    };
    
    // Update localStorage
    localStorage.setItem('finhive_user_preferences', JSON.stringify(updatedPreferences));
    
    // Return the updated preferences
    return updatedPreferences;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return null;
  }
};
