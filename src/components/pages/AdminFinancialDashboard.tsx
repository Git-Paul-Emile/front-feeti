import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import axiosInstance from "../../api/axiosConfig";

// ─── Types ────────────────────────────────────────────────────────────
interface FluxFinanciers {
  totalEntrees: number;
  totalTVACollectee: number;
  totalCommissions: number;
  totalVersesOrganisateurs: number;
  soldesPlateforme: number;
}

interface AdminDashboard {
  fluxFinanciers: FluxFinanciers;
  topOrganisateurs: Array<{
    organizerId: string;
    nom: string;
    totalTransactions: number;
    totalTTC: number;
    totalNet: number;
  }>;
  transactionsEnLitige: number;
  alertes: string[];
  repartitionParStatut: Array<{ status: string; count: number; totalTTC: number }>;
}

interface TVAReport {
  periode: { debut: string; fin: string; label: string };
  totalTTC: number;
  totalHT: number;
  totalTVA: number;
  nombreTransactions: number;
  parTaux: Array<{
    tauxTVA: string; devise: string;
    totalHT: number; totalTVA: number; totalTTC: number; nombre: number;
  }>;
}

interface AuditEntry {
  id: string;
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  createdAt: string;
}

interface Payout {
  id: string;
  organizerId: string;
  organizer: { name: string; email: string };
  montant: number;
  devise: string;
  methodePaiement: string;
  statut: string;
  initiatedAt: string;
  approvedAt?: string;
  completedAt?: string;
  _count?: { transactions: number };
}

const STATUS_COLORS: Record<string, string> = {
  pending:            "#f59e0b",
  processing:         "#3b82f6",
  paid:               "#06b6d4",
  completed:          "#22c55e",
  failed:             "#ef4444",
  refunded:           "#f97316",
  partially_refunded: "#eab308",
  disputed:           "#a855f7",
  cancelled:          "#9ca3af",
};

const PIE_COLORS = ["#7c3aed", "#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7", "#f97316"];

const fmt = (centimes: number, devise: string = "XOF") =>
  `${(centimes / 100).toLocaleString("fr-FR")} ${devise}`;

