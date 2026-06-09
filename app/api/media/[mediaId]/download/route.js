import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Media from '@/models/Media';
import Event from '@/models/Event';
import { addWatermark } from '@/lib/watermark';

export async function GET(request, { params }) {
  try {
    const { mediaId } = await params;
    await dbConnect();

    const media = await Media.findById(mediaId).populate('event', 'title').populate('uploader', 'name role');
    if (!media) return NextResponse.json({ error: 'Media not found' }, { status: 404 });

    // Increment download count
    await Media.findByIdAndUpdate(mediaId, { $inc: { downloadCount: 1 } });

    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role || 'viewer';

    // Fetch the file
    let fileBuffer;
    try {
      const response = await fetch(media.fileUrl);
      fileBuffer = Buffer.from(await response.arrayBuffer());
    } catch {
      return NextResponse.json({ error: 'File not accessible' }, { status: 404 });
    }

    // Apply watermark for images
    if (media.type === 'image') {
      try {
        fileBuffer = await addWatermark(fileBuffer, {
          clubName: 'EventFrame',
          eventName: media.event?.title || 'Event Photo',
          userRole,
        });
      } catch { /* Watermark failed, serve original */ }
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': media.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${media.title || 'download'}.${media.mimeType?.split('/')[1] || 'jpg'}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
