import { ArrowLeft, Cookie, Shield, BarChart3, Settings, Target, Clock, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useNavigate } from 'react-router-dom';

export function CookiePolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Cookie className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Politique de Cookies</h1>
              <p className="text-gray-600 mt-1">Version 1.0 | Entrée en vigueur : 08 mars 2026</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <Card className="mb-8 border-purple-200 bg-white/80 backdrop-blur">
            <CardContent className="p-8">
              <p className="text-lg leading-relaxed text-gray-700">
                Pour vous offrir la meilleure expérience possible, <strong className="text-purple-600">Feeti</strong> utilise des cookies
                et technologies similaires. Cette politique vous explique clairement de quoi il s'agit et comment vous pouvez les contrôler.
                La bannière de consentement est gérée par <strong>CookieYes</strong>, un service certifié conforme.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <Cookie className="w-6 h-6 text-purple-600" />
                1. Qu'est-ce qu'un cookie ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, smartphone, tablette) lorsque vous visitez un site web. Les cookies permettent au site de mémoriser vos préférences, d'assurer votre connexion et d'analyser l'utilisation du service.</p>
              <p>Les cookies ne peuvent pas accéder à d'autres fichiers sur votre appareil, ni contenir de virus.</p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">2. Les cookies que nous utilisons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-gray-700 leading-relaxed">
              <div>
                <h3 className="flex items-center gap-2 font-semibold text-lg text-gray-900 mb-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  2.1 Cookies strictement nécessaires (toujours actifs)
                </h3>
                <p className="mb-3">Ces cookies sont indispensables au fonctionnement de la plateforme. Sans eux, vous ne pourriez pas vous connecter ni acheter des billets.</p>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <ul className="space-y-2">
                    {[
                      ['Cookie de session', 'maintient votre connexion active pendant votre visite'],
                      ['Cookie de panier', 'mémorise vos billets en cours d\'achat'],
                      ['Cookie de sécurité', 'protège contre les attaques CSRF et fraudes'],
                    ].map(([name, desc]) => (
                      <li key={name} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                        <span><strong>{name} :</strong> {desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="flex items-center gap-2 font-semibold text-lg text-gray-900 mb-3">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  2.2 Cookies de performance et d'analyse (avec votre accord)
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <span><strong>Mesure d'audience :</strong> pages les plus visitées, temps passé, parcours utilisateur</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <span><strong>Cartes de chaleur :</strong> pour améliorer l'interface utilisateur</span>
                    </li>
                  </ul>
                </div>
                <p className="text-sm bg-blue-50 p-3 rounded-lg border border-blue-200 mt-3">
                  ℹ️ Les données collectées par ces cookies sont anonymisées.
                </p>
              </div>

              <div>
                <h3 className="flex items-center gap-2 font-semibold text-lg text-gray-900 mb-3">
                  <Settings className="w-5 h-5 text-purple-600" />
                  2.3 Cookies de personnalisation (avec votre accord)
                </h3>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <ul className="space-y-2">
                    {['Langue et région préférées', 'Types d\'événements favoris', 'Historique de navigation pour des recommandations pertinentes'].map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="flex items-center gap-2 font-semibold text-lg text-gray-900 mb-3">
                  <Target className="w-5 h-5 text-orange-600" />
                  2.4 Cookies publicitaires (avec votre accord)
                </h3>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <ul className="space-y-2">
                    {['Ciblage basé sur vos interactions avec la plateforme', 'Mesure de l\'efficacité des campagnes publicitaires', 'Partage limité avec nos partenaires publicitaires de confiance'].map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
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
                <Clock className="w-6 h-6 text-purple-600" />
                3. Durée de conservation des cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700 leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['Cookies de session', 'Supprimés à la fermeture de votre navigateur'],
                  ['Cookies de préférence', '12 mois maximum'],
                  ['Cookies analytiques', '13 mois maximum'],
                  ['Cookies publicitaires', '13 mois maximum'],
                ].map(([name, duration]) => (
                  <div key={name} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="font-semibold text-gray-900 mb-1">{name}</div>
                    <div className="text-sm">{duration}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <Settings className="w-6 h-6 text-purple-600" />
                4. Comment gérer vos cookies ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>À votre première visite sur Feeti, un bandeau CookieYes vous permet d'accepter ou de refuser les cookies non essentiels. Vous pouvez modifier vos choix à tout moment via :</p>
              <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                <ul className="space-y-3">
                  {[
                    ['Centre de gestion des cookies', 'Accessible dans le pied de page du site (lien "Gérer mes cookies")'],
                    ['Paramètres de votre navigateur', 'Chrome, Firefox, Safari, Opera, etc.'],
                    ['Outils de désactivation', 'Des régies publicitaires'],
                  ].map(([title, desc], i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">{i + 1}</div>
                      <div>
                        <div className="font-semibold text-gray-900">{title}</div>
                        <div className="text-sm">{desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-center text-white">
            <Cookie className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Transparence et Contrôle</h3>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">Nous croyons en votre droit de contrôler vos données. Gérez vos préférences de cookies à tout moment.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={() => navigate(-1)} className="bg-white text-purple-600 hover:bg-gray-100">Retour</Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10"
                onClick={() => window.location.href = 'mailto:privacy@feeti.com'}>
                <Mail className="w-4 h-4 mr-2" />Contact
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
