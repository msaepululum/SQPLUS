import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  tableBodyStripedClassName,
  tableHeadCellClassName,
  tableHeadRowClassName,
  tableShellClassName,
} from "@/components/ui/tableStyles";

const DOCTORS = [
  { rank: 1, name: "dr. Andi Wijaya, Sp.PD", poli: "Penyakit Dalam", visits: 842, revenue: "Rp 8,9 M", contrib: "6,9%" },
  { rank: 2, name: "dr. Budi Santoso, Sp.B", poli: "Bedah", visits: 624, revenue: "Rp 6,2 M", contrib: "4,8%" },
  { rank: 3, name: "dr. Siti Rahayu, Sp.A", poli: "Anak", visits: 578, revenue: "Rp 5,4 M", contrib: "4,2%" },
  { rank: 4, name: "dr. Rina Kusuma, Sp.OG", poli: "Kebidanan", visits: 491, revenue: "Rp 4,8 M", contrib: "3,7%" },
  { rank: 5, name: "dr. Hendra Pratama, Sp.JP", poli: "Jantung", visits: 412, revenue: "Rp 4,1 M", contrib: "3,2%" },
  { rank: 6, name: "dr. Maya Lestari, Sp.OT", poli: "Orthopedi", visits: 356, revenue: "Rp 3,6 M", contrib: "2,8%" },
  { rank: 7, name: "dr. Agus Firmansyah, Sp.M", poli: "Mata", visits: 298, revenue: "Rp 2,9 M", contrib: "2,3%" },
  { rank: 8, name: "dr. Dewi Anggraini, Sp.THT", poli: "THT", visits: 245, revenue: "Rp 2,4 M", contrib: "1,9%" },
];

export function RevenueDoctorTable() {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Pendapatan per Dokter</CardTitle>
        <button type="button" className="text-xs font-medium text-teal-600 hover:underline">
          Lihat semua dokter →
        </button>
      </CardHeader>
      <CardContent scrollable>
        <div className={tableShellClassName}>
          <table className="w-full min-w-[36rem] text-sm">
            <thead>
              <tr className={tableHeadRowClassName}>
                <th className={tableHeadCellClassName}>#</th>
                <th className={tableHeadCellClassName}>Dokter</th>
                <th className={tableHeadCellClassName}>Poli</th>
                <th className={`${tableHeadCellClassName} text-right`}>Kunjungan</th>
                <th className={`${tableHeadCellClassName} text-right`}>Pendapatan</th>
                <th className={`${tableHeadCellClassName} text-right`}>Kontribusi</th>
              </tr>
            </thead>
            <tbody className={tableBodyStripedClassName}>
              {DOCTORS.map((d) => (
                <tr key={d.rank}>
                  <td className="px-3 py-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                      {d.rank}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-medium text-slate-800">{d.name}</td>
                  <td className="px-3 py-2.5 text-slate-600">{d.poli}</td>
                  <td className="px-3 py-2.5 text-right text-slate-700">{d.visits}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-slate-900">
                    {d.revenue}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                      {d.contrib}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
