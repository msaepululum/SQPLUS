export type HrDashboard = {
  total_employees: number;
  present_today: number;
  pending_leave_requests: number;
  latest_payroll_period: {
    id: number;
    code: string;
    name: string;
    status: string;
    period_start: string;
    period_end: string;
  } | null;
};

export type Employee = {
  id: number;
  employee_code: string;
  legacy_department_code?: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  employment_status: string;
  join_date: string;
  base_salary: string;
  position?: { id: number; code: string; name: string };
  organizational_unit?: { id: number; code: string; name: string };
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
  id: number;
  employee_id: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
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
};
