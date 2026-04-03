import { useState } from 'react';
import { ArrowLeft, HelpCircle, Search, ChevronDown, ChevronUp, Ticket, CreditCard, Calendar, Shield, Users, Smartphone } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useNavigate } from 'react-router-dom';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon: any;
}

const faqs: FAQItem[] = [
  { id: '1', category: 'Achats et Billets', question: 'Comment acheter des billets sur Feeti ?', answer: '1. Parcourez les événements disponibles\n2. Sélectionnez l\'événement qui vous intéresse\n3. Choisissez le nombre et le type de billets\n4. Ajoutez au panier et procédez au paiement\n5. Recevez vos billets électroniques par email avec un QR code unique', icon: Ticket },
  { id: '2', category: 'Achats et Billets', question: 'Quels sont les modes de paiement acceptés ?', answer: 'Nous acceptons plusieurs modes de paiement :\n• Cartes bancaires (Visa, Mastercard) via Stripe\n• Mobile Money (Airtel Money, MTN Mobile Money) via Paystack\n• Cartes prépayées\n\nTous les paiements sont sécurisés et cryptés.', icon: CreditCard },
  { id: '3', category: 'Achats et Billets', question: 'Puis-je annuler ou me faire rembourser mon billet ?', answer: 'Les conditions d\'annulation dépendent de l\'organisateur de l\'événement :\n• Billets généralement non remboursables sauf indication contraire\n• En cas d\'annulation par l\'organisateur : remboursement intégral dans 14 jours\n• Vérifiez la politique de remboursement spécifique avant l\'achat\n\nPour toute demande, contactez support@feeti.cg', icon: Shield },
  { id: '4', category: 'Achats et Billets', question: 'Comment recevoir mes billets électroniques ?', answer: 'Après validation du paiement :\n1. Un email de confirmation est envoyé immédiatement\n2. Le billet électronique avec QR code est joint en PDF\n3. Vous pouvez aussi télécharger vos billets depuis votre compte\n4. Conservez le QR code sur votre smartphone ou imprimez-le', icon: Smartphone },
  { id: '5', category: 'Événements', question: 'Comment trouver des événements près de chez moi ?', answer: 'Utilisez nos filtres de recherche :\n• Sélectionnez votre ville dans le menu déroulant\n• Filtrez par catégorie (Concerts, Sports, Théâtre, etc.)\n• Utilisez la barre de recherche pour un événement spécifique\n• Consultez la section "Événements à proximité" sur la page d\'accueil', icon: Search },
  { id: '6', category: 'Événements', question: 'Puis-je organiser mon propre événement sur Feeti ?', answer: 'Oui ! Créez votre événement en quelques étapes :\n1. Créez un compte organisateur\n2. Cliquez sur "Créer un événement"\n3. Remplissez le formulaire (9 étapes)\n4. Attendez la validation par notre équipe (24-48h)\n5. Une fois approuvé, votre événement est en ligne !', icon: Calendar },
  { id: '7', category: 'Événements', question: 'Que faire si un événement est annulé ou reporté ?', answer: 'Si un événement est annulé :\n• Vous recevrez un email de notification\n• Remboursement automatique sous 14 jours ouvrables\n\nSi un événement est reporté :\n• Votre billet reste valable pour la nouvelle date\n• Si vous ne pouvez pas assister, contactez l\'organisateur', icon: Calendar },
  { id: '8', category: 'Compte Utilisateur', question: 'Comment créer un compte ?', answer: '1. Cliquez sur "Connexion" dans le menu\n2. Sélectionnez "Créer un compte"\n3. Remplissez vos informations (nom, email, mot de passe)\n4. Validez votre email via le lien reçu\n5. Votre compte est prêt !', icon: Users },
  { id: '9', category: 'Compte Utilisateur', question: 'J\'ai oublié mon mot de passe, que faire ?', answer: '1. Cliquez sur "Mot de passe oublié ?" sur la page de connexion\n2. Entrez votre adresse email\n3. Recevez un lien de réinitialisation par email\n4. Créez un nouveau mot de passe sécurisé\n\nSi vous ne recevez pas l\'email, vérifiez vos spams ou contactez support@feeti.cg', icon: Shield },
  { id: '10', category: 'Compte Utilisateur', question: 'Comment retrouver mes billets achetés ?', answer: 'Connectez-vous à votre compte :\n1. Accédez à "Mon Compte"\n2. Cliquez sur "Mes Billets"\n3. Tous vos billets actifs et passés sont listés\n4. Téléchargez ou affichez le QR code pour chaque billet', icon: Ticket },
  { id: '11', category: 'QR Code et Accès', question: 'Comment utiliser mon QR code à l\'entrée ?', answer: 'À l\'entrée de l\'événement :\n1. Ouvrez votre billet électronique (email ou app)\n2. Présentez le QR code à l\'agent de sécurité\n3. Le QR code sera scanné une seule fois\n\n⚠️ Ne partagez jamais votre QR code avant l\'événement !', icon: Smartphone },
  { id: '12', category: 'QR Code et Accès', question: 'Que faire si mon QR code ne fonctionne pas ?', answer: 'Solutions possibles :\n• Augmentez la luminosité de votre écran\n• Téléchargez à nouveau le billet depuis votre compte\n• Imprimez le billet en PDF\n• Contactez l\'équipe sur place avec votre email de confirmation', icon: HelpCircle },
  { id: '13', category: 'Sécurité', question: 'Mes données de paiement sont-elles sécurisées ?', answer: 'Oui, absolument :\n• Nous utilisons le cryptage SSL/TLS pour toutes les transactions\n• Les paiements sont traités par Stripe et Paystack\n• Nous ne stockons JAMAIS vos coordonnées bancaires complètes\n• Conformité PCI-DSS', icon: Shield },
  { id: '14', category: 'Sécurité', question: 'Comment protégez-vous mes données personnelles ?', answer: 'Protection RGPD et législation congolaise :\n• Cryptage de toutes les données sensibles\n• Accès restreint aux employés autorisés\n• Audits de sécurité réguliers\n• Droit d\'accès, modification et suppression de vos données', icon: Shield },
  { id: '15', category: 'Support Technique', question: 'Je ne reçois pas les emails de Feeti', answer: 'Vérifiez :\n1. Dossier spam/courrier indésirable\n2. L\'adresse email dans votre compte est correcte\n3. Ajoutez noreply@feeti.cg à vos contacts\n\nSi le problème persiste, contactez support@feeti.cg avec votre numéro de commande.', icon: HelpCircle },
  { id: '16', category: 'Support Technique', question: 'L\'application ne fonctionne pas correctement', answer: 'Solutions de dépannage :\n• Videz le cache de votre navigateur\n• Mettez à jour votre navigateur\n• Essayez en navigation privée\n• Vérifiez votre connexion Internet\n\nSi aucune solution ne fonctionne, contactez support@feeti.cg', icon: HelpCircle },
];

