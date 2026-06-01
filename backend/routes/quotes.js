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
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ quotes: data });
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
      .eq('user_id', req.user.id)
      .single();

    if (companyError || !company) {
      return res.status(404).json({ error: 'Entreprise introuvable' });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `Tu es un assistant de génération de devis professionnels pour des entreprises africaines francophones. À partir de la description fournie, génère un devis structuré en JSON.

Règles importantes :
- Si un budget est mentionné, le total_ttc DOIT être égal à ce budget
- La TVA au Cameroun est de 19,25%
- Calcule total_ht = total_ttc / 1.1925 (arrondi)
- Calcule tva = total_ttc - total_ht (arrondi)
- Répartis les prestations de façon logique pour que leur somme = total_ht
- Si pas de budget mentionné, estime un prix marché africain raisonnable
- Analyse attentivement la description pour extraire :
  client_name (nom du client ou de son entreprise), client_address (adresse mentionnée), client_email (email mentionné)
  Si ces infos ne sont pas mentionnées, laisse les champs à "" (chaîne vide), PAS de placeholders comme "[Adresse du client]" ou "[Email du client]"
- conditions_paiement : si des conditions de paiement sont mentionnées dans la description (ex: 30% avance, paiement à la livraison, etc.), utilise-les. Sinon, utilise "50% à la commande, 50% à la livraison" par défaut

Réponds UNIQUEMENT avec ce JSON, sans texte autour :
{
  "client_name": "Nom du client",
  "client_address": "Adresse du client",
  "client_email": "email@client.com",
  "objet": "Objet court du devis",
  "prestations": [
    {
      "description": "Titre de la prestation",
      "sous_detail": "Détail technique court",
      "quantite": 1,
      "prix_unitaire": 000000,
      "total": 000000
    }
  ],
  "total_ht": 000000,
  "tva": 000000,
  "taux_tva": 19.25,
  "total_ttc": 000000,
  "conditions_paiement": "50% à la commande, 50% à la livraison",
  "delai_realisation": "X semaines",
  "validite_jours": 30
}

IMPORTANT : Si budget = 500000 FCFA alors :
- total_ttc = 500000
- total_ht = 419287 (arrondi de 500000/1.1925)
- tva = 80713 (500000 - 419287)
- La somme des prestations doit être égale à total_ht soit 419287`,
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
        user_id: req.user.id,
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
    console.error('Erreur génération devis:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ error: err.message });
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
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Devis introuvable' });

    res.json({ quote: data });
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
      .eq('user_id', req.user.id)
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
      .eq('user_id', req.user.id);

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
      .eq('user_id', req.user.id)
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
