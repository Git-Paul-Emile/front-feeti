// Routes pour la gestion des soumissions d'événements

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Configuration upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté'));
    }
  }
});

// Configuration Email
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Soumettre un nouvel événement
 * POST /api/event-submissions
 */
router.post('/', upload.fields([
  { name: 'organizerLogo', maxCount: 1 },
  { name: 'mainPoster', maxCount: 1 },
  { name: 'gallery', maxCount: 5 },
  { name: 'partnerLogos', maxCount: 10 }
]), async (req, res) => {
  try {
    const submissionData = JSON.parse(req.body.data);
    const files = req.files;

    // Upload des fichiers vers Firebase Storage
    const uploadedUrls = {};

    // Logo organisateur
    if (files.organizerLogo) {
      const logoUrl = await uploadFile(files.organizerLogo[0], 'organizer-logos');
      uploadedUrls.organizerLogo = logoUrl;
    }

    // Affiche principale
    if (files.mainPoster) {
      const posterUrl = await uploadFile(files.mainPoster[0], 'event-posters');
      uploadedUrls.mainPoster = posterUrl;
    }

    // Galerie
    if (files.gallery) {
      uploadedUrls.gallery = await Promise.all(
        files.gallery.map(file => uploadFile(file, 'event-gallery'))
      );
    }

    // Logos partenaires
    if (files.partnerLogos) {
      uploadedUrls.partnerLogos = await Promise.all(
        files.partnerLogos.map(file => uploadFile(file, 'partner-logos'))
      );
    }

    // Créer la soumission dans Firestore
    const submission = {
      ...submissionData,
      uploadedUrls,
      status: 'pending',
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      userId: submissionData.organizerEmail // Lier au compte utilisateur
    };

    const submissionRef = await db.collection('event_submissions').add(submission);

    // Notifier les admins
    await notifyAdmins(submissionRef.id, submissionData);

    // Envoyer confirmation à l'organisateur
    await sendSubmissionConfirmation(submissionData.organizerEmail, submissionData.eventName);

    res.json({
      success: true,
      submissionId: submissionRef.id,
      message: 'Événement soumis avec succès. Vous recevrez une réponse sous 24-48 heures.'
    });

  } catch (error) {
    console.error('Error submitting event:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la soumission'
    });
  }
});

