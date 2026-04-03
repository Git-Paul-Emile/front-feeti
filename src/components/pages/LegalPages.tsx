import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft } from 'lucide-react';

interface LegalPagesProps {
  page: 'terms' | 'privacy' | 'cookies' | 'faq' | 'contact' | 'refund';
  onBack: () => void;
}

export function LegalPages({ page, onBack }: LegalPagesProps) {
  const getPageContent = () => {
    switch (page) {
      case 'terms':
        return {
          title: "Conditions Générales d'Utilisation",
          content: (
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Objet</h2>
                <p className="text-gray-700 leading-relaxed">
                  Les présentes conditions générales d'utilisation (CGU) régissent l'utilisation 
                  de la plateforme Feeti, service de billetterie en ligne et de diffusion 
                  d'événements en streaming.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Accès au service</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  L'accès à Feeti est gratuit. Cependant, certains services peuvent être payants :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Achat de billets pour des événements</li>
                  <li>Accès à des contenus en streaming payants</li>
                  <li>Services premium pour les organisateurs</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Inscription et compte utilisateur</h2>
                <p className="text-gray-700 leading-relaxed">
                  Pour utiliser certains services de Feeti, vous devez créer un compte en 
                  fournissant des informations exactes et à jour. Vous êtes responsable de 
                  la confidentialité de vos identifiants de connexion.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Achat de billets</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Lors de l'achat de billets :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Les prix affichés sont TTC</li>
                  <li>Le paiement est sécurisé via nos partenaires certifiés</li>
                  <li>Un billet électronique vous sera envoyé par email</li>
                  <li>Les conditions d'annulation varient selon l'organisateur</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Streaming et contenu</h2>
                <p className="text-gray-700 leading-relaxed">
                  Les contenus en streaming sont protégés par le droit d'auteur. Il est 
                  interdit de les enregistrer, diffuser ou redistribuer sans autorisation.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Responsabilités</h2>
                <p className="text-gray-700 leading-relaxed">
                  Feeti agit en tant qu'intermédiaire entre les organisateurs d'événements 
                  et les utilisateurs. Nous ne sommes pas responsables du contenu des 
                  événements ou de leur déroulement.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Modifications des CGU</h2>
                <p className="text-gray-700 leading-relaxed">
                  Ces conditions peuvent être modifiées à tout moment. Les utilisateurs 
                  seront informés des changements importants par email ou notification 
                  sur la plateforme.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Contact</h2>
                <p className="text-gray-700 leading-relaxed">
                  Pour toute question concernant ces conditions, contactez-nous à : 
                  <a href="mailto:legal@feeti.com" className="text-indigo-600 hover:underline ml-1">
                    legal@feeti.com
                  </a>
                </p>
              </section>
            </div>
          )
        };

      case 'privacy':
        return {
          title: "Politique de Confidentialité",
          content: (
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Collecte des données</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Nous collectons les données suivantes :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Informations d'inscription (nom, email, téléphone)</li>
                  <li>Données de navigation et d'utilisation</li>
                  <li>Informations de paiement (traitées par nos partenaires sécurisés)</li>
                  <li>Préférences et historique d'événements</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Utilisation des données</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Vos données sont utilisées pour :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Fournir nos services de billetterie et streaming</li>
                  <li>Traiter vos commandes et paiements</li>
                  <li>Vous envoyer des confirmations et rappels</li>
                  <li>Améliorer nos services</li>
                  <li>Vous proposer des événements personnalisés (avec votre consentement)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Partage des données</h2>
                <p className="text-gray-700 leading-relaxed">
                  Nous ne vendons jamais vos données personnelles. Nous pouvons les partager 
                  uniquement avec :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
                  <li>Les organisateurs d'événements (pour les billets achetés)</li>
                  <li>Nos prestataires techniques (hébergement, paiement)</li>
                  <li>Les autorités légales si requis par la loi</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Vos droits</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Droit d'accès à vos données</li>
                  <li>Droit de rectification</li>
                  <li>Droit à l'effacement</li>
                  <li>Droit à la portabilité</li>
                  <li>Droit d'opposition au traitement</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Sécurité</h2>
                <p className="text-gray-700 leading-relaxed">
                  Nous mettons en œuvre des mesures techniques et organisationnelles 
                  appropriées pour protéger vos données contre l'accès non autorisé, 
                  la modification, la divulgation ou la destruction.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Conservation des données</h2>
                <p className="text-gray-700 leading-relaxed">
                  Nous conservons vos données personnelles uniquement le temps nécessaire 
                  aux finalités pour lesquelles elles ont été collectées, conformément 
                  aux obligations légales.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact</h2>
                <p className="text-gray-700 leading-relaxed">
                  Pour exercer vos droits ou toute question sur cette politique, 
                  contactez notre délégué à la protection des données : 
                  <a href="mailto:dpo@feeti.com" className="text-indigo-600 hover:underline ml-1">
                    dpo@feeti.com
                  </a>
                </p>
              </section>
            </div>
          )
        };

      case 'cookies':
        return {
          title: "Politique des Cookies",
          content: (
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Qu'est-ce qu'un cookie ?</h2>
                <p className="text-gray-700 leading-relaxed">
                  Un cookie est un petit fichier texte déposé sur votre appareil lors de 
                  la visite d'un site web. Il permet de mémoriser des informations sur 
                  votre navigation et vos préférences.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Types de cookies utilisés</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Cookies essentiels</h3>
                    <p className="text-gray-700">
                      Nécessaires au fonctionnement du site (authentification, panier, sécurité)
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">Cookies de performance</h3>
                    <p className="text-gray-700">
                      Collectent des informations anonymes sur l'utilisation du site pour l'améliorer
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">Cookies de personnalisation</h3>
                    <p className="text-gray-700">
                      Mémorisent vos préférences (langue, région, événements favoris)
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">Cookies marketing</h3>
                    <p className="text-gray-700">
                      Utilisés pour afficher des publicités personnalisées (avec votre consentement)
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Cookies tiers</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Nous utilisons également des cookies de services tiers :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Google Analytics (analyse d'audience)</li>
                  <li>Stripe (traitement des paiements)</li>
                  <li>YouTube (lecteur vidéo intégré)</li>
                  <li>Réseaux sociaux (boutons de partage)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Gestion des cookies</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Vous pouvez contrôler l'utilisation des cookies :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Via le bandeau de consentement lors de votre première visite</li>
                  <li>Dans les paramètres de votre navigateur</li>
                  <li>En utilisant des outils de blocage des cookies</li>
                  <li>En nous contactant pour exercer vos droits</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Durée de conservation</h2>
                <p className="text-gray-700 leading-relaxed">
                  La durée de conservation des cookies varie selon leur type :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
                  <li>Cookies de session : supprimés à la fermeture du navigateur</li>
                  <li>Cookies persistants : conservés jusqu'à 13 mois maximum</li>
                  <li>Cookies tiers : selon les politiques de chaque service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Mise à jour</h2>
                <p className="text-gray-700 leading-relaxed">
                  Cette politique peut être mise à jour pour refléter les changements 
                  dans nos pratiques ou la réglementation. La date de dernière 
                  modification est indiquée en bas de cette page.
                </p>
              </section>
            </div>
          )
        };

      case 'faq':
        return {
          title: "Questions Fréquemment Posées (FAQ)",
          content: (
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">🎫 Billeterie & Achat</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Comment acheter un billet ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Recherchez votre événement, cliquez sur "Acheter", sélectionnez vos billets, 
                      créez un compte ou connectez-vous, puis procédez au paiement sécurisé. 
                      Vous recevrez vos billets par email immédiatement.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Quels moyens de paiement acceptez-vous ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Nous acceptons les cartes Visa, Mastercard, et les paiements mobiles via 
                      nos partenaires sécurisés Stripe et Paystack. Tous les paiements sont 
                      chiffrés et sécurisés.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Puis-je annuler ma commande ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Les conditions d'annulation dépendent de l'organisateur de l'événement. 
                      Consultez les conditions spécifiques sur la page de l'événement ou 
                      contactez-nous pour plus d'informations.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">📱 Billets Électroniques</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Comment présenter mon billet à l'entrée ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Présentez votre billet électronique directement depuis votre smartphone 
                      ou imprimez-le. Le code QR sera scanné à l'entrée pour valider votre accès.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Je n'ai pas reçu mon billet par email</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Vérifiez vos spams/courriers indésirables. Si vous ne trouvez pas votre billet, 
                      connectez-vous à votre compte Feeti ou contactez notre support avec votre 
                      numéro de commande.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Mon code QR ne fonctionne pas</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Assurez-vous que l'écran de votre téléphone est propre et lumineux. 
                      Si le problème persiste, présentez votre pièce d'identité avec le numéro 
                      de billet à l'accueil de l'événement.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">📺 Streaming & Événements Live</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Comment accéder à un événement en streaming ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Achetez votre billet d'accès, puis cliquez sur "Voir le Live" à l'heure 
                      de l'événement. Vous serez automatiquement dirigé vers la plateforme 
                      de streaming sécurisée.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Puis-je regarder l'événement en replay ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Cela dépend de l'organisateur. Certains événements sont disponibles en 
                      replay pendant une durée limitée. Cette information est précisée sur 
                      la page de l'événement.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Problèmes de connexion au streaming</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Vérifiez votre connexion internet, actualisez la page, ou essayez 
                      avec un autre navigateur. Pour une assistance technique immédiate, 
                      contactez notre support pendant l'événement.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">👥 Compte & Profil</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Comment créer un compte ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Cliquez sur "Se connecter" puis "Créer un compte". Renseignez votre 
                      email et mot de passe. Vous pouvez aussi créer un compte lors de 
                      votre premier achat.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">J'ai oublié mon mot de passe</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Sur la page de connexion, cliquez sur "Mot de passe oublié" et suivez 
                      les instructions envoyées par email pour réinitialiser votre mot de passe.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Comment modifier mes informations personnelles ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Connectez-vous à votre compte, allez dans "Mon Profil" et modifiez 
                      vos informations. N'oubliez pas de sauvegarder vos changements.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">🏢 Pour les Organisateurs</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Comment créer un événement sur Feeti ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Créez un compte organisateur, accédez au tableau de bord organisateur, 
                      et cliquez sur "Créer un événement". Remplissez les informations et 
                      soumettez pour validation.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Quelles sont vos commissions ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Nos frais de service sont compétitifs et transparents. Contactez notre 
                      équipe commerciale pour obtenir un devis personnalisé selon votre type 
                      d'événement et votre volume.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Comment scanner les billets à l'entrée ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Utilisez notre application mobile de vérification ou notre interface web. 
                      Chaque billet dispose d'un code QR unique pour une vérification instantanée.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )
        };

      case 'contact':
        return {
          title: "Nous Contacter",
          content: (
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">📞 Contacts Principaux</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-indigo-50 rounded-lg p-6">
                    <h3 className="font-semibold text-indigo-900 mb-3 flex items-center">
                      <span className="text-2xl mr-2">🎫</span>
                      Support Billetterie
                    </h3>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Email:</strong> <a href="mailto:support@feeti.com" className="text-indigo-600 hover:underline">support@feeti.com</a></p>
                      <p><strong>Téléphone:</strong> <a href="tel:+242981231923" className="text-indigo-600 hover:underline">+242 981-23-19-23</a></p>
                      <p><strong>Horaires:</strong> Lun-Ven 8h-20h, Sam-Dim 10h-18h</p>
                      <p className="text-sm text-gray-600 italic">Pour vos questions sur les achats, billets et événements</p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                      <span className="text-2xl mr-2">🏢</span>
                      Support Organisateurs
                    </h3>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Email:</strong> <a href="mailto:pro@feeti.com" className="text-green-600 hover:underline">pro@feeti.com</a></p>
                      <p><strong>Téléphone:</strong> <a href="tel:+242981231924" className="text-green-600 hover:underline">+242 981-23-19-24</a></p>
                      <p><strong>Horaires:</strong> Lun-Ven 9h-18h</p>
                      <p className="text-sm text-gray-600 italic">Pour les partenariats et la création d'événements</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">🏬 Nos Bureaux</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">🇨🇬 Siège Social - Brazzaville</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p className="text-gray-700">
                        <strong>Adresse:</strong><br />
                        Avenue Félix Eboué, Immeuble Centre Ville<br />
                        Plateau, Brazzaville<br />
                        République du Congo
                      </p>
                      <p className="text-gray-700">
                        <strong>Horaires:</strong> Lun-Ven 8h-17h
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">🇨🇬 Bureau - Pointe-Noire</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p className="text-gray-700">
                        <strong>Adresse:</strong><br />
                        Boulevard Pierre Savorgnan de Brazza<br />
                        Centre-ville, Pointe-Noire<br />
                        République du Congo
                      </p>
                      <p className="text-gray-700">
                        <strong>Horaires:</strong> Lun-Ven 8h-17h
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">⚡ Support d'Urgence</h2>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🚨</span>
                    <div>
                      <h3 className="font-semibold text-red-900 mb-2">Support Événements en Direct</h3>
                      <p className="text-red-800 mb-3">
                        Pour les problèmes techniques durant un événement en direct ou streaming :
                      </p>
                      <div className="space-y-2 text-red-700">
                        <p><strong>WhatsApp Support:</strong> <a href="https://wa.me/242981231925" className="text-red-600 hover:underline">+242 981-23-19-25</a></p>
                        <p><strong>Chat en Direct:</strong> Disponible sur notre site pendant les événements</p>
                        <p><strong>Email Express:</strong> <a href="mailto:urgent@feeti.com" className="text-red-600 hover:underline">urgent@feeti.com</a></p>
                      </div>
                      <p className="text-sm text-red-600 italic mt-3">
                        ⏰ Support 24h/24 pendant les événements en direct
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">📧 Contacts Spécialisés</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">⚖️</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Questions Légales</h3>
                    <p className="text-gray-700 text-sm mb-2">
                      <a href="mailto:legal@feeti.com" className="text-blue-600 hover:underline">legal@feeti.com</a>
                    </p>
                    <p className="text-xs text-gray-600">RGPD, CGU, litiges</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">📰</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Presse & Médias</h3>
                    <p className="text-gray-700 text-sm mb-2">
                      <a href="mailto:presse@feeti.com" className="text-purple-600 hover:underline">presse@feeti.com</a>
                    </p>
                    <p className="text-xs text-gray-600">Communiqués, interviews</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🤝</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Partenariats</h3>
                    <p className="text-gray-700 text-sm mb-2">
                      <a href="mailto:partenariats@feeti.com" className="text-orange-600 hover:underline">partenariats@feeti.com</a>
                    </p>
                    <p className="text-xs text-gray-600">Collaborations, sponsors</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">🌐 Suivez-nous</h2>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <a href="https://facebook.com/feeti" className="bg-[#1877f2] text-white px-6 py-3 rounded-lg hover:bg-[#166fe5] transition-colors flex items-center space-x-2">
                    <span>📘</span>
                    <span>Facebook</span>
                  </a>
                  <a href="https://instagram.com/feeti" className="bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2">
                    <span>📷</span>
                    <span>Instagram</span>
                  </a>
                  <a href="https://twitter.com/feeti" className="bg-[#1da1f2] text-white px-6 py-3 rounded-lg hover:bg-[#1a91da] transition-colors flex items-center space-x-2">
                    <span>🐦</span>
                    <span>Twitter</span>
                  </a>
                  <a href="https://youtube.com/feeti" className="bg-[#ff0000] text-white px-6 py-3 rounded-lg hover:bg-[#e60000] transition-colors flex items-center space-x-2">
                    <span>📺</span>
                    <span>YouTube</span>
                  </a>
                  <a href="https://linkedin.com/company/feeti" className="bg-[#0077b5] text-white px-6 py-3 rounded-lg hover:bg-[#006ba1] transition-colors flex items-center space-x-2">
                    <span>💼</span>
                    <span>LinkedIn</span>
                  </a>
                </div>
              </section>
            </div>
          )
        };

      case 'refund':
        return {
          title: "Politique de Remboursement",
          content: (
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Principe Général</h2>
                <p className="text-gray-700 leading-relaxed">
                  Feeti agit en tant qu'intermédiaire de vente entre les organisateurs d'événements 
                  et les acheteurs. Les conditions de remboursement sont définies par chaque 
                  organisateur et clairement indiquées sur la page de l'événement avant l'achat.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Types de Remboursement</h2>
                
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-2">✅ Remboursement Automatique</h3>
                    <p className="text-green-800">
                      <strong>Événement annulé par l'organisateur :</strong> Remboursement intégral 
                      automatique sous 3-5 jours ouvrés sur votre moyen de paiement d'origine.
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="font-semibold text-orange-900 mb-2">⚠️ Remboursement Conditionnel</h3>
                    <p className="text-orange-800">
                      <strong>Annulation volontaire :</strong> Soumise aux conditions spécifiques 
                      de l'organisateur. Possibles frais de traitement et délais variables.
                    </p>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h3 className="font-semibold text-red-900 mb-2">❌ Pas de Remboursement</h3>
                    <p className="text-red-800">
                      <strong>Billets non remboursables :</strong> Clairement indiqués lors de l'achat. 
                      Aucun remboursement possible sauf circonstances exceptionnelles.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Délais de Remboursement</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-indigo-50">
                        <th className="border border-gray-300 p-3 text-left font-semibold">Situation</th>
                        <th className="border border-gray-300 p-3 text-left font-semibold">Délai de Remboursement</th>
                        <th className="border border-gray-300 p-3 text-left font-semibold">Frais</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-3">Événement annulé</td>
                        <td className="border border-gray-300 p-3">3-5 jours ouvrés</td>
                        <td className="border border-gray-300 p-3 text-green-600">Aucun frais</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 p-3">Annulation plus de 30 jours avant</td>
                        <td className="border border-gray-300 p-3">5-10 jours ouvrés</td>
                        <td className="border border-gray-300 p-3 text-orange-600">Selon organisateur</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Annulation 7-30 jours avant</td>
                        <td className="border border-gray-300 p-3">5-10 jours ouvrés</td>
                        <td className="border border-gray-300 p-3 text-orange-600">Frais possibles</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 p-3">Annulation moins de 7 jours avant</td>
                        <td className="border border-gray-300 p-3">Non applicable</td>
                        <td className="border border-gray-300 p-3 text-red-600">Généralement refusé</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Procédure de Demande</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Connectez-vous à votre compte</h3>
                      <p className="text-gray-700">Accédez à "Mes Billets" dans votre tableau de bord utilisateur.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Sélectionnez le billet concerné</h3>
                      <p className="text-gray-700">Cliquez sur "Demander un remboursement" si l'option est disponible.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Remplissez le formulaire</h3>
                      <p className="text-gray-700">Indiquez le motif de votre demande et joignez les justificatifs si nécessaire.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">4</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Suivi de votre demande</h3>
                      <p className="text-gray-700">Vous recevrez une confirmation et des mises à jour par email.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Circonstances Exceptionnelles</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Dans certaines situations exceptionnelles, des remboursements peuvent être accordés 
                  même pour des billets non remboursables :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Maladie grave justifiée par certificat médical</li>
                  <li>Décès dans la famille proche</li>
                  <li>Cas de force majeure (catastrophe naturelle, restrictions sanitaires)</li>
                  <li>Erreur technique de notre plateforme lors de l'achat</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  Ces demandes sont étudiées au cas par cas par notre équipe support.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Frais de Traitement</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Les frais suivants peuvent s'appliquer selon les conditions de l'organisateur :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Frais de service Feeti : généralement non remboursables (2 000 - 5 000 FCFA)</li>
                  <li>Frais de traitement bancaire : 1-3% du montant remboursé</li>
                  <li>Pénalités organisateur : variables selon les conditions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Alternatives au Remboursement</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Avant une demande de remboursement, explorez ces alternatives :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Report :</strong> Certains organisateurs proposent le report vers une autre date</li>
                  <li><strong>Échange :</strong> Possibilité d'échanger contre un autre événement</li>
                  <li><strong>Revente :</strong> Transférez votre billet à un proche (si autorisé)</li>
                  <li><strong>Crédit :</strong> Conservez le montant en crédit pour un futur achat</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Litiges et Réclamations</h2>
                <p className="text-gray-700 leading-relaxed">
                  En cas de désaccord sur une décision de remboursement, vous pouvez saisir 
                  notre service réclamations à <a href="mailto:reclamations@feeti.com" className="text-indigo-600 hover:underline">reclamations@feeti.com</a>. 
                  Si aucune solution amiable n'est trouvée, vous pouvez recourir à la médiation 
                  de la consommation ou aux tribunaux compétents de Brazzaville.
                </p>
              </section>

              <section>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-3">💡 Conseils Pratiques</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li>• Lisez attentivement les conditions avant l'achat</li>
                    <li>• Conservez tous vos justificatifs de paiement</li>
                    <li>• Contactez le support dès que possible en cas de problème</li>
                    <li>• Vérifiez votre assurance voyage/événements personnelle</li>
                  </ul>
                </div>
              </section>
            </div>
          )
        };

      default:
        return { title: '', content: null };
    }
  };

  const { title, content } = getPageContent();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">{title}</CardTitle>
            <p className="text-gray-600">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            {content}
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Nous contacter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Support technique</h3>
                <p className="text-gray-700">
                  Email: <a href="mailto:support@feeti.com" className="text-indigo-600 hover:underline">support@feeti.com</a>
                </p>
                <p className="text-gray-700">Téléphone: +33 1 23 45 67 89</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Questions légales</h3>
                <p className="text-gray-700">
                  Email: <a href="mailto:legal@feeti.com" className="text-indigo-600 hover:underline">legal@feeti.com</a>
                </p>
                <p className="text-gray-700">
                  Adresse: 123 rue de la Tech, 75001 Paris, France
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}