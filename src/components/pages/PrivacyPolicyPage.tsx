import { ArrowLeft, Shield, Lock, Eye, Database, Mail, Users, Clock, Globe, Baby } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useNavigate } from 'react-router-dom';

export function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Politique de Confidentialité</h1>
              <p className="text-gray-600 mt-1">Version 1.0 | Entrée en vigueur : 08 mars 2026</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <Card className="mb-8 border-indigo-200 bg-white/80 backdrop-blur">
            <CardContent className="p-8">
              <p className="text-lg leading-relaxed text-gray-700">
                Chez <strong className="text-indigo-600">Feeti</strong>, votre vie privée n'est pas une formalité, c'est une priorité.
                Ce document vous explique, de manière claire et honnête, quelles informations nous collectons, pourquoi nous les utilisons,
                et comment nous les protégeons.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <Users className="w-6 h-6 text-indigo-600" />
                1. Qui sommes-nous ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>Feeti est une plateforme numérique spécialisée dans la billetterie en ligne, la promotion d'événements et le live streaming pour le bassin du Congo.</p>
              <div className="bg-indigo-50 p-6 rounded-lg">
                <ul className="space-y-2">
                  <li><strong>Raison sociale :</strong> Feeti SAS</li>
                  <li><strong>Siège social :</strong> [Adresse complète - République du Congo / RDC]</li>
                  <li><strong>Courriel :</strong> <a href="mailto:privacy@feeti.com" className="text-indigo-600 hover:underline">privacy@feeti.com</a></li>
                  <li><strong>DPD :</strong> <a href="mailto:dpo@feeti.com" className="text-indigo-600 hover:underline">dpo@feeti.com</a></li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <Database className="w-6 h-6 text-indigo-600" />
                2. Quelles données collectons-nous ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">2.1 Données que vous nous fournissez directement</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Prénom, nom, adresse e-mail, numéro de téléphone lors de votre inscription</li>
                  <li>Informations de paiement (via nos partenaires sécurisés — nous ne stockons jamais votre numéro de carte)</li>
                  <li>Photo de profil si vous choisissez d'en ajouter une</li>
                  <li>Contenu que vous partagez : commentaires, avis, messages envoyés au support</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">2.2 Données collectées automatiquement</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Adresse IP, type de navigateur, système d'exploitation</li>
                  <li>Pages visitées, durée de visite, événements consultés</li>
                  <li>Données de géolocalisation approximative (avec votre accord)</li>
                  <li>Identifiants cookies et traceurs (voir notre Politique de Cookies)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">2.3 Données reçues de tiers</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Si vous vous connectez via Google ou Facebook, nous recevons uniquement les informations que vous autorisez</li>
                  <li>Données issues de nos partenaires de paiement mobile money (Airtel, Orange, etc.)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <Eye className="w-6 h-6 text-indigo-600" />
                3. Pourquoi utilisons-nous vos données ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Créer et gérer votre compte utilisateur</li>
                <li>Traiter vos achats de billets et vous envoyer vos confirmations</li>
                <li>Vous permettre d'accéder aux lives et événements que vous avez payés</li>
                <li>Vous envoyer des notifications sur les événements susceptibles de vous intéresser (avec votre accord)</li>
                <li>Améliorer continuellement notre plateforme grâce à l'analyse des usages</li>
                <li>Lutter contre la fraude, les faux billets et les usages abusifs</li>
                <li>Respecter nos obligations légales et comptables</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <Clock className="w-6 h-6 text-indigo-600" />
                4. Combien de temps conservons-nous vos données ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Données de compte actif :</strong> pendant toute la durée de votre utilisation + 3 ans après fermeture</li>
                <li><strong>Données de transaction :</strong> 10 ans (obligation comptable et fiscale)</li>
                <li><strong>Données de navigation / cookies :</strong> de 30 jours à 13 mois maximum</li>
                <li><strong>Données relatives aux billets :</strong> 5 ans à compter de l'événement</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <Users className="w-6 h-6 text-indigo-600" />
                5. Partageons-nous vos données ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p className="font-semibold text-gray-900">Nous ne vendons jamais vos données personnelles. Nous pouvons cependant les partager dans les cas suivants :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Avec nos prestataires techniques (hébergement, paiement, SMS, email) contractuellement tenus de les protéger</li>
                <li>Avec les organisateurs d'événements : uniquement les informations nécessaires à la validation des billets</li>
                <li>Avec les autorités compétentes si la loi l'exige ou en cas de procédure judiciaire</li>
                <li>En cas de fusion ou cession d'activité, après vous en avoir informé</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <Shield className="w-6 h-6 text-indigo-600" />
                6. Vos droits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
                <li><strong>Droit de rectification :</strong> corriger des informations inexactes</li>
                <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
                <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements, notamment le marketing</li>
                <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format lisible</li>
                <li><strong>Droit de retirer votre consentement</strong> à tout moment</li>
              </ul>
              <p className="mt-4 font-medium">Pour exercer vos droits : <a href="mailto:privacy@feeti.com" className="text-indigo-600 hover:underline">privacy@feeti.com</a>. Nous répondons dans un délai de 30 jours.</p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <Lock className="w-6 h-6 text-indigo-600" />
                7. Sécurité de vos données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Chiffrement SSL/TLS de toutes les communications</li>
                <li>Accès aux données limité au personnel autorisé</li>
                <li>Audits de sécurité réguliers</li>
                <li>Procédures de gestion des incidents</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <Globe className="w-6 h-6 text-indigo-600" />
                8. Transferts internationaux
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>Feeti opère principalement dans le bassin du Congo. Si des données sont transférées vers des pays tiers pour des raisons techniques (hébergement cloud), nous veillons à ce que des garanties adéquates soient en place.</p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <Baby className="w-6 h-6 text-indigo-600" />
                9. Mineurs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>Feeti n'est pas destinée aux personnes de moins de 16 ans. Contactez-nous à <a href="mailto:privacy@feeti.com" className="text-indigo-600 hover:underline">privacy@feeti.com</a> si vous pensez qu'un mineur nous a fourni ses données.</p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">10. Modifications de cette politique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>Cette politique peut évoluer. En cas de changement important, nous vous en informerons par e-mail au moins 15 jours avant l'entrée en vigueur.</p>
            </CardContent>
          </Card>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-center text-white">
            <Shield className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Votre Confiance est Notre Priorité</h3>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">Nous nous engageons à protéger vos données personnelles et à respecter votre vie privée.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={() => navigate(-1)} className="bg-white text-indigo-600 hover:bg-gray-100">Retour</Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10"
                onClick={() => window.location.href = 'mailto:privacy@feeti.com'}>
                <Mail className="w-4 h-4 mr-2" />Nous Contacter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
