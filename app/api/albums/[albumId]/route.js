import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Album from '@/models/Album';
import Event from '@/models/Event';

/**
 * GET /api/albums/[albumId]
 * Get a single album with populated media.
 */
export async function GET(request, { params }) {
  try {
    const { albumId } = await params;

    await dbConnect();

    const album = await Album.findById(albumId)
      .populate('creator', 'name email avatar')
      .populate('collaborators', 'name email avatar')
      .populate('event', 'name startDate endDate')
      .populate({
        path: 'media',
        select: 'title fileUrl thumbnailUrl type tags likeCount downloadCount createdAt',
        populate: { path: 'uploader', select: 'name avatar' },
      })
      .lean();

    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    return NextResponse.json({ album });
  } catch (error) {
    console.error('Get album error:', error);
    if (error.name === 'CastError') {
      return NextResponse.json({ error: 'Invalid album ID' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/albums/[albumId]
 * Update an album. Creator, collaborator, or admin only.
 */
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { albumId } = await params;

    await dbConnect();

    const album = await Album.findById(albumId);
    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    // Authorization: creator, collaborator, or admin
    const isCreator = album.creator.toString() === session.user.id;
    const isCollaborator = album.collaborators.some(
      (c) => c.toString() === session.user.id
    );
    const isAdmin = session.user.role === 'admin';

    if (!isCreator && !isCollaborator && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to update this album' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const allowedFields = [
      'title', 'description', 'coverImage', 'visibility', 'collaborators',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedAlbum = await Album.findByIdAndUpdate(albumId, updates, {
      new: true,
      runValidators: true,
    })
      .populate('creator', 'name email avatar')
      .populate('event', 'name startDate')
      .lean();

    return NextResponse.json({
      message: 'Album updated successfully',
      album: updatedAlbum,
    });
  } catch (error) {
    console.error('Update album error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json({ error: 'Invalid album ID' }, { status: 400 });
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
 * DELETE /api/albums/[albumId]
 * Delete an album. Creator or admin only.
 */
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { albumId } = await params;

    await dbConnect();

    const album = await Album.findById(albumId);
    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    const isCreator = album.creator.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only the creator or an admin can delete this album' },
        { status: 403 }
      );
    }

    // Remove album reference from parent event
    if (album.event) {
      await Event.findByIdAndUpdate(album.event, {
        $pull: { albums: album._id },
      });
    }

    await Album.findByIdAndDelete(albumId);

    return NextResponse.json({ message: 'Album deleted successfully' });
  } catch (error) {
    console.error('Delete album error:', error);
    if (error.name === 'CastError') {
      return NextResponse.json({ error: 'Invalid album ID' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
