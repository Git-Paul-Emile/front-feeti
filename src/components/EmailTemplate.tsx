import { QRCodeGenerator } from './QRCodeGenerator';

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

interface EmailTemplateProps {
  tickets: Ticket[];
  customerName: string;
  customerEmail: string;
  orderId: string;
}

export function EmailTemplate({ tickets, customerName, customerEmail, orderId }: EmailTemplateProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'FCFA') {
      return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const totalAmount = tickets.reduce((sum, ticket) => sum + ticket.price, 0);
  const serviceFee = totalAmount * 0.05;
  const finalTotal = totalAmount + serviceFee;

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header avec logo */}
        <div style={{
          background: 'linear-gradient(135deg, #4338ca, #059669)',
          color: '#ffffff',
          padding: '32px 24px',
          textAlign: 'center'
        }}>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '28px',
            fontWeight: 'bold'
          }}>
            Feeti
          </h1>
          <p style={{
            margin: '0',
            fontSize: '16px',
            opacity: '0.9'
          }}>
            Vos billets sont prêts !
          </p>
        </div>

        {/* Contenu principal */}
        <div style={{ padding: '32px 24px' }}>
          {/* Message de bienvenue */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '24px',
              color: '#1f2937'
            }}>
              Bonjour {customerName} !
            </h2>
            <p style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              Merci pour votre achat ! Vos billets électroniques sont ci-dessous. 
              Présentez simplement les QR codes à l'entrée de l'événement.
            </p>
          </div>

          {/* Récapitulatif de commande */}
          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '32px'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              color: '#1f2937'
            }}>
              Récapitulatif de commande
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Commande N°</span>
                <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{orderId}</span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Email</span>
                <span style={{ color: '#1f2937' }}>{customerEmail}</span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Nombre de billets</span>
                <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{tickets.length}</span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Sous-total</span>
                <span style={{ color: '#1f2937' }}>{formatPrice(totalAmount, tickets[0]?.currency || 'FCFA')}</span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Frais de service</span>
                <span style={{ color: '#1f2937' }}>{formatPrice(serviceFee, tickets[0]?.currency || 'FCFA')}</span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0 0 0'
              }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>Total</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#4338ca' }}>
                  {formatPrice(finalTotal, tickets[0]?.currency || 'FCFA')}
                </span>
              </div>
            </div>
          </div>

          {/* Billets */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              margin: '0 0 24px 0',
              fontSize: '20px',
              color: '#1f2937'
            }}>
              Vos billets électroniques
            </h3>

            {tickets.map((ticket, index) => (
              <div key={ticket.id} style={{
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                marginBottom: '24px',
                overflow: 'hidden',
                backgroundColor: '#ffffff'
              }}>
                {/* Header du billet */}
                <div style={{
                  background: ticket.category === 'VIP' 
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : ticket.category === 'Premium' 
                    ? 'linear-gradient(135deg, #4338ca, #6366f1)'
                    : 'linear-gradient(135deg, #6b7280, #4b5563)',
                  color: '#ffffff',
                  padding: '16px 20px',
                  textAlign: 'center'
                }}>
                  <h4 style={{
                    margin: '0 0 4px 0',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}>
                    {ticket.eventTitle}
                  </h4>
                  <p style={{
                    margin: '0',
                    fontSize: '14px',
                    opacity: '0.9'
                  }}>
                    Billet {ticket.category} #{index + 1}
                  </p>
                </div>

                {/* Informations de l'événement */}
                <div style={{ padding: '24px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    <div>
                      <p style={{
                        margin: '0 0 4px 0',
                        fontSize: '12px',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        fontWeight: 'bold'
                      }}>
                        Date
                      </p>
                      <p style={{
                        margin: '0',
                        fontSize: '14px',
                        color: '#1f2937',
                        fontWeight: 'bold'
                      }}>
                        {formatDate(ticket.eventDate)}
                      </p>
                    </div>
                    
                    <div>
                      <p style={{
                        margin: '0 0 4px 0',
                        fontSize: '12px',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        fontWeight: 'bold'
                      }}>
                        Heure
                      </p>
                      <p style={{
                        margin: '0',
                        fontSize: '14px',
                        color: '#1f2937',
                        fontWeight: 'bold'
                      }}>
                        {ticket.eventTime}
                      </p>
                    </div>
                    
                    <div style={{ gridColumn: 'span 2' }}>
                      <p style={{
                        margin: '0 0 4px 0',
                        fontSize: '12px',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        fontWeight: 'bold'
                      }}>
                        Lieu
                      </p>
                      <p style={{
                        margin: '0',
                        fontSize: '14px',
                        color: '#1f2937',
                        fontWeight: 'bold'
                      }}>
                        {ticket.eventLocation}
                      </p>
                    </div>
                    
                    <div>
                      <p style={{
                        margin: '0 0 4px 0',
                        fontSize: '12px',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        fontWeight: 'bold'
                      }}>
                        Porteur
                      </p>
                      <p style={{
                        margin: '0',
                        fontSize: '14px',
                        color: '#1f2937',
                        fontWeight: 'bold'
                      }}>
                        {ticket.holderName}
                      </p>
                    </div>
                    
                    <div>
                      <p style={{
                        margin: '0 0 4px 0',
                        fontSize: '12px',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        fontWeight: 'bold'
                      }}>
                        Prix
                      </p>
                      <p style={{
                        margin: '0',
                        fontSize: '14px',
                        color: '#1f2937',
                        fontWeight: 'bold'
                      }}>
                        {formatPrice(ticket.price, ticket.currency)}
                      </p>
                    </div>
                  </div>

                  {/* Section QR Code */}
                  <div style={{
                    borderTop: '2px dashed #e5e7eb',
                    paddingTop: '20px',
                    textAlign: 'center'
                  }}>
                    <p style={{
                      margin: '0 0 16px 0',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#1f2937'
                    }}>
                      QR Code d'entrée
                    </p>
                    
                    <div style={{
                      display: 'inline-block',
                      padding: '12px',
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ 
                        width: '120px', 
                        height: '120px',
                        margin: '0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '4px'
                      }}>
                        {/* Placeholder QR code pattern */}
                        <div style={{
                          width: '100px',
                          height: '100px',
                          background: 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBoMjB2MjBIMHoiIGZpbGw9IiMwMDAiLz4KPHA+YXRoIGQ9Ik00IDBoMTJ2NDJINDV6IiBmaWxsPSIjRkZGIi8+CjxwYXRoIGQ9Ik0xNiA0aDR2NGgtNHoiIGZpbGw9IiMwMDAiLz4KPHA+YXRoIGQ9Ik04MCAwaDE2djIwSDgweiIgZmlsbD0iIzAwMCIvPgo8cGF0aCBkPSJNODQgMGgxMnY0Mkg4NHoiIGZpbGw9IiNGRkYiLz4KPHA+YXRoIGQ9Ik05NiA0aDR2NGgtNHoiIGZpbGw9IiMwMDAiLz4KPHA+YXRoIGQ9Ik0wIDgwaDIwdjIwSDB6IiBmaWxsPSIjMDAwIi8+CjxwYXRoIGQ9Ik00IDgwaDE2djE2SDR6IiBmaWxsPSIjRkZGIi8+CjxwYXRoIGQ9Ik04IDg0aDh2OEg4eiIgZmlsbD0iIzAwMCIvPgo8L3N2Zz4=) no-repeat center',
                          backgroundSize: 'contain'
                        }} />
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '16px' }}>
                      <p style={{
                        margin: '0 0 4px 0',
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        Billet N° {ticket.id.slice(-8).toUpperCase()}
                      </p>
                      <p style={{
                        margin: '0',
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        Présentez ce QR code à l'entrée
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Informations importantes */}
          <div style={{
            backgroundColor: '#dbeafe',
            border: '1px solid #93c5fd',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '32px'
          }}>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              color: '#1e40af',
              fontWeight: 'bold'
            }}>
              Informations importantes
            </h4>
            <ul style={{
              margin: '0',
              padding: '0 0 0 16px',
              color: '#1e40af',
              fontSize: '14px',
              lineHeight: '1.6'
            }}>
              <li style={{ marginBottom: '4px' }}>Gardez ce billet avec vous jusqu'à l'entrée dans la salle</li>
              <li style={{ marginBottom: '4px' }}>Le QR code peut être présenté sur smartphone ou imprimé</li>
              <li style={{ marginBottom: '4px' }}>Arrivez 30 minutes avant le début de l'événement</li>
              <li style={{ marginBottom: '4px' }}>Une pièce d'identité peut être demandée</li>
              <li>Ce billet est personnel et non cessible</li>
            </ul>
          </div>

          {/* Support */}
          <div style={{
            textAlign: 'center',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '24px'
          }}>
            <p style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              color: '#1f2937',
              fontWeight: 'bold'
            }}>
              Besoin d'aide ?
            </p>
            <p style={{
              margin: '0 0 16px 0',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Notre équipe support est là pour vous aider
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              flexWrap: 'wrap'
            }}>
              <a href="mailto:support@feeti.com" style={{
                color: '#4338ca',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                support@feeti.com
              </a>
              <a href="tel:+242612345678" style={{
                color: '#4338ca',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                +242 6 12 34 56 78
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '24px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            © 2024 Feeti. Tous droits réservés.
          </p>
          <p style={{ margin: '0' }}>
            Cet email a été envoyé à {customerEmail}
          </p>
        </div>
      </div>
    </div>
  );
}