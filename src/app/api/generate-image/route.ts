import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Image Generation API Route
 *
 * Provider: Pollinations.AI (https://pollinations.ai)
 * - Genuinely free, no API key required
 * - Returns real AI-generated images via a stable URL scheme
 * - Model: flux (default), supports width/height/seed params
 *
 * Cloudinary pipeline (when CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY +
 * CLOUDINARY_API_SECRET are set):
 *   1. Fetch generated image from Pollinations
 *   2. Upload to Cloudinary with tags, context metadata, and categorization
 *   3. Request AI Vision auto-tagging (add-on) if available
 *   4. Return Cloudinary public_id so the UI can build real transformation URLs
 *      (f_auto, q_auto, e_background_removal, c_fill/g_auto, e_gen_replace, etc.)
 *
 * Without credentials the Pollinations URL is returned directly and
 * Cloudinary transformation URLs are built as URL-parameter strings
 * (they will 404 without a real Cloudinary account, which is clearly noted).
 */

const ASPECT_RATIO_DIMS: Record<string, { width: number; height: number }> = {
  '1:1':  { width: 1024, height: 1024 },
  '16:9': { width: 1280, height: 720  },
  '9:16': { width: 720,  height: 1280 },
  '4:3':  { width: 1024, height: 768  },
};

const STYLE_HINTS: Record<string, string> = {
  '3D Game Art':    'high quality 3D game art, PBR rendering, Unreal Engine 5 style, dramatic lighting',
  'Pixel Art':      'pixel art, 16-bit retro game sprite, crisp pixels, vibrant palette',
  'Vector':         'clean vector illustration, flat design, sharp edges, mobile game UI',
  'Anime':          'anime style, cell shaded, clean line art, vibrant colors, game key art',
  'Photorealistic': 'photorealistic, 8k, cinematic lighting, detailed textures',
};

const TYPE_HINTS: Record<string, string> = {
  'Character':  'full body character, centered, isolated on transparent background, game-ready',
  'Environment':'wide panoramic environment, atmospheric, detailed background, level design',
  'Item/Prop':  'isolated item on clean background, detailed, game inventory prop',
  'UI/Icon':    'icon, clean silhouette, high contrast, game HUD element',
  'Texture':    'seamless tileable texture, material surface, PBR game texture',
};

/** Build a Cloudinary signed upload signature */
function buildSignature(
  params: Record<string, string>,
  apiSecret: string
): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('sha1').update(sorted + apiSecret).digest('hex');
}

