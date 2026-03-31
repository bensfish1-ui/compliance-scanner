export interface HorizonScanResult {
  id: string;
  title: string;
  summary: string;
  country: string;
  countryCode: string;
  regulator: string;
  category: string;
  status: string;
  effectiveDate: string | null;
  impactLevel: string;
  sourceUrl: string | null;
  keyObligations: string[];
  isAmendment: boolean;
  amendedLegislation: string | null;
  alreadyTracked: boolean;
  existingId?: string;
}

export interface HorizonScanRequest {
  countries: string[];
  sectors: string[];
  includeProposed: boolean;
}

export interface HorizonScanResponse {
  success: boolean;
  data: {
    newRegulations: any[];
    existingMatches: any[];
    scannedCountries: string[];
    totalFound: number;
    scanDuration: number;
  };
}

export interface HorizonImportResponse {
  success: boolean;
  data: {
    imported: number;
    skipped: number;
    details: any[];
  };
}
