"use client";

import { Card } from "@/components/ui/Card";
import {
  createLeaveRequest,
  getLeaveRequests,
  getLeaveTypes,
} from "@/services/hr";
import type { LeaveRequest, LeaveType } from "@/types/hr";
import { FormEvent, useEffect, useState } from "react";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  submitted: "Diajukan",
  approved: "Disetujui",
  rejected: "Ditolak",
};

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    setLoading(true);
    Promise.all([getLeaveRequests(), getLeaveTypes()])
      .then(([reqRes, types]) => {
        setRequests(reqRes.data);
        setLeaveTypes(types);
        if (types.length && !form.leave_type_id) {
          setForm((f) => ({ ...f, leave_type_id: String(types[0].id) }));
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await createLeaveRequest({
        leave_type_id: Number(form.leave_type_id),
        start_date: form.start_date,
        end_date: form.end_date,
        reason: form.reason || undefined,
        submit: true,
      });
      setMessage("Pengajuan cuti berhasil dikirim.");
      setShowForm(false);
      setForm({ leave_type_id: form.leave_type_id, start_date: "", end_date: "", reason: "" });
      load();
    } catch {
      setMessage("Gagal mengajukan cuti. Periksa saldo cuti Anda.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cuti</h1>
          <p className="mt-1 text-sm text-slate-600">
            Pengajuan dan riwayat cuti karyawan.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="shrink-0 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          {showForm ? "Batal" : "+ Ajukan Cuti"}
        </button>
      </div>

      {message && (
        <p className="mb-4 text-sm text-sky-700">{message}</p>
      )}

      {showForm && (
        <Card variant="elevated" className="mb-6">
          <form onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Jenis cuti
              </label>
              <select
                required
                value={form.leave_type_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, leave_type_id: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {leaveTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div />
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Tanggal mulai
              </label>
              <input
                type="date"
                required
                value={form.start_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, start_date: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Tanggal selesai
              </label>
              <input
                type="date"
                required
                value={form.end_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, end_date: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Alasan
              </label>
              <textarea
                value={form.reason}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reason: e.target.value }))
                }
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {submitting ? "Mengirim..." : "Kirim Pengajuan"}
          </button>
          </form>
        </Card>
      )}

      <Card variant="flat" padding={false} className="overflow-x-auto">
        <table className="min-w-[40rem] w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Karyawan</th>
              <th className="px-4 py-3 font-medium">Jenis</th>
              <th className="px-4 py-3 font-medium">Periode</th>
              <th className="px-4 py-3 font-medium">Hari</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Memuat...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Belum ada pengajuan cuti.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{r.employee?.name}</td>
                  <td className="px-4 py-3">{r.leave_type?.name}</td>
                  <td className="px-4 py-3">
                    {r.start_date} — {r.end_date}
                  </td>
                  <td className="px-4 py-3">{r.days_count}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                      {STATUS_LABEL[r.status] ?? r.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
