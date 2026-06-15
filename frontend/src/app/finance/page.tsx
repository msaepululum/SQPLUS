import { FinanceTopBar } from "@/components/finance/FinanceTopBar";
import { ExecutiveCard } from "@/components/finance/ExecutiveCard";
import {
  CashFlowChart,
  RevenueCompositionChart,
  RevenueTrendChart,
  SpendingCategoryChart,
} from "@/components/finance/FinanceCharts";
import {
  IconBudget,
  IconCashflow,
  IconExpense,
  IconRevenue,
} from "@/components/finance/FinanceIcons";
import { MetricCard } from "@/components/finance/MetricCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { CardGrid } from "@/components/ui/CardGrid";

const ALERTS = [
  {
    level: "Tinggi",
    levelColor: "bg-red-100 text-red-700 border-red-200",
    text: "Belanja BMHP mencapai 92% anggaran — risiko over-budget dalam 2 minggu.",
    action: "Lihat detail anggaran",
  },
  {
    level: "Waspada",
    levelColor: "bg-amber-100 text-amber-800 border-amber-200",
    text: "7 payment request senilai Rp 4,8 M menunggu persetujuan direktur.",
    action: "Buka antrian PR",
  },
  {
    level: "Waspada",
    levelColor: "bg-amber-100 text-amber-800 border-amber-200",
    text: "Piutang BPJS > 60 hari naik 8% — perlu follow-up penagihan.",
    action: "Lihat piutang",
  },
  {
    level: "Info",
    levelColor: "bg-sky-100 text-sky-800 border-sky-200",
    text: "Rekonsiliasi bank BCA & Mandiri periode Mei sudah selesai.",
    action: null,
  },
];

const TODAY_SUMMARY = [
  { indicator: "Pendapatan Hari Ini", value: "Rp 4,2 M", target: "Rp 4,0 M", status: "ok" as const },
  { indicator: "Belanja Hari Ini", value: "Rp 2,8 M", target: "Rp 3,2 M", status: "ok" as const },
  { indicator: "Kunjungan Pasien", value: "312", target: "300", status: "ok" as const },
  { indicator: "PR Pending", value: "7 dokumen", target: "< 10", status: "ok" as const },
  { indicator: "Saldo Kas", value: "Rp 15,8 M", target: "Rp 12 M", status: "warn" as const },
  { indicator: "Rasio Beban SDM", value: "38,2%", target: "< 40%", status: "warn" as const },
];

const RECENT_PR = [
  { no: "PR-2025-0487", vendor: "PT Medika Supply", amount: "Rp 128 Jt", status: "Pending", statusColor: "bg-amber-100 text-amber-700" },
  { no: "PR-2025-0486", vendor: "RS Vendor Farmasi", amount: "Rp 45 Jt", status: "Disetujui", statusColor: "bg-emerald-100 text-emerald-700" },
  { no: "PR-2025-0485", vendor: "CV Logistik Sehat", amount: "Rp 210 Jt", status: "Pending", statusColor: "bg-amber-100 text-amber-700" },
  { no: "PR-2025-0484", vendor: "PT Alat Kesehatan", amount: "Rp 89 Jt", status: "Ditolak", statusColor: "bg-red-100 text-red-700" },
];

const BUDGET_UNITS = [
  { unit: "IGD", budget: "Rp 8,2 M", realisasi: "Rp 6,9 M", pct: 84 },
  { unit: "Rawat Inap", budget: "Rp 24,5 M", realisasi: "Rp 21,1 M", pct: 86 },
  { unit: "Farmasi", budget: "Rp 12,0 M", realisasi: "Rp 11,0 M", pct: 92 },
  { unit: "SDM", budget: "Rp 38,0 M", realisasi: "Rp 35,8 M", pct: 94 },
];

