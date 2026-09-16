-- ========================================================
-- GAMEFORGE AI - Database Schema (Supabase PostgreSQL)
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    plan_tier VARCHAR(50) DEFAULT 'pro', -- 'free', 'pro', 'studio'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    game_engine VARCHAR(50) DEFAULT 'Unity', -- 'Unity', 'Unreal Engine', 'Godot', 'WebGPU/Three.js'
    asset_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    cloudinary_public_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(50) NOT NULL, -- 'Character', 'Environment', 'Item/Prop', 'UI/Icon', 'Texture'
    style VARCHAR(50) NOT NULL, -- '3D Game Art', 'Pixel Art', 'Vector', 'Anime', 'Photorealistic'
    prompt TEXT NOT NULL,
    aspect_ratio VARCHAR(20) DEFAULT '1:1',
    thumbnail_url TEXT NOT NULL,
    original_url TEXT NOT NULL,
    bg_removed_url TEXT,
    width INTEGER DEFAULT 1024,
    height INTEGER DEFAULT 1024,
    format VARCHAR(20) DEFAULT 'png',
    is_pack BOOLEAN DEFAULT FALSE,
    pack_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ASSET TAGS TABLE (Cloudinary AI Vision)
CREATE TABLE IF NOT EXISTS public.asset_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    confidence NUMERIC(5,2) DEFAULT 0.95,
    source VARCHAR(50) DEFAULT 'cloudinary_ai'
);

-- 5. ASSET VARIATIONS TABLE (Cloudinary Generative Variations)
CREATE TABLE IF NOT EXISTS public.asset_variations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    variation_type VARCHAR(50) NOT NULL, -- 'armor_variant', 'color_variant', 'pose_variant', 'style_variant', 'smart_crop'
    label VARCHAR(255) NOT NULL,
    cloudinary_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. GENERATIONS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    style VARCHAR(50) NOT NULL,
    model VARCHAR(100) DEFAULT 'GameForge-SDXL-v2.5',
    status VARCHAR(50) DEFAULT 'completed', -- 'pending', 'processing', 'completed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR SPEED
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_project_id ON public.assets(project_id);
CREATE INDEX IF NOT EXISTS idx_asset_tags_asset_id ON public.asset_tags(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_tags_tag ON public.asset_tags(tag);
CREATE INDEX IF NOT EXISTS idx_asset_variations_asset_id ON public.asset_variations(asset_id);

-- RLS POLICIES (SUPABASE AUTH)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own data" ON public.users FOR ALL USING (true);
CREATE POLICY "Projects accessible by user" ON public.projects FOR ALL USING (true);
CREATE POLICY "Assets accessible by project" ON public.assets FOR ALL USING (true);
