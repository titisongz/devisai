const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

// Toutes les routes sont protégées
router.use(authMiddleware);

// GET /api/companies — liste les entreprises du user
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', req.user.sub)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ companies: data });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/companies — crée une entreprise
router.post('/', async (req, res) => {
  const { name, address, phone, email, siret, logo_url } = req.body;

  if (!name) return res.status(400).json({ error: 'Le nom de l\'entreprise est requis' });

  try {
    const { data, error } = await supabase
      .from('companies')
      .insert({ user_id: req.user.sub, name, address, phone, email, siret, logo_url })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({ company: data });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/companies/:id — modifie une entreprise
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // Vérification que l'entreprise appartient au user
    const { data: existing, error: fetchError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.sub)
      .single();

    if (fetchError || !existing) return res.status(404).json({ error: 'Entreprise introuvable' });

    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    res.json({ company: data });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/companies/:id — supprime une entreprise
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.sub);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'Entreprise supprimée' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/companies/:id/signature — upload signature (base64)
router.post('/:id/signature', async (req, res) => {
  const { id } = req.params;
  const { signature_base64 } = req.body;

  if (!signature_base64) return res.status(400).json({ error: 'Signature requise' });

  try {
    const { data: existing, error: fetchError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.sub)
      .single();

    if (fetchError || !existing) return res.status(404).json({ error: 'Entreprise introuvable' });

    const { data, error } = await supabase
      .from('companies')
      .update({ signature_base64 })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'Signature enregistrée', company: data });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
