import type {
  AttendanceRecord,
  Employee,
  HrDashboard,
  HrPayrollTaxRow,
  HrPayrollTaxSchema,
  HrPayrollTaxSummary,
  LeaveRequest,
  LeaveType,
  Paginated,
  PayrollItem,
  PayrollPeriod,
} from "@/types/hr";
import { apiFetch } from "./api";

export async function getHrDashboard() {
  const res = await apiFetch<{ data: HrDashboard }>("/hr/dashboard");
  return res.data;
}

export async function getEmployees(params?: {
  search?: string;
  page?: number;
  source?: "payroll" | "sqplus";
}) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.source) qs.set("source", params.source);
  const query = qs.toString();
  return apiFetch<Paginated<Employee>>(`/hr/employees${query ? `?${query}` : ""}`);
}

export async function getEmployeeMe() {
  const res = await apiFetch<{ data: Employee }>("/hr/employees/me");
  return res.data;
}

export async function getAttendance(params?: {
  date?: string;
  page?: number;
  hris?: boolean;
  fromHris?: boolean;
}) {
  const qs = new URLSearchParams();
  if (params?.date) qs.set("date", params.date);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.hris) qs.set("hris", "1");
  if (params?.fromHris) qs.set("from_hris", "1");
  const query = qs.toString();
  const res = await apiFetch<
    Paginated<AttendanceRecord> | { data: AttendanceRecord[]; source?: string; total?: number; last_page?: number; current_page?: number; per_page?: number }
  >(`/hr/attendance${query ? `?${query}` : ""}`);

  if ("data" in res && Array.isArray(res.data) && !("current_page" in res)) {
    return { data: res.data, source: res.source ?? "hris" };
  }

  if ("data" in res && Array.isArray(res.data) && "total" in res) {
    return {
      data: res.data,
      source: res.source ?? "hris",
      total: res.total ?? res.data.length,
      current_page: res.current_page ?? 1,
      last_page: res.last_page ?? 1,
      per_page: res.per_page ?? res.data.length,
    };
  }

  return { ...(res as Paginated<AttendanceRecord>), source: "sqplus" };
}

export async function getLeaveTypes() {
  const res = await apiFetch<{ data: LeaveType[] }>("/hr/leave-types");
  return res.data;
}

export async function getLeaveRequests(page = 1) {
  return apiFetch<Paginated<LeaveRequest>>(`/hr/leave-requests?page=${page}`);
}

export async function createLeaveRequest(payload: {
  leave_type_id: number;
  start_date: string;
  end_date: string;
  reason?: string;
  submit?: boolean;
}) {
  const res = await apiFetch<{ data: LeaveRequest }>("/hr/leave-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function getPayrollPeriods(page = 1) {
  return apiFetch<Paginated<PayrollPeriod>>(`/hr/payroll/periods?page=${page}`);
}

export async function getPayrollPeriod(id: number) {
  const res = await apiFetch<{ data: PayrollPeriod }>(`/hr/payroll/periods/${id}`);
  return res.data;
}

export async function getPayrollMe() {
  const res = await apiFetch<{ data: PayrollItem[] }>("/hr/payroll/me");
  return res.data;
}

export async function getPayrollTaxSchema() {
  const res = await apiFetch<{ data: HrPayrollTaxSchema }>("/hr/payroll/tax/schema");
  return res.data;
}

export async function getPayrollTaxSummary(params?: { tahun?: number; bulan?: number }) {
  const qs = new URLSearchParams();
  if (params?.tahun) qs.set("tahun", String(params.tahun));
  if (params?.bulan) qs.set("bulan", String(params.bulan));
  const query = qs.toString();
  const res = await apiFetch<{ data: HrPayrollTaxSummary }>(
    `/hr/payroll/tax/summary${query ? `?${query}` : ""}`
  );
  return res.data;
}

export async function getPayrollTaxEmployees(params?: {
  tahun?: number;
  bulan?: number;
  search?: string;
  page?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.tahun) qs.set("tahun", String(params.tahun));
  if (params?.bulan) qs.set("bulan", String(params.bulan));
  if (params?.search) qs.set("search", params.search);
  if (params?.page) qs.set("page", String(params.page));
  const query = qs.toString();
  return apiFetch<Paginated<HrPayrollTaxRow>>(
    `/hr/payroll/tax/employees${query ? `?${query}` : ""}`
  );
}

export async function getPayrollTaxMe() {
  const res = await apiFetch<{ data: HrPayrollTaxRow }>("/hr/payroll/tax/me");
  return res.data;
}