export default function FinanceDashboardPage() {
  const updatedAt = new Date().toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <>
      <FinanceTopBar
        title="Dashboard Keuangan Pimpinan"
        subtitle="Ringkasan kinerja keuangan rumah sakit"
      />

      <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
        {/* KPI utama */}
        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-sky-400 to-sky-600" />
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Indikator Utama
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50/90 px-2.5 py-1 text-[0.8125rem] font-medium text-emerald-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Kinerja Mei 2025: Baik
            </span>
          </div>
          <CardGrid cols={4}>
            <MetricCard
              label="Total Pendapatan"
              value="Rp 128,4 M"
              subValue="Target: Rp 124,5 M"
              trend="12,6% vs Apr"
              icon={<IconRevenue />}
              tone="emerald"
              highlight
              href="/finance/revenue"
            />
            <MetricCard
              label="Realisasi Belanja"
              value="Rp 94,2 M"
              subValue="Anggaran: Rp 108,7 M"
              trend="8,3% vs Apr"
              icon={<IconExpense />}
              tone="orange"
            />
            <MetricCard
              label="Sisa Cashflow"
              value="Rp 15,8 M"
              subValue="Saldo kas & bank"
              trend="Stabil"
              trendNeutral
              icon={<IconCashflow />}
              tone="sky"
            />
            <MetricCard
              label="Anggaran Tersisa"
              value="Rp 22,1 M"
              subValue="13,3% dari total pagu"
              trend="Aman"
              trendNeutral
              icon={<IconBudget />}
              tone="violet"
            />
          </CardGrid>
        </section>

        {/* KPI sekunder */}
        <section>
          <CardGrid cols={4}>
            <MetricCard
              label="Piutang RS"
              value="Rp 18,6 M"
              subValue="Outstanding > 30 hari: Rp 6,2 M"
              trend="2,1% vs Apr"
              trendUp={false}
              icon={<IconRevenue className="h-5 w-5" />}
              tone="slate"
            />
            <MetricCard
              label="Hutang Vendor"
              value="Rp 9,4 M"
              subValue="Jatuh tempo 7 hari: Rp 2,1 M"
              trend="5,4% vs Apr"
              trendUp={false}
              icon={<IconExpense className="h-5 w-5" />}
              tone="slate"
            />
            <MetricCard
              label="PR Disetujui"
              value="24"
              subValue="Total nilai: Rp 18,6 M"
              trend="Bulan ini"
              trendNeutral
              icon={<IconBudget className="h-5 w-5" />}
              tone="emerald"
            />
            <MetricCard
              label="PR Pending"
              value="7"
              subValue="Menunggu approval direktur"
              trend="Perlu tindakan"
              trendUp={false}
              icon={<IconCashflow className="h-5 w-5" />}
              tone="amber"
            />
          </CardGrid>
        </section>

        {/* Ringkasan eksekutif */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-400 to-violet-600" />
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ringkasan Eksekutif
            </h2>
          </div>
          <CardGrid cols={4}>
            <ExecutiveCard
              title="Pendapatan vs Target"
              value="103,2%"
              subtitle="Tercapai"
              detail="Lebih Rp 3,9 M dari target bulanan"
              status="success"
              progress={103}
            />
            <ExecutiveCard
              title="Belanja vs Anggaran"
              value="86,7%"
              subtitle="Aman"
              detail="Sisa pagu Rp 14,5 M hingga akhir bulan"
              status="success"
              progress={87}
            />
            <ExecutiveCard
              title="Efisiensi Operasional"
              value="91,4%"
              subtitle="Baik"
              detail="Rasio biaya/pendapatan menurun 1,2 poin"
              status="info"
              progress={91}
            />
            <ExecutiveCard
              title="Rasio Beban SDM"
              value="38,2%"
              subtitle="Waspada"
              detail="Mendekati batas maksimum 40%"
              status="warning"
              progress={38}
            />
          </CardGrid>
        </section>

        {/* Charts */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-teal-400 to-teal-600" />
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Analisis Visual
            </h2>
          </div>
          <CardGrid cols={2} className="lg:grid-cols-2">
            <RevenueTrendChart />
            <RevenueCompositionChart />
            <CashFlowChart />
            <SpendingCategoryChart />
          </CardGrid>
        </section>

        {/* Alerts + Ringkasan hari ini */}
        <CardGrid cols={2} className="lg:grid-cols-2">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Perhatian Pimpinan</CardTitle>
              <span className="rounded-full border border-red-200/70 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                {ALERTS.filter((a) => a.level === "Tinggi" || a.level === "Waspada").length} perlu tindakan
              </span>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {ALERTS.map((a, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${a.levelColor}`}
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/80 text-xs font-bold">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold uppercase tracking-wide opacity-80">
                        {a.level}
                      </span>
                      <p className="mt-0.5 text-sm leading-relaxed">{a.text}</p>
                      {a.action && (
                        <button type="button" className="mt-1.5 text-xs font-semibold underline opacity-80 hover:opacity-100">
                          {a.action} →
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader className="flex-col items-start sm:flex-col sm:items-start">
              <CardTitle>Ringkasan Hari Ini</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </CardDescription>
            </CardHeader>
            <CardContent scrollable>
              <div className="overflow-hidden rounded-lg border border-slate-100">
                <table className="w-full min-w-[32rem] text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs text-slate-500">
                    <th className="px-3 py-2.5 font-medium">Indikator</th>
                    <th className="px-3 py-2.5 font-medium">Nilai</th>
                    <th className="px-3 py-2.5 font-medium">Target</th>
                    <th className="px-3 py-2.5 text-center font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {TODAY_SUMMARY.map((row) => (
                    <tr key={row.indicator} className="border-t border-slate-50">
                      <td className="px-3 py-2.5 text-slate-700">{row.indicator}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900">{row.value}</td>
                      <td className="px-3 py-2.5 text-slate-500">{row.target}</td>
                      <td className="px-3 py-2.5 text-center">
                        {row.status === "ok" ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">✓</span>
                        ) : (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600">!</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </CardGrid>

        {/* PR terbaru + Anggaran per unit */}
        <CardGrid cols={2} className="lg:grid-cols-2">
          <Card variant="elevated">
            <CardHeader className="flex-col items-start sm:flex-col sm:items-start">
              <CardTitle>Payment Request Terbaru</CardTitle>
              <CardDescription>4 transaksi terakhir</CardDescription>
            </CardHeader>
            <CardContent scrollable>
              <div className="overflow-hidden rounded-lg border border-slate-100">
                <table className="w-full min-w-[32rem] text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs text-slate-500">
                    <th className="px-3 py-2 font-medium">No. PR</th>
                    <th className="px-3 py-2 font-medium">Vendor</th>
                    <th className="px-3 py-2 font-medium">Nilai</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_PR.map((pr) => (
                    <tr key={pr.no} className="border-t border-slate-50">
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-700">{pr.no}</td>
                      <td className="px-3 py-2.5 text-slate-700">{pr.vendor}</td>
                      <td className="px-3 py-2.5 font-medium text-slate-900">{pr.amount}</td>
                      <td className="px-3 py-2.5">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${pr.statusColor}`}>
                          {pr.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader className="flex-col items-start sm:flex-col sm:items-start">
              <CardTitle>Realisasi Anggaran per Unit</CardTitle>
              <CardDescription>Top unit dengan utilisasi tertinggi</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
              {BUDGET_UNITS.map((u) => (
                <li key={u.unit}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{u.unit}</span>
                    <span className={`font-semibold ${u.pct >= 90 ? "text-amber-600" : "text-slate-900"}`}>
                      {u.pct}%
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-slate-400">
                    <span>Realisasi: {u.realisasi}</span>
                    <span>Pagu: {u.budget}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${u.pct >= 90 ? "bg-amber-500" : "bg-sky-500"}`}
                      style={{ width: `${u.pct}%` }}
                    />
                  </div>
                </li>
              ))}
              </ul>
            </CardContent>
          </Card>
        </CardGrid>

        <Card variant="flat" className="text-center text-xs text-slate-400">
          Data diperbarui: <strong className="text-slate-600">{updatedAt}</strong>
          {" · "}
          Sumber: Modul Keuangan SQ+ (data demo)
        </Card>
      </div>
    </>
  );
}
