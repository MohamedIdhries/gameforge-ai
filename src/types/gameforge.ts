export type AssetType = 'Character' | 'Environment' | 'Item/Prop' | 'UI/Icon' | 'Texture';

export type AssetStyle = '3D Game Art' | 'Pixel Art' | 'Vector' | 'Anime' | 'Photorealistic';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3';

export interface AssetTag {
  id: string;
  tag: string;
  confidence: number;
}

export interface SmartCropVariant {
  label: string;
  dimensions: string;
  url: string;
  useCase: string;
}

export interface GenerativeVariation {
  id: string;
  type: 'armor_variant' | 'color_variant' | 'pose_variant' | 'style_variant';
  label: string;
  description: string;
  url: string;
}

export interface GameAsset {
  id: string;
  projectId: string;
  projectName: string;
  cloudinaryPublicId: string;
  name: string;
  assetType: AssetType;
  style: AssetStyle;
  prompt: string;
  aspectRatio: AspectRatio;
  thumbnailUrl: string;
  originalUrl: string;
  bgRemovedUrl: string;
  /** f_auto,q_auto optimized Cloudinary URL (null if not uploaded to Cloudinary) */
  optimizedUrl?: string | null;
  tags: string[];
  /** Dominant colors from Cloudinary AI Vision (hex strings) */
  dominantColors?: string[];
  width: number;
  height: number;
  format: string;
  isPack?: boolean;
  packName?: string;
  /** ID of the parent asset this was derived from (for variations) */
  parentAssetId?: string;
  isFavorite?: boolean;
  /** Whether this asset was actually uploaded to Cloudinary */
  cloudinaryUploaded?: boolean;
  /** Generation provider used */
  provider?: 'pollinations+cloudinary' | 'pollinations' | 'user-upload';
  createdAt: string;
  smartCrops: SmartCropVariant[];
  variations: GenerativeVariation[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  gameEngine: 'Unity' | 'Unreal Engine' | 'Godot' | 'WebGPU/Three.js';
  assetCount: number;
  characterCount: number;
  environmentCount: number;
  createdAt: string;
}

export interface AssetPackRequest {
  packName: string;
  prompt: string;
  assetType: AssetType;
  style: AssetStyle;
  gameEngine: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey?: string;
  apiSecret?: string;
}
