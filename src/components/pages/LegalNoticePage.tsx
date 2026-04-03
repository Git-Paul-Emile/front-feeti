import { ArrowLeft, Building2, Server, User, Copyright, Link as LinkIcon, AlertTriangle, Scale, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useNavigate } from 'react-router-dom';

export function LegalNoticePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mentions Légales</h1>
              <p className="text-gray-600 mt-1">Version 1.0 | Entrée en vigueur : 08 mars 2026</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <Building2 className="w-6 h-6 text-slate-700" />
                1. Éditeur de la plateforme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p className="font-medium text-gray-900 mb-4">La plateforme Feeti est éditée par :</p>
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    ['Raison sociale', 'Feeti SAS'],
                    ['Forme juridique', 'Société par Actions Simplifiée'],
                    ['Capital social', '[Montant] FCFA'],
                    ['Siège social', '[Adresse complète], [Ville], [Pays]'],
                    ['N° RCCM', '[Numéro]'],
                    ['N° Identification Fiscale (NIF)', '[Numéro]'],
                    ['Directeur de la publication', '[Nom du Directeur Général]'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="text-sm font-semibold text-slate-600 uppercase mb-1">{label}</div>
                      <div className="text-base">{value}</div>
                    </div>
                  ))}
                  <div>
                    <div className="text-sm font-semibold text-slate-600 uppercase mb-1">Email</div>
                    <a href="mailto:contact@feeti.com" className="text-indigo-600 hover:underline">contact@feeti.com</a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <Server className="w-6 h-6 text-slate-700" />
                2. Hébergement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p className="font-medium text-gray-900 mb-4">La plateforme Feeti est hébergée par :</p>
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-3">
                <div><div className="text-sm font-semibold text-slate-600 uppercase mb-1">Prestataire</div><div>[Nom de l'hébergeur]</div></div>
                <div><div className="text-sm font-semibold text-slate-600 uppercase mb-1">Adresse</div><div>[Adresse de l'hébergeur]</div></div>
                <div><div className="text-sm font-semibold text-slate-600 uppercase mb-1">Contact</div><div>[contact hébergeur]</div></div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <User className="w-6 h-6 text-slate-700" />
                3. Directeur de la publication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>Le Directeur de la publication au sens de la loi est <strong>[Nom et Prénom]</strong>, en sa qualité de représentant légal de Feeti SAS.</p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <Copyright className="w-6 h-6 text-slate-700" />
                4. Propriété intellectuelle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>L'ensemble des éléments composant la plateforme Feeti (marque, logo, chartes graphiques, textes, images, vidéos, bases de données, logiciels) sont la propriété exclusive de Feeti SAS ou de ses partenaires, et sont protégés par les droits de la propriété intellectuelle applicables en zone OHADA.</p>
              <div className="bg-red-50 p-6 rounded-lg border border-red-200 mt-4">
                <p className="font-medium text-red-900 mb-2">⚠️ Avertissement</p>
                <p className="text-red-800">Toute reproduction, représentation, modification ou publication de ces éléments sans autorisation écrite préalable est illicite et constitue une contrefaçon susceptible de poursuites judiciaires.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <LinkIcon className="w-6 h-6 text-slate-700" />
                5. Liens hypertextes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>La plateforme Feeti peut contenir des liens vers des sites externes fournis à titre informatif. Feeti ne saurait être responsable du contenu ou des pratiques de ces sites tiers.</p>
              <p>Toute demande d'autorisation pour créer un lien pointant vers Feeti doit être adressée à : <a href="mailto:contact@feeti.com" className="text-indigo-600 hover:underline font-medium">contact@feeti.com</a></p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                6. Limitation de responsabilité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>Feeti s'engage à faire ses meilleurs efforts pour assurer la disponibilité et la sécurité de la plateforme. Cependant, Feeti décline toute responsabilité en cas de :</p>
              <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                <ul className="space-y-2">
                  {['Interruption temporaire pour maintenance ou mise à jour', 'Événement de force majeure (panne réseau nationale, catastrophe naturelle, etc.)', 'Utilisation frauduleuse par un tiers'].map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <Scale className="w-6 h-6 text-slate-700" />
                7. Droit applicable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>La plateforme Feeti et ses mentions légales sont régies par le droit de la République du Congo et les Actes Uniformes de l'OHADA. Tout litige relatif à l'utilisation de la plateforme sera soumis à la juridiction compétente du ressort du siège social de Feeti.</p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                <Mail className="w-6 h-6 text-slate-700" />
                8. Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  <div>
                    <div className="text-sm font-semibold text-slate-600">Email</div>
                    <a href="mailto:contact@feeti.com" className="text-indigo-600 hover:underline font-medium">contact@feeti.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <div className="text-sm font-semibold text-slate-600">Adresse postale</div>
                    <div>[Adresse complète de Feeti]</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl p-8 text-center text-white">
            <Building2 className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Informations Légales Complètes</h3>
            <p className="text-slate-200 mb-6 max-w-2xl mx-auto">Ces mentions légales garantissent la transparence et la conformité de la plateforme Feeti avec la législation en vigueur.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={() => navigate(-1)} className="bg-white text-slate-900 hover:bg-gray-100">Retour</Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10"
                onClick={() => window.location.href = 'mailto:contact@feeti.com'}>
                <Mail className="w-4 h-4 mr-2" />Nous Contacter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
