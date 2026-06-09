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
    const labels = analysis.labels || [];

    // Construct caption from labels
    let caption = '';
    if (labels.length > 0) {
      const main = labels.slice(0, 3).join(', ');
      const secondary = labels.slice(3, 6).join(', ');
      caption = `A photo featuring ${main}`;
      if (secondary) caption += `, with ${secondary}`;
      caption += '.';
    }

    return NextResponse.json({ caption: caption || analysis.description || 'A beautiful moment captured.' });
  } catch (error) {
    console.error('AI caption error:', error);
    return NextResponse.json({ caption: 'A beautiful moment captured.' });
  }
}
