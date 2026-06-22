"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { fetchProcurementPoDetail } from "@/services/procurementService";
import {
  formatProcurementAmount,
  formatProcurementDate,
  type ProcurementPoDetail,
} from "@/types/procurement";
import { tableGridShellClassName } from "@/components/ui/tableStyles";

type ProcurementPoDetailDrawerProps = {
  noPo: string | null;
  onClose: () => void;
};

export function ProcurementPoDetailDrawer({ noPo, onClose }: ProcurementPoDetailDrawerProps) {
  const [data, setData] = useState<ProcurementPoDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!noPo) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    void fetchProcurementPoDetail(noPo)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat detail PO."))
      .finally(() => setLoading(false));
  }, [noPo]);

  if (!noPo) return null;

  const h = data?.header;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Detail PO — {noPo}</h2>
            <p className="text-xs text-slate-500">POH header + POD detail lines</p>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : h ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Tanggal</span>
                  <p className="font-medium">{formatProcurementDate(h.tgl_po)}</p>
                </div>
                <div>
                  <span className="text-slate-400">No. AJU</span>
                  <p className="font-medium">{h.no_aju ?? "—"}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Supplier</span>
                  <p className="font-medium">{h.nama_supplier}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Uraian</span>
                  <p>{h.uraian}</p>
                </div>
                <div>
                  <span className="text-slate-400">Total</span>
                  <p className="font-semibold tabular-nums">Rp {formatProcurementAmount(h.total)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Jenis</span>
                  <p className="font-medium">{h.jenis_label}</p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-800">Detail Barang (POD)</h3>
                <div className={tableGridShellClassName()}>
                  <Table>
                    <THead>
                      <TR>
                        <TH>Barang</TH>
                        <TH>Qty</TH>
                        <TH className="text-right">Harga</TH>
                        <TH className="text-right">Total</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {data.lines.map((line) => (
                        <TR key={line.urut}>
                          <TD>
                            <p className="font-medium">{line.nama_barang}</p>
                            <p className="text-[10px] text-slate-400">{line.kode_barang}</p>
                          </TD>
                          <TD className="tabular-nums">
                            {line.qty_po} {line.satuan}
                          </TD>
                          <TD className="text-right tabular-nums">
                            {formatProcurementAmount(line.harga)}
                          </TD>
                          <TD className="text-right tabular-nums">
                            {formatProcurementAmount(line.total)}
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
