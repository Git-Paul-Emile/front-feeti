import { ArrowLeft, DollarSign, CheckCircle, XCircle, AlertTriangle, Clock, FileText, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useNavigate } from 'react-router-dom';

export function RefundPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Politique de Remboursement de Ticket</h1>
              <p className="text-gray-600 mt-1">Version 1.0 | Entrée en vigueur : 08 mars 2026</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <Card className="mb-8 border-green-200 bg-white/80 backdrop-blur">
            <CardContent className="p-8">
              <p className="text-lg leading-relaxed text-gray-700">
                Nous comprenons que les imprévus arrivent. Cette politique définit les conditions dans lesquelles vous pouvez
                obtenir un remboursement pour vos achats de billets sur <strong className="text-green-600">Feeti</strong>, de manière équitable et transparente.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <FileText className="w-6 h-6 text-green-600" />
                1. Principe général
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>Les billets achetés sur Feeti sont en principe <strong>non remboursables</strong> une fois la transaction finalisée, sauf dans les cas expressément prévus ci-dessous.</p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <CheckCircle className="w-6 h-6 text-green-600" />
                2. Cas donnant droit à un remboursement intégral
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">2.1 Annulation de l'événement par l'organisateur</h3>
                <p>Si un événement est annulé définitivement, vous serez <strong>automatiquement remboursé</strong> dans un délai de 7 à 14 jours ouvrables.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">2.2 Report ou modification majeure de l'événement</h3>
                <p>Si l'événement est reporté à plus de 30 jours ou si des éléments essentiels changent, vous avez <strong>72 heures</strong> à compter de la notification pour demander un remboursement.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">2.3 Problème technique imputable à Feeti</h3>
                <p>Si une panne technique de notre plateforme vous empêche d'accéder à un live streaming, un remboursement ou un avoir vous sera proposé après vérification.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">3. Remboursement à la demande de l'acheteur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">3.1 Délai de rétractation</h3>
                <p>Vous disposez d'un délai de <strong>24 heures</strong> après l'achat pour annuler votre commande, à condition que l'événement ait lieu dans plus de 7 jours.</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">3.2 Cas non éligibles au remboursement</h3>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <ul className="space-y-2">
                    {[
                      'Billet non utilisé par choix personnel',
                      'Erreur lors de l\'achat non signalée dans les 24h',
                      'Refus d\'entrée dû à un non-respect des conditions de l\'événement',
                      'Accès impossible en raison d\'un problème de connexion côté utilisateur',
                      'Billet perdu ou volé',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
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
                <MessageSquare className="w-6 h-6 text-green-600" />
                4. Procédure de demande de remboursement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Rendez-vous dans la rubrique "Mes billets" de votre compte Feeti</li>
                <li>Sélectionnez le billet concerné et cliquez sur "Demander un remboursement"</li>
                <li>Décrivez le motif de votre demande</li>
                <li>Notre équipe vous répond dans un délai de <strong>3 jours ouvrables</strong></li>
              </ol>
              <p>Ou par email : <a href="mailto:remboursement@feeti.com" className="text-green-600 hover:underline font-medium">remboursement@feeti.com</a></p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <Clock className="w-6 h-6 text-green-600" />
                5. Modalités de remboursement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Le remboursement est effectué via le même moyen de paiement utilisé lors de l'achat</li>
                <li><strong>Mobile money :</strong> remboursement sous 3 à 7 jours ouvrables</li>
                <li><strong>Carte bancaire :</strong> remboursement sous 5 à 10 jours ouvrables</li>
                <li>Feeti peut proposer un <strong>avoir</strong> d'une valeur équivalente comme alternative</li>
              </ul>
              <p className="text-sm bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                ℹ️ Les frais de service ne sont pas remboursables, sauf en cas d'annulation totale de l'événement par l'organisateur.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                6. Litiges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>En cas de désaccord sur une décision de remboursement, vous pouvez escalader votre réclamation à : <a href="mailto:reclamations@feeti.com" className="text-green-600 hover:underline font-medium">reclamations@feeti.com</a>.</p>
            </CardContent>
          </Card>

          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-center text-white">
            <CheckCircle className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Politique Équitable et Transparente</h3>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">Notre objectif est de traiter chaque demande de remboursement de manière juste et rapide.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={() => navigate(-1)} className="bg-white text-green-600 hover:bg-gray-100">Retour</Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10"
                onClick={() => window.location.href = 'mailto:remboursement@feeti.com'}>
                <MessageSquare className="w-4 h-4 mr-2" />Demander un Remboursement
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
