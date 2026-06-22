"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import type { CashAccountOption, CashTransactionDetail } from "@/types/cash-transaction";
import {
  formatCashAmountInput,
  parseCashAmountInput,
} from "@/types/cash-transaction";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { Loader2, Plus, Trash2, X } from "lucide-react";

type JournalLineDraft = {
  account_no: string;
  account_name: string;
  keterangan: string;
  debet: string;
  kredit: string;
  is_kas_line?: boolean;
};

type CashTransactionFormModalProps = {
  open: boolean;
  flowType: "masuk" | "keluar";
  budgetYearId: number;
  kasAccounts: CashAccountOption[];
  bankAccounts: CashAccountOption[];
  initial?: CashTransactionDetail | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    tanggal: string;
    journal_type: string;
    keterangan: string;
    no_bukti: string;
    kas_account_no: string;
    kas_account_name: string;
    lines: Array<{
      account_no: string;
      account_name?: string;
      keterangan?: string;
      debet: number;
      kredit: number;
    }>;
  }) => Promise<void>;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultJournalType(flowType: "masuk" | "keluar"): string {
  return flowType === "masuk" ? "BKM" : "BBK";
}

function emptyLine(isKas = false): JournalLineDraft {
  return {
    account_no: "",
    account_name: "",
    keterangan: "",
    debet: "",
    kredit: "",
    is_kas_line: isKas,
  };
}

