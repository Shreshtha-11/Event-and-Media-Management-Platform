import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';

/**
 * GET /api/events/[eventId]
 * Get a single event with populated albums and organizer.
 */
export async function GET(request, { params }) {
  try {
    const { eventId } = await params;

    await dbConnect();

    const event = await Event.findById(eventId)
      .populate('organizer', 'name email avatar')
      .populate({
        path: 'albums',
        select: 'title description coverImage creator media visibility',
        populate: { path: 'creator', select: 'name avatar' },
      })
      .lean();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    if (error.name === 'CastError') {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/events/[eventId]
 * Update an event. Only the organizer or an admin can update.
 */
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = await params;

    await dbConnect();

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Authorization: organizer or admin only
    const isOrganizer = event.organizer.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOrganizer && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only the organizer or an admin can update this event' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const allowedFields = [
      'title', 'description', 'category', 'date',
      'location', 'coverImage', 'visibility', 'tags',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // Convert date string to Date object
    if (updates.date) {
      updates.date = new Date(updates.date);
    }

    // Normalize tags
    if (updates.tags && Array.isArray(updates.tags)) {
      updates.tags = updates.tags.map((t) => t.trim().toLowerCase());
    }

    const updatedEvent = await Event.findByIdAndUpdate(eventId, updates, {
      new: true,
      runValidators: true,
    })
      .populate('organizer', 'name email avatar')
      .lean();

    return NextResponse.json({
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  } catch (error) {
    console.error('Update event error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
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
 * DELETE /api/events/[eventId]
 * Delete an event. Only the organizer or an admin can delete.
 */
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = await params;

    await dbConnect();

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const isOrganizer = event.organizer.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOrganizer && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only the organizer or an admin can delete this event' },
        { status: 403 }
      );
    }

    await Event.findByIdAndDelete(eventId);

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    if (error.name === 'CastError') {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
