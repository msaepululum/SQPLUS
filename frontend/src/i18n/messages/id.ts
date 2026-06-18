export const messages = {
  common: {
    appSubtitle: "Sistem Integrasi Rumah Sakit",
    copyright: "© 2026 SQ+ Hospital System",
    copyrightFull: "© 2026 SQ+ Hospital System. All rights reserved.",
  },
  language: {
    label: "Bahasa",
    id: "Bahasa Indonesia",
    en: "English",
    select: "Pilih bahasa",
  },
  login: {
    welcome: "Selamat Datang Kembali",
    title: "Masuk Ke Akun",
    subtitle:
      "Masukkan nomor kepegawaian dan kata sandi untuk mengakses dashboard manajemen rumah sakit.",
    employeeNumberLabel: "Nomor Kepegawaian",
    employeeNumberPlaceholder: "Masukkan nomor kepegawaian",
    passwordLabel: "Kata Sandi",
    passwordPlaceholder: "Masukkan kata sandi",
    showPassword: "Tampilkan kata sandi",
    hidePassword: "Sembunyikan kata sandi",
    rememberMe: "Ingat saya",
    forgotPassword: "Lupa kata sandi?",
    submit: "Masuk ke Dashboard",
    submitting: "Memproses...",
    errorInvalid: "Nomor kepegawaian atau kata sandi salah.",
    securityNotice:
      "Akses ini tercatat dalam audit log sistem. Pastikan Anda logout setelah selesai menggunakan aplikasi di perangkat bersama.",
  },
  branding: {
    heroTitle: "Satu Sistem,",
    heroHighlight: "Integrasi",
    heroTitleEnd: "Tanpa Batas",
    heroDescription:
      "Platform terintegrasi untuk manajemen rumah sakit modern — keuangan, SDM, pengadaan, dan supply chain dalam satu ekosistem digital.",
    featureRealtimeTitle: "Informasi Real-time",
    featureRealtimeDesc: "Pantau kinerja rumah sakit secara langsung",
    featureSecurityTitle: "Keamanan Terjamin",
    featureSecurityDesc: "Data terenkripsi & audit trail lengkap",
    featureCollaborationTitle: "Kolaborasi Efektif",
    featureCollaborationDesc: "Integrasi lintas unit & departemen",
    featureDecisionTitle: "Keputusan Lebih Cepat",
    featureDecisionDesc: "Dashboard eksekutif untuk pimpinan",
    isoBadge: "SQ+ Terverifikasi ISO 27001",
    hospitalAlt: "Gatot Soebroto Indonesia Army Central Hospital",
  },
  menu: {
    home: "Beranda",
    homeDescription: "Ringkasan kinerja rumah sakit",
    finance: "Keuangan & RenGar",
    financeDescription: "Akuntansi, anggaran, kas, dan pelaporan keuangan",
    hr: "Personalia",
    hrDescription: "SDM, kehadiran, penggajian, dan manajemen karyawan",
    procurement: "Pengadaan Barang/Jasa",
    procurementDescription: "Perencanaan, tender, PO, dan penerimaan barang/jasa",
    supplyChain: "Asset / Supply Chain",
    supplyChainDescription: "Inventori, aset tetap, distribusi, dan logistik",
    mainModules: "Modul Utama",
  },
  finance: {
    moduleTitle: "Keuangan & Anggaran",
    moduleSubtitle: "RenGar — rencana, realisasi, dan pelaporan keuangan",
    nav: {
      dashboard: "Dashboard",
      budget: "Anggaran",
      revenue: "Pendapatan",
      expenditure: "Belanja",
      cashBank: "Kas & Bank",
      receivablesPayables: "Hutang & Piutang",
      payments: "Pembayaran",
      accounting: "Akuntansi",
      reports: "Laporan",
      executiveInsight: "Insight Pimpinan",
      approvals: "Approval",
      settings: "Pengaturan",
    },
  },
  hr: {
    nav: {
      summary: "Ringkasan",
      employees: "Karyawan",
      attendance: "Absensi",
      leave: "Cuti",
      payroll: "Penggajian",
    },
  },
  sidebar: {
    closeMenu: "Tutup menu",
    logout: "Keluar",
    collapseMenu: "Ciutkan menu",
  },
  topbar: {
    openMenu: "Buka menu",
    collapseSidebar: "Ciutkan sidebar",
    searchPlaceholder: "Cari menu, dokumen, atau data…",
    search: "Cari",
    messages: "Pesan",
    myApprovals: "Approval Saya",
    notifications: "Notifikasi",
    directorRole: "Direktur Utama",
  },
  theme: {
    label: "Tema",
    select: "Pilih tema",
    light: "Terang",
    lightDescription: "Tampilan terang",
    dark: "Gelap",
    darkDescription: "Tampilan gelap",
    system: "Sistem",
    systemDescription: "Ikuti pengaturan perangkat",
  },
  beranda: {
    title: "Beranda",
    description:
      "Ringkasan kinerja rumah sakit — keuangan, personalia, aset, dan sorotan pimpinan.",
  },
  appShell: {
    closeOverlay: "Tutup menu",
  },
  ai: {
    openAssistant: "Buka AI Assistant",
    closePanel: "Tutup panel AI",
    close: "Tutup",
    title: "SQ+ AI Assistant",
    subtitle: "Read-only · Ringkasan & analisa",
    greeting:
      "Halo! Saya dapat membantu ringkasan keuangan, SDM, pengadaan, stok, approval, dan laporan eksekutif.",
    placeholder: "Tanyakan ringkasan atau analisa...",
    send: "Kirim",
    newConversation: "Mulai percakapan baru",
    positiveFeedback: "Feedback positif",
    negativeFeedback: "Feedback negatif",
  },
} as const;

type DeepStringRecord<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringRecord<T[K]>;
};

export type Messages = DeepStringRecord<typeof messages>;
