import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Generate Variation Route
 *
 * Creates a genuine Cloudinary-derived variation of an existing asset.
 * Each variation is a real Cloudinary transformation URL built from the
 * parent asset's public_id. When Cloudinary credentials are present,
 * the variation is also uploaded as a new asset (eager transformation)
 * so it has its own public_id and can be independently managed.
 *
 * Supported variation types:
 *   - bg_removed    : e_background_removal (Cloudinary AI)
 *   - smart_crop_512: c_fill,g_auto,w_512,h_512
 *   - smart_crop_256: c_fill,g_auto,w_256,h_256
 *   - smart_crop_128: c_thumb,g_auto,w_128,h_128
 *   - hue_shift     : e_hue:40 (color variant)
 *   - contrast_boost: e_contrast:30,e_vignette:20
 *   - pixelate      : e_pixelate:10 (retro pixel art)
 *   - grayscale     : e_grayscale
 *
 * POST body: { parentPublicId: string, variationType: string, parentAssetId: string }
 * Returns: { variationUrl: string, variationPublicId: string | null, parentAssetId: string }
 */

const VARIATION_TRANSFORMS: Record<string, string> = {
  bg_removed:     'e_background_removal,f_auto,q_auto',
  smart_crop_512: 'c_fill,g_auto,w_512,h_512,f_auto,q_auto',
  smart_crop_256: 'c_fill,g_auto,w_256,h_256,f_auto,q_auto',
  smart_crop_128: 'c_thumb,g_auto,w_128,h_128,f_auto,q_auto',
  hue_shift:      'e_hue:40,f_auto,q_auto',
  contrast_boost: 'e_contrast:30,e_vignette:20,f_auto,q_auto',
  pixelate:       'e_pixelate:10,f_auto,q_auto',
  grayscale:      'e_grayscale,f_auto,q_auto',
};

function buildSignature(params: Record<string, string>, apiSecret: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('sha1').update(sorted + apiSecret).digest('hex');
}

export interface GenerateVariationResponse {
  variationUrl: string;
  variationPublicId: string | null;
  parentAssetId: string;
  variationType: string;
  cloudinaryConfigured: boolean;
  transform: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      parentPublicId: string;
      variationType: string;
      parentAssetId: string;
    };

    const { parentPublicId, variationType, parentAssetId } = body;

    if (!parentPublicId || !variationType) {
      return NextResponse.json(
        { error: 'parentPublicId and variationType are required' },
        { status: 400 }
      );
    }

    const transform = VARIATION_TRANSFORMS[variationType];
    if (!transform) {
      return NextResponse.json(
        { error: `Unknown variationType. Supported: ${Object.keys(VARIATION_TRANSFORMS).join(', ')}` },
        { status: 400 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Build the transformation URL — this is a real Cloudinary URL that works
    // when the parentPublicId exists in the configured Cloudinary account.
    const variationUrl = cloudName
      ? `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${parentPublicId}`
      : null;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({
        variationUrl: variationUrl ?? '',
        variationPublicId: null,
        parentAssetId,
        variationType,
        cloudinaryConfigured: false,
        transform,
        note: 'Cloudinary not configured — variation URL is illustrative only.',
      } satisfies GenerateVariationResponse & { note: string });
    }

    // Optionally: create an explicit derived image via Cloudinary explicit API
    // so the variation has its own public_id and can be independently tagged/managed.
    // This is a real Cloudinary operation (uses transformation credits).
    try {
      const timestamp = String(Math.floor(Date.now() / 1000));
      const eagerTransform = transform.replace(/,f_auto,q_auto$/, ''); // strip delivery params for eager
      const sigParams: Record<string, string> = {
        eager: eagerTransform,
        public_id: parentPublicId,
        timestamp,
        type: 'upload',
      };
      const signature = buildSignature(sigParams, apiSecret);

      const formData = new FormData();
      formData.append('public_id', parentPublicId);
      formData.append('type', 'upload');
      formData.append('eager', eagerTransform);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);

      const explicitRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/explicit`,
        { method: 'POST', body: formData, signal: AbortSignal.timeout(20000) }
      );

      if (explicitRes.ok) {
        const explicitData = await explicitRes.json() as {
          eager?: Array<{ secure_url: string; public_id?: string }>;
        };
        const eagerResult = explicitData.eager?.[0];
        if (eagerResult) {
          return NextResponse.json({
            variationUrl:      eagerResult.secure_url,
            variationPublicId: eagerResult.public_id ?? null,
            parentAssetId,
            variationType,
            cloudinaryConfigured: true,
            transform,
          } satisfies GenerateVariationResponse);
        }
      }
    } catch (explicitErr) {
      console.warn('[generate-variation] explicit API failed, returning URL-based variation:', explicitErr);
    }

    // Fall back to URL-based variation (still a real Cloudinary URL)
    return NextResponse.json({
      variationUrl:      variationUrl!,
      variationPublicId: null,
      parentAssetId,
      variationType,
      cloudinaryConfigured: true,
      transform,
    } satisfies GenerateVariationResponse);
  } catch (err) {
    console.error('[generate-variation] error:', err);
    return NextResponse.json(
      { error: 'Variation generation failed. Check server logs.' },
      { status: 500 }
    );
  }
}
