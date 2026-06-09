import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Media from '@/models/Media';
import Notification from '@/models/Notification';

/**
 * GET /api/media/[mediaId]/comment
 * Get comments for a media item with pagination.
 *
 * Query params:
 *  - page (default: 1)
 *  - limit (default: 20)
 */
export async function GET(request, { params }) {
  try {
    const { mediaId } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') || '20', 10))
    );

    await dbConnect();

    const media = await Media.findById(mediaId)
      .select('comments')
      .populate('comments.user', 'name avatar')
      .populate('comments.taggedUsers', 'name avatar')
      .lean();

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Sort comments by newest first and paginate
    const allComments = (media.comments || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const total = allComments.length;
    const start = (page - 1) * limit;
    const paginatedComments = allComments.slice(start, start + limit);

    return NextResponse.json({
      comments: paginatedComments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    if (error.name === 'CastError') {
      return NextResponse.json({ error: 'Invalid media ID' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/media/[mediaId]/comment
 * Add a comment to a media item. Creates notifications for media owner
 * and any tagged users.
 */
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mediaId } = await params;
    const body = await request.json();
    const { text, taggedUsers } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
    }

    if (text.trim().length > 1000) {
      return NextResponse.json(
        { error: 'Comment cannot exceed 1000 characters' },
        { status: 400 }
      );
    }

    await dbConnect();

    const media = await Media.findById(mediaId);
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const comment = {
      user: session.user.id,
      text: text.trim(),
      taggedUsers: Array.isArray(taggedUsers) ? taggedUsers : [],
    };

    media.comments.push(comment);
    await media.save();

    // Get the newly added comment (last element)
    const addedComment = media.comments[media.comments.length - 1];

    // Notify media owner (skip if commenting on own media)
    if (media.uploader.toString() !== session.user.id) {
      await Notification.create({
        recipient: media.uploader,
        sender: session.user.id,
        type: 'comment',
        title: 'New Comment',
        message: `${session.user.name} commented on your ${media.type}${media.title ? ': ' + media.title : ''}`,
        link: `/media/${mediaId}`,
        relatedMedia: mediaId,
      });
    }

    // Notify tagged users
    if (Array.isArray(taggedUsers) && taggedUsers.length > 0) {
      const tagNotifications = taggedUsers
        .filter((userId) => userId !== session.user.id) // Don't notify self
        .map((userId) => ({
          recipient: userId,
          sender: session.user.id,
          type: 'tag',
          title: 'You were tagged',
          message: `${session.user.name} tagged you in a comment`,
          link: `/media/${mediaId}`,
          relatedMedia: mediaId,
        }));

      if (tagNotifications.length > 0) {
        await Notification.insertMany(tagNotifications);
      }
    }

    // Populate the comment before returning
    const populatedMedia = await Media.findById(mediaId)
      .select('comments')
      .populate('comments.user', 'name avatar')
      .populate('comments.taggedUsers', 'name avatar')
      .lean();

    const populatedComment = populatedMedia.comments.find(
      (c) => c._id.toString() === addedComment._id.toString()
    );

    return NextResponse.json(
      {
        message: 'Comment added successfully',
        comment: populatedComment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add comment error:', error);
    if (error.name === 'CastError') {
      return NextResponse.json({ error: 'Invalid media ID' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
