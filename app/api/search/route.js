import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Media from '@/models/Media';
import Event from '@/models/Event';
import Album from '@/models/Album';
import User from '@/models/User';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const type = searchParams.get('type');
    const eventName = searchParams.get('event');
    const userName = searchParams.get('user');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    await dbConnect();
    const results = { media: [], events: [], albums: [] };

    // Search media
    const mediaFilter = { visibility: 'public' };
    if (query) {
      mediaFilter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { aiCaption: { $regex: query, $options: 'i' } },
      ];
    }
    if (tags.length) mediaFilter.tags = { $in: tags };
    if (type) mediaFilter.type = type;
    if (dateFrom || dateTo) {
      mediaFilter.createdAt = {};
      if (dateFrom) mediaFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) mediaFilter.createdAt.$lte = new Date(dateTo);
    }
    if (userName) {
      const users = await User.find({ name: { $regex: userName, $options: 'i' } }).select('_id');
      mediaFilter.uploader = { $in: users.map(u => u._id) };
    }

    results.media = await Media.find(mediaFilter)
      .populate('uploader', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Search events
    if (query || eventName) {
      const eventFilter = { visibility: 'public' };
      const searchTerm = eventName || query;
      eventFilter.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ];
      results.events = await Event.find(eventFilter)
        .populate('organizer', 'name avatar')
        .sort({ date: -1 })
        .limit(10);
    }

    // Search albums
    if (query) {
      results.albums = await Album.find({
        visibility: 'public',
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
      })
        .populate('creator', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(10);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
