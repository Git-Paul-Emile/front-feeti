import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import axiosInstance from "../../api/axiosConfig";

// ─── Types ────────────────────────────────────────────────────────────
interface KPIs {
  totalGagne: number;
  totalGagneFormatted: string;
  soldeDisponible: number;
  soldeDisponibleFormatted: string;
  totalBilletsVendus: number;
  totalTransactions: number;
  tauxRemboursement: number;
  croissance: number;
}

interface RevenusEvenement {
  eventId: string;
  eventTitle: string;
  billets: number;
  montantTTC: number;
  montantHT: number;
  tva: number;
  commission: number;
  netOrganisateur: number;
  formatted: { net: string; ttc: string };
}

interface Dashboard {
  kpis: KPIs;
  revenusParEvenement: RevenusEvenement[];
  tvaCollectee: { total: number; formatted: string; periodeLabel: string };
  commissionsPayees: { total: number; formatted: string };
  topEvenements: Array<{ eventId: string; titre: string; revenus: number; billets: number }>;
}

interface WalletSummary {
  soldeTotal: number;
  soldeDisponible: number;
  soldeEnAttente: number;
  soldeRetirable: number;
  totalRetire: number;
  totalEnLitige: number;
  devise: string;
  formatted: {
    soldeTotal: string;
    soldeDisponible: string;
    soldeEnAttente: string;
    soldeRetirable: string;
    totalRetire: string;
    totalEnLitige: string;
  };
}

interface TendanceMois {
  mois: string;
  label: string;
  totalTTC: number;
  net: number;
  count: number;
}

interface Transaction {
  id: string;
  createdAt: string;
  status: string;
  montantTTC: number;
  netOrganisateur: number;
  devise: string;
  event: { title: string };
  buyer: { name: string; email: string };
}

// ─── Constantes ───────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:            { label: "En attente",       color: "bg-yellow-100 text-yellow-800" },
  processing:         { label: "En cours",         color: "bg-blue-100 text-blue-800" },
  paid:               { label: "Payé",             color: "bg-cyan-100 text-cyan-800" },
  completed:          { label: "Complété",         color: "bg-green-100 text-green-800" },
  failed:             { label: "Échoué",           color: "bg-red-100 text-red-800" },
  refunded:           { label: "Remboursé",        color: "bg-orange-100 text-orange-800" },
  partially_refunded: { label: "Part. remboursé",  color: "bg-amber-100 text-amber-800" },
  disputed:           { label: "En litige",        color: "bg-purple-100 text-purple-800" },
  cancelled:          { label: "Annulé",           color: "bg-gray-100 text-gray-800" },
};

