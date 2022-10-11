export interface Configuration {
  companyName: string;
  logoUrl?: string;
  contact?: {
    phone?: string;
    email?: string;
  };
  address?: string;
}

export const defaultConfiguration: Configuration = {
  companyName: 'N/A',
  logoUrl: null,
  contact: {
    phone: null,
    email: null,
  },
  address: null
} as const;
