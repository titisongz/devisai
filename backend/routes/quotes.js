const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');
const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

// Toutes les routes sont protégées sauf /share
router.use(authMiddleware);

// Génère un numéro de devis au format DV-YYYY-XXXX
async function generateQuoteNumber() {
  const year = new Date().getFullYear();
  const prefix = `DV-${year}-`;

  const { count } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
    .like('quote_number', `${prefix}%`);

  const nextNum = String((count || 0) + 1).padStart(4, '0');
  return `${prefix}${nextNum}`;
}

// GET /api/quotes — liste les devis du user
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('quotes')
      .select('*, companies(name)')
      .eq('user_id', req.user.sub)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ quotes: data });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/quotes/:id — détail d'un devis
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('quotes')
      .select('*, companies(*)')
      .eq('id', id)
      .eq('user_id', req.user.sub)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Devis introuvable' });

    res.json({ quote: data });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/quotes/generate — génère un devis via Claude
router.post('/generate', async (req, res) => {
  const { company_id, description } = req.body;

  if (!company_id || !description) {
    return res.status(400).json({ error: 'company_id et description requis' });
  }

  try {
    // Vérification que l'entreprise appartient au user
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', company_id)
      .eq('user_id', req.user.sub)
      .single();

    if (companyError || !company) {
      return res.status(404).json({ error: 'Entreprise introuvable' });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: `Tu es un assistant de génération de devis professionnels pour des entreprises africaines francophones. À partir de la description fournie, génère un devis structuré en JSON avec exactement ces champs : client_name (mettre "[Nom du client]" si non précisé), client_address (mettre "[Adresse du client]" si non précisé), client_email (mettre "[Email du client]" si non précisé), objet (résumer l'objet du devis), prestations (array de : description, sous_detail, quantite, prix_unitaire, total — déduire les prestations logiques depuis la description, mettre prix_unitaire à 0 si non précisé), total_ht (somme des totaux des prestations), taux_taxe (nombre entre 0 et 100, déduire du contexte ou mettre 0 si non précisé), montant_taxe (calculer depuis total_ht et taux_taxe), total_ttc (total_ht + montant_taxe), conditions_paiement (mettre "50% à la commande, 50% à la livraison" si non précisé), delai_realisation (mettre "[À préciser]" si non mentionné), validite_jours (30 par défaut). Les montants sont en FCFA par défaut sauf si une autre devise est mentionnée. Ne jamais inventer de données sensibles — utiliser des placeholders clairs entre crochets pour tout ce qui manque. Réponds UNIQUEMENT avec le JSON, sans texte autour.`,
      messages: [{ role: 'user', content: description }]
    });

    let quoteData;
    try {
      const rawText = message.content[0].text;
      const clean = rawText.replace(/```json|```/g, '').trim();
      quoteData = JSON.parse(clean);
    } catch {
      return res.status(500).json({ error: 'Réponse Claude invalide' });
    }

    const quoteNumber = await generateQuoteNumber();

    const { data: savedQuote, error: saveError } = await supabase
      .from('quotes')
      .insert({
        user_id: req.user.sub,
        company_id,
        quote_number: quoteNumber,
        content: quoteData,
        status: 'draft',
      })
      .select()
      .single();

    if (saveError) return res.status(400).json({ error: saveError.message });

    res.status(201).json({ quote: savedQuote });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/quotes/:id — modifie un devis
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const { data: existing, error: fetchError } = await supabase
      .from('quotes')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.sub)
      .single();

    if (fetchError || !existing) return res.status(404).json({ error: 'Devis introuvable' });

    const { data, error } = await supabase
      .from('quotes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    res.json({ quote: data });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/quotes/:id — supprime un devis
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.sub);

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'Devis supprimé' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/quotes/:id/share — retourne l'URL publique du devis
router.get('/:id/share', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('quotes')
      .select('id, quote_number')
      .eq('id', id)
      .eq('user_id', req.user.sub)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Devis introuvable' });

    const baseUrl = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`;
    const shareUrl = `${baseUrl}/api/quotes/${id}/public`;

    res.json({ share_url: shareUrl, quote_number: data.quote_number });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
