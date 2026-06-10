import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import * as XLSX from 'xlsx';
import {
  ArrowLeft, Plus, RefreshCw, Download, Shield, Users, Map,
  TicketCheck, CheckCircle2, XCircle, AlertTriangle, Mail,
  Trash2, Eye, ChevronRight, Layers, Zap, Copy, QrCode, Upload, UserCheck, FileText, X as XIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import AccessAPI from '../../services/api/AccessAPI';
import ControllerAPI, { type EventControllerAssignment, type ControllerUser } from '../../services/api/ControllerAPI';
import type {
  EventZone, ParticipantCategory, ZoneAccessLevel,
  AccessBadge, AccessLog, ZoneTracking, SuspectReport, BadgePricing,
} from '../../services/api/AccessAPI';
import { useAccessSocket } from '../../hooks/useAccessSocket';

// ─── Constantes ────────────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<ZoneAccessLevel, string> = {
  OUI:  '#22C55E',
  COND: '#F59E0B',
  NON:  '#F87171',
};

const LEVEL_NEXT: Record<ZoneAccessLevel, ZoneAccessLevel> = {
  NON: 'COND', COND: 'OUI', OUI: 'NON',
};

const RESULT_BADGE: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' }> = {
  granted:     { label: 'Autorisé',     variant: 'default' },
  denied:      { label: 'Refusé',       variant: 'destructive' },
  conditional: { label: 'Conditionnel', variant: 'secondary' },
};

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

function normalizeCsvOrXlsxRow(row: Array<string | number | boolean | null | undefined>) {
  const parts = row.map(value => String(value ?? '').trim());
  return {
    holderName: parts[0] ?? '',
    holderEmail: parts[1] ?? '',
    holderPhone: parts[2] ?? '',
    categoryName: parts[3] ?? '',
  };
}

function parseCsvOrXlsxRows(file: File, raw: string | ArrayBuffer) {
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
    const workbook = XLSX.read(raw, { type: 'array' });
    const firstSheet = workbook.SheetNames[0];
    if (!firstSheet) return [];
    const worksheet = workbook.Sheets[firstSheet];
    const rows = XLSX.utils.sheet_to_json<Array<string | number | boolean | null | undefined>>(worksheet, { header: 1, blankrows: false });
    return rows.slice(1).map(normalizeCsvOrXlsxRow);
  }

  const text = typeof raw === 'string' ? raw : new TextDecoder('utf-8').decode(raw);
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  return lines.slice(1).map(line => {
    const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
    return normalizeCsvOrXlsxRow(parts);
  });
}

function normalizeCategoryKey(value: string) {
  return value.trim().toLowerCase();
}

function normalizeBadgeEmail(value: string) {
  return value.trim().toLowerCase();
}

function findDuplicateBadgeEmail(rows: { holderEmail: string }[], existingBadges: AccessBadge[]) {
  const seen = new Set(existingBadges.map(badge => normalizeBadgeEmail(badge.holderEmail)));
  for (const row of rows) {
    const email = normalizeBadgeEmail(row.holderEmail);
    if (seen.has(email)) return row.holderEmail;
    seen.add(email);
  }
  return null;
}

function reviewImportedRows(rows: CsvOrXlsxRow[], categories: ParticipantCategory[]): CsvUploadReview {
  const categoriesByName = new Map(categories.map(category => [normalizeCategoryKey(category.name), category]));
  const validRows: CsvOrXlsxRow[] = [];
  const ignoredReasons = new Set<string>();

  for (const row of rows) {
    const hasRequiredFields = row.holderName.trim() && row.holderEmail.trim() && row.holderEmail.includes('@');
    if (!hasRequiredFields) {
      ignoredReasons.add('nom ou email invalide');
      continue;
    }

    if (row.categoryName.trim()) {
      if (!categoriesByName.has(normalizeCategoryKey(row.categoryName))) {
        ignoredReasons.add("catégorie non reconnue pour l'événement");
        continue;
      }
    }

    validRows.push(row);
  }

  return {
    validRows,
    ignoredCount: rows.length - validRows.length,
    ignoredReasons: Array.from(ignoredReasons),
  };
}

// ─── Props ──────────────────────────────────────────────────────────────────────

interface FeetiAccessDashboardProps {
  eventId: string;
  eventTitle: string;
  onBack: () => void;
}

type CsvOrXlsxRow = {
  holderName: string;
  holderEmail: string;
  holderPhone: string;
  categoryName: string;
};

type CsvUploadReview = {
  validRows: CsvOrXlsxRow[];
  ignoredCount: number;
  ignoredReasons: string[];
};

// ─── Composant principal ────────────────────────────────────────────────────────