/**
 * Liste des soumissions (Admin)
 * GET /api/event-submissions
 */
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50, startAfter } = req.query;

    let query = db.collection('event_submissions');

    if (status) {
      query = query.where('status', '==', status);
    }

    query = query.orderBy('submittedAt', 'desc').limit(parseInt(limit));

    if (startAfter) {
      const startDoc = await db.collection('event_submissions').doc(startAfter).get();
      query = query.startAfter(startDoc);
    }

    const snapshot = await query.get();
    const submissions = [];

    snapshot.forEach(doc => {
      submissions.push({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate?.()?.toISOString?.() || null
      });
    });

    res.json({
      success: true,
      submissions,
      count: submissions.length
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Détails d'une soumission
 * GET /api/event-submissions/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection('event_submissions').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Soumission introuvable'
      });
    }

    res.json({
      success: true,
      submission: {
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate?.()?.toISOString?.() || null
      }
    });

  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Approuver un événement
 * POST /api/event-submissions/:id/approve
 */
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, adminName } = req.body;

    const submissionRef = db.collection('event_submissions').doc(id);
    const submissionDoc = await submissionRef.get();

    if (!submissionDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Soumission introuvable'
      });
    }

    const submissionData = submissionDoc.data();

    // Créer l'événement public
    const eventData = {
      title: submissionData.eventName,
      description: submissionData.description,
      category: submissionData.category,
      date: submissionData.startDate,
      time: submissionData.startTime,
      endDate: submissionData.endDate,
      endTime: submissionData.endTime,
      location: submissionData.venueName,
      address: submissionData.address,
      city: submissionData.city,
      country: submissionData.country,
      venue: submissionData.venueName,
      image: submissionData.uploadedUrls?.mainPoster || '',
      price: submissionData.tickets?.[0]?.price || 0,
      currency: 'FCFA',
      isLive: submissionData.hasStreaming,
      organizer: submissionData.organizerName,
      organizerId: submissionData.userId,
      maxAttendees: submissionData.tickets?.reduce((sum, t) => sum + t.quantity, 0) || 100,
      attendees: 0,
      status: 'published',
      featured: submissionData.featuredHomepage || false,
      tickets: submissionData.tickets || [],
      hashtags: submissionData.hashtags || [],
      gallery: submissionData.uploadedUrls?.gallery || [],
      videoLink: submissionData.videoLink || '',
      partners: submissionData.partners || [],
      googleMapsLink: submissionData.googleMapsLink || '',
      salesStartDate: submissionData.salesStartDate || null,
      salesEndDate: submissionData.salesEndDate || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      publishedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const eventRef = await db.collection('events').add(eventData);

    // Générer code d'accès dashboard organisateur
    const accessCode = generateAccessCode();

    // Mettre à jour la soumission
    await submissionRef.update({
      status: 'approved',
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      approvedBy: adminId,
      approvedByName: adminName,
      eventId: eventRef.id,
      dashboardAccessCode: accessCode
    });

    // Envoyer email de confirmation
    await sendApprovalEmail(
      submissionData.organizerEmail,
      submissionData.organizerName,
      submissionData.eventName,
      eventRef.id,
      accessCode
    );

    res.json({
      success: true,
      eventId: eventRef.id,
      accessCode,
      message: 'Événement approuvé et publié'
    });

  } catch (error) {
    console.error('Error approving event:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Rejeter un événement
 * POST /api/event-submissions/:id/reject
 */
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, adminName, reason } = req.body;

    const submissionRef = db.collection('event_submissions').doc(id);
    const submissionDoc = await submissionRef.get();

    if (!submissionDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Soumission introuvable'
      });
    }

    const submissionData = submissionDoc.data();

    // Mettre à jour la soumission
    await submissionRef.update({
      status: 'rejected',
      rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
      rejectedBy: adminId,
      rejectedByName: adminName,
      rejectionReason: reason
    });

    // Envoyer email de rejet
    await sendRejectionEmail(
      submissionData.organizerEmail,
      submissionData.organizerName,
      submissionData.eventName,
      reason
    );

    res.json({
      success: true,
      message: 'Soumission rejetée'
    });

  } catch (error) {
    console.error('Error rejecting event:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Helper: Upload un fichier vers Firebase Storage
 */
async function uploadFile(file, folder) {
  const filename = `${folder}/${Date.now()}-${file.originalname}`;
  const fileUpload = bucket.file(filename);

  await fileUpload.save(file.buffer, {
    metadata: {
      contentType: file.mimetype
    }
  });

  await fileUpload.makePublic();

  return `https://storage.googleapis.com/${bucket.name}/${filename}`;
}

/**
 * Helper: Générer un code d'accès
 */
function generateAccessCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code.match(/.{1,4}/g)?.join('-') || code;
}

/**
 * Helper: Notifier les admins d'une nouvelle soumission
 */
async function notifyAdmins(submissionId, submissionData) {
  // Récupérer les emails des admins
  const adminsSnapshot = await db.collection('users')
    .where('role', '==', 'admin')
    .get();

  const adminEmails = [];
  adminsSnapshot.forEach(doc => {
    const email = doc.data().email;
    if (email) adminEmails.push(email);
  });

  if (adminEmails.length === 0) return;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4338ca, #059669); color: white; padding: 20px; border-radius: 8px; }
    .content { background: white; padding: 20px; border: 1px solid #e5e7eb; margin-top: 20px; }
    .button { display: inline-block; padding: 12px 24px; background: #4338ca; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🆕 Nouvelle Soumission d'Événement</h2>
    </div>
    <div class="content">
      <p><strong>Événement :</strong> ${submissionData.eventName}</p>
      <p><strong>Organisateur :</strong> ${submissionData.organizerName}</p>
      <p><strong>Email :</strong> ${submissionData.organizerEmail}</p>
      <p><strong>Catégorie :</strong> ${submissionData.category}</p>
      <p><strong>Date :</strong> ${submissionData.startDate}</p>
      <p><strong>Ville :</strong> ${submissionData.city}</p>
      
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/submissions/${submissionId}" class="button">
        Examiner la soumission
      </a>
    </div>
  </div>
</body>
</html>
  `;

  await emailTransporter.sendMail({
    from: process.env.SMTP_FROM || '"Feeti Admin" <admin@feeti.com>',
    to: adminEmails.join(','),
    subject: `🆕 Nouvelle soumission : ${submissionData.eventName}`,
    html
  });
}

/**
 * Helper: Email de confirmation de soumission
 */
async function sendSubmissionConfirmation(email, eventName) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4338ca, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Soumission Reçue</h1>
    </div>
    <div class="content">
      <p>Bonjour,</p>
      <p>Nous avons bien reçu votre soumission pour l'événement :</p>
      <h3 style="color: #4338ca;">${eventName}</h3>
      
      <p>Notre équipe examinera votre demande sous <strong>24 à 48 heures</strong>.</p>
      
      <p>Vous recevrez un email de confirmation dès que votre événement sera approuvé.</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      
      <p style="color: #6b7280; font-size: 14px;">
        Des questions ? Contactez-nous à support@feeti.com
      </p>
    </div>
  </div>
</body>
</html>
  `;

  await emailTransporter.sendMail({
    from: process.env.SMTP_FROM || '"Feeti" <noreply@feeti.com>',
    to: email,
    subject: `✅ Soumission reçue : ${eventName}`,
    html
  });
}

/**
 * Helper: Email d'approbation
 */
async function sendApprovalEmail(email, organizerName, eventName, eventId, accessCode) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
    .code-box { background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .code { font-size: 32px; font-weight: bold; color: #4338ca; letter-spacing: 4px; font-family: monospace; }
    .button { display: inline-block; padding: 14px 28px; background: #4338ca; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Événement Approuvé !</h1>
    </div>
    <div class="content">
      <p>Bonjour <strong>${organizerName}</strong>,</p>
      
      <p>Excellente nouvelle ! Votre événement a été approuvé et est maintenant en ligne sur Feeti :</p>
      
      <h3 style="color: #059669;">✨ ${eventName}</h3>
      
      <div class="code-box">
        <h4 style="margin: 0 0 10px 0; color: #6b7280;">Code d'accès Dashboard</h4>
        <div class="code">${accessCode}</div>
        <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">
          Utilisez ce code pour accéder à votre dashboard organisateur
        </p>
      </div>
      
      <h4>🎯 Prochaines étapes :</h4>
      <ul>
        <li>Accédez à votre dashboard organisateur</li>
        <li>Suivez vos ventes en temps réel</li>
        <li>Téléchargez l'app mobile pour scanner les billets</li>
        <li>Partagez votre événement sur les réseaux sociaux</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/organizer/dashboard" class="button">
          Accéder au Dashboard
        </a>
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/events/${eventId}" style="color: #4338ca;">
          Voir mon événement →
        </a>
      </div>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      
      <p style="color: #6b7280; font-size: 14px;">
        <strong>Besoin d'aide ?</strong><br>
        Email : support@feeti.com<br>
        Téléphone : +242 981-23-19
      </p>
    </div>
  </div>
</body>
</html>
  `;

  await emailTransporter.sendMail({
    from: process.env.SMTP_FROM || '"Feeti" <noreply@feeti.com>',
    to: email,
    subject: `🎉 Votre événement "${eventName}" est maintenant en ligne !`,
    html
  });
}

/**
 * Helper: Email de rejet
 */
async function sendRejectionEmail(email, organizerName, eventName, reason) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
    .reason-box { background: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Soumission Non Approuvée</h1>
    </div>
    <div class="content">
      <p>Bonjour <strong>${organizerName}</strong>,</p>
      
      <p>Nous avons examiné votre soumission pour l'événement :</p>
      <h3>${eventName}</h3>
      
      <p>Malheureusement, nous ne pouvons pas approuver cet événement pour la raison suivante :</p>
      
      <div class="reason-box">
        <strong>Raison :</strong> ${reason}
      </div>
      
      <p>N'hésitez pas à nous contacter pour plus d'informations ou à soumettre une nouvelle version corrigée.</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      
      <p style="color: #6b7280; font-size: 14px;">
        <strong>Contact :</strong><br>
        Email : support@feeti.com<br>
        Téléphone : +242 981-23-19
      </p>
    </div>
  </div>
</body>
</html>
  `;

  await emailTransporter.sendMail({
    from: process.env.SMTP_FROM || '"Feeti" <noreply@feeti.com>',
    to: email,
    subject: `Soumission non approuvée : ${eventName}`,
    html
  });
}

module.exports = router;
