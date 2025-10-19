import { NextRequest, NextResponse } from 'next/server';
import { getPowerBIClient } from '@/lib/powerbi/client';
import { powerBIConfig } from '@/config/powerbi';

export async function GET(request: NextRequest) {
  try {
    const client = getPowerBIClient();
    
    const reports = await client.getReports(powerBIConfig.workspaceId);

    return NextResponse.json({
      reports,
      workspaceId: powerBIConfig.workspaceId,
    });
  } catch (error) {
    console.error('Error fetching Power BI reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

