import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Album from '@/models/Album';
import Event from '@/models/Event';

/**
 * GET /api/albums
 * List albums with optional filtering and pagination.
 *
 * Query params:
 *  - page (default: 1)
 *  - limit (default: 20, max: 100)
 *  - event (filter by event ID)
 *  - visibility (public|private|club_only)
 */
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') || '20', 10))
    );
    const eventId = searchParams.get('event');
    const visibility = searchParams.get('visibility');
    const skip = (page - 1) * limit;

    const filter = {};

    if (eventId) {
      filter.event = eventId;
    }

    if (visibility) {
      filter.visibility = visibility;
    }

    const [albums, total] = await Promise.all([
      Album.find(filter)
        .populate('creator', 'name email avatar')
        .populate('event', 'name startDate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Album.countDocuments(filter),
    ]);

    // Include media count for each album
    const albumsWithCount = albums.map((album) => ({
      ...album,
      mediaCount: album.media ? album.media.length : 0,
    }));

    return NextResponse.json({
      albums: albumsWithCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List albums error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/albums
 * Create a new album. Requires authentication.
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, event, coverImage, visibility, collaborators } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { error: 'Album title is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Validate event exists if provided
    if (event) {
      const eventDoc = await Event.findById(event);
      if (!eventDoc) {
        return NextResponse.json(
          { error: 'Referenced event not found' },
          { status: 404 }
        );
      }
    }

    const album = await Album.create({
      title: title.trim(),
      description: description || '',
      event: event || null,
      coverImage: coverImage || null,
      creator: session.user.id,
      visibility: visibility || 'public',
      collaborators: Array.isArray(collaborators) ? collaborators : [],
    });

    // Add album reference to the event if provided
    if (event) {
      await Event.findByIdAndUpdate(event, {
        $addToSet: { albums: album._id },
      });
    }

    const populatedAlbum = await Album.findById(album._id)
      .populate('creator', 'name email avatar')
      .populate('event', 'name startDate')
      .lean();

    return NextResponse.json(
      { message: 'Album created successfully', album: populatedAlbum },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create album error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
