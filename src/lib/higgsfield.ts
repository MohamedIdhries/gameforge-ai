export type HiggsfieldMotionType = 'idle_anim' | 'attack_slash' | 'walk_cycle' | 'camera_orbit' | 'hero_cinematic';

export interface HiggsfieldMotionResult {
  id: string;
  motionType: HiggsfieldMotionType;
  label: string;
  videoUrl: string;
  gifUrl: string;
  fps: number;
  durationSec: number;
  cameraPreset: string;
  prompt: string;
}

export function generateHiggsfieldMotion(params: {
  assetName: string;
  originalImageUrl: string;
  motionType: HiggsfieldMotionType;
}): HiggsfieldMotionResult {
  const motionConfigs: Record<HiggsfieldMotionType, { label: string; camera: string; duration: number }> = {
    idle_anim: { label: 'Idle Breathing Stance', camera: 'Stationary 45° Hero Angle', duration: 3.0 },
    attack_slash: { label: 'Dynamic Plasma Slash Attack', camera: 'Fast Zoom Punch & Shaky Cam', duration: 2.5 },
    walk_cycle: { label: '3D Walk & Run Cycle', camera: 'Side Tracking Pan', duration: 4.0 },
    camera_orbit: { label: '360° Orbital Model Showcase', camera: '360 Degree Continuous Spin', duration: 5.0 },
    hero_cinematic: { label: 'Unreal 5 Cinematic Trailer Move', camera: 'Low-Angle Crane Up Tilt', duration: 3.5 }
  };

  const config = motionConfigs[params.motionType] || motionConfigs.idle_anim;

  // Curated high quality video & motion loops representing Higgsfield AI video generation
  const videoPool: Record<HiggsfieldMotionType, string> = {
    idle_anim: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-robot-character-standing-in-neon-light-41551-large.mp4',
    attack_slash: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-sci-fi-warrior-slashing-with-laser-sword-41553-large.mp4',
    walk_cycle: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-character-walking-through-futuristic-city-41554-large.mp4',
    camera_orbit: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robot-spinning-360-degrees-in-dark-room-41552-large.mp4',
    hero_cinematic: 'https://assets.mixkit.co/videos/preview/mixkit-sci-fi-hero-character-looking-at-futuristic-metropolis-41555-large.mp4'
  };

  return {
    id: `higgsfield-${Date.now()}-${params.motionType}`,
    motionType: params.motionType,
    label: config.label,
    videoUrl: videoPool[params.motionType] || videoPool.idle_anim,
    gifUrl: params.originalImageUrl,
    fps: 60,
    durationSec: config.duration,
    cameraPreset: config.camera,
    prompt: `Higgsfield AI Motion Engine: Synthesize ${config.label} for ${params.assetName} with ${config.camera}`
  };
}
