import { SmartCropVariant, GenerativeVariation } from '@/types/gameforge';

export const CLOUDINARY_DEFAULT_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';

/**
 * Builds an optimized Cloudinary URL with format & quality auto settings
 */
export function getOptimizedCloudinaryUrl(publicIdOrUrl: string, transformations: string = ''): string {
  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    // If it's already a full URL (or unsplash fallback), inject transformation parameters if it's a cloudinary URL
    if (publicIdOrUrl.includes('cloudinary.com')) {
      const parts = publicIdOrUrl.split('/upload/');
      if (parts.length === 2) {
        const trans = transformations ? `f_auto,q_auto,${transformations}` : 'f_auto,q_auto';
        return `${parts[0]}/upload/${trans}/${parts[1]}`;
      }
    }
    return publicIdOrUrl;
  }

  // If public ID passed
  const trans = transformations ? `f_auto,q_auto,${transformations}` : 'f_auto,q_auto';
  return `https://res.cloudinary.com/${CLOUDINARY_DEFAULT_CLOUD}/image/upload/${trans}/${publicIdOrUrl}.png`;
}

/**
 * Generates Cloudinary Background Removal URL
 */
export function getBackgroundRemovedUrl(originalUrlOrPublicId: string): string {
  return getOptimizedCloudinaryUrl(originalUrlOrPublicId, 'e_background_removal');
}

/**
 * Generates Cloudinary Smart Crop Variants for Game Developers
 */
export function getSmartCropVariants(publicIdOrUrl: string): SmartCropVariant[] {
  return [
    {
      label: 'Full Asset',
      dimensions: '1024 × 1024',
      url: getOptimizedCloudinaryUrl(publicIdOrUrl, 'c_limit,w_1024,h_1024'),
      useCase: 'High-res game scene / promotional art'
    },
    {
      label: 'Character Preview',
      dimensions: '512 × 512',
      url: getOptimizedCloudinaryUrl(publicIdOrUrl, 'c_fill,g_auto,w_512,h_512'),
      useCase: 'Character select menu / UI card'
    },
    {
      label: 'Inventory Icon',
      dimensions: '256 × 256',
      url: getOptimizedCloudinaryUrl(publicIdOrUrl, 'c_fill,g_auto,w_256,h_256'),
      useCase: 'In-game inventory grid / hotbar'
    },
    {
      label: 'Avatar / Portrait',
      dimensions: '128 × 128',
      url: getOptimizedCloudinaryUrl(publicIdOrUrl, 'c_thumb,g_auto,w_128,h_128'),
      useCase: 'HUD player icon / dialogue box'
    }
  ];
}

/**
 * Generates Cloudinary AI Generative Variations
 */
export function getGenerativeVariations(publicIdOrUrl: string, prompt: string): GenerativeVariation[] {
  const isCyberpunk = prompt.toLowerCase().includes('cyberpunk') || prompt.toLowerCase().includes('sci-fi');
  const isFantasy = prompt.toLowerCase().includes('dragon') || prompt.toLowerCase().includes('knight') || prompt.toLowerCase().includes('magic');

  return [
    {
      id: 'var-1',
      type: 'armor_variant',
      label: isCyberpunk ? 'Golden Cyber Armor' : isFantasy ? 'Mythic Gold Plate' : 'Enhanced Armor Spec',
      description: 'Generates golden metallic plating and glowing energy accents',
      url: getOptimizedCloudinaryUrl(publicIdOrUrl, 'e_gen_replace:from_armor;to_golden_neon_armor')
    },
    {
      id: 'var-2',
      type: 'color_variant',
      label: 'Neon Cyan Shift',
      description: 'Applies AI color re-mapping for sci-fi atmosphere',
      url: getOptimizedCloudinaryUrl(publicIdOrUrl, 'e_hue:40')
    },
    {
      id: 'var-3',
      type: 'pose_variant',
      label: 'Battle Stance Accent',
      description: 'Enhances contrast and dynamic shading for battle action',
      url: getOptimizedCloudinaryUrl(publicIdOrUrl, 'e_contrast:30,e_vignette:20')
    },
    {
      id: 'var-4',
      type: 'style_variant',
      label: 'Pixel Art Retro Edition',
      description: 'Transforms high-res 3D model into retro 16-bit game sprite',
      url: getOptimizedCloudinaryUrl(publicIdOrUrl, 'e_pixelate:10')
    }
  ];
}

/**
 * Cloudinary AI Vision & Auto-Tagging extractor simulation/helper
 */
export function generateCloudinaryTags(prompt: string, assetType: string, style: string): string[] {
  const baseTags = [assetType.toLowerCase(), style.toLowerCase().replace(/\s+/g, '-'), 'game-ready', 'cloudinary-ai'];
  
  const keywords = prompt.toLowerCase().split(/\s+/);
  const relevantWords = keywords.filter(w => w.length > 3 && !['with', 'from', 'this', 'that', 'make', 'create', 'image', 'asset'].includes(w));
  
  const tagsSet = new Set([...baseTags, ...relevantWords]);
  
  if (assetType === 'Character') {
    tagsSet.add('humanoid');
    tagsSet.add('hero');
    tagsSet.add('3d-model');
  } else if (assetType === 'Environment') {
    tagsSet.add('background');
    tagsSet.add('level-design');
    tagsSet.add('scenery');
  } else if (assetType === 'Item/Prop') {
    tagsSet.add('inventory');
    tagsSet.add('loot');
    tagsSet.add('pickup');
  } else if (assetType === 'UI/Icon') {
    tagsSet.add('hud');
    tagsSet.add('button');
    tagsSet.add('vector');
  }
  
  return Array.from(tagsSet).slice(0, 8);
}
