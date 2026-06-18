export type AuthUser = {
  id: number;
  name: string;
  email: string;
  no_absen: string | null;
  phone: string | null;
  roles: string[];
  permissions: string[];
  organizational_units: {
    id: number;
    code: string;
    name: string;
    is_primary: boolean;
  }[];
};

export type LoginResponse = {
  data: {
    token: string;
    user: AuthUser;
  };
};
