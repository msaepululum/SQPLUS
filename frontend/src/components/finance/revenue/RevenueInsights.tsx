import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

export function RevenueInsights() {
  return (
    <Card variant="elevated">
      <CardHeader className="flex-col items-start sm:flex-col sm:items-start">
        <CardTitle>Insight Pendapatan</CardTitle>
        <CardDescription>Ringkasan temuan utama periode ini</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Poli Tertinggi
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">Poli Penyakit Dalam</p>
          <p className="text-sm text-slate-600">Rp 23,6 M · 18,4% dari total pendapatan</p>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Dokter Tertinggi
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">dr. Andi Wijaya, Sp.PD</p>
          <p className="text-sm text-slate-600">Rp 8,9 M · 842 kunjungan</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Komposisi Sumber
          </p>
          <p className="mt-2 text-sm text-slate-700">
            <strong>BPJS 56,8%</strong> dan <strong>Tunai 24,7%</strong> menyumbang 81,5% total
            pendapatan.
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            Perhatian
          </p>
          <p className="mt-2 text-sm leading-relaxed text-amber-900">
            Ketergantungan pendapatan pada BPJS cukup tinggi (56,8%). Pertimbangkan diversifikasi
            sumber pembayar untuk stabilitas jangka panjang.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
