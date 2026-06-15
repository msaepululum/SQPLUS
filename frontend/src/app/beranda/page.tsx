import { BerandaKpiRow } from "@/components/beranda/BerandaKpiRow";
import { InsightAsset } from "@/components/beranda/InsightAsset";
import { InsightKeuangan } from "@/components/beranda/InsightKeuangan";
import { InsightPersonalia } from "@/components/beranda/InsightPersonalia";
import { SorotanPimpinan } from "@/components/beranda/SorotanPimpinan";
import { PageHeader } from "@/components/layout/PageHeader";

export default function BerandaPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Beranda"
        description="Ringkasan kinerja rumah sakit — keuangan, personalia, aset, dan sorotan pimpinan."
      />

      <BerandaKpiRow />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-4">
        <InsightKeuangan />
        <InsightPersonalia />
        <InsightAsset />
        <SorotanPimpinan />
      </div>
    </div>
  );
}
