import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import AdminAPI, { type AuditIntegrity, type AuditLogEntry } from '../../services/api/AdminAPI';

export function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [integrity, setIntegrity] = useState<AuditIntegrity | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, pages: 1 });
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    userId: '',
    dateFrom: '',
    dateTo: '',
  });

  const canPrev = page > 1;
  const canNext = page < meta.pages;

  const load = async () => {
    setLoading(true);
    try {
      const [auditRes, integrityRes] = await Promise.all([
        AdminAPI.getAuditLogs({
          ...filters,
          page,
          limit: 25,
          action: filters.action || undefined,
          resource: filters.resource || undefined,
          userId: filters.userId || undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
        }),
        AdminAPI.getAuditIntegrity(),
      ]);
      setLogs(auditRes.data);
      setMeta(auditRes.meta);
      setIntegrity(integrityRes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => {});
  }, [page]);

  const corruptedBadge = useMemo(() => {
    if (!integrity) return { label: 'Vérification…', cls: 'bg-slate-100 text-slate-700' };
    if (integrity.corrupted > 0) return { label: `${integrity.corrupted} corruption(s)`, cls: 'bg-red-100 text-red-700' };
    return { label: 'Intégrité OK', cls: 'bg-emerald-100 text-emerald-700' };
  }, [integrity]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Sécurité</h1>
          <p className="text-sm text-gray-500">Traçabilité des actions sensibles plateforme</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${corruptedBadge.cls}`}>
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            {corruptedBadge.label}
          </span>
          <Button variant="outline" onClick={() => load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtres</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div><Label>Action</Label><Input value={filters.action} onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))} /></div>
          <div><Label>Ressource</Label><Input value={filters.resource} onChange={(e) => setFilters((f) => ({ ...f, resource: e.target.value }))} /></div>
          <div><Label>Utilisateur</Label><Input value={filters.userId} onChange={(e) => setFilters((f) => ({ ...f, userId: e.target.value }))} /></div>
          <div><Label>Du</Label><Input type="date" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} /></div>
          <div><Label>Au</Label><Input type="date" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} /></div>
          <div className="md:col-span-5">
            <Button
              onClick={() => {
                setPage(1);
                load().catch(() => {});
              }}
              disabled={loading}
            >
              Appliquer les filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {integrity?.corrupted ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {integrity.corrupted} entrée(s) suspecte(s) détectée(s) dans les checksums.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Journal d’audit</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Ressource</TableHead>
                <TableHead>Acteur</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{new Date(row.createdAt).toLocaleString('fr-FR')}</TableCell>
                  <TableCell className="font-mono text-xs">{row.action}</TableCell>
                  <TableCell className="text-xs">{row.resource}{row.resourceId ? `#${row.resourceId.slice(0, 8)}` : ''}</TableCell>
                  <TableCell className="text-xs">{row.userRole} · {row.userId.slice(0, 8)}…</TableCell>
                  <TableCell className="font-mono text-xs">{row.ipAddress ?? '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>{meta.total} entrées</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!canPrev}>
                Précédent
              </Button>
              <span>{meta.page} / {meta.pages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!canNext}>
                Suivant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminAuditPage;
