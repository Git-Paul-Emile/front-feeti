// Bannière de consentement des cookies - Conforme RGPD

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Cookie, Shield, Settings, X, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CookieService, { CookieConsent } from '../services/CookieService';

interface CookieBannerProps {
  onPreferencesClick: () => void;
}

export function CookieBanner({ onPreferencesClick }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consent = CookieService.getConsent();
    
    if (!consent) {
      // Afficher la bannière après un court délai
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    CookieService.acceptAll();
    closeBanner();
  };

  const handleRejectAll = () => {
    CookieService.rejectAll();
    closeBanner();
  };

  const handleCustomize = () => {
    onPreferencesClick();
    closeBanner();
  };

  const closeBanner = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
        style={{ pointerEvents: isClosing ? 'none' : 'auto' }}
      >
        <Card className="mx-auto max-w-5xl border-2 border-indigo-200 shadow-2xl bg-white/95 backdrop-blur-lg">
          <CardContent className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Cookie className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">
                    🍪 Gestion des Cookies
                  </h3>
                  <Badge variant="outline" className="mt-1 text-xs bg-green-50 text-green-700 border-green-200">
                    <Shield className="w-3 h-3 mr-1" />
                    Conforme RGPD
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeBanner}
                className="flex-shrink-0 -mt-2 -mr-2 hover:bg-gray-100"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">
                Nous utilisons des cookies pour améliorer votre expérience sur <strong>Feeti</strong>, 
                analyser notre audience et personnaliser le contenu. Certains cookies sont essentiels 
                au fonctionnement du site.
              </p>

              {/* Toggle Details */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors text-sm font-medium"
              >
                <Info className="w-4 h-4" />
                {showDetails ? 'Masquer les détails' : 'En savoir plus'}
                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Details Dropdown */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-1.5" />
                        <div>
                          <strong className="text-gray-900">Cookies essentiels</strong>
                          <p className="text-gray-600 mt-1">
                            Nécessaires au fonctionnement du site (connexion, panier, sécurité). 
                            Toujours actifs.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                        <div>
                          <strong className="text-gray-900">Cookies analytiques</strong>
                          <p className="text-gray-600 mt-1">
                            Nous aident à comprendre comment vous utilisez notre site pour l'améliorer 
                            (Google Analytics).
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-1.5" />
                        <div>
                          <strong className="text-gray-900">Cookies marketing</strong>
                          <p className="text-gray-600 mt-1">
                            Utilisés pour afficher des publicités pertinentes sur d'autres sites 
                            (Facebook, Google Ads).
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-amber-500 rounded-full mt-1.5" />
                        <div>
                          <strong className="text-gray-900">Cookies de préférences</strong>
                          <p className="text-gray-600 mt-1">
                            Mémorisent vos choix (langue, thème, pays) pour personnaliser votre 
                            expérience.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>

          <CardFooter className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0">
            <div className="w-full space-y-3">
              {/* Desktop buttons */}
              <div className="hidden sm:flex items-center gap-3 flex-wrap">
                <Button
                  onClick={handleAcceptAll}
                  className="flex-1 min-w-[200px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium"
                  size="lg"
                >
                  Tout Accepter
                </Button>
                <Button
                  onClick={handleCustomize}
                  variant="outline"
                  className="flex-1 min-w-[200px] border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                  size="lg"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Personnaliser
                </Button>
                <Button
                  onClick={handleRejectAll}
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  size="lg"
                >
                  Tout Refuser
                </Button>
              </div>

              {/* Mobile buttons */}
              <div className="sm:hidden space-y-2">
                <Button
                  onClick={handleAcceptAll}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium"
                  size="lg"
                >
                  Tout Accepter
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleCustomize}
                    variant="outline"
                    className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Personnaliser
                  </Button>
                  <Button
                    onClick={handleRejectAll}
                    variant="ghost"
                    className="text-gray-600 hover:bg-gray-100"
                  >
                    Refuser
                  </Button>
                </div>
              </div>

              {/* Privacy link */}
              <p className="text-xs text-center text-gray-500">
                En continuant, vous acceptez notre{' '}
                <a href="#" className="text-indigo-600 hover:underline font-medium">
                  Politique de Confidentialité
                </a>
                {' '}et notre{' '}
                <a href="#" className="text-indigo-600 hover:underline font-medium">
                  Politique de Cookies
                </a>
              </p>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
