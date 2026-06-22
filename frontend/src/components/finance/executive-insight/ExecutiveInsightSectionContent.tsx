"use client";

import { useState } from "react";
import {
  BarChartVertical,
  DonutChart,
  LineChartDual,
  ProgressBar,
} from "@/components/beranda/BerandaCharts";
import { ExecutiveInsightModal } from "@/components/finance/executive-insight/ExecutiveInsightModal";
import {
  AbsorptionHeatmap,
  DetailTable,
  HorizontalBarChart,
  InsightAlerts,
  InsightChartCard,
  InsightKpiGrid,
} from "@/components/finance/executive-insight/ExecutiveInsightPrimitives";
import {
  EI_DAYA_SERAP,
  EI_HUTANG_AKUN,
  EI_KOMPOSISI_ANGGARAN,
  EI_PAGU_PENGADAAN,
  EI_PASIEN_RESEP,
  EI_PENDAPATAN_AKUN,
  EI_POSISI_KEUANGAN,
  EI_REVISI_PAGU,
  EI_SALDO_BULANAN,
  EI_SIMULASI_PAGU,
  EI_TREN_HUTANG,
  EI_TREN_PENDAPATAN,
} from "@/constants/executive-insight-data";

function TrenPendapatanBelanjaSection() {
  const [detailOpen, setDetailOpen] = useState(false);
  const d = EI_TREN_PENDAPATAN;

  return (
    <div className="space-y-3">
      <InsightKpiGrid
        items={[
          { label: "Pendapatan Jun", value: "Rp 189,60 M", trend: "▲ 4,2% MoM", positive: true },
          { label: "Belanja Jun", value: "Rp 165,40 M", trend: "▲ 3,4% MoM", positive: true },
          { label: "Surplus Operasional", value: "Rp 24,20 M", trend: "▲ 10,0% MoM", positive: true },
          { label: "Rasio Belanja/Pendapatan", value: "87,2%", trend: "▼ 0,7 p.p", positive: true },
        ]}
      />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <InsightChartCard
          title="Tren Pendapatan vs Belanja"
          subtitle="Dalam miliar rupiah (Jan–Jun 2025)"
          onDetail={() => setDetailOpen(true)}
        >
          <LineChartDual
            months={d.months}
            seriesA={d.pendapatan}
            seriesB={d.belanja}
            labelA="Pendapatan"
            labelB="Belanja"
            colorA="#3b82f6"
            colorB="#f97316"
            max={200}
          />
        </InsightChartCard>
        <InsightChartCard title="Surplus Operasional Bulanan" subtitle="Dalam miliar rupiah">
          <BarChartVertical months={d.months} values={d.surplus} color="#0d9488" max={30} />
        </InsightChartCard>
      </div>
      <InsightAlerts items={d.insights} />
      <ExecutiveInsightModal
        open={detailOpen}
        title="Detail Tren Pendapatan & Belanja"
        subtitle="Rincian bulanan dan kumulatif YTD"
        onClose={() => setDetailOpen(false)}
        wide
      >
        <DetailTable
          headers={["Bulan", "Pendapatan", "Belanja", "Surplus", "YTD Pendapatan", "YTD Belanja"]}
          rows={d.detail.map((r) => [
            r.bulan,
            r.pendapatan,
            r.belanja,
            r.surplus,
            r.ytdPendapatan,
            r.ytdBelanja,
          ])}
        />
      </ExecutiveInsightModal>
    </div>
  );
}

