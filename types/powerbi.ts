export interface PowerBIConfig {
  clientId: string;
  workspaceId: string;
  reportId: string;
  clientSecret: string;
  tenantId: string;
}

export interface EmbedToken {
  token: string;
  tokenId: string;
  expiration: string;
}

export interface EmbedConfig {
  type: 'report';
  id: string;
  embedUrl: string;
  accessToken: string;
  tokenType: number;
  permissions: number;
  settings?: {
    panes?: {
      filters?: { visible: boolean };
      pageNavigation?: { visible: boolean };
    };
    bars?: {
      actionBar?: { visible: boolean };
    };
  };
}

export interface Report {
  id: string;
  name: string;
  webUrl: string;
  embedUrl: string;
  datasetId: string;
}

export interface Dataset {
  id: string;
  name: string;
  tables: DatasetTable[];
}

export interface DatasetTable {
  name: string;
  columns: DatasetColumn[];
}

export interface DatasetColumn {
  name: string;
  dataType: string;
}

