import { EmailTemplate } from '../EmailTemplate';
import { Button } from '../ui/button';

interface Ticket {
  id: string;
  orderId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventImage: string;
  category: string;
  price: number;
  currency: string;
  holderName: string;
  holderEmail: string;
  qrCode: string;
  status: 'valid' | 'used' | 'expired';
  purchaseDate: string;
  timestamp: number;
  signature: string;
}

interface EmailPreviewPageProps {
  tickets: Ticket[];
  customerName: string;
  customerEmail: string;
  orderId: string;
  onBack: () => void;
}

export function EmailPreviewPage({ 
  tickets, 
  customerName, 
  customerEmail, 
  orderId, 
  onBack 
}: EmailPreviewPageProps) {
  
  const handlePrint = () => {
    window.print();
  };

  const handleSaveAsPDF = () => {
    // Simulation de la sauvegarde PDF
    const element = document.getElementById('email-content');
    if (element) {
      // En production, on utiliserait une vraie libraire PDF
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header avec actions */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Aperçu de l'email de confirmation
              </h1>
              <p className="text-sm text-gray-600">
                Cet email sera envoyé à {customerEmail}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handlePrint}>
                Imprimer
              </Button>
              <Button variant="outline" onClick={handleSaveAsPDF}>
                Sauvegarder PDF
              </Button>
              <Button onClick={onBack}>
                Retour
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu de l'email */}
      <div className="py-8">
        <div id="email-content">
          <EmailTemplate
            tickets={tickets}
            customerName={customerName}
            customerEmail={customerEmail}
            orderId={orderId}
          />
        </div>
      </div>

      {/* Note informative */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            📧 Email automatique
          </h3>
          <p className="text-sm text-blue-800">
            Cet email sera automatiquement envoyé à l'adresse {customerEmail} avec les billets en pièces jointes PDF. 
            Le client recevra également un SMS de confirmation avec un lien vers ses billets.
          </p>
        </div>
      </div>

      <style jsx>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .sticky,
          .z-10,
          button {
            display: none !important;
          }
          
          #email-content {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}