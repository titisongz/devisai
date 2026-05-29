const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) return res.status(400).json({ error: error.message });

    // Création du profil dans la table profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        first_name: first_name,
        last_name: last_name
      });

    if (profileError) {
      console.error('Erreur insertion profil (non bloquante):', profileError.message);
    }

    // Génération du JWT via Supabase (sign in après création)
    const { data: session, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) return res.status(400).json({ error: loginError.message });

    res.status(201).json({
      token: session.session.access_token,
      user: { id: data.user.id, email, first_name: first_name || '', last_name: last_name || '' },
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(401).json({ error: error.message });

    // Récupération du profil
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        first_name: profile?.first_name || data.user.user_metadata?.first_name || '',
        last_name: profile?.last_name || data.user.user_metadata?.last_name || '',
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/auth/me (protégé)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) return res.status(404).json({ error: 'Profil introuvable' });

    res.json({ user: profile });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
