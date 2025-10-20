import { NextRequest, NextResponse } from 'next/server';
import { getPowerBIClient } from '@/lib/powerbi/client';
import { powerBIConfig } from '@/config/powerbi';

export async function POST(request: NextRequest) {
  try {
    const client = getPowerBIClient();
    
    const embedToken = await client.generateEmbedToken(
      powerBIConfig.workspaceId,
      powerBIConfig.reportId
    );

    console.log('Embed Token:', embedToken);

    const report = await client.getReport(
      powerBIConfig.workspaceId,
      powerBIConfig.reportId
    );

    console.log('Report:', report);

    return NextResponse.json({
      embedToken: embedToken.token,
      embedUrl: report.embedUrl,
      reportId: report.id,
      expiration: embedToken.expiration,
    });
  } catch (error) {
    console.error('Error generating Power BI embed token:', error);
    return NextResponse.json(
      { error: 'Failed to generate embed token' },
      { status: 500 }
    );
  }
}

