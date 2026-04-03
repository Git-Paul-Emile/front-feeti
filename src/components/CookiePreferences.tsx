// Modal de préférences détaillées des cookies

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Cookie, Shield, BarChart3, Megaphone, Palette, Info, CheckCircle, AlertTriangle, Lock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import CookieService, { CookieConsent, CookieCategory } from '../services/CookieService';

interface CookiePreferencesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CookiePreferences({ open, onOpenChange }: CookiePreferencesProps) {
  const [preferences, setPreferences] = useState({
    analytics: false,
    marketing: false,
    preferences: false
  });

  const [activeTab, setActiveTab] = useState<CookieCategory>('essential');

  useEffect(() => {
    if (open) {
      // Charger les préférences actuelles
      const consent = CookieService.getConsent();
      if (consent) {
        setPreferences({
          analytics: consent.analytics,
          marketing: consent.marketing,
          preferences: consent.preferences
        });
      }
    }
  }, [open]);

  const handleSave = () => {
    CookieService.saveConsent(preferences);
    toast.success('✅ Vos préférences ont été enregistrées');
    onOpenChange(false);
  };

  const handleAcceptAll = () => {
    const newPrefs = {
      analytics: true,
      marketing: true,
      preferences: true
    };
    setPreferences(newPrefs);
    CookieService.saveConsent(newPrefs);
    toast.success('✅ Tous les cookies ont été acceptés');
    onOpenChange(false);
  };

  const handleRejectAll = () => {
    const newPrefs = {
      analytics: false,
      marketing: false,
      preferences: false
    };
    setPreferences(newPrefs);
    CookieService.saveConsent(newPrefs);
    toast.info('❌ Seuls les cookies essentiels sont actifs');
    onOpenChange(false);
  };

  const getCookiesByCategory = (category: CookieCategory) => {
    return CookieService.getCookiesByCategory(category);
  };

  const stats = CookieService.getUsageStats();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Cookie className="w-7 h-7 text-indigo-600" />
            Préférences des Cookies
          </DialogTitle>
          <DialogDescription>
            Gérez vos préférences de cookies et de confidentialité. Les cookies essentiels 
            sont toujours actifs pour garantir le fonctionnement du site.
          </DialogDescription>
        </DialogHeader>

        {/* Stats Bar */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-indigo-600" />
            <span className="font-medium text-gray-900">
              {stats.activeCookies} / {stats.totalCookies} cookies actifs
            </span>
          </div>
          <Badge variant="outline" className="bg-white text-green-700 border-green-200">
            <Shield className="w-3 h-3 mr-1" />
            RGPD Compliant
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CookieCategory)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="essential" className="text-xs sm:text-sm">
              <Shield className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Essentiels</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">
              <BarChart3 className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Analytiques</span>
            </TabsTrigger>
            <TabsTrigger value="marketing" className="text-xs sm:text-sm">
              <Megaphone className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Marketing</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs sm:text-sm">
              <Palette className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Préférences</span>
            </TabsTrigger>
          </TabsList>

          {/* Essential Cookies */}
          <TabsContent value="essential" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      Cookies Essentiels
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés.
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <Lock className="w-3 h-3 mr-1" />
                    Toujours Actif
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {getCookiesByCategory('essential').map((cookie) => (
                  <div key={cookie.name} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-white rounded text-xs font-mono border">
                            {cookie.name}
                          </code>
                          <Badge variant="outline" className="text-xs">
                            {cookie.provider}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{cookie.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <strong>Expiration:</strong> {cookie.expiry}
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                Les cookies essentiels assurent la sécurité, l'authentification et les fonctionnalités 
                de base du site. Ils sont conformes au RGPD et ne nécessitent pas de consentement.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Analytics Cookies */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Cookies Analytiques
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Ces cookies nous aident à comprendre comment les visiteurs utilisent notre site.
                    </CardDescription>
                  </div>
                  <Switch
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, analytics: checked }))
                    }
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {getCookiesByCategory('analytics').map((cookie) => (
                  <div key={cookie.name} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-white rounded text-xs font-mono border">
                            {cookie.name}
                          </code>
                          <Badge variant="outline" className="text-xs">
                            {cookie.provider}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{cookie.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <strong>Expiration:</strong> {cookie.expiry}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Alert>
              <BarChart3 className="w-4 h-4" />
              <AlertDescription>
                Les données collectées sont anonymisées et utilisées uniquement pour améliorer 
                l'expérience utilisateur. Nous utilisons Google Analytics avec IP anonymisé.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Marketing Cookies */}
          <TabsContent value="marketing" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Megaphone className="w-5 h-5 text-purple-600" />
                      Cookies Marketing
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Ces cookies sont utilisés pour afficher des publicités pertinentes.
                    </CardDescription>
                  </div>
                  <Switch
                    checked={preferences.marketing}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, marketing: checked }))
                    }
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {getCookiesByCategory('marketing').map((cookie) => (
                  <div key={cookie.name} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-white rounded text-xs font-mono border">
                            {cookie.name}
                          </code>
                          <Badge variant="outline" className="text-xs">
                            {cookie.provider}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{cookie.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <strong>Expiration:</strong> {cookie.expiry}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Ces cookies peuvent collecter des informations sur votre navigation sur d'autres sites. 
                Vous pouvez les refuser sans affecter le fonctionnement de Feeti.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Preferences Cookies */}
          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-amber-600" />
                      Cookies de Préférences
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Ces cookies mémorisent vos choix pour personnaliser votre expérience.
                    </CardDescription>
                  </div>
                  <Switch
                    checked={preferences.preferences}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, preferences: checked }))
                    }
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {getCookiesByCategory('preferences').map((cookie) => (
                  <div key={cookie.name} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-white rounded text-xs font-mono border">
                            {cookie.name}
                          </code>
                          <Badge variant="outline" className="text-xs">
                            {cookie.provider}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{cookie.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <strong>Expiration:</strong> {cookie.expiry}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Alert>
              <Palette className="w-4 h-4" />
              <AlertDescription>
                Ces cookies améliorent votre confort d'utilisation en mémorisant vos préférences 
                (langue, thème, pays). Aucune donnée personnelle n'est collectée.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={handleRejectAll}
            className="w-full sm:w-auto"
          >
            Tout Refuser
          </Button>
          <Button
            variant="outline"
            onClick={handleAcceptAll}
            className="w-full sm:w-auto"
          >
            Tout Accepter
          </Button>
          <Button
            onClick={handleSave}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            Enregistrer mes Préférences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
