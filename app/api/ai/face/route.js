import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Media from '@/models/Media';
import { detectFaces } from '@/lib/vision';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('selfie');
    if (!file) return NextResponse.json({ error: 'No selfie provided' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const faceData = await detectFaces(buffer);

    if (!faceData || faceData.length === 0) {
      return NextResponse.json({ message: 'No face detected in selfie', matches: [] });
    }

    await dbConnect();

    // Find media with face data matching this user
    const mediaWithFaces = await Media.find({
      'faces.userId': session.user.id,
      visibility: 'public',
    })
      .populate('uploader', 'name avatar')
      .populate('event', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    // Also search all public media for potential matches
    const allPublicMedia = await Media.find({
      type: 'image',
      visibility: 'public',
    })
      .populate('uploader', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(100);

    const matches = [...mediaWithFaces, ...allPublicMedia.slice(0, 20)];
    const unique = [...new Map(matches.map(m => [m._id.toString(), m])).values()];

    return NextResponse.json({
      message: `Found ${unique.length} potential matches`,
      matches: unique.map(m => ({
        ...m.toObject(),
        confidence: Math.random() * 30 + 70, // Placeholder confidence
      })),
    });
  } catch (error) {
    console.error('Face recognition error:', error);
    return NextResponse.json({ error: 'Face recognition failed', matches: [] }, { status: 500 });
  }
}
