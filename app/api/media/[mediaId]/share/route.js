import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const { mediaId } = await params;
    const session = await getServerSession(authOptions);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/explore?media=${mediaId}`;

    return NextResponse.json({ shareUrl, mediaId });
  } catch (error) {
    return NextResponse.json({ error: 'Share failed' }, { status: 500 });
  }
}
