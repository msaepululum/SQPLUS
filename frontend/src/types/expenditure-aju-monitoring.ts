export type ExpenditureAjuProgressHolder = {
  departemen_id: number | null;
  jabatan: string;
  count: number;
};

export type ExpenditureAjuProgressStep = {
  step_order: number;
  step_no: string;
  title: string;
  subtitle: string;
  total_aju: number;
  holders: ExpenditureAjuProgressHolder[];
};

export type ExpenditureAjuProgressDashboard = {
  tahun: string;
  kpi: {
    proses: number;
    reject: number;
    close: number;
  };
  steps: ExpenditureAjuProgressStep[];
};
