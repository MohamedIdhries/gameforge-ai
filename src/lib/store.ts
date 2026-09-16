import { GameAsset, Project, AssetType, AssetStyle, AspectRatio } from '@/types/gameforge';
import { INITIAL_PROJECTS, INITIAL_ASSETS } from './mock-data';
import { generateCloudinaryTags, getSmartCropVariants, getGenerativeVariations, getBackgroundRemovedUrl, getOptimizedCloudinaryUrl } from './cloudinary';

const LOCAL_STORAGE_KEY_ASSETS = 'gameforge_assets_v1';
const LOCAL_STORAGE_KEY_PROJECTS = 'gameforge_projects_v1';

export function getStoredProjects(): Project[] {
  if (typeof window === 'undefined') return INITIAL_PROJECTS;
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_PROJECTS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load projects from localStorage', e);
  }
  return INITIAL_PROJECTS;
}

export function saveProjects(projects: Project[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects to localStorage', e);
  }
}

export function getStoredAssets(): GameAsset[] {
  if (typeof window === 'undefined') return INITIAL_ASSETS;
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_ASSETS);
    if (data) {
      const parsed: GameAsset[] = JSON.parse(data);
      const existingIds = new Set(parsed.map(a => a.id));
      const missingInitial = INITIAL_ASSETS.filter(a => !existingIds.has(a.id));
      return [...parsed, ...missingInitial];
    }
  } catch (e) {
    console.error('Failed to load assets from localStorage', e);
  }
  return INITIAL_ASSETS;
}

export function saveAssets(assets: GameAsset[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_ASSETS, JSON.stringify(assets));
  } catch (e) {
    console.error('Failed to save assets to localStorage', e);
  }
}

// Helper pool of high quality AI game art images for prompt-based generation simulation
const GENERATED_IMAGE_POOL: Record<string, string[]> = {
  Character: [
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1024&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1563089145-599997674d42?w=1024&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1024&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1024&q=80&auto=format&fit=crop'
  ],
  Environment: [
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1024&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1024&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1024&q=80&auto=format&fit=crop'
  ],
  'Item/Prop': [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1024&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1563089145-599997674d42?w=1024&q=80&auto=format&fit=crop'
  ],
  'UI/Icon': [
    'https://images.unsplash.com/photo-1514517220017-8ce97a34a7b6?w=1024&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1024&q=80&auto=format&fit=crop'
  ],
  Texture: [
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1024&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1024&q=80&auto=format&fit=crop'
  ]
};

export function resolvePromptImageUrl(prompt: string, assetType: AssetType, style: AssetStyle): string {
  const seed = Math.floor(Math.random() * 100000);
  const cleanPrompt = prompt.trim() || `${style} ${assetType}`;

  // Live AI Image Generator API - Synthesizes an EXACT custom AI image for ANY prompt
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt + ', ' + style + ', ' + assetType + ', game-ready asset, centered isolated composition')}?width=1024&height=1024&seed=${seed}&nologo=true`;
}

export function createNewAsset(params: {
  projectId: string;
  name: string;
  prompt: string;
  assetType: AssetType;
  style: AssetStyle;
  aspectRatio: AspectRatio;
}): GameAsset {
  const projects = getStoredProjects();
  const proj = projects.find(p => p.id === params.projectId) || projects[0];

  const imageUrl = resolvePromptImageUrl(params.prompt, params.assetType, params.style);

  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const publicId = `gameforge/${params.assetType.toLowerCase().replace(/[^a-z]/g, '')}_${uniqueSuffix}`;
  const tags = generateCloudinaryTags(params.prompt, params.assetType, params.style);
  
  const bgRemovedUrl = getBackgroundRemovedUrl(imageUrl);
  const smartCrops = getSmartCropVariants(imageUrl);
  const variations = getGenerativeVariations(imageUrl, params.prompt);

  const newAsset: GameAsset = {
    id: `asset-${uniqueSuffix}`,
    projectId: proj.id,
    projectName: proj.name,
    cloudinaryPublicId: publicId,
    name: params.name || `${params.style} ${params.assetType}`,
    assetType: params.assetType,
    style: params.style,
    prompt: params.prompt,
    aspectRatio: params.aspectRatio,
    thumbnailUrl: imageUrl,
    originalUrl: imageUrl,
    bgRemovedUrl: bgRemovedUrl,
    tags: tags,
    width: params.aspectRatio === '16:9' ? 1920 : 1024,
    height: params.aspectRatio === '16:9' ? 1080 : 1024,
    format: 'png',
    createdAt: new Date().toISOString(),
    smartCrops: smartCrops,
    variations: variations
  };

  const assets = getStoredAssets();
  const updatedAssets = [newAsset, ...assets];
  saveAssets(updatedAssets);

  // Update project count
  const updatedProjects = projects.map(p => {
    if (p.id === proj.id) {
      return {
        ...p,
        assetCount: p.assetCount + 1,
        characterCount: params.assetType === 'Character' ? p.characterCount + 1 : p.characterCount,
        environmentCount: params.assetType === 'Environment' ? p.environmentCount + 1 : p.environmentCount
      };
    }
    return p;
  });
  saveProjects(updatedProjects);

  return newAsset;
}

/**
 * Creates a complete "Asset Pack" in one click! (Hackathon Winning Feature)
 */
export function createAssetPack(params: {
  projectId: string;
  packName: string;
  prompt: string;
  assetType: AssetType;
  style: AssetStyle;
}): GameAsset[] {
  const packName = params.packName || 'Cyberpunk Warrior Pack';

  const basePrompt = params.prompt;
  const assetType = params.assetType;
  const style = params.style;

  const packItems = [
    {
      name: `${packName} - Full Body Character`,
      prompt: `${basePrompt}, full body standing stance, game character model`,
      type: assetType,
      aspectRatio: '1:1' as AspectRatio
    },
    {
      name: `${packName} - UI Portrait (512x512)`,
      prompt: `${basePrompt}, headshot hero portrait, character icon`,
      type: assetType,
      aspectRatio: '1:1' as AspectRatio
    },
    {
      name: `${packName} - Inventory Icon (256x256)`,
      prompt: `${basePrompt}, character inventory gear icon`,
      type: assetType,
      aspectRatio: '1:1' as AspectRatio
    }
  ];

  const generatedPackAssets: GameAsset[] = [];

  for (const item of packItems) {
    const asset = createNewAsset({
      projectId: params.projectId,
      name: item.name,
      prompt: item.prompt,
      assetType: item.type,
      style: style,
      aspectRatio: item.aspectRatio
    });
    asset.isPack = true;
    asset.packName = packName;
    generatedPackAssets.push(asset);
  }

  return generatedPackAssets;
}
