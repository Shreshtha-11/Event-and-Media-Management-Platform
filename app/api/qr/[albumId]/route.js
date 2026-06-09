import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Album from '@/models/Album';
import { generateQRBuffer } from '@/lib/qr';

export async function GET(request, { params }) {
  try {
    const { albumId } = await params;
    await dbConnect();

    const album = await Album.findById(albumId);
    if (!album) return NextResponse.json({ error: 'Album not found' }, { status: 404 });

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/albums/${albumId}`;
    const qrBuffer = await generateQRBuffer(shareUrl);

    return new NextResponse(qrBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="album-${albumId}-qr.png"`,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'QR generation failed' }, { status: 500 });
  }
}
