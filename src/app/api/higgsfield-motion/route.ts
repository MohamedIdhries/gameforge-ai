import { NextRequest, NextResponse } from 'next/server';

/**
 * Higgsfield AI Motion API Route
 *
 * Higgsfield (https://higgsfield.ai) is a real AI video generation company.
 * Their product "Higgsfield Animate" generates short video clips from a
 * reference image + motion prompt.
 *
 * API access: As of mid-2025 Higgsfield does NOT publish a public REST API
 * with documented endpoints. Access is through their web app at
 * https://higgsfield.ai. A private/beta API may exist for enterprise
 * partners — contact them at https://higgsfield.ai/contact.
 *
 * To enable real Higgsfield generation:
 *   1. Obtain an API key from Higgsfield (enterprise/beta access).
 *   2. Set HIGGSFIELD_API_KEY in your environment.
 *   3. Replace the stub below with the actual endpoint once documented.
 *
 * Without HIGGSFIELD_API_KEY this route returns a clear "not configured"
 * response so the UI can show an honest state instead of fake video URLs.
 */

export interface HiggsfieldMotionRequest {
  imageUrl: string;
  motionType: string;
  assetName: string;
}

export async function POST(req: NextRequest) {
  const body = await req.json() as HiggsfieldMotionRequest;
  const { imageUrl, motionType, assetName } = body;

  if (!imageUrl || !motionType) {
    return NextResponse.json({ error: 'imageUrl and motionType are required' }, { status: 400 });
  }

  const apiKey = process.env.HIGGSFIELD_API_KEY;

  if (!apiKey) {
    // Honest "not configured" response — the UI renders a setup notice
    return NextResponse.json(
      {
        configured: false,
        message:
          'Higgsfield API key not set. Add HIGGSFIELD_API_KEY to your environment variables. ' +
          'Higgsfield does not currently publish a public API — contact https://higgsfield.ai for beta access.',
      },
      { status: 200 }
    );
  }

  // --- Stub for when a real Higgsfield API becomes available ---
  // Replace this block with the actual documented endpoint.
  // The shape below is illustrative based on typical video-gen APIs.
  try {
    const motionPrompts: Record<string, string> = {
      idle_anim: 'subtle idle breathing animation, character standing still, gentle sway',
      attack_slash: 'dynamic attack slash motion, fast sword swing, impact effect',
      walk_cycle: 'smooth walk cycle, forward movement, natural gait',
      camera_orbit: '360 degree camera orbit around subject, slow rotation showcase',
      hero_cinematic: 'cinematic hero reveal, low angle crane shot, dramatic lighting',
    };

    const motionPrompt = motionPrompts[motionType] ?? motionPrompts.idle_anim;

    // NOTE: This endpoint URL is a placeholder. Replace with the real Higgsfield API URL.
    const response = await fetch('https://api.higgsfield.ai/v1/animate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        prompt: `${motionPrompt} for ${assetName}`,
        duration: 3,
        fps: 24,
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        {
          configured: true,
          error: `Higgsfield API returned ${response.status}: ${errText}`,
        },
        { status: 502 }
      );
    }

    const data = await response.json() as { video_url?: string; job_id?: string };
    return NextResponse.json({
      configured: true,
      videoUrl: data.video_url ?? null,
      jobId: data.job_id ?? null,
    });
  } catch (err) {
    console.error('[higgsfield-motion] error:', err);
    return NextResponse.json(
      { configured: true, error: 'Higgsfield request failed. Check server logs.' },
      { status: 502 }
    );
  }
}
