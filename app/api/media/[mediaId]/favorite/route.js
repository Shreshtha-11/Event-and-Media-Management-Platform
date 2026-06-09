import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mediaId } = await params;
    await dbConnect();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isFavorited = user.favorites.includes(mediaId);

    if (isFavorited) {
      // Unfavorite
      user.favorites = user.favorites.filter(id => id.toString() !== mediaId);
      await user.save();
      return NextResponse.json({ favorited: false });
    } else {
      // Favorite
      user.favorites.push(mediaId);
      await user.save();
      return NextResponse.json({ favorited: true });
    }
  } catch (error) {
    console.error('Favorite error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ favorited: false });

    const { mediaId } = await params;
    await dbConnect();

    const user = await User.findById(session.user.id);
    const favorited = user?.favorites?.includes(mediaId) || false;

    return NextResponse.json({ favorited });
  } catch (error) {
    return NextResponse.json({ favorited: false });
  }
}