export function FeetiAccessDashboard({ eventId, eventTitle, onBack }: FeetiAccessDashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState((location.state as any)?.initialTab ?? 'zones');

  // ── Zones state ─────────────────────────────────────────────────────────────
  const [zones, setZones] = useState<EventZone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [zoneDialog, setZoneDialog] = useState<{ open: boolean; zone?: EventZone }>({ open: false });
  const [zoneForm, setZoneForm] = useState({ code: 'Z1', name: '', description: '', color: '#3B82F6', maxCapacity: '' });

  // ── Categories state ────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<ParticipantCategory[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [catDialog, setCatDialog] = useState<{ open: boolean; cat?: ParticipantCategory }>({ open: false });
  const [catForm, setCatForm] = useState({ name: '', description: '', color: '#6B7280' });

  // ── Matrix state ────────────────────────────────────────────────────────────
  const [matrix, setMatrix] = useState<Record<string, Record<string, ZoneAccessLevel>>>({});
  const [matrixDirty, setMatrixDirty] = useState(false);
  const [matrixSaving, setMatrixSaving] = useState(false);

  // ── Badges state ────────────────────────────────────────────────────────────
  const [badges, setBadges] = useState<AccessBadge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [badgeDialog, setBadgeDialog] = useState(false);
  const [badgeStep, setBadgeStep] = useState<0 | 1 | 2>(0);
  const [badgeForm, setBadgeForm] = useState({ categoryId: '', holderName: '', holderEmail: '', holderPhone: '', holderPhoto: '', ticketId: '' });
  const [badgePhotoPreview, setBadgePhotoPreview] = useState<string | null>(null);
  const [badgeCategoryFormOpen, setBadgeCategoryFormOpen] = useState(false);
  const [badgeCategoryForm, setBadgeCategoryForm] = useState({ name: '', description: '', color: '#6B7280' });
  const [csvMode, setCsvMode] = useState(false);
  const [csvRows, setCsvRows] = useState<CsvOrXlsxRow[]>([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [csvError, setCsvError] = useState('');
  const [csvIgnoredSummary, setCsvIgnoredSummary] = useState('');
  const [badgePricing, setBadgePricing] = useState<BadgePricing | null>(null);
  const [badgeWizardPaying, setBadgeWizardPaying] = useState(false);
  const [generatedBadges, setGeneratedBadges] = useState<AccessBadge[]>([]);
  const [qrDialog, setQrDialog] = useState<{ open: boolean; badge?: AccessBadge }>({ open: false });
  const [sourceEventId, setSourceEventId] = useState('');

  // ── Tracking state ──────────────────────────────────────────────────────────
  const [tracking, setTracking] = useState<ZoneTracking[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [logsFilter, setLogsFilter] = useState<{ zoneId: string; result: string }>({ zoneId: '', result: '' });
  const [trackingLoading, setTrackingLoading] = useState(false);

  // ── Refus & signalements (FA-034 / FA-027) ───────────────────────────────────
  const [refusedLogs, setRefusedLogs] = useState<AccessLog[]>([]);
  const [refusedLoading, setRefusedLoading] = useState(false);
  const [suspectReports, setSuspectReports] = useState<SuspectReport[]>([]);
  const [suspectLoading, setSuspectLoading] = useState(false);
  const [reportDialog, setReportDialog] = useState<{ open: boolean; badge?: AccessBadge }>({ open: false });
  const [reportReason, setReportReason] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    loading: boolean;
    onConfirm: (() => Promise<void> | void) | null;
  }>({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Confirmer',
    loading: false,
    onConfirm: null,
  });

  // ── Contrôleurs ─────────────────────────────────────────────────────────────
  const [controllers, setControllers] = useState<EventControllerAssignment[]>([]);
  const [ctrlLoading, setCtrlLoading] = useState(false);
  const [ctrlForm, setCtrlForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [ctrlDialog, setCtrlDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [allControllers, setAllControllers] = useState<ControllerUser[]>([]);
  const [selectedCtrlId, setSelectedCtrlId] = useState('');


  // ── Load zones (auto-init les 10 zones par défaut si l'événement n'en a pas) ─
  const loadZones = useCallback(async () => {
    try {
      setZonesLoading(true);
      let data = await AccessAPI.getZones(eventId);
      if (data.length === 0) {
        data = await AccessAPI.applyDefaultZones(eventId);
      }
      setZones(Array.isArray(data) ? data : []);
    } catch { toast.error('Erreur lors du chargement des zones'); }
    finally { setZonesLoading(false); }
  }, [eventId]);

  // ── Prochain code zone disponible ──────────────────────────────────────────
  const nextZoneCode = useMemo(() => {
    if (zones.length === 0) return 'Z11';
    const nums = zones
      .map(z => parseInt(z.code.replace(/^Z/, ''), 10))
      .filter(n => !isNaN(n));
    return `Z${Math.max(...nums) + 1}`;
  }, [zones]);

  // ── Load categories + matrix (auto-init les catégories par défaut si vides) ─
  const loadCategories = useCallback(async () => {
    try {
      setCatsLoading(true);
      let cats = await AccessAPI.getCategories(eventId);
      if (cats.length === 0) {
        cats = await AccessAPI.applyDefaultCategories(eventId);
      }
      const [data, matrixData] = await Promise.all([
        Promise.resolve(cats),
        AccessAPI.getAccessMatrix(eventId),
      ]);
      setCategories(Array.isArray(data) ? data : []);
      const map: Record<string, Record<string, ZoneAccessLevel>> = {};
      matrixData.categories.forEach((cat) => {
        map[cat.id] = {};
        (cat.accessRights ?? []).forEach((r) => {
          map[cat.id][r.zoneId] = r.accessLevel;
        });
      });
      setMatrix(map);
      setMatrixDirty(false);
    } catch { toast.error('Erreur lors du chargement des catégories'); }
    finally { setCatsLoading(false); }
  }, [eventId]);

  // ── Load badges ──────────────────────────────────────────────────────────
  const loadBadges = useCallback(async () => {
    try {
      setBadgesLoading(true);
      setBadges(await AccessAPI.getBadges(eventId));
    } catch { toast.error('Erreur lors du chargement des badges'); }
    finally { setBadgesLoading(false); }
  }, [eventId]);

  // ── Load tracking ─────────────────────────────────────────────────────────
  const loadTracking = useCallback(async () => {
    try {
      setTrackingLoading(true);
      const [t, l] = await Promise.all([
        AccessAPI.getTracking(eventId),
        AccessAPI.getAccessLogs(eventId, {
          ...(logsFilter.zoneId ? { zoneId: logsFilter.zoneId } : {}),
          ...(logsFilter.result ? { result: logsFilter.result as any } : {}),
        }),
      ]);
      setTracking(t);
      setLogs(l);
    } catch { toast.error('Erreur lors du chargement du tracking'); }
    finally { setTrackingLoading(false); }
  }, [eventId, logsFilter]);

  const loadRefused = useCallback(async () => {
    setRefusedLoading(true);
    try { setRefusedLogs(await AccessAPI.getRefusedAttempts(eventId)); }
    catch { toast.error('Erreur chargement refus'); }
    finally { setRefusedLoading(false); }
  }, [eventId]);

  const loadSuspectReports = useCallback(async () => {
    setSuspectLoading(true);
    try { setSuspectReports(await AccessAPI.getSuspectReports(eventId)); }
    catch { toast.error('Erreur chargement signalements'); }
    finally { setSuspectLoading(false); }
  }, [eventId]);

  const handleReportSuspect = async () => {
    if (!reportDialog.badge || !reportReason.trim()) return;
    try {
      await AccessAPI.reportSuspectBadge(reportDialog.badge.id, reportReason.trim());
      toast.success('Badge signalé');
      setReportDialog({ open: false });
      setReportReason('');
      loadSuspectReports();
    } catch { toast.error('Erreur lors du signalement'); }
  };

  useEffect(() => { loadZones(); }, [loadZones]);
  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { if (activeTab === 'categories') loadCategories(); }, [activeTab, loadCategories]);
  useEffect(() => { if (activeTab === 'badges') loadBadges(); }, [activeTab, loadBadges]);
  useEffect(() => {
    if (activeTab === 'tracking') loadTracking();
  }, [activeTab, loadTracking]);
  useEffect(() => {
    if (activeTab === 'alertes') { loadRefused(); loadSuspectReports(); }
  }, [activeTab, loadRefused, loadSuspectReports]);

  // WebSocket temps réel — met à jour une zone à chaque scan accordé
  useAccessSocket(eventId, (updatedZone) => {
    setTracking(prev => {
      const idx = prev.findIndex(t => t.zoneId === updatedZone.zoneId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedZone;
        return next;
      }
      return [...prev, updatedZone];
    });
  });


  // ── Zone actions ────────────────────────────────────────────────────────────

  const handleApplyDefaultZones = async () => {
    try {
      const data = await AccessAPI.applyDefaultZones(eventId);
      const zonesArray = Array.isArray(data) ? data : [];
      setZones(zonesArray);
      toast.success(`${zonesArray.length} zones chargées`);
    } catch { toast.error('Erreur lors de l\'application des templates'); }
  };

  const handleSaveZone = async () => {
    try {
      if (zoneDialog.zone) {
        const updated = await AccessAPI.updateZone(eventId, zoneDialog.zone.id, {
          name: zoneForm.name,
          description: zoneForm.description || undefined,
          color: zoneForm.color,
          maxCapacity: zoneForm.maxCapacity ? Number(zoneForm.maxCapacity) : undefined,
        });
        setZones(prev => prev.map(z => z.id === updated.id ? updated : z));
        toast.success('Zone mise à jour');
      } else {
        const created = await AccessAPI.createZone(eventId, {
          code: zoneForm.code,
          name: zoneForm.name,
          description: zoneForm.description || undefined,
          color: zoneForm.color,
          maxCapacity: zoneForm.maxCapacity ? Number(zoneForm.maxCapacity) : undefined,
        });
        setZones(prev => [...prev, created]);
        toast.success('Zone créée');
      }
      setZoneDialog({ open: false });
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Erreur lors de la sauvegarde');
    }
  };

  const handleToggleZone = async (zone: EventZone) => {
    try {
      const updated = await AccessAPI.updateZone(eventId, zone.id, { isActive: !zone.isActive });
      setZones(prev => prev.map(z => z.id === updated.id ? updated : z));
    } catch { toast.error('Erreur'); }
  };

  const handleDeleteZone = async (zone: EventZone) => {
    setConfirmDialog({
      open: true,
      title: 'Supprimer la zone',
      description: `Supprimer la zone "${zone.name}" ? Cette action est définitive.`,
      confirmLabel: 'Supprimer',
      loading: false,
      onConfirm: async () => {
        try {
          await AccessAPI.deleteZone(eventId, zone.id);
          setZones(prev => prev.filter(z => z.id !== zone.id));
          toast.success('Zone supprimée');
        } catch {
          toast.error('Erreur lors de la suppression');
        }
      },
    });
  };

  // ── Category actions ──────────────────────────────────────────────────────

  const handleApplyDefaultCategories = async () => {
    try {
      const data = await AccessAPI.applyDefaultCategories(eventId);
      const categoriesArray = Array.isArray(data) ? data : [];
      setCategories(categoriesArray);
      await loadCategories();
      toast.success(`${categoriesArray.length} catégories chargées`);
    } catch { toast.error('Erreur'); }
  };

  const handleSaveCategory = async () => {
    try {
      if (catDialog.cat) {
        const updated = await AccessAPI.updateCategory(eventId, catDialog.cat.id, catForm);
        setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
        toast.success('Catégorie mise à jour');
      } else {
        const created = await AccessAPI.createCategory(eventId, catForm);
        setCategories(prev => [...prev, created]);
        toast.success('Catégorie créée');
      }
      setCatDialog({ open: false });
      await loadCategories();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Erreur');
    }
  };

  const handleDeleteCategory = async (cat: ParticipantCategory) => {
    setConfirmDialog({
      open: true,
      title: 'Supprimer la catégorie',
      description: `Supprimer la catégorie "${cat.name}" ? Cette action est définitive.`,
      confirmLabel: 'Supprimer',
      loading: false,
      onConfirm: async () => {
        try {
          await AccessAPI.deleteCategory(eventId, cat.id);
          setCategories(prev => prev.filter(c => c.id !== cat.id));
          toast.success('Catégorie supprimée');
        } catch {
          toast.error('Erreur');
        }
      },
    });
  };

  // ── Matrix actions ────────────────────────────────────────────────────────

  const toggleCell = (categoryId: string, zoneId: string) => {
    setMatrix(prev => {
      const current = prev[categoryId]?.[zoneId] ?? 'NON';
      return {
        ...prev,
        [categoryId]: { ...(prev[categoryId] ?? {}), [zoneId]: LEVEL_NEXT[current] },
      };
    });
    setMatrixDirty(true);
  };

  const handleSaveMatrix = async () => {
    try {
      setMatrixSaving(true);
      const rights: { categoryId: string; zoneId: string; accessLevel: ZoneAccessLevel }[] = [];
      for (const [catId, zoneMap] of Object.entries(matrix)) {
        for (const [zoneId, level] of Object.entries(zoneMap)) {
          rights.push({ categoryId: catId, zoneId, accessLevel: level });
        }
      }
      if (rights.length === 0) { toast.error('Aucun droit à sauvegarder'); return; }
      await AccessAPI.setAccessRights(eventId, rights);
      setMatrixDirty(false);
      toast.success('Matrice sauvegardée');
    } catch { toast.error('Erreur lors de la sauvegarde'); }
    finally { setMatrixSaving(false); }
  };

  const handleApplyDefaultMatrix = async () => {
    try {
      const result = await AccessAPI.applyDefaultMatrix(eventId);
      await loadCategories();
      toast.success(`${result.applied} droits appliqués par défaut`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Erreur — créez d\'abord les zones et catégories');
    }
  };

  // ── Badge wizard ──────────────────────────────────────────────────────────

  const resetBadgeWizard = () => {
    setBadgeStep(0);
    setCsvMode(false);
    setCsvRows([]);
    setCsvFileName('');
    setCsvError('');
    setBadgePricing(null);
    setBadgeWizardPaying(false);
    setGeneratedBadges([]);
    setBadgeForm({ categoryId: '', holderName: '', holderEmail: '', holderPhone: '', holderPhoto: '', ticketId: '' });
    setBadgePhotoPreview(null);
    setBadgeCategoryFormOpen(false);
    setBadgeCategoryForm({ name: '', description: '', color: '#6B7280' });
  };

  const handleBadgePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setBadgePhotoPreview(result);
      setBadgeForm(p => ({ ...p, holderPhoto: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    setCsvError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = ev.target?.result;
      if (!raw) { setCsvError('Impossible de lire le fichier'); return; }
      const rows = parseCsvOrXlsxRows(file, raw).filter(r => r.holderName && r.holderEmail && r.holderEmail.includes('@'));
      if (rows.length === 0) { setCsvError('Aucune ligne valide — format attendu : Nom, Email, Téléphone, Catégorie'); return; }
      setCsvRows(rows);
      setCsvMode(true);
      setBadgeForm({ categoryId: '', holderName: '', holderEmail: '', holderPhone: '', holderPhoto: '', ticketId: '' });
      setBadgePhotoPreview(null);
    };
    if (/\.(xlsx|xls)$/i.test(file.name)) {
      reader.readAsArrayBuffer(file);
      return;
    }
    reader.readAsText(file);
  };

  const handleClearCsv = () => { setCsvMode(false); setCsvRows([]); setCsvFileName(''); setCsvError(''); };

  const downloadCsvTemplate = () => {
    const content = 'Nom,Email,Téléphone,Catégorie\nJean Dupont,jean@exemple.com,+242 06 123 456,VIP';
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'modele-badges-feeti.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const badgeCount = csvMode ? csvRows.length : (badgeForm.holderName.trim() && badgeForm.holderEmail.trim() ? 1 : 0);

  const handleBadgeWizardNext = async () => {
    if (!csvMode) {
      if (!badgeForm.categoryId) { toast.error('Choisissez une catégorie'); return; }
      if (!badgeForm.holderName.trim()) { toast.error('Le nom est obligatoire'); return; }
      if (!badgeForm.holderEmail.trim()) { toast.error("L'email est obligatoire"); return; }
      const duplicateEmail = findDuplicateBadgeEmail([{ holderEmail: badgeForm.holderEmail }], badges);
      if (duplicateEmail) {
        toast.error(`Un badge existe déjà pour ${duplicateEmail}`);
        return;
      }
    } else if (csvRows.length === 0) {
      toast.error('Aucune ligne valide dans le fichier'); return;
    } else {
      const duplicateEmail = findDuplicateBadgeEmail(csvRows, badges);
      if (duplicateEmail) {
        toast.error(`Un badge existe déjà pour ${duplicateEmail}`);
        return;
      }
    }
    if (!badgePricing) {
      try { setBadgePricing(await AccessAPI.getBadgePricing()); }
      catch { toast.error('Erreur chargement tarification'); return; }
    }
    setBadgeStep(1);
  };

  const handlePayAndGenerate = async () => {
    if (!badgePricing) return;
    const duplicateEmail = csvMode
      ? findDuplicateBadgeEmail(csvRows, badges)
      : findDuplicateBadgeEmail([{ holderEmail: badgeForm.holderEmail }], badges);
    if (duplicateEmail) {
      toast.error(`Un badge existe déjà pour ${duplicateEmail}`);
      return;
    }
    setBadgeWizardPaying(true);
    try {
      const order = await AccessAPI.createBadgeOrder(eventId, badgeCount);
      await AccessAPI.payBadgeOrder(order.id);
      let created: AccessBadge[];
      if (csvMode) {
        created = await AccessAPI.generateBulkBadges(eventId, {
          badges: csvRows.map(r => ({
            holderName: r.holderName,
            holderEmail: r.holderEmail,
            ...(r.holderPhone ? { holderPhone: r.holderPhone } : {}),
            ...(r.categoryName ? { categoryName: r.categoryName } : {}),
          })),
        });
      } else {
        const badge = await AccessAPI.generateBadge(eventId, {
          categoryId:  badgeForm.categoryId,
          holderName:  badgeForm.holderName,
          holderEmail: badgeForm.holderEmail,
          ...(badgeForm.holderPhone  ? { holderPhone:  badgeForm.holderPhone }  : {}),
          ...(badgeForm.holderPhoto  ? { holderPhoto:  badgeForm.holderPhoto }  : {}),
          ...(badgeForm.ticketId     ? { ticketId:     badgeForm.ticketId }     : {}),
        });
        created = [badge];
      }
      setGeneratedBadges(created);
      setBadges(prev => [...created, ...prev]);
      setBadgeStep(2);
      toast.success(`${created.length} badge${created.length > 1 ? 's' : ''} généré${created.length > 1 ? 's' : ''} !`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Erreur lors de la génération');
    } finally {
      setBadgeWizardPaying(false);
    }
  };

  const handleCreateBadgeCategory = async () => {
    if (!badgeCategoryForm.name.trim()) {
      toast.error('Le nom de la catégorie est obligatoire');
      return;
    }
    try {
      const created = await AccessAPI.createCategory(eventId, {
        name: badgeCategoryForm.name.trim(),
        description: badgeCategoryForm.description.trim() || undefined,
        color: badgeCategoryForm.color,
      });
      await loadCategories();
      setBadgeCategoryForm({ name: '', description: '', color: '#6B7280' });
      setBadgeCategoryFormOpen(false);
      setBadgeForm(prev => ({ ...prev, categoryId: prev.categoryId || created.id }));
      toast.success('Catégorie ajoutée');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Erreur lors de la création de la catégorie');
    }
  };

  const handleDeleteBadgeCategory = async (category: ParticipantCategory) => {
    setConfirmDialog({
      open: true,
      title: 'Supprimer la catégorie',
      description: `Supprimer la catégorie "${category.name}" ? Cette action est définitive.`,
      confirmLabel: 'Supprimer',
      loading: false,
      onConfirm: async () => {
        try {
          await AccessAPI.deleteCategory(eventId, category.id);
          await loadCategories();
          if (badgeForm.categoryId === category.id) {
            setBadgeForm(prev => ({ ...prev, categoryId: '' }));
          }
          toast.success('Catégorie supprimée');
        } catch (e: any) {
          toast.error(e?.response?.data?.message ?? 'Erreur lors de la suppression de la catégorie');
        }
      },
    });
  };

  const downloadGeneratedPdf = async () => {
    if (generatedBadges.length === 0) return;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    for (let i = 0; i < generatedBadges.length; i++) {
      const badge = generatedBadges[i];
      if (i > 0) doc.addPage();
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, 210, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16); doc.setFont('helvetica', 'bold');
      doc.text('Fééti Access', 14, 12);
      doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.text(eventTitle, 14, 20);
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(14); doc.setFont('helvetica', 'bold');
      doc.text(badge.holderName, 14, 40);
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(badge.holderEmail, 14, 48);
      if (badge.holderPhone) doc.text(badge.holderPhone, 14, 55);
      const catY = badge.holderPhone ? 63 : 56;
      doc.setFontSize(9); doc.setTextColor(100, 100, 100);
      doc.text(`Catégorie : ${badge.category?.name ?? badge.categoryLabel ?? '—'}`, 14, catY);
      doc.text(`Statut : Actif`, 14, catY + 7);
      try {
        const dataUrl = await QRCode.toDataURL(badge.qrCode, { width: 300, margin: 1, errorCorrectionLevel: 'M' });
        doc.addImage(dataUrl, 'PNG', (210 - 80) / 2, 85, 80, 80);
      } catch { /* fallback */ }
      doc.setFontSize(7); doc.setTextColor(160, 160, 160);
      doc.text(`Badge ID: ${badge.id}`, 14, 280);
      doc.text('Fééti Access — Contrôle d\'accès sécurisé', 105, 280, { align: 'center' });
    }
    doc.save(`badges-feeti-access-${eventId}.pdf`);
  };

  const downloadBadgePdf = async (badge: AccessBadge) => {
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, 210, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Fééti Access', 14, 12);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(eventTitle, 14, 20);

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(badge.holderName, 14, 40);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(badge.holderEmail, 14, 48);
      if (badge.holderPhone) doc.text(badge.holderPhone, 14, 55);
      const categoryY = badge.holderPhone ? 63 : 56;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Catégorie : ${badge.category?.name ?? badge.categoryLabel ?? '—'}`, 14, categoryY);
      doc.text(`Statut : ${badge.status === 'active' ? 'Actif' : badge.status === 'revoked' ? 'Révoqué' : 'Expiré'}`, 14, categoryY + 7);

      const dataUrl = await QRCode.toDataURL(badge.qrCode, { width: 300, margin: 1, errorCorrectionLevel: 'M' });
      doc.addImage(dataUrl, 'PNG', (210 - 80) / 2, 85, 80, 80);

      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text(`Badge ID: ${badge.id}`, 14, 280);
      doc.text('Fééti Access — Contrôle d\'accès sécurisé', 105, 280, { align: 'center' });
      doc.save(`badge-${badge.holderName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      toast.success('Badge téléchargé');
    } catch {
      toast.error('Erreur lors du téléchargement du badge');
    }
  };

  const downloadGeneratedCsv = () => {
    if (generatedBadges.length === 0) return;
    const header = 'Nom,Email,Téléphone,Catégorie,Statut,QR Code';
    const rows = generatedBadges.map(b =>
      `"${b.holderName}","${b.holderEmail}","${b.holderPhone ?? ''}","${b.category?.name ?? b.categoryLabel ?? ''}","${b.status}","${b.qrCode}"`
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `badges-generes-${eventId}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendBadge = async (badge: AccessBadge) => {
    try {
      const updated = await AccessAPI.sendBadge(eventId, badge.id);
      setBadges(prev => prev.map(b => b.id === updated.id ? updated : b));
      toast.success('Badge envoyé par email');
    } catch { toast.error('Erreur lors de l\'envoi'); }
  };

  const handleSendBadgeSms = async (badge: AccessBadge) => {
    try {
      const result = await AccessAPI.sendBadgeSms(eventId, badge.id, badge.holderPhone ?? undefined);
      toast.success(result.provider === 'simulation' ? 'SMS simulÃ©' : 'Badge envoyÃ© par SMS');
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Erreur SMS'); }
  };

  const handleRevokeBadge = async (badge: AccessBadge) => {
    setConfirmDialog({
      open: true,
      title: 'Révoquer le badge',
      description: `Révoquer le badge de ${badge.holderName} ? La personne ne pourra plus passer les contrôles tant que le badge reste révoqué.`,
      confirmLabel: 'Révoquer',
      loading: false,
      onConfirm: async () => {
        try {
          const updated = await AccessAPI.revokeBadge(eventId, badge.id);
          setBadges(prev => prev.map(b => b.id === updated.id ? updated : b));
          toast.success('Badge révoqué');
        } catch {
          toast.error('Erreur');
        }
      },
    });
  };

  const handleActivateBadge = async (badge: AccessBadge) => {
    try {
      const updated = await AccessAPI.activateBadge(eventId, badge.id);
      setBadges(prev => prev.map(b => b.id === updated.id ? updated : b));
      toast.success('Badge activé');
    } catch { toast.error('Erreur'); }
  };

  // ── Export ────────────────────────────────────────────────────────────────

  const handleExportCsv = async () => {
    try {
      await AccessAPI.exportCsv(eventId);
      toast.success('Export CSV téléchargé');
    } catch { toast.error('Erreur lors de l\'export'); }
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      title: '',
      description: '',
      confirmLabel: 'Confirmer',
      loading: false,
      onConfirm: null,
    });
  };

  const handleConfirmDialogConfirm = async () => {
    const action = confirmDialog.onConfirm;
    if (!action || confirmDialog.loading) return;
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    if (action) {
      try {
        await action();
        closeConfirmDialog();
      } catch {
        setConfirmDialog(prev => ({ ...prev, loading: false }));
      }
    }
  };

  const handleExportBadgesCsv = async () => {
    try {
      await AccessAPI.exportBadgesCsv(eventId);
      toast.success('Export badges tÃ©lÃ©chargÃ©');
    } catch { toast.error('Erreur lors de l\'export badges'); }
  };

  const handleExportBadgesPdf = async () => {
    if (badges.length === 0) return;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    for (let i = 0; i < badges.length; i++) {
      const badge = badges[i];
      if (i > 0) doc.addPage();

      // En-tête
      doc.setFillColor(79, 70, 229); // indigo-600
      doc.rect(0, 0, 210, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Fééti Access', 14, 12);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(eventTitle, 14, 20);

      // Infos porteur
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(badge.holderName, 14, 40);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(badge.holderEmail, 14, 48);
      if (badge.holderPhone) doc.text(badge.holderPhone, 14, 55);
      const categoryY = badge.holderPhone ? 63 : 56;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Catégorie : ${badge.category?.name ?? badge.categoryLabel ?? '—'}`, 14, categoryY);
      doc.text(`Statut : ${badge.status === 'active' ? 'Actif' : badge.status === 'revoked' ? 'Révoqué' : 'Expiré'}`, 14, categoryY + 7);

      // QR code visuel (centré, 80×80 mm)
      try {
        const dataUrl = await QRCode.toDataURL(badge.qrCode, { width: 300, margin: 1, errorCorrectionLevel: 'M' });
        const qrX = (210 - 80) / 2;
        doc.addImage(dataUrl, 'PNG', qrX, 85, 80, 80);
      } catch { /* fallback texte si échec */ }

      // Pied de page
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text(`Badge ID: ${badge.id}`, 14, 280);
      doc.text('Fééti Access — Contrôle d\'accès sécurisé', 105, 280, { align: 'center' });
    }
    doc.save(`badges-feeti-access-${eventId}.pdf`);
    toast.success(`${badges.length} badge${badges.length > 1 ? 's' : ''} exporté${badges.length > 1 ? 's' : ''} en PDF`);
  };

  const handleDuplicateConfig = async () => {
    if (!sourceEventId.trim()) return;
    try {
      const result = await AccessAPI.duplicateConfig(eventId, sourceEventId.trim());
      await Promise.all([loadZones(), loadCategories()]);
      toast.success(`${result.zones} zones, ${result.categories} catÃ©gories, ${result.rights} droits copiÃ©s`);
      setSourceEventId('');
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Duplication impossible'); }
  };

  // ── Contrôleurs actions ──────────────────────────────────────────────────────

  const loadControllers = useCallback(async () => {
    try {
      setCtrlLoading(true);
      const data = await ControllerAPI.listForEvent(eventId);
      setControllers(data);
    } catch { toast.error('Erreur lors du chargement des contrôleurs'); }
    finally { setCtrlLoading(false); }
  }, [eventId]);

  useEffect(() => { if (activeTab === 'controleurs') loadControllers(); }, [activeTab, loadControllers]);

  const handleCreateController = async () => {
    if (!ctrlForm.name.trim() || !ctrlForm.email.trim() || !ctrlForm.password.trim()) return;
    try {
      await ControllerAPI.createAndAssign(eventId, ctrlForm);
      await loadControllers();
      setCtrlDialog(false);
      setCtrlForm({ name: '', email: '', password: '', phone: '' });
      toast.success('Contrôleur créé et assigné');
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Erreur'); }
  };

  const handleAssignController = async () => {
    if (!selectedCtrlId) return;
    const ctrl = allControllers.find(c => c.id === selectedCtrlId);
    if (!ctrl) return;
    try {
      await ControllerAPI.assignExisting(eventId, { email: ctrl.email });
      await loadControllers();
      setAssignDialog(false);
      setSelectedCtrlId('');
      toast.success('Contrôleur assigné');
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Contrôleur déjà assigné'); }
  };

  const handleRemoveController = async (controllerId: string) => {
    try {
      await ControllerAPI.remove(eventId, controllerId);
      setControllers(prev => prev.filter(c => c.id !== controllerId));
      toast.success('Contrôleur retiré');
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Erreur'); }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Feeti Access</h1>
              <p className="text-sm text-gray-500 truncate max-w-xs">{eventTitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto mb-6">
            <TabsList className="flex w-max min-w-full h-auto p-1">
              <TabsTrigger value="zones" className="flex-1 flex items-center gap-1 text-xs sm:text-sm whitespace-nowrap px-3 py-2">
                <Map className="w-4 h-4 shrink-0" />Zones
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex-1 flex items-center gap-1 text-xs sm:text-sm whitespace-nowrap px-3 py-2">
                <Users className="w-4 h-4 shrink-0" />Catégories
              </TabsTrigger>
              <TabsTrigger value="badges" className="flex-1 flex items-center gap-1 text-xs sm:text-sm whitespace-nowrap px-3 py-2">
                <TicketCheck className="w-4 h-4 shrink-0" />Badges QR
              </TabsTrigger>
              <TabsTrigger value="controleurs" className="flex-1 flex items-center gap-1 text-xs sm:text-sm whitespace-nowrap px-3 py-2">
                <UserCheck className="w-4 h-4 shrink-0" />Contrôleurs
              </TabsTrigger>
              <TabsTrigger value="tracking" className="flex-1 flex items-center gap-1 text-xs sm:text-sm whitespace-nowrap px-3 py-2">
                <Zap className="w-4 h-4 shrink-0" />Tracking
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── TAB ZONES ──────────────────────────────────────────────────────── */}
          <TabsContent value="zones" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Zones de l'événement</h2>
                <p className="text-sm text-gray-500">{zones.filter(z => z.isActive).length} zones actives sur {zones.length}</p>
              </div>
              <div className="flex gap-2">
                <Input
                  className="w-48 h-9 text-xs"
                  value={sourceEventId}
                  onChange={e => setSourceEventId(e.target.value)}
                  placeholder="ID Ã©vÃ©nement source"
                />
                <Button variant="outline" onClick={handleDuplicateConfig} disabled={!sourceEventId.trim()}>
                  <Copy className="w-4 h-4 mr-1" />
                  Dupliquer
                </Button>
                <Button variant="outline" onClick={handleApplyDefaultZones}>
                  <Layers className="w-4 h-4 mr-1" />
                  10 templates
                </Button>
                <Button onClick={() => {
                  setZoneForm({ code: nextZoneCode, name: '', description: '', color: '#3B82F6', maxCapacity: '' });
                  setZoneDialog({ open: true });
                }}>
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter zone
                </Button>
              </div>
            </div>

            {zonesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />)}
              </div>
            ) : zones.length === 0 ? (
              <Card className="py-16 text-center">
                <CardContent className="flex flex-col items-center gap-3 text-gray-500">
                  <Map className="w-12 h-12 opacity-30" />
                  <p className="font-medium">Aucune zone configurée</p>
                  <Button variant="outline" onClick={handleApplyDefaultZones}>
                    <Layers className="w-4 h-4 mr-1" /> Charger les 10 templates
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zones.map(zone => (
                  <Card key={zone.id} className={`transition-opacity ${zone.isActive ? '' : 'opacity-60'}`}>
                    <CardContent className="pt-4 pb-3 px-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: zone.color }}>
                            {zone.code}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm leading-tight">{zone.name}</p>
                            {zone.description && <p className="text-xs text-gray-500 line-clamp-1">{zone.description}</p>}
                          </div>
                        </div>
                        <Badge variant={zone.isActive ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                          {zone.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      {zone.maxCapacity != null && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Capacité</span>
                            <span className={zone.currentCount > zone.maxCapacity ? 'text-red-500 font-semibold' : ''}>
                              {zone.currentCount} / {zone.maxCapacity}
                            </span>
                          </div>
                          <Progress
                            value={Math.min(100, (zone.currentCount / zone.maxCapacity) * 100)}
                            className={zone.currentCount > zone.maxCapacity ? '[&>div]:bg-red-500' : ''}
                          />
                        </div>
                      )}

                      <div className="flex gap-1 pt-1 border-t">
                        <Button size="sm" variant="ghost" className="flex-1 h-7 text-xs"
                          onClick={() => {
                            setZoneForm({
                              code: zone.code, name: zone.name,
                              description: zone.description ?? '',
                              color: zone.color,
                              maxCapacity: zone.maxCapacity != null ? String(zone.maxCapacity) : '',
                            });
                            setZoneDialog({ open: true, zone });
                          }}>
                          Modifier
                        </Button>
                        <Button size="sm" variant="ghost" className="flex-1 h-7 text-xs"
                          onClick={() => handleToggleZone(zone)}>
                          {zone.isActive ? 'Désactiver' : 'Activer'}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteZone(zone)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── TAB CATÉGORIES & DROITS ────────────────────────────────────────── */}
          <TabsContent value="categories" className="space-y-6">
            {/* Categories */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h2 className="text-xl font-bold text-gray-900">Catégories de participants</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleApplyDefaultCategories}>
                    <Layers className="w-4 h-4 mr-1" />10 catégories
                  </Button>
                  <Button onClick={() => {
                    setCatForm({ name: '', description: '', color: '#6B7280' });
                    setCatDialog({ open: true });
                  }}>
                    <Plus className="w-4 h-4 mr-1" />Ajouter
                  </Button>
                </div>
              </div>

              {catsLoading ? (
                <div className="flex gap-2 flex-wrap">
                  {[1,2,3,4].map(i => <div key={i} className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />)}
                </div>
              ) : categories.length === 0 ? (
                <Card className="py-10 text-center">
                  <CardContent className="text-gray-500">Aucune catégorie. Utilisez les 10 catégories par défaut.</CardContent>
                </Card>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border shadow-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                      <button onClick={() => {
                        setCatForm({ name: cat.name, description: cat.description ?? '', color: cat.color });
                        setCatDialog({ open: true, cat });
                      }} className="text-gray-400 hover:text-gray-600 text-xs">✎</button>
                      <button onClick={() => handleDeleteCategory(cat)} className="text-gray-300 hover:text-red-500 text-xs">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Matrix */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Matrice d'accès</h2>
                  <p className="text-sm text-gray-500">Cliquez sur une cellule pour changer le niveau.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" onClick={handleApplyDefaultMatrix}>
                    <RefreshCw className="w-4 h-4 mr-1" />Matrice par défaut
                  </Button>
                  {matrixDirty && (
                    <Button onClick={handleSaveMatrix} disabled={matrixSaving}>
                      {matrixSaving ? 'Sauvegarde...' : 'Sauvegarder la matrice'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Légende */}
              <div className="flex gap-3 mb-3 text-xs">
                {(['OUI','COND','NON'] as ZoneAccessLevel[]).map(l => (
                  <span key={l} className="px-2 py-0.5 rounded font-semibold text-white" style={{ backgroundColor: LEVEL_COLORS[l] }}>{l}</span>
                ))}
                <span className="text-gray-500">— cliquer pour changer</span>
              </div>

              {categories.length === 0 || zones.length === 0 ? (
                <Card className="py-8 text-center">
                  <CardContent className="text-gray-500 text-sm">
                    Configurez d'abord les zones et les catégories pour accéder à la matrice.
                  </CardContent>
                </Card>
              ) : (
                <div className="overflow-x-auto rounded-xl border bg-white">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-2 text-left font-semibold text-gray-600 min-w-[160px] sticky left-0 bg-gray-50">
                          Catégorie / Zone
                        </th>
                        {zones.filter(z => z.isActive).map(z => (
                          <th key={z.id} className="px-2 py-2 text-center font-semibold min-w-[80px]">
                            <div className="flex flex-col items-center gap-0.5">
                              <div className="w-6 h-6 rounded text-white text-xs flex items-center justify-center font-bold"
                                style={{ backgroundColor: z.color }}>{z.code}</div>
                              <span className="text-xs text-gray-500 max-w-[70px] truncate">{z.name}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat, idx) => (
                        <tr key={cat.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 font-medium text-gray-700 sticky left-0 bg-inherit flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                            <span className="max-w-[130px] truncate">{cat.name}</span>
                          </td>
                          {zones.filter(z => z.isActive).map(zone => {
                            const level: ZoneAccessLevel = matrix[cat.id]?.[zone.id] ?? 'NON';
                            return (
                              <td key={zone.id} className="px-2 py-1.5 text-center">
                                <button
                                  className="px-2 py-0.5 rounded text-xs font-bold transition-opacity hover:opacity-80 text-white"
                                  style={{ backgroundColor: LEVEL_COLORS[level] }}
                                  onClick={() => toggleCell(cat.id, zone.id)}
                                >
                                  {level}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── TAB BADGES QR ──────────────────────────────────────────────────── */}
          <TabsContent value="badges" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Badges QR</h2>
                <p className="text-sm text-gray-500">{badges.length} badge{badges.length > 1 ? 's' : ''}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" onClick={handleExportBadgesCsv} disabled={badges.length === 0}>
                  <Download className="w-4 h-4 mr-1" />CSV badges
                </Button>
                <Button variant="outline" onClick={handleExportBadgesPdf} disabled={badges.length === 0}>
                  <Download className="w-4 h-4 mr-1" />PDF badges
                </Button>
                <Button onClick={() => setBadgeDialog(true)}>
                  <Plus className="w-4 h-4 mr-1" />Générer un badge
                </Button>
              </div>
            </div>

            {badgesLoading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}
              </div>
            ) : badges.length === 0 ? (
              <Card className="py-16 text-center">
                <CardContent className="flex flex-col items-center gap-3 text-gray-500">
                  <TicketCheck className="w-12 h-12 opacity-30" />
                  <p>Aucun badge généré</p>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-white rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titulaire</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Envoyé</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {badges.map(badge => (
                      <TableRow key={badge.id}>
                        <TableCell>
                          <p className="font-medium text-gray-900">{badge.holderName}</p>
                          <p className="text-xs text-gray-500">{badge.holderEmail}</p>
                          {badge.holderPhone && <p className="text-xs text-gray-400">{badge.holderPhone}</p>}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{badge.category?.name ?? '—'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            badge.status === 'active' ? 'default' :
                            badge.status === 'revoked' ? 'destructive' : 'secondary'
                          }>
                            {badge.status === 'active' ? 'Actif' : badge.status === 'revoked' ? 'Révoqué' : 'Expiré'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {badge.sentAt ? (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />{fmt(badge.sentAt)}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Non envoyé</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Voir QR"
                              onClick={() => setQrDialog({ open: true, badge })}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Télécharger le badge"
                              onClick={() => downloadBadgePdf(badge)}>
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Envoyer par email"
                              onClick={() => handleSendBadge(badge)}>
                              <Mail className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Envoyer par SMS"
                              onClick={() => handleSendBadgeSms(badge)}>
                              <Zap className="w-3.5 h-3.5" />
                            </Button>
                            {badge.status === 'active' ? (
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" title="Désactiver"
                                onClick={() => handleRevokeBadge(badge)}>
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            ) : (
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700" title="Activer"
                                onClick={() => handleActivateBadge(badge)}>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

            )}
          </TabsContent>

          {/* ── TAB CONTRÔLEURS ───────────────────────────────────────────────── */}
          <TabsContent value="controleurs" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Contrôleurs</h2>
                <p className="text-sm text-gray-500">{controllers.length} contrôleur{controllers.length > 1 ? 's' : ''} assigné{controllers.length > 1 ? 's' : ''}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={async () => {
                  const list = await ControllerAPI.getAllControllers().catch(() => []);
                  setAllControllers(list);
                  setAssignDialog(true);
                }}>
                  <UserCheck className="w-4 h-4 mr-1" />Assigner existant
                </Button>
                <Button onClick={() => setCtrlDialog(true)}>
                  <Plus className="w-4 h-4 mr-1" />Nouveau contrôleur
                </Button>
              </div>
            </div>

            {ctrlLoading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}</div>
            ) : controllers.length === 0 ? (
              <Card className="py-16 text-center">
                <CardContent className="flex flex-col items-center gap-3 text-gray-500">
                  <UserCheck className="w-12 h-12 opacity-30" />
                  <p className="font-medium">Aucun contrôleur assigné</p>
                  <p className="text-sm">Créez un compte contrôleur ou assignez un compte existant.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {controllers.map(c => (
                  <Card key={c.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <UserCheck className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{c.controller.name}</p>
                          <p className="text-xs text-gray-500">{c.controller.email}</p>
                          {c.controller.phone && <p className="text-xs text-gray-400">{c.controller.phone}</p>}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveController(c.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Dialog nouveau contrôleur */}
            <Dialog open={ctrlDialog} onOpenChange={setCtrlDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Nouveau contrôleur</DialogTitle></DialogHeader>
                <div className="space-y-3 pt-2">
                  <div><Label>Nom <span className="text-red-500">*</span></Label>
                    <Input value={ctrlForm.name} onChange={e => setCtrlForm(p => ({ ...p, name: e.target.value }))} placeholder="Nom du contrôleur" />
                  </div>
                  <div><Label>Email <span className="text-red-500">*</span></Label>
                    <Input type="email" value={ctrlForm.email} onChange={e => setCtrlForm(p => ({ ...p, email: e.target.value }))} placeholder="email@exemple.com" />
                  </div>
                  <div><Label>Mot de passe <span className="text-red-500">*</span></Label>
                    <Input type="password" value={ctrlForm.password} onChange={e => setCtrlForm(p => ({ ...p, password: e.target.value }))} placeholder="Mot de passe" />
                  </div>
                  <div><Label>Téléphone</Label>
                    <Input value={ctrlForm.phone} onChange={e => setCtrlForm(p => ({ ...p, phone: e.target.value }))} placeholder="+225 XX XX XX XX XX" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => setCtrlDialog(false)}>Annuler</Button>
                    <Button className="flex-1" onClick={handleCreateController}
                      disabled={!ctrlForm.name.trim() || !ctrlForm.email.trim() || !ctrlForm.password.trim()}>
                      Créer et assigner
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Dialog assigner existant */}
            <Dialog open={assignDialog} onOpenChange={(o) => { setAssignDialog(o); if (!o) setSelectedCtrlId(''); }}>
              <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>Assigner un contrôleur existant</DialogTitle></DialogHeader>
                <div className="space-y-3 pt-2">
                  {(() => {
                    const assignedIds = new Set(controllers.map(c => c.controllerId));
                    const available = allControllers.filter(c => !assignedIds.has(c.id));
                    return available.length === 0 ? (
                      <div className="py-6 text-center text-sm text-gray-500">
                        <UserCheck className="w-10 h-10 mx-auto opacity-20 mb-2" />
                        Aucun contrôleur disponible à assigner.<br />
                        Tous vos contrôleurs sont déjà assignés à cet événement,<br />
                        ou vous n'en avez pas encore créé.
                      </div>
                    ) : (
                      <div>
                        <Label>Sélectionner un contrôleur</Label>
                        <Select value={selectedCtrlId} onValueChange={setSelectedCtrlId}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Choisir un contrôleur..." />
                          </SelectTrigger>
                          <SelectContent>
                            {available.map(c => (
                              <SelectItem key={c.id} value={c.id}>
                                <span className="font-medium">{c.name}</span>
                                <span className="text-gray-400 ml-2 text-xs">{c.email}{c.phone ? ` · ${c.phone}` : ''}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })()}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => setAssignDialog(false)}>Annuler</Button>
                    <Button className="flex-1" onClick={handleAssignController} disabled={!selectedCtrlId}>
                      Assigner
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

          </TabsContent>

          {/* ── TAB TRACKING ──────────────────────────────────────────────────── */}
          <TabsContent value="tracking" className="space-y-6">
            {/* Zone Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-900">Flux en temps réel</h2>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/scan/access/${eventId}`)}>
                    <QrCode className="w-4 h-4 mr-1" />Scanner Web
                  </Button>
                  <Button variant="outline" size="sm" onClick={loadTracking} disabled={trackingLoading}>
                    <RefreshCw className={`w-4 h-4 mr-1 ${trackingLoading ? 'animate-spin' : ''}`} />
                    Actualiser
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportCsv}>
                    <Download className="w-4 h-4 mr-1" />Export CSV
                  </Button>
                </div>
              </div>

              {tracking.length === 0 ? (
                <Card className="py-8 text-center">
                  <CardContent className="text-gray-500 text-sm">
                    Aucune donnée de tracking — les compteurs s'affichent dès le premier scan.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {tracking.map(t => (
                    <Card key={t.zoneId} className={t.isOverCapacity ? 'border-red-400 bg-red-50' : ''}>
                      <CardContent className="pt-3 pb-3 px-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: t.color }}>{t.code}</div>
                            <span className="text-sm font-medium text-gray-700 truncate max-w-[100px]">{t.name}</span>
                          </div>
                          {t.isOverCapacity && (
                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {t.currentCount}
                          {t.maxCapacity != null && (
                            <span className="text-sm font-normal text-gray-400"> / {t.maxCapacity}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{t.totalEntries} entrées totales</p>
                        {t.maxCapacity != null && (
                          <Progress
                            value={Math.min(100, (t.currentCount / t.maxCapacity) * 100)}
                            className={`mt-2 ${t.isOverCapacity ? '[&>div]:bg-red-500' : ''}`}
                          />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Logs */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h2 className="text-xl font-bold text-gray-900">Historique des accès</h2>
                <div className="flex gap-2 flex-wrap">
                  <Select value={logsFilter.result || 'all'} onValueChange={v => setLogsFilter(p => ({ ...p, result: v === 'all' ? '' : v }))}>
                    <SelectTrigger className="w-36 h-8 text-xs">
                      <SelectValue placeholder="Tous résultats" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="granted">Autorisés</SelectItem>
                      <SelectItem value="denied">Refusés</SelectItem>
                      <SelectItem value="conditional">Conditionnels</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={logsFilter.zoneId || 'all'} onValueChange={v => setLogsFilter(p => ({ ...p, zoneId: v === 'all' ? '' : v }))}>
                    <SelectTrigger className="w-36 h-8 text-xs">
                      <SelectValue placeholder="Toutes zones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes zones</SelectItem>
                      {zones.map(z => <SelectItem key={z.id} value={z.id}>{z.code} — {z.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={loadTracking}>
                    <RefreshCw className="w-3 h-3 mr-1" />Filtrer
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titulaire</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead>Résultat</TableHead>
                      <TableHead>Date & Heure</TableHead>
                      <TableHead>Sync offline</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">Aucun log</TableCell>
                      </TableRow>
                    ) : logs.slice(0, 200).map(log => {
                      const rb = RESULT_BADGE[log.result];
                      return (
                        <TableRow key={log.id}>
                          <TableCell>
                            <p className="font-medium text-sm">{log.badge?.holderName ?? '—'}</p>
                            <p className="text-xs text-gray-500">{log.badge?.category?.name ?? ''}</p>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {log.zone ? `${log.zone.code} — ${log.zone.name}` : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={rb.variant}>{rb.label}</Badge>
                            {log.refusalReason && (
                              <p className="text-xs text-red-500 mt-0.5">{log.refusalReason}</p>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">{fmt(log.scannedAt)}</TableCell>
                          <TableCell>
                            {log.offlineSync && <Badge variant="outline" className="text-xs">Offline</Badge>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* ── TAB ALERTES : refus + signalements suspects (FA-034 / FA-027) ── */}
          <TabsContent value="alertes" className="space-y-8">

            {/* Tentatives refusées */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Tentatives refusées</h2>
                  <p className="text-sm text-gray-500">{refusedLogs.length} refus enregistrés</p>
                </div>
                <Button variant="outline" size="sm" onClick={loadRefused} disabled={refusedLoading}>
                  <RefreshCw className={`w-4 h-4 ${refusedLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <div className="bg-white rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titulaire</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead>Motif</TableHead>
                      <TableHead>Date & Heure</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {refusedLoading ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-400">Chargement…</TableCell></TableRow>
                    ) : refusedLogs.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-400">Aucun refus enregistré</TableCell></TableRow>
                    ) : refusedLogs.map(log => (
                      <TableRow key={log.id} className="bg-red-50/40">
                        <TableCell>
                          <p className="font-medium text-sm">{log.badge?.holderName ?? '—'}</p>
                          <p className="text-xs text-gray-500">{log.badge?.category?.name ?? ''}</p>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {log.zone ? `${log.zone.code} — ${log.zone.name}` : '—'}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-red-600 font-medium">{log.refusalReason ?? 'Accès non autorisé'}</span>
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">{fmt(log.scannedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Badges signalés suspects */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Badges signalés suspects</h2>
                  <p className="text-sm text-gray-500">{suspectReports.length} signalement{suspectReports.length !== 1 ? 's' : ''}</p>
                </div>
                <Button variant="outline" size="sm" onClick={loadSuspectReports} disabled={suspectLoading}>
                  <RefreshCw className={`w-4 h-4 ${suspectLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <div className="bg-white rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titulaire du badge</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Motif du signalement</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suspectLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">Chargement…</TableCell></TableRow>
                    ) : suspectReports.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">Aucun signalement</TableCell></TableRow>
                    ) : suspectReports.map(r => (
                      <TableRow key={r.id} className="bg-amber-50/40">
                        <TableCell>
                          <p className="font-medium text-sm">{r.badge?.holderName ?? '—'}</p>
                          <p className="text-xs text-gray-500">{r.badge?.holderEmail ?? ''}</p>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{r.badge?.category?.name ?? '—'}</TableCell>
                        <TableCell className="text-sm text-amber-700 font-medium">{r.reason}</TableCell>
                        <TableCell>
                          {r.resolved
                            ? <Badge variant="default" className="bg-green-100 text-green-700 border-0 text-xs">Résolu</Badge>
                            : <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">En cours</Badge>}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">{fmt(r.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

          </TabsContent>
        </Tabs>

        <Dialog open={confirmDialog.open} onOpenChange={(open: boolean) => { if (!open) closeConfirmDialog(); }} modal={false}>
          <DialogContent className="max-w-md" hideOverlay>
            <DialogHeader>
              <DialogTitle>{confirmDialog.title}</DialogTitle>
              <DialogDescription>{confirmDialog.description}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={closeConfirmDialog} disabled={confirmDialog.loading}>Annuler</Button>
              <Button variant="destructive" onClick={handleConfirmDialogConfirm} disabled={confirmDialog.loading}>
                {confirmDialog.loading ? 'Traitement...' : confirmDialog.confirmLabel}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Dialog Zone ──────────────────────────────────────────────────────── */}
      <Dialog open={zoneDialog.open} onOpenChange={(o) => setZoneDialog(p => ({ ...p, open: o }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{zoneDialog.zone ? 'Modifier la zone' : 'Créer une zone'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {!zoneDialog.zone && (
              <div>
                <Label>Code zone</Label>
                <Input
                  value={zoneForm.code}
                  onChange={e => setZoneForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder={nextZoneCode}
                />
                <p className="text-xs text-gray-400 mt-1">Format : Z suivi d'un numéro (ex: {nextZoneCode})</p>
              </div>
            )}
            <div>
              <Label>Nom <span className="text-red-500">*</span></Label>
              <Input value={zoneForm.name} onChange={e => setZoneForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Accès Général" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={zoneForm.description} onChange={e => setZoneForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Couleur</Label>
                <div className="flex gap-2 items-center mt-1">
                  <input type="color" value={zoneForm.color}
                    onChange={e => setZoneForm(p => ({ ...p, color: e.target.value }))}
                    className="w-10 h-9 rounded border cursor-pointer" />
                  <span className="text-sm text-gray-500">{zoneForm.color}</span>
                </div>
              </div>
              <div className="flex-1">
                <Label>Capacité max</Label>
                <Input type="number" min={1} value={zoneForm.maxCapacity}
                  onChange={e => setZoneForm(p => ({ ...p, maxCapacity: e.target.value }))}
                  placeholder="Illimitée" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setZoneDialog({ open: false })}>Annuler</Button>
              <Button className="flex-1" onClick={handleSaveZone} disabled={!zoneForm.name.trim()}>
                {zoneDialog.zone ? 'Sauvegarder' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Catégorie ──────────────────────────────────────────────────── */}
      <Dialog open={catDialog.open} onOpenChange={(o) => setCatDialog(p => ({ ...p, open: o }))}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{catDialog.cat ? 'Modifier la catégorie' : 'Créer une catégorie'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Nom <span className="text-red-500">*</span></Label>
              <Input value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: VIP" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={catForm.description} onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <Label>Couleur</Label>
              <div className="flex gap-2 items-center mt-1">
                <input type="color" value={catForm.color}
                  onChange={e => setCatForm(p => ({ ...p, color: e.target.value }))}
                  className="w-10 h-9 rounded border cursor-pointer" />
                <span className="text-sm text-gray-500">{catForm.color}</span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setCatDialog({ open: false })}>Annuler</Button>
              <Button className="flex-1" onClick={handleSaveCategory} disabled={!catForm.name.trim()}>
                {catDialog.cat ? 'Sauvegarder' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Générer Badge — wizard 3 étapes ────────────────────────────── */}
      <Dialog open={badgeDialog} onOpenChange={(o) => { if (!o) resetBadgeWizard(); setBadgeDialog(o); }}>
        <DialogContent className="max-w-lg" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          <DialogHeader>
            <DialogTitle>
              {badgeStep === 0 && 'Générer un badge QR'}
              {badgeStep === 1 && 'Confirmer le paiement'}
              {badgeStep === 2 && 'Badges générés'}
            </DialogTitle>
          </DialogHeader>

          {/* ── Étape 0 : formulaire + CSV ── */}
          {badgeStep === 0 && (
            <div className="space-y-4 pt-2">

              {/* Formulaire (désactivé si CSV chargé) */}
              <div className={csvMode ? 'opacity-40 pointer-events-none select-none' : ''}>
                <div className="space-y-3">
                  <div>
                    <Label>Catégorie <span className="text-red-500">*</span></Label>
                    <Select value={badgeForm.categoryId} onValueChange={v => setBadgeForm(p => ({ ...p, categoryId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Nom <span className="text-red-500">*</span></Label>
                      <Input value={badgeForm.holderName} onChange={e => setBadgeForm(p => ({ ...p, holderName: e.target.value }))} placeholder="Nom complet" />
                    </div>
                    <div>
                      <Label>Email <span className="text-red-500">*</span></Label>
                      <Input type="email" value={badgeForm.holderEmail} onChange={e => setBadgeForm(p => ({ ...p, holderEmail: e.target.value }))} placeholder="email@exemple.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Téléphone</Label>
                      <Input value={badgeForm.holderPhone} onChange={e => setBadgeForm(p => ({ ...p, holderPhone: e.target.value }))} placeholder="+242..." />
                    </div>
                    <div>
                      <Label>ID Billet</Label>
                      <Input value={badgeForm.ticketId} onChange={e => setBadgeForm(p => ({ ...p, ticketId: e.target.value }))} placeholder="Optionnel" />
                    </div>
                  </div>
                  <div>
                    <Label>Photo (optionnel)</Label>
                    <label className="flex items-center gap-3 mt-1 cursor-pointer p-2.5 border-2 border-dashed border-gray-200 rounded-lg hover:border-indigo-400 transition-colors">
                      <Upload className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-500 flex-1 truncate">
                        {badgePhotoPreview ? 'Photo sélectionnée' : 'Cliquer pour choisir…'}
                      </span>
                      <input type="file" accept="image/*" className="sr-only" onChange={handleBadgePhotoChange} />
                    </label>
                    {badgePhotoPreview && (
                      <div className="mt-2 flex items-center gap-2">
                        <img src={badgePhotoPreview} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200" />
                        <button type="button" className="text-xs text-red-500"
                          onClick={() => { setBadgePhotoPreview(null); setBadgeForm(p => ({ ...p, holderPhoto: '' })); }}>
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Séparateur */}
              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-400 uppercase tracking-wide">ou importer un fichier CSV</span>
                </div>
              </div>

              {/* Zone CSV */}
              <div className="space-y-2">
                <div className="rounded-lg border border-dashed border-indigo-200 bg-indigo-50/70 p-3 text-xs text-indigo-800">
                  <p className="font-semibold mb-1">Colonnes attendues dans le CSV</p>
                  <p>Le fichier doit contenir exactement ces colonnes, dans cet ordre : <span className="font-medium">Nom, Email, Téléphone, Catégorie</span>.</p>
                  <p className="mt-1">Les formats acceptés sont <span className="font-medium">.csv</span>, <span className="font-medium">.xlsx</span> et <span className="font-medium">.xls</span>.</p>
                  <p className="mt-1 text-indigo-700">Le téléphone et la catégorie sont facultatifs, mais le nom et l'email sont obligatoires pour chaque ligne.</p>
                </div>
                {!csvMode ? (
                  <label className="flex items-center gap-3 cursor-pointer p-3 border-2 border-dashed border-gray-200 rounded-lg hover:border-indigo-400 transition-colors">
                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-500 flex-1">Cliquer pour importer un fichier CSV…</span>
                    <input type="file" accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" className="sr-only" onChange={handleCsvUpload} />
                  </label>
                ) : (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="text-sm font-medium text-indigo-800 truncate max-w-[200px]">{csvFileName}</span>
                        <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">{csvRows.length} ligne{csvRows.length > 1 ? 's' : ''}</span>
                      </div>
                      <button type="button" onClick={handleClearCsv} className="text-gray-400 hover:text-gray-600">
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Aperçu des 3 premières lignes */}
                    <div className="overflow-x-auto rounded border border-indigo-200 bg-white">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 text-gray-500">
                          <tr>
                            <th className="px-2 py-1 text-left font-medium">Nom</th>
                            <th className="px-2 py-1 text-left font-medium">Email</th>
                            <th className="px-2 py-1 text-left font-medium">Catégorie</th>
                          </tr>
                        </thead>
                        <tbody>
                          {csvRows.slice(0, 3).map((r, i) => (
                            <tr key={i} className="border-t border-gray-100">
                              <td className="px-2 py-1 truncate max-w-[80px]">{r.holderName}</td>
                              <td className="px-2 py-1 truncate max-w-[100px]">{r.holderEmail}</td>
                              <td className="px-2 py-1 text-gray-500">{r.categoryName || '—'}</td>
                            </tr>
                          ))}
                          {csvRows.length > 3 && (
                            <tr className="border-t border-gray-100">
                              <td colSpan={3} className="px-2 py-1 text-center text-gray-400 italic">
                                … et {csvRows.length - 3} autre{csvRows.length - 3 > 1 ? 's' : ''} ligne{csvRows.length - 3 > 1 ? 's' : ''}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {csvError && <p className="text-red-500 text-xs">{csvError}</p>}
                <button type="button" onClick={downloadCsvTemplate}
                  className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700">
                  <Download className="w-3 h-3" /> Télécharger le modèle CSV
                </button>
              </div>

              {/* Récapitulatif prix */}
              {badgeCount > 0 && badgePricing && (
                <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm">
                  <span className="text-gray-600">{badgeCount} badge{badgeCount > 1 ? 's' : ''} × {badgePricing.unitCost.toLocaleString('fr-FR')} {badgePricing.currency}</span>
                  <span className="font-bold text-emerald-700">{(badgeCount * badgePricing.unitCost).toLocaleString('fr-FR')} {badgePricing.currency}</span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setBadgeDialog(false)}>Annuler</Button>
                <Button className="flex-1" onClick={handleBadgeWizardNext} disabled={badgeCount === 0}>
                  Continuer →
                </Button>
              </div>
            </div>
          )}

          {/* ── Étape 1 : paiement ── */}
          {badgeStep === 1 && (
            <div className="space-y-4 pt-2">
              <div className="rounded-lg border bg-gray-50 p-4 space-y-2 text-sm">
                <p className="font-semibold text-gray-800 mb-1">Récapitulatif</p>
                <div className="flex justify-between"><span className="text-gray-500">Événement</span><span className="font-medium truncate ml-4 max-w-[200px]">{eventTitle}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Badges</span><span className="font-medium">{badgeCount}</span></div>
                {badgePricing ? (
                  <>
                    <div className="flex justify-between"><span className="text-gray-500">Prix unitaire</span><span>{badgePricing.unitCost.toLocaleString('fr-FR')} {badgePricing.currency}</span></div>
                    <div className="flex justify-between border-t pt-2 font-bold text-base">
                      <span>Total</span>
                      <span className="text-emerald-700">{(badgeCount * badgePricing.unitCost).toLocaleString('fr-FR')} {badgePricing.currency}</span>
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white/80 p-3 text-sm text-gray-600">
                    <p className="font-semibold">Tarification en cours de chargement...</p>
                    <p>Le montant s'affichera dès que la tarification sera prête.</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBadgeStep(0)}
                  disabled={badgeWizardPaying}
                  className="flex-1 rounded-xl border border-gray-300 bg-white text-gray-700 px-4 py-3 font-semibold transition hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={handlePayAndGenerate}
                  disabled={badgeWizardPaying || !badgePricing}
                  className="flex-1 rounded-xl bg-emerald-600 text-white text-center px-4 py-3 font-semibold transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    color: '#ffffff',
                    backgroundColor: '#059669',
                    borderColor: '#059669',
                  }}
                >
                  {badgeWizardPaying ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="relative z-10">Génération…</span>
                    </span>
                  ) : (
                    <span className="relative z-10">Confirmer et payer</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── Étape 2 : succès + téléchargements ── */}
          {badgeStep === 2 && (
            <div className="space-y-4 pt-2 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="font-semibold text-gray-900">
                {generatedBadges.length} badge{generatedBadges.length > 1 ? 's' : ''} généré{generatedBadges.length > 1 ? 's' : ''} !
              </p>
              <p className="text-sm text-gray-500">Téléchargez les badges pour les distribuer à vos participants.</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={downloadGeneratedPdf} className="flex-1">
                  <Download className="w-4 h-4 mr-1" />PDF (QR codes)
                </Button>
                <Button variant="outline" onClick={downloadGeneratedCsv} className="flex-1">
                  <Download className="w-4 h-4 mr-1" />CSV
                </Button>
              </div>
              <Button className="w-full" onClick={() => { resetBadgeWizard(); setBadgeDialog(false); }}>
                Fermer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Dialog QR Code ──────────────────────────────────────────────────────── */}
      <Dialog open={qrDialog.open} onOpenChange={(o) => setQrDialog(p => ({ ...p, open: o }))}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Badge QR — {qrDialog.badge?.holderName}</DialogTitle>
          </DialogHeader>
          {qrDialog.badge && (
            <div className="flex flex-col items-center gap-4 pt-2">
              <div className="w-full rounded-xl border bg-white p-3 space-y-3 text-left">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Catégories</p>
                    <p className="text-xs text-gray-500">Gérez les catégories depuis la vue QR du badge.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setBadgeCategoryFormOpen(v => !v)}>
                    <Plus className="w-4 h-4 mr-1" />{badgeCategoryFormOpen ? 'Fermer' : 'Ajouter'}
                  </Button>
                </div>
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <span key={category.id} className="inline-flex items-center gap-2 rounded-full border bg-gray-50 px-3 py-1 text-xs text-gray-700">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="max-w-[140px] truncate">{category.name}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteBadgeCategory(category)}
                          className="text-gray-400 hover:text-red-500"
                          title="Supprimer la catégorie"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {badgeCategoryFormOpen && (
                  <div className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
                    <Input
                      value={badgeCategoryForm.name}
                      onChange={e => setBadgeCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nom de la catégorie"
                    />
                    <Input
                      type="color"
                      value={badgeCategoryForm.color}
                      onChange={e => setBadgeCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                      className="h-10 px-2"
                    />
                    <Button type="button" onClick={handleCreateBadgeCategory}>
                      <Plus className="w-4 h-4 mr-1" />Créer
                    </Button>
                    <Input
                      className="sm:col-span-2"
                      value={badgeCategoryForm.description}
                      onChange={e => setBadgeCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description facultative"
                    />
                  </div>
                )}
              </div>

              <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
                <QRCodeSVG value={qrDialog.badge.qrCode} size={200} level="M" />
              </div>
              <div className="text-center text-sm text-gray-600">
                {qrDialog.badge.holderPhoto && (
                  <img src={qrDialog.badge.holderPhoto} alt="" className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border" />
                )}
                <p className="font-semibold">{qrDialog.badge.holderName}</p>
                <p className="text-gray-500">{qrDialog.badge.category?.name}</p>
                {qrDialog.badge.holderPhone && <p className="text-gray-400">{qrDialog.badge.holderPhone}</p>}
              </div>
              <Badge variant={
                qrDialog.badge.status === 'active' ? 'default' :
                qrDialog.badge.status === 'revoked' ? 'destructive' : 'secondary'
              }>
                {qrDialog.badge.status === 'active' ? 'Actif' : qrDialog.badge.status === 'revoked' ? 'Révoqué' : 'Expiré'}
              </Badge>
              <button
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                onClick={() => { navigator.clipboard.writeText(qrDialog.badge!.qrCode); toast.success('Données copiées'); }}>
                <Copy className="w-3 h-3" />Copier les données QR
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Dialog signalement badge suspect (FA-027) ─────────────────────────── */}
      <Dialog open={reportDialog.open} onOpenChange={(o) => setReportDialog(p => ({ ...p, open: o }))}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Signaler un badge suspect
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {reportDialog.badge && (
              <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                <p className="font-medium">{reportDialog.badge.holderName}</p>
                <p className="text-xs text-gray-500">{reportDialog.badge.holderEmail}</p>
              </div>
            )}
            <div className="space-y-1">
              <Label>Motif du signalement <span className="text-red-500">*</span></Label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                rows={3}
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
                placeholder="Ex : badge falsifié, photo non conforme, comportement suspect…"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setReportDialog({ open: false })}>
                Annuler
              </Button>
              <Button
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                onClick={handleReportSuspect}
                disabled={!reportReason.trim()}
              >
                <AlertTriangle className="w-4 h-4 mr-1" /> Signaler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FeetiAccessDashboard;
