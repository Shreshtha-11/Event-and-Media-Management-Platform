import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Media from '@/models/Media';
import Album from '@/models/Album';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files');
    const eventId = formData.get('eventId');
    const albumId = formData.get('albumId');
    const visibility = formData.get('visibility') || 'public';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    await dbConnect();
    const results = [];

    for (const file of files) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${file.name}`;
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) continue;

        // Generate hash for duplicate detection
        const hash = crypto.createHash('md5').update(buffer).digest('hex');
        const existing = await Media.findOne({ hash });
        if (existing) {
          results.push({ filename: file.name, duplicate: true, existingId: existing._id });
          continue;
        }

        // Try to upload to GCS, fallback to local storage placeholder
        let fileUrl;
        try {
          const { uploadFile } = await import('@/lib/gcs');
          const url = await uploadFile(buffer, `media/${filename}`, file.type);
          fileUrl = typeof url === 'string' ? url : url?.url || url;
        } catch (gcsError) {
          console.warn('GCS upload skipped (not configured):', gcsError.message);
          // Store a placeholder URL - in production you'd want actual local storage
          fileUrl = `/uploads/${filename}`;
        }

        // AI tagging for images (optional, skip if not configured)
        let tags = [];
        let aiCaption = '';
        if (isImage) {
          try {
            const { analyzeImage } = await import('@/lib/vision');
            const analysis = await analyzeImage(buffer);
            if (analysis) {
              tags = analysis.labels || analysis.tags || [];
              aiCaption = analysis.description || analysis.caption || '';
            }
          } catch {
            // Vision API not configured - skip silently
          }
        }

        // Create media record
        const media = await Media.create({
          title: file.name.replace(/\.[^/.]+$/, ''),
          fileUrl,
          thumbnailUrl: fileUrl,
          type: isImage ? 'image' : 'video',
          size: buffer.length,
          mimeType: file.type,
          uploader: session.user.id,
          event: eventId || undefined,
          album: albumId || undefined,
          tags,
          aiCaption,
          visibility,
          hash,
          isModerated: false,
        });

        // Add to album if specified
        if (albumId) {
          await Album.findByIdAndUpdate(albumId, { $push: { media: media._id } });
        }

        results.push({ id: media._id, filename: file.name, fileUrl, tags, aiCaption });
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        results.push({ filename: file.name, error: fileError.message });
      }
    }

    return NextResponse.json({ success: true, results }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
