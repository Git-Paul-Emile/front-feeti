/**
 * Traduit les erreurs Firebase (Auth / Firestore / Storage) et messages techniques
 * en textes français compréhensibles pour les formulaires et l'authentification.
 */

const DEFAULT_FALLBACK = "Une erreur est survenue. Veuillez réessayer.";

/** Messages métier déjà en français ; on les conserve tels quels */
const APP_MESSAGES_KEEP = new Set<string>([
  "Profil utilisateur introuvable",
  "Non authentifie",
  "Veuillez vous connecter pour continuer",
]);

/** Codes Firebase + erreurs usuelles du client */
const FIREBASE_CLIENT_MESSAGES: Record<string, string> = {
  // ── Auth ──
  "auth/invalid-email":
    "L’adresse e-mail n’est pas valide : vérifiez le champ « E-mail » (exemple : vous@domaine.fr).",
  "auth/missing-email": "Indiquez votre adresse e-mail dans le champ prévu.",
  "auth/missing-password": "Indiquez votre mot de passe.",
  "auth/wrong-password":
    "Le mot de passe ne correspond pas. Vérifiez votre saisie ou utilisez « Mot de passe oublié ».",
  "auth/user-not-found":
    "Aucun compte avec cette adresse e-mail. Créez un compte ou corrigez l’e-mail.",
  "auth/invalid-credential":
    "E-mail ou mot de passe incorrect.",
  "auth/user-disabled": "Ce compte a été désactivé. Contactez le support pour plus d’informations.",
  "auth/email-already-in-use":
    "Cette adresse e-mail est déjà utilisée. Connectez-vous ou choisissez une autre adresse.",
  "auth/weak-password":
    "Mot de passe trop faible : utilisez au moins 6 caractères (idéalement lettres, chiffres et symboles).",
  "auth/too-many-requests":
    "Trop de tentatives. Patientez quelques minutes puis réessayez ou réinitialisez votre mot de passe.",
  "auth/network-request-failed":
    "Problème de connexion réseau. Vérifiez Internet et réessayez.",
  "auth/requires-recent-login":
    "Pour des raisons de sécurité, reconnectez-vous puis refaites l’action (mot de passe, suppression de compte, etc.).",
  "auth/invalid-action-code": "Le lien utilisé est invalide ou incomplet.",
  "auth/expired-action-code": "Ce lien a expiré. Demandez un nouveau lien (réinitialisation, vérification, etc.).",
  "auth/invalid-verification-code": "Code de vérification incorrect. Copiez le code tel qu’envoyé par e-mail.",
  "auth/account-exists-with-different-credential":
    "Un compte existe déjà avec une autre méthode de connexion pour cette même adresse. Essayez avec Google ou l’autre méthode utilisée à l’inscription.",
  "auth/credential-already-in-use": "Ce compte est déjà lié à une autre adresse e-mail.",
  "auth/popup-closed-by-user":
    "La fenêtre Google a été fermée avant la fin ; réessayez la connexion depuis le bouton fourni.",
  "auth/cancelled-popup-request": "Connexion Google annulée ; réessayez si vous souhaitez continuer.",
  "auth/popup-blocked":
    "Votre navigateur a bloqué la fenêtre de connexion. Autorisez les fenêtres pop-up pour ce site puis réessayez.",
  "auth/operation-not-allowed":
    "Cette méthode de connexion n’est pas activée pour l’instant. Contactez le support.",
  "auth/invalid-api-key":
    "Problème de configuration de l’application. Contactez le support technique.",
  "auth/unauthorized-domain":
    "Connexion depuis ce site non autorisée. Contactez le support si vous y accédez depuis une URL légitime.",
  "auth/invalid-phone-number":
    "Le numéro de téléphone n’est pas valide : vérifiez l’indicatif et les chiffres.",
  "auth/missing-phone-number": "Le numéro de téléphone est requis dans ce champ.",
  "auth/captcha-check-failed": "Vérification de sécurité échouée. Rechargez la page et réessayez.",
  "auth/quota-exceeded": "Trop de demandes sur ce service pour le moment. Réessayez plus tard.",

  // ── Firestore / client ──
  "permission-denied":
    "Vous n’avez pas les droits pour cette action ; certaines données sont réservées aux administrateurs ou à un autre rôle.",
  "not-found":
    "Données introuvables (elles ont peut‑être été supprimées ou l’élément demandé n’existe pas).",
  "already-exists": "Cette ressource existe déjà sous un autre enregistrement.",
  "unauthenticated":
    "Votre session a expiré ou vous n’êtes pas connecté. Déconnectez-vous puis reconnectez-vous.",
  "failed-precondition":
    "Cette modification n’est pas possible dans l’état actuel des données.",
  "resource-exhausted": "Limite ou quota dépassé. Réessayez plus tard.",
  "unavailable":
    "Service temporairement indisponible. Réessayez dans quelques minutes.",
  "deadline-exceeded":
    "L’action a mis trop longtemps à répondre. Vérifiez votre connexion et réessayez.",
  "cancelled": "La requête a été annulée.",
  "aborted": "L’opération a été interrompue. Réessayez.",
  "data-loss":
    "Un problème de données a été détecté. Contactez le support si cela persiste.",
  "internal":
    "Erreur technique côté serveur. Réessayez plus tard ou contactez le support.",
  "invalid-argument": "Certaines données envoyées sont invalides. Revérifiez le formulaire.",
  "unknown": "Une erreur inconnue est survenue. Réessayez.",

  // ── Storage ──
  "storage/unauthorized":
    "Vous n’avez pas l’autorisation d’enregistrer ce fichier.",
  "storage/canceled": "Téléchargement ou envoi du fichier annulé.",
  "storage/unknown":
    "Erreur lors du fichier. Vérifiez le fichier (taille, type) et votre connexion.",
  "storage/object-not-found": "Le fichier demandé est introuvable (il est peut‑être déjà supprimé).",
  "storage/quota-exceeded":
    "Espace de stockage saturé ou quota dépassé. Contactez l’organisateur.",
  "storage/retry-limit-exceeded":
    "Téléversement trop instable après plusieurs tentatives. Réessayez avec une meilleure connexion.",
  "storage/invalid-format": "Format de fichier non accepté.",
  "storage/project-not-found": "Projet de fichiers inaccessible. Contactez le support.",
  "storage/bucket-not-found": "Stockage fichier non disponible pour le moment.",
  "storage/invalid-root-operation": "Action non autorisée sur ce dossier.",

  "server-error":
    "Le serveur a rencontré une erreur. Réessayez dans quelques instants ou contactez le support.",
};

function extractCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" && code.length > 0 ? code : undefined;
}

/** Ex. chaîne Firebase complète sans parenthèses : "... auth/invalid-credential." */
function extractInlineFirebaseCode(text: string): string | undefined {
  const m = /\b(auth|storage|firestore)\/[a-z0-9_-]+\b/i.exec(text);
  return m ? m[0] : undefined;
}

function codesFromFirebaseMessage(message: string): string[] {
  const out: string[] = [];
  const re = /\(([a-z]+(?:[_-]?[a-z]+)*\/[^\s),]+)\)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(message)) !== null) {
    const c = m[1];
    if (c) out.push(c);
  }
  return out;
}

function isTechnicalFirebaseMessage(text: string): boolean {
  return /\bFirebase\b|\(auth\/|FirebaseError/i.test(text);
}

/**
 * Libellé utilisateur à partir d’une erreur inconnue, d’une chaîne (ex. message Axios), ou `{ code, message }`.
 */
export function firebaseClientErrorToUserMessage(error: unknown, fallback = DEFAULT_FALLBACK): string {
  if (error == null || error === "") return fallback;

  if (typeof error === "object" && error !== null && "response" in error) {
    const body = (error as { response?: { data?: { message?: unknown } } }).response?.data?.message;
    if (typeof body === "string" && body.trim()) {
      error = body.trim();
    }
  }

  if (typeof error === "string") {
    const t = error.trim();
    if (!t) return fallback;
    if (APP_MESSAGES_KEEP.has(t)) return t;
    for (const c of codesFromFirebaseMessage(t)) {
      if (FIREBASE_CLIENT_MESSAGES[c]) return FIREBASE_CLIENT_MESSAGES[c];
    }
    const inline = extractInlineFirebaseCode(t);
    if (inline && FIREBASE_CLIENT_MESSAGES[inline]) return FIREBASE_CLIENT_MESSAGES[inline];

    if (isTechnicalFirebaseMessage(t)) return fallback;
    if (t.length <= 280) return t;
    return fallback;
  }

  let message = "";
  if (typeof error === "object" && error !== null && "message" in error) {
    message = String((error as { message?: string }).message ?? "").trim();
    if (APP_MESSAGES_KEEP.has(message)) return message;
  }

  const code = extractCode(error);
  const inlineFromMsg = message ? extractInlineFirebaseCode(message) : undefined;
  const tryCodes = [code, inlineFromMsg, ...codesFromFirebaseMessage(message)].filter(
    (c): c is string => typeof c === "string" && c.length > 0,
  );

  for (const c of tryCodes) {
    if (FIREBASE_CLIENT_MESSAGES[c]) return FIREBASE_CLIENT_MESSAGES[c];
  }

  if (message) {
    if (isTechnicalFirebaseMessage(message)) return fallback;
    if (message.length <= 280) return message;
  }

  return fallback;
}
