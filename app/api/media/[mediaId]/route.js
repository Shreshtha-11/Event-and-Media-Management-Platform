import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Media from '@/models/Media';
import Album from '@/models/Album';
import { deleteFile } from '@/lib/gcs';

/**
 * GET /api/media/[mediaId]
 * Get a single media item with populated uploader and comments.
 */
export async function GET(request, { params }) {
  try {
    const { mediaId } = await params;

    await dbConnect();

    const media = await Media.findById(mediaId)
      .populate('uploader', 'name email avatar')
      .populate('event', 'name startDate')
      .populate('album', 'title')
      .populate('comments.user', 'name avatar')
      .populate('comments.taggedUsers', 'name avatar')
      .lean();

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    return NextResponse.json({ media });
  } catch (error) {
    console.error('Get media error:', error);
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
 * PUT /api/media/[mediaId]
 * Update media metadata. Uploader or admin only.
 */
export async function PUT(request, { params }) {
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

    const isUploader = media.uploader.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isUploader && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only the uploader or an admin can update this media' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const allowedFields = [
      'title', 'description', 'tags', 'visibility', 'aiCaption',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // Normalize tags
    if (updates.tags && Array.isArray(updates.tags)) {
      updates.tags = updates.tags.map((t) => t.trim().toLowerCase());
    }

    const updatedMedia = await Media.findByIdAndUpdate(mediaId, updates, {
      new: true,
      runValidators: true,
    })
      .populate('uploader', 'name avatar')
      .lean();

    return NextResponse.json({
      message: 'Media updated successfully',
      media: updatedMedia,
    });
  } catch (error) {
    console.error('Update media error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json({ error: 'Invalid media ID' }, { status: 400 });
    }
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

/**
 * DELETE /api/media/[mediaId]
 * Delete media record and file from GCS. Uploader or admin only.
 */
export async function DELETE(request, { params }) {
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

    const isUploader = media.uploader.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isUploader && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only the uploader or an admin can delete this media' },
        { status: 403 }
      );
    }

    // Delete file from GCS
    if (media.fileUrl) {
      try {
        const bucketName = process.env.GCS_BUCKET_NAME;
        const prefix = `https://storage.googleapis.com/${bucketName}/`;
        if (media.fileUrl.startsWith(prefix)) {
          const filename = media.fileUrl.replace(prefix, '');
          await deleteFile(filename);
        }
      } catch (gcsError) {
        console.error('GCS file deletion error (non-fatal):', gcsError.message);
      }
    }

    // Delete thumbnail from GCS
    if (media.thumbnailUrl) {
      try {
        const bucketName = process.env.GCS_BUCKET_NAME;
        const prefix = `https://storage.googleapis.com/${bucketName}/`;
        if (media.thumbnailUrl.startsWith(prefix)) {
          const filename = media.thumbnailUrl.replace(prefix, '');
          await deleteFile(filename);
        }
      } catch (gcsError) {
        console.error('GCS thumbnail deletion error (non-fatal):', gcsError.message);
      }
    }

    // Remove media from its album
    if (media.album) {
      await Album.findByIdAndUpdate(media.album, {
        $pull: { media: media._id },
      });
    }

    await Media.findByIdAndDelete(mediaId);

    return NextResponse.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Delete media error:', error);
    if (error.name === 'CastError') {
      return NextResponse.json({ error: 'Invalid media ID' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
