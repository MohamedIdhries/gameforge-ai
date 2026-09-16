/**
 * Higgsfield AI — client-side types and motion preset metadata.
 *
 * Higgsfield (https://higgsfield.ai) is a real AI video generation service.
 * As of mid-2025 they do NOT publish a public REST API; access is through
 * their web app. A private/beta API may be available for enterprise partners.
 *
 * Actual generation is handled server-side in /api/higgsfield-motion/route.ts.
 * Set HIGGSFIELD_API_KEY in your environment to enable it.
 * Without the key the UI shows an honest "not configured" notice.
 */

export type HiggsfieldMotionType =
  | 'idle_anim'
  | 'attack_slash'
  | 'walk_cycle'
  | 'camera_orbit'
  | 'hero_cinematic';

export interface HiggsfieldMotionPreset {
  id: HiggsfieldMotionType;
  label: string;
  description: string;
  cameraPreset: string;
  durationSec: number;
  motionPrompt: string;
}

export interface HiggsfieldMotionResult {
  /** null when API is not configured or generation is pending */
  videoUrl: string | null;
  configured: boolean;
  error?: string;
  message?: string;
}

export const HIGGSFIELD_MOTION_PRESETS: HiggsfieldMotionPreset[] = [
  {
    id: 'idle_anim',
    label: 'Idle Stance',
    description: 'Subtle breathing & idle loop',
    cameraPreset: 'Stationary 45° hero angle',
    durationSec: 3.0,
    motionPrompt: 'subtle idle breathing animation, character standing still, gentle sway',
  },
  {
    id: 'attack_slash',
    label: 'Attack Slash',
    description: 'Dynamic attack combo',
    cameraPreset: 'Fast zoom punch & shaky cam',
    durationSec: 2.5,
    motionPrompt: 'dynamic attack slash motion, fast sword swing, impact effect',
  },
  {
    id: 'walk_cycle',
    label: '3D Walk Cycle',
    description: 'Seamless forward movement loop',
    cameraPreset: 'Side tracking pan',
    durationSec: 4.0,
    motionPrompt: 'smooth walk cycle, forward movement, natural gait',
  },
  {
    id: 'camera_orbit',
    label: '360° Camera Orbit',
    description: 'Orbital showcase render',
    cameraPreset: '360° continuous spin',
    durationSec: 5.0,
    motionPrompt: '360 degree camera orbit around subject, slow rotation showcase',
  },
  {
    id: 'hero_cinematic',
    label: 'Cinematic Move',
    description: 'Trailer-style hero reveal',
    cameraPreset: 'Low-angle crane up tilt',
    durationSec: 3.5,
    motionPrompt: 'cinematic hero reveal, low angle crane shot, dramatic lighting',
  },
];