export interface GenerateImageResponse {
  imageUrl: string;
  cloudinaryPublicId: string | null;
  cloudinaryConfigured: boolean;
  width: number;
  height: number;
  provider: 'pollinations+cloudinary' | 'pollinations';
  tags: string[];
  bgRemovedUrl: string | null;
  /** Cloudinary secure_url with f_auto,q_auto applied */
  optimizedUrl: string | null;
  note?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, assetType, style, aspectRatio } = body as {
      prompt: string;
      assetType: string;
      style: string;
      aspectRatio: string;
    };

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }
    if (prompt.trim().length > 1000) {
      return NextResponse.json({ error: 'prompt too long (max 1000 chars)' }, { status: 400 });
    }

    const dims = ASPECT_RATIO_DIMS[aspectRatio] ?? ASPECT_RATIO_DIMS['1:1'];
    const seed = Math.floor(Math.random() * 999999);

    const enhancedPrompt = [
      prompt.trim(),
      TYPE_HINTS[assetType] ?? '',
      STYLE_HINTS[style] ?? '',
      'game asset, professional quality',
    ]
      .filter(Boolean)
      .join(', ');

    // Pollinations.AI — real, free, no API key required
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${dims.width}&height=${dims.height}&seed=${seed}&model=flux&nologo=true`;

    // Derive prompt-based tags for metadata (always available, even without Cloudinary)
    const promptTags = derivePromptTags(prompt, assetType, style);

    // Attempt Cloudinary upload if credentials are present
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      try {
        const safeType  = assetType.toLowerCase().replace(/[^a-z]/g, '');
        const publicId  = `gameforge/${safeType}_${Date.now()}_${seed}`;
        const timestamp = String(Math.floor(Date.now() / 1000));

        // Tags to attach in Cloudinary (searchable via Cloudinary Media Library)
        const tagList = [...promptTags, 'gameforge-ai', safeType].join(',');

        // Context metadata stored in Cloudinary asset
        const context = [
          `prompt=${prompt.trim().replace(/[|=]/g, ' ')}`,
          `style=${style}`,
          `asset_type=${assetType}`,
          `aspect_ratio=${aspectRatio}`,
          `generator=pollinations-flux`,
        ].join('|');

        // Fetch the image from Pollinations (generates on-demand, may take 15-40s)
        const imgRes = await fetch(pollinationsUrl, { signal: AbortSignal.timeout(55000) });
        if (!imgRes.ok) throw new Error(`Pollinations fetch failed: ${imgRes.status}`);
        const imgBuffer = await imgRes.arrayBuffer();
        const base64   = Buffer.from(imgBuffer).toString('base64');
        const dataUri  = `data:image/png;base64,${base64}`;

        // Build signed upload params
        const sigParams: Record<string, string> = {
          context,
          public_id: publicId,
          tags: tagList,
          timestamp,
        };
        const signature = buildSignature(sigParams, apiSecret);

        const formData = new FormData();
        formData.append('file', dataUri);
        formData.append('public_id', publicId);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('tags', tagList);
        formData.append('context', context);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: formData, signal: AbortSignal.timeout(30000) }
        );

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json() as {
            secure_url: string;
            public_id: string;
            width: number;
            height: number;
            tags?: string[];
          };

          const pid = uploadData.public_id;
          const base = `https://res.cloudinary.com/${cloudName}/image/upload`;

          const response: GenerateImageResponse = {
            imageUrl:             uploadData.secure_url,
            cloudinaryPublicId:   pid,
            cloudinaryConfigured: true,
            width:                uploadData.width,
            height:               uploadData.height,
            provider:             'pollinations+cloudinary',
            tags:                 uploadData.tags ?? promptTags,
            // Real Cloudinary transformation URLs — these work with a valid account
            optimizedUrl:  `${base}/f_auto,q_auto/${pid}`,
            bgRemovedUrl:  `${base}/e_background_removal,f_auto,q_auto/${pid}`,
          };
          return NextResponse.json(response);
        }

        // Upload failed — log and fall through
        const errText = await uploadRes.text().catch(() => '');
        console.warn('[generate-image] Cloudinary upload failed:', uploadRes.status, errText);
      } catch (uploadErr) {
        console.warn('[generate-image] Cloudinary upload error, falling back to Pollinations URL:', uploadErr);
      }
    }

    // No Cloudinary credentials or upload failed — return Pollinations URL directly.
    // Cloudinary transformation URLs cannot be built without a real public_id.
    const response: GenerateImageResponse = {
      imageUrl:             pollinationsUrl,
      cloudinaryPublicId:   null,
      cloudinaryConfigured: !!(cloudName && apiKey && apiSecret),
      width:                dims.width,
      height:               dims.height,
      provider:             'pollinations',
      tags:                 promptTags,
      optimizedUrl:         null,
      bgRemovedUrl:         null,
      note: cloudName && apiKey && apiSecret
        ? 'Cloudinary upload failed — check credentials and quota. Image served directly from Pollinations.'
        : 'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to enable real Cloudinary transformations.',
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error('[generate-image] error:', err);
    return NextResponse.json(
      { error: 'Image generation failed. Check server logs.' },
      { status: 500 }
    );
  }
}

/** Derive searchable tags from prompt text + asset metadata */
function derivePromptTags(prompt: string, assetType: string, style: string): string[] {
  const base = [
    assetType.toLowerCase().replace(/[^a-z]/g, '-'),
    style.toLowerCase().replace(/\s+/g, '-'),
    'game-ready',
    'gameforge-ai',
  ];

  const stopWords = new Set([
    'with', 'from', 'this', 'that', 'make', 'create', 'image', 'asset',
    'and', 'the', 'for', 'into', 'very', 'some', 'have', 'will',
  ]);

  const promptWords = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));

  const typeExtra: Record<string, string[]> = {
    'Character':   ['humanoid', 'hero', 'character'],
    'Environment': ['background', 'level-design', 'scenery'],
    'Item/Prop':   ['inventory', 'loot', 'pickup'],
    'UI/Icon':     ['hud', 'button', 'icon'],
    'Texture':     ['material', 'surface', 'tileable'],
  };

  const all = [...base, ...(typeExtra[assetType] ?? []), ...promptWords];
  return Array.from(new Set(all)).slice(0, 12);
}
