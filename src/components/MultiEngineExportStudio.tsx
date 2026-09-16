'use client';

import React, { useState } from 'react';
import { GameAsset } from '@/types/gameforge';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary';
import { Code, Copy, Check, Download, Layers, ShieldCheck, Box, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MultiEngineExportStudioProps {
  asset: GameAsset;
}

export default function MultiEngineExportStudio({ asset }: MultiEngineExportStudioProps) {
  const [engineTab, setEngineTab] = useState<'unity' | 'unreal' | 'godot' | 'json'>('unity');
  const [copied, setCopied] = useState(false);

  const assetCdnUrl = getOptimizedCloudinaryUrl(asset.originalUrl);

  // NOTE: GameForge AI generates 2D raster images (PNG/JPG), not 3D mesh files
  // (.fbx, .obj, .gltf). The snippets below load the image as a Sprite/Texture
  // in each engine — suitable for 2D games, UI, HUD elements, and as reference
  // art for 3D artists. For actual 3D models with rigging, you need a dedicated
  // 3D generation service (e.g. Meshy, Tripo3D, or manual modelling).
  const assetNote = `// ⚠ This is a 2D PNG image asset, not a 3D mesh.
// Use as: Sprite (Unity 2D), UI texture (Unreal UMG), or reference art.
// For rigged 3D models, export to .fbx/.gltf via a 3D modelling tool.`;

  const snippets = {
    unity: `// GameForge AI — Unity C# Runtime Loader (2D Sprite)
// Asset: ${asset.name} | Type: ${asset.assetType} | Style: ${asset.style}
${assetNote}

using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

public class GameForgeAssetLoader : MonoBehaviour
{
    [SerializeField] private string cdnUrl = "${assetCdnUrl}";
    [SerializeField] private SpriteRenderer targetSpriteRenderer;

    private IEnumerator Start()
    {
        using UnityWebRequest www = UnityWebRequestTexture.GetTexture(cdnUrl);
        yield return www.SendWebRequest();

        if (www.result == UnityWebRequest.Result.Success)
        {
            Texture2D tex = DownloadHandlerTexture.GetContent(www);
            Sprite sprite = Sprite.Create(
                tex,
                new Rect(0, 0, tex.width, tex.height),
                new Vector2(0.5f, 0.5f),
                100f
            );
            if (targetSpriteRenderer != null)
                targetSpriteRenderer.sprite = sprite;

            Debug.Log("[GameForge AI] Loaded: ${asset.name}");
        }
        else
        {
            Debug.LogError("[GameForge AI] Load failed: " + www.error);
        }
    }
}`,
    unreal: `// GameForge AI — Unreal Engine 5 C++ HTTP Texture Loader (2D Image)
// Asset: ${asset.name} | Type: ${asset.assetType} | Style: ${asset.style}
${assetNote.replace(/^\/\//gm, '//')}

#pragma once
#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "HttpModule.h"
#include "Interfaces/IHttpRequest.h"
#include "Interfaces/IHttpResponse.h"
#include "GameForgeSubsystem.generated.h"

UCLASS()
class MYGAME_API UGameForgeSubsystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()
public:
    UFUNCTION(BlueprintCallable, Category = "GameForge AI")
    void LoadAsset(UImage* TargetImage);

private:
    void OnAssetDownloaded(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bSuccess);
    UImage* PendingImage = nullptr;
};

// .cpp
void UGameForgeSubsystem::LoadAsset(UImage* TargetImage)
{
    PendingImage = TargetImage;
    TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Req = FHttpModule::Get().CreateRequest();
    Req->OnProcessRequestComplete().BindUObject(this, &UGameForgeSubsystem::OnAssetDownloaded);
    Req->SetURL(TEXT("${assetCdnUrl}"));
    Req->SetVerb(TEXT("GET"));
    Req->ProcessRequest();
}

void UGameForgeSubsystem::OnAssetDownloaded(
    FHttpRequestPtr Request, FHttpResponsePtr Response, bool bSuccess)
{
    if (!bSuccess || !Response.IsValid()) return;
    TArray<uint8> Data = Response->GetContent();
    UTexture2D* Tex = FImageUtils::ImportBufferAsTexture2D(Data);
    if (Tex && PendingImage)
        PendingImage->SetBrushFromTexture(Tex);
}`,
    godot: `# GameForge AI — Godot 4 GDScript Runtime Loader (2D Sprite)
# Asset: ${asset.name} | Type: ${asset.assetType} | Style: ${asset.style}
# NOTE: This loads a 2D PNG image, not a 3D mesh.
# For 3D use, import the PNG as an albedo texture on a MeshInstance3D material.

extends Node2D

@onready var sprite: Sprite2D = $Sprite2D
const CDN_URL: String = "${assetCdnUrl}"

func _ready() -> void:
    var http := HTTPRequest.new()
    add_child(http)
    http.request_completed.connect(_on_asset_downloaded)
    var err := http.request(CDN_URL)
    if err != OK:
        push_error("[GameForge AI] HTTP request failed: %s" % error_string(err))

func _on_asset_downloaded(
    _result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray
) -> void:
    if response_code != 200:
        push_error("[GameForge AI] Bad response: %d" % response_code)
        return
    var image := Image.new()
    var err := image.load_png_from_buffer(body)
    if err != OK:
        push_error("[GameForge AI] PNG decode failed")
        return
    sprite.texture = ImageTexture.create_from_image(image)
    print("[GameForge AI] Loaded: ${asset.name}")`,
    json: `{
  "asset_id": "${asset.id}",
  "name": "${asset.name}",
  "asset_type": "${asset.assetType}",
  "style": "${asset.style}",
  "format": "PNG (2D raster image — not a 3D mesh)",
  "cloudinary_public_id": "${asset.cloudinaryPublicId}",
  "cdn_url": "${assetCdnUrl}",
  "bg_removed_url": "${asset.bgRemovedUrl}",
  "dimensions": "${asset.width}x${asset.height}",
  "tags": ${JSON.stringify(asset.tags)},
  "engine_compatibility": {
    "unity_2d": "Sprite / SpriteRenderer — direct use",
    "unity_3d": "Texture2D on material — reference art",
    "unreal_umg": "UImage widget texture — direct use",
    "unreal_3d": "Albedo texture on StaticMesh material",
    "godot_2d": "Sprite2D / TextureRect — direct use",
    "godot_3d": "Albedo texture on MeshInstance3D material",
    "note": "3D mesh (.fbx/.gltf) requires a separate 3D modelling step"
  }
}`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(snippets[engineTab]);
    setCopied(true);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-4">
      {/* 2D vs 3D NOTICE */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <span className="font-bold text-amber-300">2D image asset</span> — GameForge AI generates PNG images, not 3D meshes (.fbx/.gltf).
          The snippets below load the image as a <strong>Sprite / Texture</strong> in each engine.
          For rigged 3D models, use the image as reference art and model in Blender, Maya, or a 3D-gen service.
        </p>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <Code className="w-4 h-4" />
          <span>Multi-Engine Code & Manifest Exporter</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setEngineTab('unity')}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
              engineTab === 'unity' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            Unity C#
          </button>
          <button
            onClick={() => setEngineTab('unreal')}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
              engineTab === 'unreal' ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            Unreal C++
          </button>
          <button
            onClick={() => setEngineTab('godot')}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
              engineTab === 'godot' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            Godot 4 GDScript
          </button>
          <button
            onClick={() => setEngineTab('json')}
            className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
              engineTab === 'json' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            JSON Manifest
          </button>
        </div>
      </div>

      {/* CODE DISPLAY BOX */}
      <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs relative shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-400">
            {engineTab === 'unity'
              ? 'GameForgeAssetLoader.cs'
              : engineTab === 'unreal'
              ? 'GameForgeSubsystem.cpp'
              : engineTab === 'godot'
              ? 'GameForgeLoader.gd'
              : 'AssetManifest.json'}
          </span>
          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold border border-slate-800 flex items-center gap-1.5 text-[11px]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Snippet!' : 'Copy Code'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-2xl bg-slate-900 text-cyan-300 overflow-x-auto border border-slate-800/80 leading-relaxed max-h-[300px]">
          {snippets[engineTab]}
        </pre>
      </div>
    </div>
  );
}
