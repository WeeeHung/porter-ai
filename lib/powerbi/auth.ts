import * as msal from '@azure/msal-node';
import { powerBIConfig, AZURE_AD_AUTHORITY, POWERBI_SCOPE } from '@/config/powerbi';

class PowerBIAuthService {
  private msalClient: msal.ConfidentialClientApplication;

  constructor() {
    const msalConfig: msal.Configuration = {
      auth: {
        clientId: powerBIConfig.clientId,
        authority: `${AZURE_AD_AUTHORITY}/${powerBIConfig.tenantId}`,
        clientSecret: powerBIConfig.clientSecret,
      },
    };

    this.msalClient = new msal.ConfidentialClientApplication(msalConfig);
  }

  async getAccessToken(): Promise<string> {
    try {
      const tokenRequest: msal.ClientCredentialRequest = {
        scopes: [POWERBI_SCOPE],
      };

      const response = await this.msalClient.acquireTokenByClientCredential(tokenRequest);
      
      if (!response || !response.accessToken) {
        throw new Error('Failed to acquire access token');
      }

      return response.accessToken;
    } catch (error) {
      console.error('Error acquiring Power BI access token:', error);
      throw error;
    }
  }
}

// Singleton instance
let authServiceInstance: PowerBIAuthService | null = null;

export function getPowerBIAuthService(): PowerBIAuthService {
  if (!authServiceInstance) {
    authServiceInstance = new PowerBIAuthService();
  }
  return authServiceInstance;
}

