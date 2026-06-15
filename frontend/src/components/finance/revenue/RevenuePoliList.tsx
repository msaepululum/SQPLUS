import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

const POLI_DATA = [
  { name: "Poli Penyakit Dalam", amount: "Rp 23,6 M", pct: 18.4, trend: "+12,3%" },
  { name: "Poli Bedah", amount: "Rp 18,2 M", pct: 14.2, trend: "+9,8%" },
  { name: "Poli Anak", amount: "Rp 14,8 M", pct: 11.5, trend: "+11,2%" },
  { name: "Poli Kebidanan", amount: "Rp 12,4 M", pct: 9.7, trend: "+8,5%" },
  { name: "Poli Jantung", amount: "Rp 10,9 M", pct: 8.5, trend: "+14,1%" },
  { name: "Poli Orthopedi", amount: "Rp 9,3 M", pct: 7.2, trend: "+7,6%" },
  { name: "Poli Mata", amount: "Rp 7,8 M", pct: 6.1, trend: "+6,9%" },
  { name: "Poli THT", amount: "Rp 6,5 M", pct: 5.1, trend: "+5,4%" },
];

export function RevenuePoliList() {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Pendapatan per Poli</CardTitle>
        <button type="button" className="text-xs font-medium text-teal-600 hover:underline">
          Lihat semua poli →
        </button>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {POLI_DATA.map((p, i) => (
            <li key={p.name}>
              <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-700">
                    {i + 1}
                  </span>
                  <span className="truncate font-medium text-slate-700">{p.name}</span>
                </div>
                <div className="shrink-0 text-left sm:text-right">
                  <span className="font-semibold text-slate-900">{p.amount}</span>
                  <span className="ml-2 text-xs text-emerald-600">{p.trend}</span>
                </div>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400"
                  style={{ width: `${p.pct}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
