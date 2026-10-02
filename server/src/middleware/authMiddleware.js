import { supabase, createScopedClient } from '../config/supabase.js';

/**
 * Middleware to authenticate requests via Supabase JWT
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No valid token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.',
      });
    }

    // Fetch user profile to get roles and info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError);
    }

    req.token = token;
    req.user = user;
    req.profile = profile || {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || 'Student',
      role: 'student',
    };
    req.scopedSupabase = createScopedClient(token);

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal authentication error.',
    });
  }
};

/**
 * Middleware to enforce Admin role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.profile || req.profile.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
    });
  }
  next();
};

/**
 * Middleware to enforce Moderator or Admin role
 */
export const requireModerator = (req, res, next) => {
  if (!req.profile || !['admin', 'moderator'].includes(req.profile.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Moderator or Administrator privileges required.',
    });
  }
  next();
};
