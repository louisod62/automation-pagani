require('dotenv').config();
const express = require('express');
const { Resend } = require('resend');
const cors    = require('cors');
const path    = require('path');

const app    = express();
const PORT   = process.env.PORT || 3001;
const resend = new Resend(process.env.RESEND_API_KEY);

// ── MIDDLEWARE ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

console.log('✅ [Resend] Prêt à envoyer des emails');
console.log(`   → Destinataire : ${process.env.DEST_EMAIL}\n`);

// ── POST /api/visit ─────────────────────────────────────────────────────────
app.post('/api/visit', async (req, res) => {
  const { date, time, url, referrer } = req.body;

  console.log('\n──────────────────────────────────────────');
  console.log('📍 [VISITE] Requête reçue');
  console.log(`   Date     : ${date}`);
  console.log(`   Heure    : ${time}`);
  console.log(`   Page     : ${url}`);
  console.log(`   Source   : ${referrer || 'Accès direct'}`);

  try {
    console.log('📤 [VISITE] Envoi email...');
    const { data, error } = await resend.emails.send({
      from:    'AutomationPagani <onboarding@resend.dev>',
      to:      [process.env.DEST_EMAIL],
      subject: `🔔 Nouveau visiteur — ${date} à ${time}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
          <h2 style="margin:0 0 24px;color:#1f2937;font-size:20px;">🔔 Nouveau visiteur sur votre site</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;color:#6b7280;font-size:14px;width:100px;">Date</td>
              <td style="padding:10px 0;color:#111827;font-size:14px;font-weight:600;">${date}</td>
            </tr>
            <tr style="border-top:1px solid #e5e7eb;">
              <td style="padding:10px 0;color:#6b7280;font-size:14px;">Heure</td>
              <td style="padding:10px 0;color:#111827;font-size:14px;font-weight:600;">${time}</td>
            </tr>
            <tr style="border-top:1px solid #e5e7eb;">
              <td style="padding:10px 0;color:#6b7280;font-size:14px;">Page</td>
              <td style="padding:10px 0;color:#111827;font-size:14px;">${url || '-'}</td>
            </tr>
            <tr style="border-top:1px solid #e5e7eb;">
              <td style="padding:10px 0;color:#6b7280;font-size:14px;">Source</td>
              <td style="padding:10px 0;color:#111827;font-size:14px;">${referrer || 'Accès direct'}</td>
            </tr>
          </table>
        </div>
      `
    });
    if (error) throw new Error(error.message);
    console.log('✅ [VISITE] Email envoyé — ID :', data.id);
    res.json({ success: true, id: data.id });
  } catch (err) {
    console.error('❌ [VISITE] Erreur :', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/contact ───────────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { from_name, from_email, project_type, message, sent_at } = req.body;

  console.log('\n──────────────────────────────────────────');
  console.log('📩 [CONTACT] Requête reçue');
  console.log(`   Nom     : ${from_name}`);
  console.log(`   Email   : ${from_email}`);
  console.log(`   Projet  : ${project_type}`);
  console.log(`   Envoyé  : ${sent_at}`);
  console.log(`   Message : ${message?.substring(0, 80)}${message?.length > 80 ? '...' : ''}`);

  // Validation basique
  if (!from_name || !from_email || !message) {
    console.warn('⚠️  [CONTACT] Champs manquants — requête rejetée');
    return res.status(400).json({ success: false, error: 'Champs obligatoires manquants' });
  }

  try {
    console.log('📤 [CONTACT] Envoi email...');
    const { data, error } = await resend.emails.send({
      from:     'AutomationPagani <onboarding@resend.dev>',
      to:       [process.env.DEST_EMAIL],
      reply_to: from_email,
      subject:  `📩 Nouveau message de ${from_name} — ${project_type}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
          <h2 style="margin:0 0 8px;color:#1f2937;font-size:20px;">📩 Nouveau message via votre site</h2>
          <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Reçu le ${sent_at}</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;color:#6b7280;font-size:14px;width:100px;">Nom</td>
              <td style="padding:10px 0;color:#111827;font-size:14px;font-weight:600;">${from_name}</td>
            </tr>
            <tr style="border-top:1px solid #e5e7eb;">
              <td style="padding:10px 0;color:#6b7280;font-size:14px;">Email</td>
              <td style="padding:10px 0;font-size:14px;">
                <a href="mailto:${from_email}" style="color:#4f46e5;">${from_email}</a>
              </td>
            </tr>
            <tr style="border-top:1px solid #e5e7eb;">
              <td style="padding:10px 0;color:#6b7280;font-size:14px;">Projet</td>
              <td style="padding:10px 0;color:#111827;font-size:14px;font-weight:600;">${project_type}</td>
            </tr>
          </table>
          <div style="margin-top:24px;padding:20px;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;">
            <p style="margin:0 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Message</p>
            <p style="margin:0;color:#1f2937;font-size:15px;line-height:1.7;white-space:pre-wrap;">${message}</p>
          </div>
          <div style="margin-top:20px;text-align:center;">
            <a href="mailto:${from_email}" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#fff;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
              Répondre à ${from_name}
            </a>
          </div>
        </div>
      `
    });
    if (error) throw new Error(error.message);
    console.log('✅ [CONTACT] Email envoyé — ID :', data.id);
    res.json({ success: true, id: data.id });
  } catch (err) {
    console.error('❌ [CONTACT] Erreur :', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:   'ok',
    gmail:    process.env.GMAIL_USER,
    dest:     process.env.DEST_EMAIL,
    time:     new Date().toLocaleString('fr-FR')
  });
});

// ── DÉMARRAGE ───────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n══════════════════════════════════════════');
  console.log(`🚀 Serveur AutomationPagani démarré`);
  console.log(`   URL  : http://localhost:${PORT}`);
  console.log(`   Site : http://localhost:${PORT}/index.html`);
  console.log('══════════════════════════════════════════\n');
});