// ─── Composant principal ──────────────────────────────────────────────
const AdminFinancialDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [tvaReport, setTvaReport] = useState<TVAReport | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "payouts" | "tva" | "audit">("overview");
  const [periode, setPeriode] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      dateFrom: firstDay.toISOString().slice(0, 10),
      dateTo: now.toISOString().slice(0, 10),
    };
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ dateFrom: periode.dateFrom, dateTo: periode.dateTo });

      const [dashRes, tvaRes, payoutsRes, auditRes] = await Promise.all([
        axiosInstance.get(`/reporting/admin/dashboard?${params}`),
        axiosInstance.get(`/reporting/tva?${params}`),
        axiosInstance.get("/payouts?limit=20"),
        axiosInstance.get(`/reporting/audit?${params}&limit=20`),
      ]);

      setDashboard(dashRes.data.data);
      setTvaReport(tvaRes.data.data);
      setPayouts(payoutsRes.data.data);
      setAuditLog(auditRes.data.data);
    } catch (err) {
      console.error("Erreur chargement admin dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [periode]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePayoutAction = async (
    payoutId: string,
    action: "approve" | "execute" | "confirm" | "cancel"
  ) => {
    try {
      if (action === "cancel") {
        const raison = prompt("Raison de l'annulation ?");
        if (!raison) return;
        await axiosInstance.delete(`/payouts/${payoutId}`, { data: { raison } });
      } else {
        await axiosInstance.post(`/payouts/${payoutId}/${action}`);
      }
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message ?? `Erreur lors de l'action ${action}`);
    }
  };

  const exportCSV = async () => {
    try {
      const params = new URLSearchParams({ dateFrom: periode.dateFrom, dateTo: periode.dateTo });
      const res = await axiosInstance.get(`/reporting/export/csv?${params}`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport_admin_${periode.dateFrom}_${periode.dateTo}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert("Erreur export CSV"); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const flux = dashboard?.fluxFinanciers;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administration Financière</h1>
          <p className="text-gray-500 text-sm mt-1">Vue globale des flux financiers de la plateforme</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2">
            <input
              type="date"
              value={periode.dateFrom}
              onChange={(e) => setPeriode((p) => ({ ...p, dateFrom: e.target.value }))}
              className="text-sm border-none outline-none bg-transparent"
            />
            <span className="text-gray-400">→</span>
            <input
              type="date"
              value={periode.dateTo}
              onChange={(e) => setPeriode((p) => ({ ...p, dateTo: e.target.value }))}
              className="text-sm border-none outline-none bg-transparent"
            />
          </div>
          <button onClick={exportCSV} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700">
            ↓ Export CSV
          </button>
        </div>
      </div>

      {/* Alertes */}
      {(dashboard?.alertes ?? []).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
          {dashboard!.alertes.map((a, i) => (
            <p key={i} className="text-amber-800 text-sm">{a}</p>
          ))}
        </div>
      )}

      {/* KPI Admin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: "Total Entrées TTC", value: fmt(flux?.totalEntrees ?? 0), color: "bg-purple-50 border-purple-200 text-purple-700" },
          { title: "TVA Collectée", value: fmt(flux?.totalTVACollectee ?? 0), color: "bg-blue-50 border-blue-200 text-blue-700" },
          { title: "Commissions", value: fmt(flux?.totalCommissions ?? 0), color: "bg-green-50 border-green-200 text-green-700" },
          { title: "Versés Orgs.", value: fmt(flux?.totalVersesOrganisateurs ?? 0), color: "bg-cyan-50 border-cyan-200 text-cyan-700" },
          { title: "En Litige", value: dashboard?.transactionsEnLitige?.toString() ?? "0", color: "bg-red-50 border-red-200 text-red-700" },
        ].map(({ title, value, color }) => (
          <div key={title} className={`border rounded-2xl p-5 ${color}`}>
            <p className="text-xs font-medium uppercase tracking-wide opacity-60">{title}</p>
            <p className="text-xl font-bold mt-2">{value}</p>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {([
            ["overview", "Vue d'ensemble"],
            ["payouts", "Payouts"],
            ["tva", "Rapport TVA"],
            ["audit", "Journal d'audit"],
          ] as [typeof activeTab, string][]).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Vue d'ensemble */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Répartition par statut — Pie Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Transactions par statut</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={dashboard?.repartitionParStatut ?? []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ status, percent }: any) =>
                    `${status} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {(dashboard?.repartitionParStatut ?? []).map((entry, index) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] ?? PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} transactions`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Organisateurs */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Top organisateurs par volume</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={dashboard?.topOrganisateurs?.slice(0, 8) ?? []}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tickFormatter={(v: number) => `${(v / 100_00).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="nom" width={90} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number) => [`${fmt(v)}`, "Total TTC"]}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar dataKey="totalTTC" fill="#7c3aed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Classement détaillé */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Classement des organisateurs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-6 py-3 text-left">#</th>
                    <th className="px-6 py-3 text-left">Organisateur</th>
                    <th className="px-6 py-3 text-right">Transactions</th>
                    <th className="px-6 py-3 text-right">Total TTC</th>
                    <th className="px-6 py-3 text-right">Net versé</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(dashboard?.topOrganisateurs ?? []).map((org, i) => (
                    <tr key={org.organizerId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-400">#{i + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{org.nom}</td>
                      <td className="px-6 py-4 text-right text-gray-600">{org.totalTransactions}</td>
                      <td className="px-6 py-4 text-right font-medium">{fmt(org.totalTTC)}</td>
                      <td className="px-6 py-4 text-right text-green-700 font-semibold">{fmt(org.totalNet)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Gestion des Payouts */}
      {activeTab === "payouts" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Gestion des versements organisateurs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Organisateur</th>
                  <th className="px-6 py-3 text-right">Montant</th>
                  <th className="px-6 py-3 text-center">Méthode</th>
                  <th className="px-6 py-3 text-center">Statut</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(p.initiatedAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{p.organizer.name}</div>
                      <div className="text-xs text-gray-400">{p.organizer.email}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold">
                      {fmt(p.montant, p.devise)}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 capitalize">
                      {p.methodePaiement.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <PayoutStatusBadge status={p.statut} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {p.statut === "initiated" && (
                          <ActionBtn
                            label="Approuver"
                            color="green"
                            onClick={() => handlePayoutAction(p.id, "approve")}
                          />
                        )}
                        {p.statut === "approved" && (
                          <ActionBtn
                            label="Exécuter"
                            color="blue"
                            onClick={() => handlePayoutAction(p.id, "execute")}
                          />
                        )}
                        {p.statut === "processing" && (
                          <ActionBtn
                            label="Confirmer"
                            color="purple"
                            onClick={() => handlePayoutAction(p.id, "confirm")}
                          />
                        )}
                        {["initiated", "approved", "processing"].includes(p.statut) && (
                          <ActionBtn
                            label="Annuler"
                            color="red"
                            onClick={() => handlePayoutAction(p.id, "cancel")}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {payouts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                      Aucun payout
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rapport TVA */}
      {activeTab === "tva" && tvaReport && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Rapport TVA — Déclaration fiscale</h3>
            <p className="text-sm text-gray-500 mb-6">{tvaReport.periode.label}</p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total TTC", value: fmt(tvaReport.totalTTC), color: "text-gray-900" },
                { label: "Base HT", value: fmt(tvaReport.totalHT), color: "text-blue-700" },
                { label: "TVA Collectée", value: fmt(tvaReport.totalTVA), color: "text-purple-700 text-xl font-bold" },
                { label: "Transactions", value: tvaReport.nombreTransactions.toLocaleString("fr-FR"), color: "text-gray-700" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
                  <p className={`mt-1 font-semibold ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            <h4 className="text-sm font-semibold text-gray-700 mb-3">Détail par taux de TVA</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Taux TVA</th>
                  <th className="px-4 py-3 text-left">Devise</th>
                  <th className="px-4 py-3 text-right">Base HT</th>
                  <th className="px-4 py-3 text-right">TVA</th>
                  <th className="px-4 py-3 text-right">TTC</th>
                  <th className="px-4 py-3 text-right">Nb opérations</th>
                </tr>
              </thead>
              <tbody>
                {tvaReport.parTaux.map((t, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-purple-700">{t.tauxTVA}</td>
                    <td className="px-4 py-3">{t.devise}</td>
                    <td className="px-4 py-3 text-right">{fmt(t.totalHT, t.devise)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-700">{fmt(t.totalTVA, t.devise)}</td>
                    <td className="px-4 py-3 text-right">{fmt(t.totalTTC, t.devise)}</td>
                    <td className="px-4 py-3 text-right">{t.nombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Journal d'audit */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Journal d'audit immuable</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Toutes les actions admin enregistrées avec checksums SHA-256
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3 text-left">Horodatage</th>
                  <th className="px-6 py-3 text-left">Action</th>
                  <th className="px-6 py-3 text-left">Ressource</th>
                  <th className="px-6 py-3 text-left">Acteur (rôle)</th>
                  <th className="px-6 py-3 text-left">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {auditLog.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-xs">
                      {new Date(e.createdAt).toLocaleString("fr-FR")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-mono">
                        {e.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">
                      <span>{e.resource}</span>
                      {e.resourceId && (
                        <span className="ml-1 text-gray-400 font-mono">#{e.resourceId.slice(0, 8)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">
                      <span className="font-mono">{e.userId.slice(0, 8)}…</span>
                      <span className="ml-1 text-gray-400">({e.userRole})</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs font-mono">
                      {e.ipAddress ?? "—"}
                    </td>
                  </tr>
                ))}
                {auditLog.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                      Aucune entrée d'audit
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Composants utilitaires ───────────────────────────────────────────
const PAYOUT_STATUS: Record<string, { label: string; color: string }> = {
  initiated:  { label: "Initié",     color: "bg-yellow-100 text-yellow-800" },
  approved:   { label: "Approuvé",   color: "bg-blue-100 text-blue-800" },
  processing: { label: "En cours",   color: "bg-cyan-100 text-cyan-800" },
  completed:  { label: "Complété",   color: "bg-green-100 text-green-800" },
  failed:     { label: "Échoué",     color: "bg-red-100 text-red-800" },
  reversed:   { label: "Inversé",    color: "bg-orange-100 text-orange-800" },
};

const PayoutStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = PAYOUT_STATUS[status] ?? { label: status, color: "bg-gray-100 text-gray-800" };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
      {s.label}
    </span>
  );
};

const ActionBtn: React.FC<{
  label: string;
  color: "green" | "blue" | "purple" | "red";
  onClick: () => void;
}> = ({ label, color, onClick }) => {
  const colors = {
    green:  "bg-green-50 text-green-700 hover:bg-green-100",
    blue:   "bg-blue-50 text-blue-700 hover:bg-blue-100",
    purple: "bg-purple-50 text-purple-700 hover:bg-purple-100",
    red:    "bg-red-50 text-red-700 hover:bg-red-100",
  };
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${colors[color]}`}
    >
      {label}
    </button>
  );
};

export default AdminFinancialDashboard;