export function FAQPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const categories = ['Tous', ...Array.from(new Set(faqs.map(f => f.category)))];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

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
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Foire Aux Questions (FAQ)</h1>
              <p className="text-gray-600 mt-1">Trouvez rapidement des réponses à vos questions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher une question..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map(category => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className={`cursor-pointer px-4 py-2 text-sm ${selectedCategory === category ? 'bg-indigo-600 hover:bg-indigo-700' : 'hover:bg-gray-100'}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg text-gray-600">Aucune question trouvée</p>
                <p className="text-gray-500 mt-2">Essayez une autre recherche ou catégorie</p>
              </CardContent>
            </Card>
          ) : (
            filteredFAQs.map(faq => {
              const Icon = faq.icon;
              const isOpen = openItems.includes(faq.id);
              return (
                <Card
                  key={faq.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${isOpen ? 'ring-2 ring-indigo-500' : ''}`}
                  onClick={() => toggleItem(faq.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <Badge variant="outline" className="mb-2 text-xs">{faq.category}</Badge>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                          </div>
                          <Button variant="ghost" size="sm" className="flex-shrink-0">
                            {isOpen ? <ChevronUp className="w-5 h-5 text-indigo-600" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                          </Button>
                        </div>
                        {isOpen && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="text-gray-700 leading-relaxed whitespace-pre-line">{faq.answer}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <Card className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 border-0">
          <CardContent className="p-8 text-center text-white">
            <HelpCircle className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Vous ne trouvez pas votre réponse ?</h3>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">Notre équipe de support est disponible pour vous aider.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button className="bg-white text-indigo-600 hover:bg-gray-100">Nous Contacter</Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">support@feeti.cg</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
