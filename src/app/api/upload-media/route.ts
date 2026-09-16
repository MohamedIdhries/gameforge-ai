import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * User Media Upload Route
 *
 * Accepts a user-uploaded image (base64 data URI or URL) and uploads it
 * to Cloudinary, running it through the same pipeline as generated assets:
 *   - f_auto / q_auto delivery
 *   - Tags and context metadata
 *   - Returns public_id for transformation URLs
 *
 * POST body (JSON):
 *   {
 *     file: string,        // base64 data URI (data:image/...;base64,...) or HTTPS URL
 *     assetType: string,   // 'Character' | 'Environment' | etc.
 *     style: string,
 *     projectId: string,
 *     name: string,
 *   }
 *
 * Validation:
 *   - file must be a data URI or https:// URL
 *   - data URIs are limited to 10 MB (base64 encoded)
 *   - Only image/* MIME types accepted
 */

const MAX_BASE64_BYTES = 10 * 1024 * 1024; // 10 MB base64 limit
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

function buildSignature(params: Record<string, string>, apiSecret: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('sha1').update(sorted + apiSecret).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      file: string;
      assetType?: string;
      style?: string;
      projectId?: string;
      name?: string;
    };

    const { file, assetType = 'Character', style = '3D Game Art', projectId = '', name = 'Uploaded Asset' } = body;

    if (!file) {
      return NextResponse.json({ error: 'file is required (base64 data URI or https:// URL)' }, { status: 400 });
    }

    // Validate input type
    if (file.startsWith('data:')) {
      const mimeMatch = file.match(/^data:([^;]+);base64,/);
      if (!mimeMatch || !ALLOWED_MIME.has(mimeMatch[1])) {
        return NextResponse.json(
          { error: 'Only image/png, image/jpeg, image/webp, image/gif are accepted' },
          { status: 400 }
        );
      }
      const base64Part = file.split(',')[1] ?? '';
      if (base64Part.length > MAX_BASE64_BYTES) {
        return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 413 });
      }
    } else if (file.startsWith('https://')) {
      // URL upload — Cloudinary will fetch it
    } else {
      return NextResponse.json(
        { error: 'file must be a base64 data URI or https:// URL' },
        { status: 400 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({
        cloudinaryConfigured: false,
        message: 'Cloudinary credentials not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.',
      }, { status: 503 });
    }

    const safeType  = assetType.toLowerCase().replace(/[^a-z]/g, '');
    const publicId  = `gameforge/user_${safeType}_${Date.now()}`;
    const timestamp = String(Math.floor(Date.now() / 1000));
    const tagList   = ['gameforge-ai', 'user-upload', safeType].join(',');
    const context   = [
      `name=${name.replace(/[|=]/g, ' ')}`,
      `style=${style}`,
      `asset_type=${assetType}`,
      `project_id=${projectId}`,
      `source=user-upload`,
    ].join('|');

    const sigParams: Record<string, string> = {
      context,
      public_id: publicId,
      tags: tagList,
      timestamp,
    };
    const signature = buildSignature(sigParams, apiSecret);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('public_id', publicId);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('tags', tagList);
    formData.append('context', context);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData, signal: AbortSignal.timeout(30000) }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text().catch(() => '');
      console.error('[upload-media] Cloudinary upload failed:', uploadRes.status, errText);
      return NextResponse.json(
        { error: `Cloudinary upload failed: ${uploadRes.status}` },
        { status: 502 }
      );
    }

    const uploadData = await uploadRes.json() as {
      secure_url: string;
      public_id: string;
      width: number;
      height: number;
      format: string;
      tags?: string[];
    };

    const pid  = uploadData.public_id;
    const base = `https://res.cloudinary.com/${cloudName}/image/upload`;

    return NextResponse.json({
      cloudinaryConfigured: true,
      imageUrl:           uploadData.secure_url,
      cloudinaryPublicId: pid,
      width:              uploadData.width,
      height:             uploadData.height,
      format:             uploadData.format,
      tags:               uploadData.tags ?? [safeType, 'user-upload'],
      optimizedUrl:       `${base}/f_auto,q_auto/${pid}`,
      bgRemovedUrl:       `${base}/e_background_removal,f_auto,q_auto/${pid}`,
    });
  } catch (err) {
    console.error('[upload-media] error:', err);
    return NextResponse.json(
      { error: 'Upload failed. Check server logs.' },
      { status: 500 }
    );
  }
}
