import { PowerBIConfig } from '@/types/powerbi';

export const powerBIConfig: PowerBIConfig = {
  clientId: process.env.POWERBI_CLIENT_ID || '',
  workspaceId: process.env.POWERBI_WORKSPACE_ID || '',
  reportId: process.env.POWERBI_REPORT_ID || '',
  clientSecret: process.env.POWERBI_CLIENT_SECRET || '',
  tenantId: process.env.POWERBI_TENANT_ID || '',
};

export const POWERBI_API_BASE = 'https://api.powerbi.com/v1.0/myorg';
export const AZURE_AD_AUTHORITY = 'https://login.microsoftonline.com';
export const POWERBI_SCOPE = 'https://analysis.windows.net/powerbi/api/.default';

