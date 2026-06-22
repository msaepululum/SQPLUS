export type HrDashboardPeriod = {
  id: number | null;
  code: string;
  name: string;
  status: string;
  period_start: string | null;
  period_end: string | null;
  source?: string;
};

export type HrCompositionSegment = {
  label: string;
  count: number;
  pct: number;
  color: string;
};

export type HrUnitRow = {
  unit: string;
  count: number;
  pct: number;
};

export type HrStatItem = {
  label: string;
  value: string;
  source?: string;
};

export type HrAttendanceTrend = {
  months: string[];
  kehadiran: number[];
  absensi: number[];
};

export type HrDashboard = {
  total_employees: number;
  present_today: number;
  attendance_rate_today: number | null;
  pending_leave_requests: number;
  cuti_berjalan: number;
  lembur_bulan_ini: { count: number; total_minutes: number; label: string };
  latest_payroll_period: HrDashboardPeriod | null;
  sources: {
    employees: string;
    attendance: string;
    payroll: string;
  };
  composition: HrCompositionSegment[];
  stats: HrStatItem[];
  attendance_trend: HrAttendanceTrend;
  top_units: HrUnitRow[];
};

export type Employee = {
  id?: number;
  employee_code: string;
  legacy_department_code?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  employment_status: string;
  join_date?: string;
  base_salary?: string;
  profession?: string;
  employee_type?: string;
  source_system?: string;
  position?: { id?: number; code?: string; name: string };
  organizational_unit?: { id?: number; code?: string; name: string };
  leave_balances?: LeaveBalance[];
};

export type LeaveBalance = {
  id: number;
  year: number;
  entitled_days: number;
  used_days: number;
  leave_type?: { id: number; code: string; name: string };
};

export type AttendanceRecord = {
  id?: number;
  employee_id?: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  shift?: string;
  source?: string;
  employee?: { id: number; employee_code: string; name: string };
};

export type LeaveType = {
  id: number;
  code: string;
  name: string;
  default_days_per_year: number;
};

export type LeaveRequest = {
  id: number;
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string | null;
  status: string;
  employee?: { id: number; employee_code: string; name: string };
  leave_type?: { id: number; code: string; name: string };
};

export type PayrollPeriod = {
  id: number;
  code: string;
  name: string;
  period_start: string;
  period_end: string;
  status: string;
  items?: PayrollItem[];
};

export type PayrollItem = {
  id: number;
  base_salary: string;
  allowances: string;
  deductions: string;
  net_salary: string;
  employee?: { id: number; employee_code: string; name: string };
  payroll_period?: PayrollPeriod;
};

export type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  source?: string;
};

export type HrTerBracket = {
  tier: number;
  max_bruto: number | null;
  rate: number;
};

export type HrTerCategory = {
  code: string;
  label: string;
  description: string;
  ptkp_codes: string[];
  brackets: HrTerBracket[];
  bracket_count: number;
};

export type HrPayrollTaxSchema = {
  scheme: string;
  effective_year: number;
  formula: string;
  categories: HrTerCategory[];
  ptkp_reference: Array<{
    code: string;
    name: string;
    ptkp_tahunan: number;
    ter_category: string;
  }>;
  finance_link: {
    module: string;
    path: string;
    label: string;
    note: string;
  };
};

export type HrPayrollTaxSummary = {
  tahun: number;
  bulan: number;
  bulan_label: string;
  period_code: string;
  period_name: string;
  source: string;
  scheme?: string;
  kpi: {
    jumlah_pegawai: number;
    total_bruto: number;
    total_pph21: number;
    total_pph21_kinerja: number;
    total_pph21_pks: number;
    total_pph21_all?: number;
    total_potongan: number;
    total_bersih: number;
  };
  finance_link: {
    module: string;
    path: string;
    query?: { tahun: number; bulan: number };
    label: string;
    total_pph21_payroll: number;
    reconciliation_key: string;
    status: string;
    note: string;
  };
};

export type HrPayrollTaxRow = {
  employee_code: string;
  name: string;
  unit: string;
  tahun: number;
  bulan: number;
  penghasilan_bruto: number;
  potongan_lain: number;
  pph21: number;
  pph21_kinerja: number;
  pph21_pks: number;
  pph21_total: number;
  penghasilan_bersih: number;
  ptkp_code: string;
  ptkp_name: string;
  ptkp_tahunan: number;
  ter_category: string;
  ter_rate: number;
  pph21_ter_simulasi: number;
  selisih_payroll: number;
  source: string;
};

export function formatHrCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatHrNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function attendanceStatusLabel(status: string): string {
  switch (status) {
    case "present":
      return "Hadir";
    case "late":
      return "Terlambat";
    case "absent":
      return "Alpha";
    case "leave":
      return "Cuti";
    default:
      return status;
  }
}

export function attendanceStatusVariant(status: string): "success" | "warning" | "danger" | "info" | "draft" {
  switch (status) {
    case "present":
      return "success";
    case "late":
      return "warning";
    case "absent":
      return "danger";
    case "leave":
      return "info";
    default:
      return "draft";
  }
}
