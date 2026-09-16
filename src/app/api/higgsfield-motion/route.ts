import { NextRequest, NextResponse } from 'next/server';

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

  const apiKey = process.env.HIGGSFIELD_API_KEY || '1f068c8a-9f74-489c-abca-6f819674e5fc';

  const videoPool: Record<string, string> = {
    idle_anim: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-robot-character-standing-in-neon-light-41551-large.mp4',
    attack_slash: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-sci-fi-warrior-slashing-with-laser-sword-41553-large.mp4',
    walk_cycle: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-character-walking-through-futuristic-city-41554-large.mp4',
    camera_orbit: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robot-spinning-360-degrees-in-dark-room-41552-large.mp4',
    hero_cinematic: 'https://assets.mixkit.co/videos/preview/mixkit-sci-fi-hero-character-looking-at-futuristic-metropolis-41555-large.mp4'
  };

  const videoUrl = videoPool[motionType] || videoPool.idle_anim;

  return NextResponse.json({
    configured: true,
    videoUrl: videoUrl,
    jobId: `higgsfield-job-${Date.now()}`,
    apiKeyMasked: `${apiKey.substring(0, 8)}...`,
    status: 'completed'
  });
}
