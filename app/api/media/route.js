import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Media from '@/models/Media';
import Album from '@/models/Album';

/**
 * GET /api/media
 * List media with filtering, sorting, and pagination.
 *
 * Query params:
 *  - page, limit, event, album, uploader, type, visibility
 *  - tags (comma-separated)
 *  - sort (newest|oldest|popular|downloads)
 *  - search (text search)
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
    const event = searchParams.get('event');
    const album = searchParams.get('album');
    const uploader = searchParams.get('uploader');
    const type = searchParams.get('type');
    const visibility = searchParams.get('visibility');
    const tags = searchParams.get('tags');
    const sortParam = searchParams.get('sort') || 'newest';
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    if (event) filter.event = event;
    if (album) filter.album = album;
    if (uploader) filter.uploader = uploader;
    if (type && ['image', 'video', 'document'].includes(type)) {
      filter.type = type;
    }
    if (visibility) filter.visibility = visibility;

    if (tags) {
      const tagArray = tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      if (tagArray.length > 0) {
        filter.tags = { $in: tagArray };
      }
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    let sort = { createdAt: -1 };
    if (sortParam === 'newest' || sortParam === '-createdAt') sort = { createdAt: -1 };
    else if (sortParam === 'oldest' || sortParam === 'createdAt') sort = { createdAt: 1 };
    else if (sortParam === 'popular' || sortParam === '-likeCount') sort = { likeCount: -1, createdAt: -1 };
    else if (sortParam === 'downloads' || sortParam === '-downloadCount') sort = { downloadCount: -1, createdAt: -1 };

    const [media, total] = await Promise.all([
      Media.find(filter)
        .populate('uploader', 'name avatar')
        .populate('event', 'title')
        .populate('album', 'title')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Media.countDocuments(filter),
    ]);

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List media error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/media
 * Create a media record after file has been uploaded via /api/upload.
 * Requires authentication.
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title, description, fileUrl, thumbnailUrl, type, mimeType,
      fileSize, fileHash, dimensions, event, album, tags,
      aiCaption, visibility,
    } = body;

    if (!fileUrl) {
      return NextResponse.json(
        { error: 'File URL is required' },
        { status: 400 }
      );
    }

    if (!type || !['image', 'video', 'document'].includes(type)) {
      return NextResponse.json(
        { error: 'Valid media type (image, video, document) is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const media = await Media.create({
      title: title || '',
      description: description || '',
      fileUrl,
      thumbnailUrl: thumbnailUrl || null,
      type,
      mimeType: mimeType || '',
      fileSize: fileSize || 0,
      fileHash: fileHash || undefined,
      dimensions: dimensions || { width: 0, height: 0 },
      event: event || null,
      album: album || null,
      uploader: session.user.id,
      tags: Array.isArray(tags) ? tags.map((t) => t.trim().toLowerCase()) : [],
      aiCaption: aiCaption || '',
      visibility: visibility || 'public',
    });

    // Add media to album if specified
    if (album) {
      await Album.findByIdAndUpdate(album, {
        $addToSet: { media: media._id },
      });
    }

    const populatedMedia = await Media.findById(media._id)
      .populate('uploader', 'name avatar')
      .lean();

    return NextResponse.json(
      { message: 'Media created successfully', media: populatedMedia },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create media error:', error);

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
