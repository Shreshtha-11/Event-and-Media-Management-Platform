import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Media from '@/models/Media';
import Notification from '@/models/Notification';

/**
 * POST /api/media/[mediaId]/like
 * Toggle like on a media item. If already liked, removes the like.
 * Creates a notification for the media owner on like (not unlike).
 */
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mediaId } = await params;

    await dbConnect();

    const media = await Media.findById(mediaId);
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const userId = session.user.id;
    const alreadyLiked = media.likes.some(
      (id) => id.toString() === userId
    );

    if (alreadyLiked) {
      // Unlike: remove user from likes array
      media.likes = media.likes.filter(
        (id) => id.toString() !== userId
      );
      media.likeCount = Math.max(0, media.likes.length);
      await media.save();

      return NextResponse.json({
        message: 'Like removed',
        liked: false,
        likeCount: media.likeCount,
      });
    } else {
      // Like: add user to likes array
      media.likes.push(userId);
      media.likeCount = media.likes.length;
      await media.save();

      // Create notification for media owner (skip if liking own media)
      if (media.uploader.toString() !== userId) {
        await Notification.create({
          recipient: media.uploader,
          sender: userId,
          type: 'like',
          title: 'New Like',
          message: `${session.user.name} liked your ${media.type}${media.title ? ': ' + media.title : ''}`,
          link: `/media/${mediaId}`,
          relatedMedia: mediaId,
        });
      }

      return NextResponse.json({
        message: 'Like added',
        liked: true,
        likeCount: media.likeCount,
      });
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    if (error.name === 'CastError') {
      return NextResponse.json({ error: 'Invalid media ID' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
