import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Cloudinary AI Vision Analysis Route
 *
 * Uses Cloudinary's Admin API to fetch real AI-generated tags for an asset.
 * Cloudinary AI Vision auto-tagging is an add-on that must be enabled on
 * your Cloudinary account (free tier includes limited usage).
 *
 * Endpoint: GET /api/cloudinary-analyze?publicId=<cloudinary_public_id>
 *
 * Returns:
 *   - tags: string[]  — AI Vision tags from Cloudinary (or prompt-derived fallback)
 *   - colors: string[] — dominant colors detected by Cloudinary
 *   - width, height, format — asset metadata from Cloudinary
 *   - cloudinaryConfigured: boolean — whether credentials are present
 */

function buildAdminSignature(params: Record<string, string>, apiSecret: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('sha1').update(sorted + apiSecret).digest('hex');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const publicId = searchParams.get('publicId');

  if (!publicId) {
    return NextResponse.json({ error: 'publicId query param is required' }, { status: 400 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({
      cloudinaryConfigured: false,
      tags: [],
      colors: [],
      message: 'Cloudinary credentials not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.',
    });
  }

  try {
    // Cloudinary Admin API — fetch asset details including tags and colors
    // Docs: https://cloudinary.com/documentation/admin_api#get_resources
    const encodedId = encodeURIComponent(publicId);
    const adminUrl  = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload/${encodedId}?colors=true&tags=true`;

    const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const res = await fetch(adminUrl, {
      headers: { Authorization: `Basic ${credentials}` },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn('[cloudinary-analyze] Admin API error:', res.status, errText);
      return NextResponse.json({
        cloudinaryConfigured: true,
        tags: [],
        colors: [],
        error: `Cloudinary Admin API returned ${res.status}`,
      });
    }

    const data = await res.json() as {
      tags?: string[];
      colors?: [string, number][];
      width?: number;
      height?: number;
      format?: string;
      secure_url?: string;
      context?: { custom?: Record<string, string> };
    };

    return NextResponse.json({
      cloudinaryConfigured: true,
      tags:    data.tags    ?? [],
      colors:  (data.colors ?? []).map(([color]) => color),
      width:   data.width,
      height:  data.height,
      format:  data.format,
      secureUrl: data.secure_url,
      context: data.context?.custom ?? {},
    });
  } catch (err) {
    console.error('[cloudinary-analyze] error:', err);
    return NextResponse.json(
      { cloudinaryConfigured: true, error: 'Analysis request failed', tags: [], colors: [] },
      { status: 500 }
    );
  }
}
