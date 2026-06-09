import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { analyzeImage } from '@/lib/vision';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('image');
    if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const analysis = await analyzeImage(buffer);

    return NextResponse.json({
      tags: analysis.labels || [],
      description: analysis.description || '',
      confidence: analysis.confidence || [],
    });
  } catch (error) {
    console.error('AI tag error:', error);
    return NextResponse.json({ error: 'Tagging failed', tags: [] }, { status: 500 });
  }
}
