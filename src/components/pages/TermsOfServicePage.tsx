import { ArrowLeft, FileText, UserCheck, ShoppingCart, Video, Scale, AlertTriangle, Ban, XCircle, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useNavigate } from 'react-router-dom';

export function TermsOfServicePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Conditions Générales d'Utilisation</h1>
              <p className="text-gray-600 mt-1">Version 1.0 | Entrée en vigueur : 08 mars 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <Card className="mb-8 border-indigo-200 bg-white/80 backdrop-blur">
            <CardContent className="p-8">
              <p className="text-lg leading-relaxed text-gray-700">
                Les présentes Conditions Générales d'Utilisation (CGU) définissent les règles qui encadrent votre utilisation
                de la plateforme <strong className="text-indigo-600">Feeti</strong>. En vous inscrivant ou en utilisant nos services, vous acceptez ces conditions.
                Si quelque chose n'est pas clair, notre équipe est disponible à <a href="mailto:support@feeti.com" className="text-indigo-600 hover:underline">support@feeti.com</a>.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <FileText className="w-6 h-6 text-indigo-600" />
                1. Présentation de Feeti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>Feeti est une plateforme numérique dédiée aux événements du bassin du Congo. Elle vous permet de :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Trouver et acheter des billets pour des événements culturels, musicaux, sportifs et autres</li>
                <li>Regarder des événements en direct (live streaming) depuis chez vous</li>
                <li>Rester informé des actualités culturelles et événementielles de votre région</li>
                <li>Pour les organisateurs : promouvoir vos événements et vendre des billets en ligne</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <UserCheck className="w-6 h-6 text-indigo-600" />
                2. Inscription et compte utilisateur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">2.1 Création de compte</h3>
                <p>Pour accéder à la plupart de nos services, vous devez créer un compte en fournissant des informations exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">2.2 Conditions d'inscription</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Être âgé d'au moins 16 ans</li>
                  <li>Fournir une adresse e-mail valide et un numéro de téléphone actif</li>
                  <li>Ne pas usurper l'identité d'une autre personne</li>
                  <li>Ne pas créer plusieurs comptes pour contourner des restrictions</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">2.3 Sécurité de votre compte</h3>
                <p>Vous êtes seul responsable des activités réalisées depuis votre compte. En cas d'accès non autorisé, contactez-nous immédiatement à <a href="mailto:security@feeti.com" className="text-indigo-600 hover:underline">security@feeti.com</a>.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">3. Utilisation de la plateforme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">3.1 Ce que vous pouvez faire</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Consulter les événements disponibles et acheter des billets</li>
                  <li>Accéder aux lives payants que vous avez acquis</li>
                  <li>Partager des événements sur vos réseaux sociaux</li>
                  <li>Contacter le support en cas de problème</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">3.2 Ce qui est interdit</h3>
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <p className="font-medium text-red-900 mb-3">Les comportements suivants sont strictement interdits :</p>
                  <ul className="space-y-2">
                    {[
                      'Revente non autorisée de billets au-delà du prix d\'achat (scalping)',
                      'Utilisation de robots ou scripts pour acheter des billets en masse',
                      'Toute tentative de fraude ou de contournement du système de paiement',
                      'Partage non autorisé de liens de streaming payants',
                      'Publication de contenus illégaux ou diffamatoires',
                      'Collecte non autorisée de données personnelles d\'autres utilisateurs',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Ban className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <ShoppingCart className="w-6 h-6 text-indigo-600" />
                4. Achats de billets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">4.1 Processus d'achat</h3>
                <p>L'achat d'un billet sur Feeti se fait en quelques étapes : sélection de l'événement, choix du type de billet, paiement sécurisé, réception de la confirmation par e-mail. Votre billet est valide uniquement s'il porte un QR code authentifié par notre système.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">4.2 Prix et paiement</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Les prix sont affichés en Franc CFA (FCFA), toutes taxes comprises</li>
                  <li>Feeti accepte les paiements par mobile money, carte bancaire et autres moyens sécurisés</li>
                  <li>Le paiement est exigé au moment de la commande</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">4.3 Frais de service</h3>
                <p>Des frais de service peuvent s'appliquer à chaque transaction. Ils sont clairement indiqués avant la validation de votre commande.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <Video className="w-6 h-6 text-indigo-600" />
                5. Live streaming
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>Feeti propose des accès à des événements en direct via des systèmes Pay-Per-View. En achetant un accès :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Vous bénéficiez d'un accès personnel et non transférable au contenu</li>
                <li>Il est strictement interdit d'enregistrer, copier ou redistribuer ce contenu</li>
                <li>L'accès peut être révoqué sans remboursement en cas de violation de ces conditions</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <Scale className="w-6 h-6 text-indigo-600" />
                6. Propriété intellectuelle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>Tout le contenu de Feeti (logo, design, textes, code, vidéos, données) est la propriété exclusive de Feeti ou de ses partenaires. Toute reproduction sans autorisation écrite préalable est interdite et constitue une contrefaçon.</p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <XCircle className="w-6 h-6 text-red-600" />
                7. Suspension et résiliation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p className="font-medium">Feeti peut suspendre ou résilier votre compte en cas de :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violation de ces CGU</li>
                <li>Comportement frauduleux avéré</li>
                <li>Non-paiement de sommes dues</li>
                <li>Inactivité prolongée (plus de 24 mois sans connexion)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <Scale className="w-6 h-6 text-indigo-600" />
                8. Droit applicable et règlement des litiges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>Les présentes CGU sont régies par le droit de la République du Congo, par les actes uniformes de l'OHADA applicables, et par les réglementations sectorielles en vigueur dans les pays du bassin du Congo.</p>
              <p>En cas de litige, contactez-nous à <a href="mailto:support@feeti.com" className="text-indigo-600 hover:underline">support@feeti.com</a>.</p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                9. Modifications des CGU
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>Feeti peut modifier ces CGU à tout moment. Toute modification substantielle sera communiquée par e-mail au moins 15 jours avant son entrée en vigueur.</p>
            </CardContent>
          </Card>

          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-8 text-center text-white">
            <FileText className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Conditions Claires et Équitables</h3>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
              Ces conditions sont conçues pour garantir une expérience sûre et agréable pour tous les utilisateurs de Feeti.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={() => navigate(-1)} className="bg-white text-indigo-600 hover:bg-gray-100">
                Retour
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10"
                onClick={() => window.location.href = 'mailto:support@feeti.com'}>
                <Mail className="w-4 h-4 mr-2" />
                Nous Contacter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
