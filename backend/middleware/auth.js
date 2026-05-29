const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      console.error('Auth error:', error?.message);
      return res.status(401).json({ error: 'Token expiré ou invalide' });
    }

    req.user = data.user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: 'Token invalide' });
  }
};
