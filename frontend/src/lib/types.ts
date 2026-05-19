export type Profile = {
  id: number;
  user_id: number;
  founder_name: string;
  startup_name: string;
  tagline: string | null;
  website: string | null;
  country: string;
  country_name: string;
  cohort_year: number;
  industry: string;
  linkedin_url: string | null;
  twitter_url: string | null;
  logo_path: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
};

export type ProfileOwnerView = Profile & {
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
};

export type Stats = {
  total_alumni: number;
  countries: number;
  cohort_years: number;
  industries: number;
};

export type Reference = {
  industries: string[];
  cohort_years: number[];
  countries: { code: string; name: string }[];
};

export type ProfileListResponse = {
  items: Profile[];
  total: number;
  page: number;
  page_size: number;
};
