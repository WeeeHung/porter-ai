import { getPowerBIAuthService } from './auth';
import { POWERBI_API_BASE } from '@/config/powerbi';
import { EmbedToken, Report, Dataset } from '@/types/powerbi';

export class PowerBIClient {
  private async getHeaders(): Promise<HeadersInit> {
    const authService = getPowerBIAuthService();
    const accessToken = await authService.getAccessToken();
    
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async generateEmbedToken(
    workspaceId: string,
    reportId: string
  ): Promise<EmbedToken> {
    const headers = await this.getHeaders();
    const url = `${POWERBI_API_BASE}/groups/${workspaceId}/reports/${reportId}/GenerateToken`;

    const body = {
      accessLevel: 'View',
      allowSaveAs: false,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate embed token: ${response.statusText}`);
    }

    return await response.json();
  }

  async getReport(workspaceId: string, reportId: string): Promise<Report> {
    const headers = await this.getHeaders();
    const url = `${POWERBI_API_BASE}/groups/${workspaceId}/reports/${reportId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to get report: ${response.statusText}`);
    }

    return await response.json();
  }

  async getReports(workspaceId: string): Promise<Report[]> {
    const headers = await this.getHeaders();
    const url = `${POWERBI_API_BASE}/groups/${workspaceId}/reports`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to get reports: ${response.statusText}`);
    }

    const data = await response.json();
    return data.value || [];
  }

  async getDataset(datasetId: string): Promise<Dataset> {
    const headers = await this.getHeaders();
    const url = `${POWERBI_API_BASE}/datasets/${datasetId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to get dataset: ${response.statusText}`);
    }

    return await response.json();
  }

  async refreshDataset(datasetId: string): Promise<void> {
    const headers = await this.getHeaders();
    const url = `${POWERBI_API_BASE}/datasets/${datasetId}/refreshes`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ notifyOption: 'NoNotification' }),
    });

    if (!response.ok && response.status !== 202) {
      throw new Error(`Failed to refresh dataset: ${response.statusText}`);
    }
  }
}

// Singleton instance
let powerBIClientInstance: PowerBIClient | null = null;

export function getPowerBIClient(): PowerBIClient {
  if (!powerBIClientInstance) {
    powerBIClientInstance = new PowerBIClient();
  }
  return powerBIClientInstance;
}