// ─── Composant principal ──────────────────────────────────────────────
const OrganizerFinancialDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [tendances, setTendances] = useState<TendanceMois[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsMeta, setTransactionsMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "ledger">("overview");
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
    setError(null);
    try {
      const params = new URLSearchParams({
        dateFrom: periode.dateFrom,
        dateTo: periode.dateTo,
      });

      const [dashRes, walletRes, tendancesRes, txRes] = await Promise.all([
        axiosInstance.get(`/reporting/dashboard?${params}`),
        axiosInstance.get("/wallet/me"),
        axiosInstance.get("/reporting/tendances?mois=6"),
        axiosInstance.get(`/transactions?${params}&limit=20`),
      ]);

      setDashboard(dashRes.data.data);
      setWallet(walletRes.data.data);
      setTendances(tendancesRes.data.data);
      setTransactions(txRes.data.data);
      setTransactionsMeta(txRes.data.meta);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [periode]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const exportCSV = async () => {
    try {
      const params = new URLSearchParams({ dateFrom: periode.dateFrom, dateTo: periode.dateTo });
      const res = await axiosInstance.get(`/reporting/export/csv?${params}`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions_${periode.dateFrom}_${periode.dateTo}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Erreur lors de l'export CSV");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg text-red-700">
        <p className="font-semibold">Erreur</p>
        <p>{error}</p>
        <button onClick={fetchData} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Réessayer
        </button>
      </div>
    );
  }

  const kpis = dashboard?.kpis;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord financier</h1>
          <p className="text-gray-500 text-sm mt-1">Gestion de vos revenus et transactions</p>
        </div>

        {/* Sélecteur de période */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2">
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

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm font-medium"
        >
          ↓ Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Revenus nets"
          value={kpis?.totalGagneFormatted ?? "—"}
          subtitle={kpis && kpis.croissance !== 0
            ? `${kpis.croissance > 0 ? "+" : ""}${kpis.croissance}% vs période précédente`
            : "vs période précédente"}
          trend={kpis?.croissance}
          color="purple"
        />
        <KPICard
          title="Solde disponible"
          value={kpis?.soldeDisponibleFormatted ?? "—"}
          subtitle="Montant retirable"
          color="green"
        />
        <KPICard
          title="Billets vendus"
          value={kpis?.totalBilletsVendus.toLocaleString("fr-FR") ?? "—"}
          subtitle={`${kpis?.totalTransactions ?? 0} transactions`}
          color="blue"
        />
        <KPICard
          title="Taux remboursement"
          value={`${kpis?.tauxRemboursement ?? 0}%`}
          subtitle="Transactions remboursées"
          color={kpis && kpis.tauxRemboursement > 10 ? "red" : "gray"}
        />
      </div>

      {/* Wallet Summary */}
      {wallet && (
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
          <h2 className="text-lg font-semibold mb-4 opacity-90">Mon Wallet</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Total gagné", value: wallet.formatted.soldeTotal },
              { label: "Disponible", value: wallet.formatted.soldeDisponible, highlight: true },
              { label: "En attente", value: wallet.formatted.soldeEnAttente },
              { label: "Retirable", value: wallet.formatted.soldeRetirable },
              { label: "Total versé", value: wallet.formatted.totalRetire },
              { label: "En litige", value: wallet.formatted.totalEnLitige },
            ].map(({ label, value, highlight }) => (
              <div key={label} className={`rounded-xl p-3 ${highlight ? "bg-white/20" : "bg-white/10"}`}>
                <p className="text-xs opacity-70">{label}</p>
                <p className={`font-bold mt-1 ${highlight ? "text-lg" : "text-sm"}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {(["overview", "transactions", "ledger"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "overview" ? "Vue d'ensemble" : tab === "transactions" ? "Transactions" : "Grand Livre"}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Graphique tendances */}
          {tendances.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Tendances sur 6 mois</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={tendances} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v: number) => `${(v / 100).toLocaleString("fr-FR")}`} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: number, name: string) => [
                      `${(val / 100).toLocaleString("fr-FR")} ${wallet?.devise ?? "XOF"}`,
                      name === "net" ? "Net organisateur" : "Total TTC",
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="net" name="Net organisateur" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="totalTTC" name="Total TTC" fill="#e2d9f3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Revenus par événement */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Revenus par événement</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                TVA collectée : {dashboard?.tvaCollectee.formatted} |
                Commissions : {dashboard?.commissionsPayees.formatted}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-6 py-3 text-left">Événement</th>
                    <th className="px-6 py-3 text-right">Billets</th>
                    <th className="px-6 py-3 text-right">TTC</th>
                    <th className="px-6 py-3 text-right">HT</th>
                    <th className="px-6 py-3 text-right">TVA 18%</th>
                    <th className="px-6 py-3 text-right">Commission 10%</th>
                    <th className="px-6 py-3 text-right font-semibold text-green-700">Net Org.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(dashboard?.revenusParEvenement ?? []).map((ev) => (
                    <tr key={ev.eventId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{ev.eventTitle}</td>
                      <td className="px-6 py-4 text-right text-gray-600">{ev.billets}</td>
                      <td className="px-6 py-4 text-right text-gray-600">{ev.formatted.ttc}</td>
                      <td className="px-6 py-4 text-right text-gray-500">
                        {(ev.montantHT / 100).toLocaleString("fr-FR")}
                      </td>
                      <td className="px-6 py-4 text-right text-blue-600">
                        {(ev.tva / 100).toLocaleString("fr-FR")}
                      </td>
                      <td className="px-6 py-4 text-right text-orange-600">
                        {(ev.commission / 100).toLocaleString("fr-FR")}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-green-700">
                        {ev.formatted.net}
                      </td>
                    </tr>
                  ))}
                  {(dashboard?.revenusParEvenement ?? []).length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                        Aucune transaction sur cette période
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Historique des transactions
              <span className="ml-2 text-sm text-gray-400 font-normal">({transactionsMeta.total} au total)</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Événement</th>
                  <th className="px-6 py-3 text-left">Acheteur</th>
                  <th className="px-6 py-3 text-right">Montant TTC</th>
                  <th className="px-6 py-3 text-right">Net Org.</th>
                  <th className="px-6 py-3 text-center">Statut</th>
                  <th className="px-6 py-3 text-center">Détail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 text-gray-900 max-w-[200px] truncate">{tx.event.title}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <div>{tx.buyer.name}</div>
                      <div className="text-xs text-gray-400">{tx.buyer.email}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {(tx.montantTTC / 100).toLocaleString("fr-FR")} {tx.devise}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-green-700">
                      {(tx.netOrganisateur / 100).toLocaleString("fr-FR")} {tx.devise}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => navigate(`/transactions/${tx.id}`)}
                        className="text-purple-600 hover:underline text-xs"
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                      Aucune transaction sur cette période
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "ledger" && (
        <LedgerTab devise={wallet?.devise ?? "XOF"} />
      )}
    </div>
  );
};

// ─── Sous-composants ──────────────────────────────────────────────────
const KPICard: React.FC<{
  title: string;
  value: string;
  subtitle: string;
  trend?: number;
  color: "purple" | "green" | "blue" | "red" | "gray";
}> = ({ title, value, subtitle, trend, color }) => {
  const colors = {
    purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-700",
    green:  "from-green-50 to-green-100 border-green-200 text-green-700",
    blue:   "from-blue-50 to-blue-100 border-blue-200 text-blue-700",
    red:    "from-red-50 to-red-100 border-red-200 text-red-700",
    gray:   "from-gray-50 to-gray-100 border-gray-200 text-gray-700",
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <div className="flex items-center gap-1 mt-1">
        {trend !== undefined && (
          <span className={`text-xs font-medium ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        )}
        <p className="text-xs opacity-60">{subtitle}</p>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = STATUS_LABELS[status] ?? { label: status, color: "bg-gray-100 text-gray-800" };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
      {s.label}
    </span>
  );
};

const LedgerTab: React.FC<{ devise: string }> = ({ devise }) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get(`/wallet/me/ledger?page=${page}&limit=30`)
      .then((r) => {
        setEntries(r.data.data);
        setMeta(r.data.meta);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const OPERATION_LABELS: Record<string, string> = {
    ticket_purchase: "Vente billet",
    refund:          "Remboursement",
    payout:          "Versement",
    dispute_hold:    "Blocage litige",
    dispute_release: "Libération litige",
    adjustment:      "Ajustement admin",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Grand livre comptable</h3>
        <p className="text-xs text-gray-500 mt-0.5">Toutes les opérations financières dans l'ordre chronologique</p>
      </div>
      {loading ? (
        <div className="p-10 text-center text-gray-400">Chargement...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Opération</th>
                  <th className="px-6 py-3 text-left">Description</th>
                  <th className="px-6 py-3 text-right">Débit</th>
                  <th className="px-6 py-3 text-right">Crédit</th>
                  <th className="px-6 py-3 text-right">Solde après</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {entries.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        e.entryType === "credit" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {OPERATION_LABELS[e.operationType] ?? e.operationType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-[250px] truncate">{e.description}</td>
                    <td className="px-6 py-4 text-right text-red-600 font-medium">
                      {e.entryType === "debit"
                        ? `- ${(e.amount / 100).toLocaleString("fr-FR")} ${devise}`
                        : ""}
                    </td>
                    <td className="px-6 py-4 text-right text-green-700 font-medium">
                      {e.entryType === "credit"
                        ? `+ ${(e.amount / 100).toLocaleString("fr-FR")} ${devise}`
                        : ""}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      {(e.balanceAfter / 100).toLocaleString("fr-FR")} {devise}
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                      Aucune entrée de ledger
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">{meta.total} entrées</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  ← Précédent
                </button>
                <span className="px-3 py-1 text-sm text-gray-500">
                  {page} / {meta.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                  disabled={page === meta.pages}
                  className="px-3 py-1 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Suivant →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrganizerFinancialDashboard;
