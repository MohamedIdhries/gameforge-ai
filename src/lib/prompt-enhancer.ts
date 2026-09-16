import { AssetType, AssetStyle } from '@/types/gameforge';

export function enhanceGamePrompt(basePrompt: string, assetType: AssetType, style: AssetStyle): string {
  if (!basePrompt.trim()) return basePrompt;

  const styleModifiers: Record<AssetStyle, string> = {
    '3D Game Art': 'rendered in Unreal Engine 5 Lumen, 8k resolution, volumetric subsurface scattering, PBR metallic rough textures, Octane Render style, dramatic rim lighting',
    'Pixel Art': 'authentic 16-bit retro game sprite, crisp pixel alignment, vibrant color palette, dithered shading, nostalgic arcade aesthetic',
    'Vector': 'clean vector art style, sharp geometric lines, smooth gradients, modern mobile UI graphic, vibrant flat shading',
    'Anime': 'cell-shaded anime game graphic, Guilty Gear Strive style, clean line-art, dramatic key art lighting, dynamic pose',
    'Photorealistic': 'photorealistic 8k octane render, realistic texture details, micro-surface imperfections, Cinematic raytraced lighting, filmic color grade'
  };

  const typeModifiers: Record<AssetType, string> = {
    'Character': 'isolated full character hero stance, centered composition, game-ready character model',
    'Environment': 'panoramic wide shot level design, atmospheric depth fog, detailed background environment',
    'Item/Prop': 'isolated high-detail inventory prop item, clean studio lighting, game loot icon',
    'UI/Icon': 'isolated game HUD icon symbol, high contrast, clean vector silhouette',
    'Texture': 'seamless tiling texture map, detailed material surface, PBR game texture'
  };

  const styleMod = styleModifiers[style] || styleModifiers['3D Game Art'];
  const typeMod = typeModifiers[assetType] || typeModifiers['Character'];

  return `${basePrompt.trim()}, ${typeMod}, ${styleMod}, game-ready asset for indie developers.`;
}