function PosisiKeuanganRiilSection() {
  const [detailOpen, setDetailOpen] = useState(false);
  const d = EI_POSISI_KEUANGAN;

  return (
    <div className="space-y-3">
      <InsightKpiGrid items={d.kpis} />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <InsightChartCard
          title="Komposisi Aset"
          subtitle="Persentase terhadap total aset"
          onDetail={() => setDetailOpen(true)}
        >
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <DonutChart
              segments={d.composition}
              centerLabel="Rp 312,5 M"
              centerSub="Total Aset"
              size={130}
            />
            <div className="flex-1 space-y-1.5">
              {d.composition.map((s) => (
                <div key={s.label} className="flex items-center justify-between text-[0.625rem]">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                    {s.label}
                  </span>
                  <span className="font-semibold text-slate-800">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </InsightChartCard>
        <InsightChartCard title="Struktur Kewajiban" subtitle="Dalam miliar rupiah">
          <HorizontalBarChart
            items={d.liabilities.map((l) => ({ label: l.label, value: parseFloat(l.value) }))}
            unit="M"
          />
        </InsightChartCard>
      </div>
      <InsightAlerts items={d.insights} />
      <ExecutiveInsightModal
        open={detailOpen}
        title="Detail Posisi Keuangan Riil"
        subtitle="Rincian komposisi aset dan kewajiban"
        onClose={() => setDetailOpen(false)}
      >
        <DetailTable
          headers={["Komponen Aset", "Nilai (M)", "Persentase"]}
          rows={d.composition.map((c) => [c.label, c.amount, `${c.pct}%`])}
        />
        <div className="mt-4">
          <h4 className="mb-2 text-xs font-semibold text-slate-700">Kewajiban</h4>
          <DetailTable
            headers={["Jenis", "Saldo (M)"]}
            rows={d.liabilities.map((l) => [l.label, l.value])}
          />
        </div>
      </ExecutiveInsightModal>
    </div>
  );
}

function PendapatanPerAkunSection() {
  const [detailOpen, setDetailOpen] = useState(false);
  const d = EI_PENDAPATAN_AKUN;

  return (
    <div className="space-y-3">
      <InsightChartCard
        title="Kontribusi Pendapatan per Akun"
        subtitle="Top 5 akun pendapatan — dalam miliar rupiah"
        onDetail={() => setDetailOpen(true)}
      >
        <HorizontalBarChart
          items={d.accounts.map((a) => ({
            label: a.nama,
            value: a.realisasi,
            color: a.growth >= 0 ? "#3b82f6" : "#f97316",
          }))}
        />
      </InsightChartCard>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {d.accounts.map((a) => (
          <div
            key={a.kode}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-center"
          >
            <p className="text-[0.5625rem] text-slate-500">{a.pct}%</p>
            <p className="text-xs font-bold text-slate-800">{a.realisasi} M</p>
            <p
              className={`text-[0.5625rem] font-semibold ${a.growth >= 0 ? "text-emerald-600" : "text-red-500"}`}
            >
              {a.growth >= 0 ? "▲" : "▼"} {Math.abs(a.growth)}%
            </p>
          </div>
        ))}
      </div>
      <InsightAlerts items={d.insights} />
      <ExecutiveInsightModal
        open={detailOpen}
        title="Detail Pendapatan per Akun"
        subtitle="Realisasi vs rencana dan pertumbuhan YoY"
        onClose={() => setDetailOpen(false)}
        wide
      >
        <DetailTable
          headers={["Kode", "Nama Akun", "Realisasi (M)", "Rencana (M)", "Kontribusi", "Growth YoY"]}
          rows={d.accounts.map((a) => [
            a.kode,
            a.nama,
            a.realisasi,
            a.rencana,
            `${a.pct}%`,
            `${a.growth}%`,
          ])}
        />
      </ExecutiveInsightModal>
    </div>
  );
}

function DayaSerapAnggaranSection() {
  const [detailOpen, setDetailOpen] = useState(false);
  const d = EI_DAYA_SERAP;

  return (
    <div className="space-y-3">
      <InsightChartCard
        title="Daya Serap per Unit Kerja"
        subtitle="Persentase realisasi terhadap pagu (%)"
        onDetail={() => setDetailOpen(true)}
      >
        <div className="space-y-2">
          {d.units.map((u) => (
            <div key={u.unit}>
              <div className="mb-0.5 flex justify-between text-[0.625rem]">
                <span className="text-slate-600">{u.unit}</span>
                <span className="font-semibold text-slate-800">{u.pct}%</span>
              </div>
              <ProgressBar
                value={u.pct}
                color={u.pct >= 70 ? "bg-emerald-500" : u.pct >= 60 ? "bg-teal-400" : "bg-amber-400"}
              />
            </div>
          ))}
        </div>
      </InsightChartCard>
      <InsightChartCard title="Heatmap Daya Serap Bulanan" subtitle="Jan–Jun 2025 (%)">
        <AbsorptionHeatmap rows={d.heatmap} months={["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"]} />
      </InsightChartCard>
      <InsightAlerts items={d.insights} />
      <ExecutiveInsightModal
        open={detailOpen}
        title="Detail Daya Serap Anggaran"
        subtitle="Pagu, realisasi, dan sisa per unit kerja"
        onClose={() => setDetailOpen(false)}
        wide
      >
        <DetailTable
          headers={["Unit Kerja", "Pagu (M)", "Realisasi (M)", "Daya Serap", "Sisa (M)"]}
          rows={d.units.map((u) => [
            u.unit,
            u.pagu,
            u.realisasi,
            `${u.pct}%`,
            (u.pagu - u.realisasi).toFixed(1),
          ])}
        />
      </ExecutiveInsightModal>
    </div>
  );
}

function KomposisiAnggaranSection() {
  const [detailOpen, setDetailOpen] = useState(false);
  const d = EI_KOMPOSISI_ANGGARAN;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <InsightChartCard
          title="Komposisi per Kelompok Belanja"
          subtitle="Distribusi pagu anggaran"
          onDetail={() => setDetailOpen(true)}
        >
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <DonutChart
              segments={d.byKelompok.map((k) => ({ label: k.label, pct: k.pct, color: k.color }))}
              centerLabel="Rp 318 M"
              centerSub="Total Pagu"
              size={120}
            />
            <div className="flex-1 space-y-1">
              {d.byKelompok.map((k) => (
                <div key={k.label} className="flex justify-between text-[0.625rem]">
                  <span className="text-slate-600">{k.label}</span>
                  <span className="font-semibold">{k.pagu} M ({k.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </InsightChartCard>
        <InsightChartCard title="Realisasi per Program" subtitle="Dalam miliar rupiah">
          <HorizontalBarChart
            items={d.byProgram.map((p) => ({ label: p.program, value: p.realisasi }))}
          />
        </InsightChartCard>
      </div>
      <InsightAlerts items={d.insights} />
      <ExecutiveInsightModal
        open={detailOpen}
        title="Detail Komposisi Anggaran"
        subtitle="Kelompok belanja dan program kerja"
        onClose={() => setDetailOpen(false)}
        wide
      >
        <h4 className="mb-2 text-xs font-semibold text-slate-700">Per Program</h4>
        <DetailTable
          headers={["Program", "Pagu (M)", "Realisasi (M)", "Daya Serap"]}
          rows={d.byProgram.map((p) => [p.program, p.pagu, p.realisasi, `${p.pct}%`])}
        />
      </ExecutiveInsightModal>
    </div>
  );
}

function AnalisaPaguPengadaanSection() {
  const [detailOpen, setDetailOpen] = useState(false);
  const d = EI_PAGU_PENGADAAN;

  return (
    <div className="space-y-3">
      <InsightKpiGrid
        items={[
          { label: "Total Pagu Pengadaan", value: "Rp 50,00 M", trend: "5 paket aktif" },
          { label: "Total Realisasi", value: "Rp 34,40 M", trend: "68,8% serap", positive: true },
          { label: "Paket Berjalan", value: "3", trend: "2 belum tender", positive: false },
          { label: "Paket Selesai", value: "1", trend: "100% on budget", positive: true },
        ]}
      />
      <InsightChartCard
        title="Realisasi per Paket Pengadaan"
        subtitle="Dalam miliar rupiah"
        onDetail={() => setDetailOpen(true)}
      >
        <HorizontalBarChart
          items={d.packages.map((p) => ({ label: p.paket, value: p.realisasi, color: "#8b5cf6" }))}
          max={20}
        />
      </InsightChartCard>
      <InsightAlerts items={d.insights} />
      <ExecutiveInsightModal
        open={detailOpen}
        title="Detail Pagu & Pengadaan"
        subtitle="Status paket tender dan vendor"
        onClose={() => setDetailOpen(false)}
        wide
      >
        <DetailTable
          headers={["Paket", "Pagu (M)", "Realisasi (M)", "Vendor", "Status"]}
          rows={d.packages.map((p) => [p.paket, p.pagu, p.realisasi, p.vendor, p.status])}
        />
      </ExecutiveInsightModal>
    </div>
  );
}

function RiwayatRevisiPaguSection() {
  const [detailOpen, setDetailOpen] = useState(false);
  const d = EI_REVISI_PAGU;

  return (
    <div className="space-y-3">
      <InsightKpiGrid
        items={[
          { label: "Pagu Awal", value: "Rp 318,00 M" },
          { label: "Pagu Efektif", value: "Rp 335,00 M", trend: "+5,3%", positive: true },
          { label: "Jumlah Revisi", value: "4", trend: "2 pergeseran internal" },
          { label: "Selisih Total", value: "+Rp 17,00 M", trend: "Revisi DIPA Apr", positive: true },
        ]}
      />
      <InsightChartCard
        title="Timeline Revisi Pagu"
        subtitle="Kronologi perubahan pagu tahun berjalan"
        onDetail={() => setDetailOpen(true)}
      >
        <div className="space-y-2">
          {d.revisions.map((r, i) => (
            <div key={r.tanggal} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0d6e63] text-[0.5625rem] font-bold text-white">
                  {i + 1}
                </div>
                {i < d.revisions.length - 1 && <div className="w-px flex-1 bg-slate-200" />}
              </div>
              <div className="pb-3">
                <p className="text-[0.6875rem] font-semibold text-slate-800">{r.jenis}</p>
                <p className="text-[0.5625rem] text-slate-500">
                  {r.tanggal} · {r.unit} · {r.selisih !== "0,00" ? r.selisih : "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </InsightChartCard>
      <InsightAlerts items={d.insights} />
      <ExecutiveInsightModal
        open={detailOpen}
        title="Detail Riwayat Revisi Pagu"
        subtitle="Seluruh perubahan pagu tahun berjalan"
        onClose={() => setDetailOpen(false)}
        wide
      >
        <DetailTable
          headers={["Tanggal", "Jenis", "Unit", "Sebelum (M)", "Sesudah (M)", "Selisih"]}
          rows={d.revisions.map((r) => [
            r.tanggal,
            r.jenis,
            r.unit,
            r.sebelum,
            r.sesudah,
            r.selisih,
          ])}
        />
      </ExecutiveInsightModal>
    </div>
  );
}

function SimulasiKebutuhanPaguSection() {
  const [detailOpen, setDetailOpen] = useState(false);
  const d = EI_SIMULASI_PAGU;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {d.scenarios.map((s) => (
          <div
            key={s.skenario}
            className={`rounded-lg border px-3 py-3 ${
              s.skenario === "Moderat"
                ? "border-[#0d6e63] bg-teal-50/50"
                : "border-slate-200 bg-white"
            }`}
          >
            <p className="text-[0.625rem] font-medium text-slate-500">{s.skenario}</p>
            <p className="mt-1 text-lg font-bold text-slate-900">Rp {s.pagu2026} M</p>
            <p className="text-[0.5625rem] text-slate-500">Growth +{s.growth}%</p>
            <p className="mt-1 text-[0.5625rem] text-slate-400">{s.basis}</p>
          </div>
        ))}
      </div>
      <InsightChartCard
        title="Faktor Penggerak Pagu 2026"
        subtitle="Estimasi dampak terhadap kebutuhan pagu"
        onDetail={() => setDetailOpen(true)}
      >
        <div className="space-y-2">
          {d.drivers.map((f) => (
            <div key={f.faktor} className="flex items-center justify-between text-[0.6875rem]">
              <span className="text-slate-600">{f.faktor}</span>
              <span
                className={`font-semibold ${f.arah === "naik" ? "text-amber-600" : "text-emerald-600"}`}
              >
                {f.dampak}
              </span>
            </div>
          ))}
        </div>
      </InsightChartCard>
      <InsightAlerts items={d.insights} />
      <ExecutiveInsightModal
        open={detailOpen}
        title="Detail Simulasi Kebutuhan Pagu"
        subtitle="Skenario proyeksi pagu tahun 2026"
        onClose={() => setDetailOpen(false)}
        wide
      >
        <DetailTable
          headers={["Skenario", "Growth", "Pagu 2026 (M)", "Basis Perhitungan"]}
          rows={d.scenarios.map((s) => [s.skenario, `+${s.growth}%`, s.pagu2026, s.basis])}
        />
        <h4 className="mb-2 mt-4 text-xs font-semibold text-slate-700">Faktor Penggerak</h4>
        <DetailTable
          headers={["Faktor", "Dampak", "Arah"]}
          rows={d.drivers.map((f) => [f.faktor, f.dampak, f.arah])}
        />
      </ExecutiveInsightModal>
    </div>
  );
}

function TrenHutangTahunanSection() {
  const [detailOpen, setDetailOpen] = useState(false);
  const d = EI_TREN_HUTANG;

  return (
    <div className="space-y-3">
      <InsightKpiGrid
        items={[
          { label: "Total Hutang 2025", value: "Rp 42,30 M", trend: "+7,9% YoY", positive: false },
          { label: "Rasio Hutang/Belanja", value: "22,4%", trend: "+0,6 p.p", positive: false },
          { label: "Hutang > 90 Hari", value: "Rp 4,10 M", trend: "9,7% dari total", positive: false },
          { label: "Pertumbuhan 5 Thn", value: "+48,4%", trend: "CAGR 10,3%", positive: false },
        ]}
      />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <InsightChartCard
          title="Tren Hutang Tahunan"
          subtitle="Dalam miliar rupiah (2021–2025)"
          onDetail={() => setDetailOpen(true)}
        >
          <BarChartVertical months={d.years} values={d.hutang} color="#ef4444" max={50} />
        </InsightChartCard>
        <InsightChartCard title="Aging Hutang" subtitle="Distribusi umur hutang saat ini">
          <div className="space-y-2">
            {d.aging.map((a) => (
              <div key={a.bucket}>
                <div className="mb-0.5 flex justify-between text-[0.625rem]">
                  <span className="text-slate-600">{a.bucket}</span>
                  <span className="font-semibold">
                    Rp {a.amount} M ({a.pct}%)
                  </span>
                </div>
                <ProgressBar value={a.pct} color="bg-red-400" />
              </div>
            ))}
          </div>
        </InsightChartCard>
      </div>
      <InsightAlerts items={d.insights} />
      <ExecutiveInsightModal
        open={detailOpen}
        title="Detail Tren Hutang Tahunan"
        subtitle="Pertumbuhan hutang dan rasio 5 tahun"
        onClose={() => setDetailOpen(false)}
      >
        <DetailTable
          headers={["Tahun", "Total Hutang (M)", "Rasio Hutang/Belanja (%)"]}
          rows={d.years.map((y, i) => [y, d.hutang[i], d.ratio[i]])}
        />
        <h4 className="mb-2 mt-4 text-xs font-semibold text-slate-700">Aging Hutang</h4>
        <DetailTable
          headers={["Bucket", "Jumlah (M)", "Persentase"]}
          rows={d.aging.map((a) => [a.bucket, a.amount, `${a.pct}%`])}
        />
      </ExecutiveInsightModal>
    </div>
  );
}

function HutangPerAkunSection() {
  const [detailOpen, setDetailOpen] = useState(false);
  const d = EI_HUTANG_AKUN;

  return (
    <div className="space-y-3">
      <InsightChartCard
        title="Hutang per Rekening Kewajiban"
        subtitle="Top 5 akun hutang — dalam miliar rupiah"
        onDetail={() => setDetailOpen(true)}
      >
        <HorizontalBarChart
          items={d.accounts.map((a) => ({ label: a.nama, value: a.saldo, color: "#ef4444" }))}
        />
      </InsightChartCard>
      <InsightAlerts items={d.insights} />
      <ExecutiveInsightModal
        open={detailOpen}
        title="Detail Hutang per Akun"
        subtitle="Saldo, aging, dan vendor terkait"
        onClose={() => setDetailOpen(false)}
        wide
      >
        <DetailTable
          headers={["Kode", "Nama Akun", "Saldo (M)", "Aging", "Vendor"]}
          rows={d.accounts.map((a) => [a.kode, a.nama, a.saldo, a.aging, a.vendor])}
        />
      </ExecutiveInsightModal>
    </div>
  );
}

function MonitoringSaldoBulananSection() {
  const [detailOpen, setDetailOpen] = useState(false);
  const d = EI_SALDO_BULANAN;

  return (
    <div className="space-y-3">
      <InsightKpiGrid
        items={[
          { label: "Saldo Akhir Jun", value: "Rp 56,80 M", trend: "▲ 17,1% MoM", positive: true },
          { label: "Runway Likuiditas", value: "3,1 bulan", trend: "Min. 2 bulan", positive: true },
          { label: "Saldo Minimum", value: "Rp 25,00 M", trend: "Tidak tercapai", positive: true },
          { label: "Net Cash Flow Jun", value: "Rp 8,30 M", trend: "▲ positif", positive: true },
        ]}
      />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <InsightChartCard
          title="Tren Saldo Kas & Bank"
          subtitle="Dalam miliar rupiah (Jan–Jun 2025)"
          onDetail={() => setDetailOpen(true)}
        >
          <BarChartVertical months={d.months} values={d.saldo} color="#0d9488" max={70} />
        </InsightChartCard>
        <InsightChartCard title="Arus Kas Masuk vs Keluar" subtitle="Dalam miliar rupiah">
          <LineChartDual
            months={d.months}
            seriesA={d.masuk}
            seriesB={d.keluar}
            labelA="Kas Masuk"
            labelB="Kas Keluar"
            colorA="#3b82f6"
            colorB="#f97316"
            max={200}
          />
        </InsightChartCard>
      </div>
      <InsightAlerts items={d.insights} />
      <ExecutiveInsightModal
        open={detailOpen}
        title="Detail Monitoring Saldo Bulanan"
        subtitle="Arus kas dan runway likuiditas"
        onClose={() => setDetailOpen(false)}
        wide
      >
        <DetailTable
          headers={[
            "Bulan",
            "Saldo Awal",
            "Kas Masuk",
            "Kas Keluar",
            "Saldo Akhir",
            "Runway",
          ]}
          rows={d.detail.map((r) => [
            r.bulan,
            r.saldoAwal,
            r.masuk,
            r.keluar,
            r.saldoAkhir,
            r.runway,
          ])}
        />
      </ExecutiveInsightModal>
    </div>
  );
}

function AnalisaPasienResepBekkesSection() {
  const [detailOpen, setDetailOpen] = useState(false);
  const d = EI_PASIEN_RESEP;
  const months = d.correlation.map((c) => c.bulan);

  return (
    <div className="space-y-3">
      <InsightKpiGrid items={d.kpis} />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <InsightChartCard
          title="Volume Pasien & Resep"
          subtitle="Korelasi layanan klinis (ribuan)"
          onDetail={() => setDetailOpen(true)}
        >
          <LineChartDual
            months={months}
            seriesA={d.correlation.map((c) => c.pasien / 100)}
            seriesB={d.correlation.map((c) => c.resep / 100)}
            labelA="Pasien (×100)"
            labelB="Resep (×100)"
            colorA="#3b82f6"
            colorB="#14b8a6"
            max={30}
          />
        </InsightChartCard>
        <InsightChartCard title="Bekkes vs Pendapatan Farmasi" subtitle="Dalam miliar rupiah">
          <LineChartDual
            months={months}
            seriesA={d.correlation.map((c) => c.bekkes)}
            seriesB={d.correlation.map((c) => c.farmasi)}
            labelA="Belanja Bekkes"
            labelB="Pendapatan Farmasi"
            colorA="#ef4444"
            colorB="#22c55e"
            max={4}
          />
        </InsightChartCard>
      </div>
      <InsightAlerts items={d.insights} />
      <ExecutiveInsightModal
        open={detailOpen}
        title="Detail Analisa Pasien, Resep & Bekkes"
        subtitle="Data bulanan layanan klinis dan dampak finansial"
        onClose={() => setDetailOpen(false)}
        wide
      >
        <DetailTable
          headers={[
            "Bulan",
            "Pasien",
            "Resep",
            "Belanja Bekkes (M)",
            "Pendapatan Farmasi (M)",
          ]}
          rows={d.correlation.map((c) => [
            c.bulan,
            c.pasien.toLocaleString("id-ID"),
            c.resep.toLocaleString("id-ID"),
            c.bekkes,
            c.farmasi,
          ])}
        />
      </ExecutiveInsightModal>
    </div>
  );
}

const SECTION_COMPONENTS: Record<string, () => React.ReactNode> = {
  "tren-pendapatan-belanja": TrenPendapatanBelanjaSection,
  "posisi-keuangan-riil": PosisiKeuanganRiilSection,
  "pendapatan-per-akun": PendapatanPerAkunSection,
  "daya-serap-anggaran": DayaSerapAnggaranSection,
  "komposisi-anggaran": KomposisiAnggaranSection,
  "analisa-pagu-pengadaan": AnalisaPaguPengadaanSection,
  "riwayat-revisi-pagu": RiwayatRevisiPaguSection,
  "simulasi-kebutuhan-pagu": SimulasiKebutuhanPaguSection,
  "tren-hutang-tahunan": TrenHutangTahunanSection,
  "hutang-per-akun": HutangPerAkunSection,
  "monitoring-saldo-bulanan": MonitoringSaldoBulananSection,
  "analisa-pasien-resep-bekkes": AnalisaPasienResepBekkesSection,
};

export function ExecutiveInsightSectionContent({ sectionId }: { sectionId: string }) {
  const Component = SECTION_COMPONENTS[sectionId];
  if (!Component) return null;
  return <Component />;
}
