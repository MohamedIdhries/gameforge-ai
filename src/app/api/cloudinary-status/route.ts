import { NextResponse } from 'next/server';

/**
 * Cloudinary Configuration Status Route
 *
 * Returns whether Cloudinary credentials are configured in the environment.
 * Does NOT expose credential values — only presence/absence.
 *
 * GET /api/cloudinary-status
 * Returns: { configured: boolean, cloudName: string | null }
 */
export async function GET() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const hasApiKey    = !!process.env.CLOUDINARY_API_KEY;
  const hasApiSecret = !!process.env.CLOUDINARY_API_SECRET;

  const configured = !!(cloudName && hasApiKey && hasApiSecret);

  return NextResponse.json({
    configured,
    // Expose cloud name (not secret) so UI can build preview URLs
    cloudName: cloudName ?? null,
    hasApiKey,
    hasApiSecret,
    // What features are available
    features: {
      upload:           configured,
      backgroundRemoval: configured,
      smartCrop:        configured,
      aiVisionTags:     configured, // requires AI Vision add-on enabled on account
      generativeReplace: configured, // requires Generative AI add-on
      fAutoQAuto:       configured,
    },
    setupInstructions: configured ? null : {
      required: [
        'CLOUDINARY_CLOUD_NAME — your Cloudinary cloud name (e.g. my-cloud)',
        'CLOUDINARY_API_KEY — from Cloudinary Dashboard > Settings > API Keys',
        'CLOUDINARY_API_SECRET — from Cloudinary Dashboard > Settings > API Keys',
      ],
      optional: [
        'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME — same as CLOUDINARY_CLOUD_NAME, for client-side URL building',
        'HIGGSFIELD_API_KEY — for Higgsfield AI video generation (requires enterprise/beta access)',
      ],
      note: 'Add these to .env.local for local development. Never commit secret values to git.',
    },
  });
}
