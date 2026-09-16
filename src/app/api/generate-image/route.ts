import { NextRequest, NextResponse } from 'next/server';

/**
 * Image Generation API Route
 *
 * Provider: Pollinations.AI (https://pollinations.ai)
 * - Genuinely free, no API key required
 * - Returns real AI-generated images via a stable URL scheme
 * - Model: flux (default), supports width/height/seed params
 *
 * If NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY +
 * CLOUDINARY_API_SECRET are set, the generated image is uploaded to
 * Cloudinary so that Cloudinary transformations (bg removal, smart crop,
 * generative variations) work on a real Cloudinary public ID.
 * Without those credentials the Pollinations URL is returned directly and
 * Cloudinary transformation URLs fall back to CSS-only approximations.
 */

const ASPECT_RATIO_DIMS: Record<string, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '16:9': { width: 1280, height: 720 },
  '9:16': { width: 720, height: 1280 },
  '4:3': { width: 1024, height: 768 },
};

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

    const dims = ASPECT_RATIO_DIMS[aspectRatio] ?? ASPECT_RATIO_DIMS['1:1'];
    const seed = Math.floor(Math.random() * 999999);

    // Build a game-art-optimised prompt
    const styleHints: Record<string, string> = {
      '3D Game Art': 'high quality 3D game art, PBR rendering, Unreal Engine 5 style, dramatic lighting',
      'Pixel Art': 'pixel art, 16-bit retro game sprite, crisp pixels, vibrant palette',
      'Vector': 'clean vector illustration, flat design, sharp edges, mobile game UI',
      'Anime': 'anime style, cell shaded, clean line art, vibrant colors, game key art',
      'Photorealistic': 'photorealistic, 8k, cinematic lighting, detailed textures',
    };
    const typeHints: Record<string, string> = {
      'Character': 'full body character, centered, isolated on transparent background, game-ready',
      'Environment': 'wide panoramic environment, atmospheric, detailed background, level design',
      'Item/Prop': 'isolated item on clean background, detailed, game inventory prop',
      'UI/Icon': 'icon, clean silhouette, high contrast, game HUD element',
      'Texture': 'seamless tileable texture, material surface, PBR game texture',
    };

    const enhancedPrompt = [
      prompt.trim(),
      typeHints[assetType] ?? '',
      styleHints[style] ?? '',
      'game asset, professional quality',
    ]
      .filter(Boolean)
      .join(', ');

    // Pollinations.AI image URL — this is a real, working, free AI image service
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${dims.width}&height=${dims.height}&seed=${seed}&model=flux&nologo=true`;

    // Attempt Cloudinary upload if credentials are present
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      try {
        const publicId = `gameforge/${assetType.toLowerCase().replace(/[^a-z]/g, '')}_${Date.now()}_${seed}`;

        // Fetch the image from Pollinations first (it generates on-demand)
        const imgRes = await fetch(pollinationsUrl, { signal: AbortSignal.timeout(55000) });
        if (!imgRes.ok) throw new Error(`Pollinations fetch failed: ${imgRes.status}`);
        const imgBuffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(imgBuffer).toString('base64');
        const dataUri = `data:image/png;base64,${base64}`;

        // Upload to Cloudinary via unsigned upload or signed upload
        const timestamp = Math.floor(Date.now() / 1000);
        const crypto = await import('crypto');
        const sigStr = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(sigStr).digest('hex');

        const formData = new FormData();
        formData.append('file', dataUri);
        formData.append('public_id', publicId);
        formData.append('api_key', apiKey);
        formData.append('timestamp', String(timestamp));
        formData.append('signature', signature);

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
          };
          return NextResponse.json({
            imageUrl: uploadData.secure_url,
            cloudinaryPublicId: uploadData.public_id,
            width: uploadData.width,
            height: uploadData.height,
            provider: 'pollinations+cloudinary',
          });
        }
        // Fall through to direct URL if upload fails
      } catch (uploadErr) {
        console.warn('[generate-image] Cloudinary upload failed, returning Pollinations URL directly:', uploadErr);
      }
    }

    // No Cloudinary credentials or upload failed — return Pollinations URL directly.
    // The image is real and downloadable; Cloudinary transformation URLs will be
    // CSS-approximated in the UI (see cloudinary.ts).
    return NextResponse.json({
      imageUrl: pollinationsUrl,
      cloudinaryPublicId: null,
      width: dims.width,
      height: dims.height,
      provider: 'pollinations',
      note: 'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to enable Cloudinary transformations.',
    });
  } catch (err) {
    console.error('[generate-image] error:', err);
    return NextResponse.json(
      { error: 'Image generation failed. Check server logs.' },
      { status: 500 }
    );
  }
}