export function CashTransactionFormModal({
  open,
  flowType,
  budgetYearId,
  kasAccounts,
  bankAccounts,
  initial,
  saving,
  onClose,
  onSubmit,
}: CashTransactionFormModalProps) {
  const accountOptions = useMemo(
    () => [...kasAccounts, ...bankAccounts],
    [kasAccounts, bankAccounts]
  );

  const [tanggal, setTanggal] = useState(todayIso());
  const [journalType, setJournalType] = useState(defaultJournalType(flowType));
  const [keterangan, setKeterangan] = useState("");
  const [noBukti, setNoBukti] = useState("");
  const [kasAccountNo, setKasAccountNo] = useState("");
  const [lines, setLines] = useState<JournalLineDraft[]>([
    emptyLine(true),
    emptyLine(false),
  ]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (initial) {
      setTanggal(initial.tanggal ?? todayIso());
      setJournalType(initial.journal_type);
      setKeterangan(initial.keterangan ?? "");
      setNoBukti(initial.no_bukti ?? "");
      setKasAccountNo(initial.kas_account_no ?? "");
      setLines(
        initial.lines.map((line) => ({
          account_no: line.account_no,
          account_name: line.account_name,
          keterangan: line.keterangan,
          debet: line.debet > 0 ? formatCashAmountInput(line.debet) : "",
          kredit: line.kredit > 0 ? formatCashAmountInput(line.kredit) : "",
          is_kas_line: line.account_no === initial.kas_account_no,
        }))
      );
    } else {
      setTanggal(todayIso());
      setJournalType(defaultJournalType(flowType));
      setKeterangan("");
      setNoBukti("");
      setKasAccountNo(accountOptions[0]?.value ?? "");
      setLines([emptyLine(true), emptyLine(false)]);
    }
    setError(null);
  }, [open, initial, flowType, accountOptions]);

  const totals = useMemo(() => {
    let debet = 0;
    let kredit = 0;
    for (const line of lines) {
      debet += parseCashAmountInput(line.debet);
      kredit += parseCashAmountInput(line.kredit);
    }
    return { debet, kredit };
  }, [lines]);

  const handleAccountChange = (index: number, accountNo: string) => {
    const opt = accountOptions.find((o) => o.value === accountNo);
    setLines((prev) =>
      prev.map((line, i) =>
        i === index
          ? {
              ...line,
              account_no: accountNo,
              account_name: opt?.label.split(" (")[0] ?? "",
              is_kas_line: line.is_kas_line,
            }
          : line
      )
    );
    if (lines[index]?.is_kas_line) {
      setKasAccountNo(accountNo);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    const kasOpt = accountOptions.find((o) => o.value === kasAccountNo);
    const parsedLines = lines.map((line) => ({
      account_no: line.account_no.trim(),
      account_name: line.account_name.trim() || undefined,
      keterangan: line.keterangan.trim() || keterangan.trim() || undefined,
      debet: parseCashAmountInput(line.debet),
      kredit: parseCashAmountInput(line.kredit),
    }));

    if (!kasAccountNo) {
      setError("Rekening kas/bank wajib dipilih.");
      return;
    }

    if (totals.debet !== totals.kredit || totals.debet <= 0) {
      setError("Jurnal harus seimbang dan nominal lebih dari nol.");
      return;
    }

    try {
      await onSubmit({
        tanggal,
        journal_type: journalType,
        keterangan: keterangan.trim(),
        no_bukti: noBukti.trim(),
        kas_account_no: kasAccountNo,
        kas_account_name: kasOpt?.label.split(" (")[0] ?? "",
        lines: parsedLines,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan transaksi.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        aria-label="Tutup form"
        onClick={onClose}
      />
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-xl border border-slate-200 bg-white shadow-2xl sm:rounded-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {initial ? "Edit" : "Tambah"}{" "}
              {flowType === "masuk" ? "Kas Masuk" : "Kas Keluar"}
            </h3>
            <p className="text-xs text-slate-500">
              Prinsip double-entry — total debet harus sama dengan total kredit
            </p>
          </div>
          <Button type="button" variant="ghost" className="h-8 w-8 px-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">Tanggal *</span>
              <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">Jenis Bukti *</span>
              <Select value={journalType} onChange={(e) => setJournalType(e.target.value)}>
                {flowType === "masuk" ? (
                  <>
                    <option value="BKM">BKM — Bukti Kas Masuk</option>
                    <option value="BBM">BBM — Bukti Bank Masuk</option>
                  </>
                ) : (
                  <>
                    <option value="BBK">BBK — Bukti Bank Keluar</option>
                    <option value="BKK">BKK — Bukti Kas Keluar</option>
                  </>
                )}
              </Select>
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-xs font-medium text-slate-600">Rekening Kas/Bank *</span>
              <Select
                value={kasAccountNo}
                onChange={(e) => {
                  setKasAccountNo(e.target.value);
                  setLines((prev) =>
                    prev.map((line) =>
                      line.is_kas_line
                        ? {
                            ...line,
                            account_no: e.target.value,
                            account_name:
                              accountOptions.find((o) => o.value === e.target.value)?.label.split(
                                " ("
                              )[0] ?? "",
                          }
                        : line
                    )
                  );
                }}
              >
                <option value="">Pilih rekening...</option>
                {accountOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-xs font-medium text-slate-600">Keterangan</span>
              <Input
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Uraian transaksi..."
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">No. Bukti</span>
              <Input
                value={noBukti}
                onChange={(e) => setNoBukti(e.target.value)}
                placeholder="Nomor bukti fisik"
              />
            </label>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-800">Baris Jurnal</h4>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setLines((prev) => [...prev, emptyLine()])}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Baris
              </Button>
            </div>
            <div className={tableGridShellClassName}>
              <Table>
                <THead>
                  <TR>
                    <TH>Akun</TH>
                    <TH className="w-28">Debet</TH>
                    <TH className="w-28">Kredit</TH>
                    <TH className="w-10" />
                  </TR>
                </THead>
                <TBody>
                  {lines.map((line, index) => (
                    <TR key={index}>
                      <TD>
                        <Select
                          value={line.account_no}
                          onChange={(e) => handleAccountChange(index, e.target.value)}
                          className="mb-1"
                        >
                          <option value="">Pilih akun...</option>
                          {accountOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </Select>
                        <Input
                          value={line.keterangan}
                          onChange={(e) =>
                            setLines((prev) =>
                              prev.map((l, i) =>
                                i === index ? { ...l, keterangan: e.target.value } : l
                              )
                            )
                          }
                          placeholder="Keterangan baris"
                          className="text-xs"
                        />
                      </TD>
                      <TD>
                        <Input
                          value={line.debet}
                          onChange={(e) =>
                            setLines((prev) =>
                              prev.map((l, i) =>
                                i === index
                                  ? { ...l, debet: e.target.value, kredit: "" }
                                  : l
                              )
                            )
                          }
                          placeholder="0"
                          className="font-mono text-right text-sm"
                        />
                      </TD>
                      <TD>
                        <Input
                          value={line.kredit}
                          onChange={(e) =>
                            setLines((prev) =>
                              prev.map((l, i) =>
                                i === index
                                  ? { ...l, kredit: e.target.value, debet: "" }
                                  : l
                              )
                            )
                          }
                          placeholder="0"
                          className="font-mono text-right text-sm"
                        />
                      </TD>
                      <TD>
                        {lines.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-8 w-8 px-0"
                            onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        )}
                      </TD>
                    </TR>
                  ))}
                  <TR className="bg-slate-50/80 font-medium">
                    <TD>Total</TD>
                    <TD className="font-mono text-right text-sm">
                      {formatCashAmountInput(totals.debet) || "0"}
                    </TD>
                    <TD className="font-mono text-right text-sm">
                      {formatCashAmountInput(totals.kredit) || "0"}
                    </TD>
                    <TD />
                  </TR>
                </TBody>
              </Table>
            </div>
            {totals.debet === totals.kredit && totals.debet > 0 ? (
              <p className="mt-1.5 text-xs text-emerald-600">✓ Jurnal seimbang</p>
            ) : (
              <p className="mt-1.5 text-xs text-amber-600">
                Total debet dan kredit harus sama
              </p>
            )}
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={saving}>
            {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Simpan Draft
          </Button>
        </div>
      </div>
    </div>
  );
}
