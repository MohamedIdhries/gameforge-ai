'use client';

import React, { useState } from 'react';
import { GameAsset } from '@/types/gameforge';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary';
import { Code, Copy, Check, Download, Layers, ShieldCheck, Box } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MultiEngineExportStudioProps {
  asset: GameAsset;
}

export default function MultiEngineExportStudio({ asset }: MultiEngineExportStudioProps) {
  const [engineTab, setEngineTab] = useState<'unity' | 'unreal' | 'godot' | 'json'>('unity');
  const [copied, setCopied] = useState(false);

  const assetCdnUrl = getOptimizedCloudinaryUrl(asset.originalUrl);

  const snippets = {
    unity: `// GameForge AI - Unity 3D C# Loader
using UnityEngine;
using UnityEngine.Networking;
import System.Collections;

public class GameForgeAssetLoader : MonoBehaviour {
    [SerializeField] private string cdnUrl = "${assetCdnUrl}";
    [SerializeField] private SpriteRenderer targetSpriteRenderer;

    IEnumerator Start() {
        UnityWebRequest www = UnityWebRequestTexture.GetTexture(cdnUrl);
        yield return www.SendWebRequest();

        if (www.result == UnityWebRequest.Result.Success) {
            Texture2D tex = DownloadHandlerTexture.GetContent(www);
            Sprite sprite = Sprite.Create(tex, new Rect(0, 0, tex.width, tex.height), new Vector2(0.5f, 0.5f));
            if (targetSpriteRenderer != null) targetSpriteRenderer.sprite = sprite;
            Debug.Log("[GameForge AI] Asset Loaded: ${asset.name}");
        }
    }
}`,
    unreal: `// GameForge AI - Unreal Engine 5 C++ Loader Subsystem
#include "GameForgeAssetLoader.h"
#include "HttpModule.h"
#include "Interfaces/IHttpResponse.h"

void UGameForgeSubsystem::DownloadCloudinaryAsset(FString AssetUrl) {
    TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request = FHttpModule::Get().CreateRequest();
    Request->OnProcessRequestComplete().BindUObject(this, &UGameForgeSubsystem::OnAssetDownloaded);
    Request->SetURL(TEXT("${assetCdnUrl}"));
    Request->SetVerb("GET");
    Request->ProcessRequest();
}`,
    godot: `# GameForge AI - Godot 4 GDScript Loader
extends Node2D

@onready var sprite: Sprite2D = $Sprite2D
var cdn_url: String = "${assetCdnUrl}"

func _ready():
	var http_request = HTTPRequest.new()
	add_child(http_request)
	http_request.request_completed.connect(_on_asset_downloaded)
	http_request.request(cdn_url)

func _on_asset_downloaded(result, response_code, headers, body):
	if response_code == 200:
		var image = Image.new()
		image.load_png_from_buffer(body)
		sprite.texture = ImageTexture.create_from_image(image)
		print("[GameForge AI] Godot Asset Synced: ${asset.name}")`,
    json: `{
  "asset_id": "${asset.id}",
  "name": "${asset.name}",
  "type": "${asset.assetType}",
  "style": "${asset.style}",
  "cloudinary_public_id": "${asset.cloudinaryPublicId}",
  "cdn_url": "${assetCdnUrl}",
  "bg_removed_url": "${asset.bgRemovedUrl}",
  "tags": ${JSON.stringify(asset.tags)},
  "engine_targets": ["Unity", "Unreal Engine 5", "Godot 4", "WebGPU"]
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
