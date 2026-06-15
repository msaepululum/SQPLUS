import type {
  AttendanceRecord,
  Employee,
  HrDashboard,
  LeaveRequest,
  LeaveType,
  Paginated,
  PayrollPeriod,
} from "@/types/hr";
import { apiFetch } from "./api";

export async function getHrDashboard() {
  const res = await apiFetch<{ data: HrDashboard }>("/hr/dashboard");
  return res.data;
}

export async function getEmployees(params?: { search?: string; page?: number }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.page) qs.set("page", String(params.page));
  const query = qs.toString();
  return apiFetch<Paginated<Employee>>(`/hr/employees${query ? `?${query}` : ""}`);
}

export async function getAttendance(params?: { date?: string; page?: number }) {
  const qs = new URLSearchParams();
  if (params?.date) qs.set("date", params.date);
  if (params?.page) qs.set("page", String(params.page));
  const query = qs.toString();
  return apiFetch<Paginated<AttendanceRecord>>(
    `/hr/attendance${query ? `?${query}` : ""}`
  );
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
