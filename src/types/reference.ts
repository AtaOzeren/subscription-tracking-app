export interface Country {
  code: string;
  name: string;
  region: string;
  deleted_at: string | null;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  deleted_at: string | null;
}

export interface ProfileUpdateData {
  name?: string;
  region?: string;
  currency?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
}

export interface CountriesResponse {
  success: boolean;
  count: number;
  data: Country[];
}

export interface CurrenciesResponse {
  success: boolean;
  count: number;
  data: Currency[];
}