import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';

/**
 * GET /api/events
 * List events with filtering, sorting, and pagination.
 */
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const category = searchParams.get('category');
    const visibility = searchParams.get('visibility');
    const sortParam = searchParams.get('sort') || '-date';
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    const filter = {};
    if (category) filter.category = category;
    if (visibility) filter.visibility = visibility;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Build sort
    let sort = { date: -1 };
    if (sortParam === 'date' || sortParam === 'date_asc') sort = { date: 1 };
    else if (sortParam === '-date' || sortParam === 'date_desc') sort = { date: -1 };
    else if (sortParam === 'title' || sortParam === 'name_asc') sort = { title: 1 };
    else if (sortParam === '-title' || sortParam === 'name_desc') sort = { title: -1 };

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate('organizer', 'name email avatar')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(filter),
    ]);

    return NextResponse.json({
      events,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('List events error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/events
 * Create a new event. Requires auth and photographer/admin role.
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['photographer', 'admin'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only photographers and admins can create events' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, category, date, location, coverImage, visibility, tags } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Event title is required' }, { status: 400 });
    }

    await dbConnect();

    const event = await Event.create({
      title: title.trim(),
      description: description || '',
      category: category || 'other',
      date: date ? new Date(date) : new Date(),
      location: location || '',
      coverImage: coverImage || null,
      organizer: session.user.id,
      visibility: visibility || 'public',
      tags: Array.isArray(tags) ? tags.map((t) => t.trim().toLowerCase()) : [],
    });

    const populatedEvent = await Event.findById(event._id)
      .populate('organizer', 'name email avatar')
      .lean();

    return NextResponse.json(
      { message: 'Event created successfully', event: populatedEvent },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create event error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
