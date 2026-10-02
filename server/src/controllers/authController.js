import { supabase } from '../config/supabase.js';
import { validateCollegeEmail, getAllowedDomains } from '../utils/domainValidator.js';

/**
 * Register a new student account
 * Strictly restricts email domains and forces role to 'student'
 */
export const register = async (req, res) => {
  try {
    const { full_name, email, student_id, password } = req.body;

    // 1. Validate required fields
    if (!full_name || !email || !student_id || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Full Name, College Email, Student ID, and Password) are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // 2. Validate college email domain
    const emailValidation = validateCollegeEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.error,
        allowedDomains: getAllowedDomains(),
      });
    }

    // 3. Register user with Supabase Auth
    // Explicitly setting role: 'student' in user metadata so client cannot pass admin role
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: full_name.trim(),
          student_id: student_id.trim().toUpperCase(),
          role: 'student',
        },
      },
    });

    if (authError) {
      return res.status(400).json({
        success: false,
        message: authError.message,
      });
    }

    const user = authData.user;
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Could not create account. Please try again.',
      });
    }

    // 4. Ensure profile row exists in public.profiles (our trigger also handles this)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: full_name.trim(),
        email: user.email,
        student_id: student_id.trim().toUpperCase(),
        college_domain: emailValidation.domain,
        role: 'student',
      }, { onConflict: 'id' })
      .select()
      .single();

    return res.status(201).json({
      success: true,
      message: 'Account successfully registered.',
      session: authData.session,
      user: {
        id: user.id,
        email: user.email,
        profile: profile || {
          id: user.id,
          full_name: full_name.trim(),
          email: user.email,
          student_id: student_id.trim().toUpperCase(),
          role: 'student',
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during registration.',
    });
  }
};

/**
 * Student / Admin login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      return res.status(401).json({
        success: false,
        message: authError.message || 'Invalid credentials.',
      });
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    return res.status(200).json({
      success: true,
      message: 'Successfully logged in.',
      session: authData.session,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        profile: profile || {
          id: authData.user.id,
          full_name: authData.user.user_metadata?.full_name || 'Student',
          email: authData.user.email,
          role: 'student',
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during login.',
    });
  }
};

/**
 * Get current authenticated user profile
 */
export const getProfile = async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile.',
    });
  }
};

/**
 * Update authenticated user profile (name, avatar)
 */
export const updateProfile = async (req, res) => {
  try {
    const { full_name, avatar_url } = req.body;
    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (full_name) updates.full_name = full_name.trim();
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
    });
  }
};

/**
 * Request password reset
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.',
      });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process password reset request.',
    });
  }
};

/**
 * Get authorized college email domains
 */
export const getAuthorizedDomains = (req, res) => {
  const domains = getAllowedDomains();
  return res.status(200).json({
    success: true,
    allowedDomains: domains,
  });
};
