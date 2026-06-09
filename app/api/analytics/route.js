import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Media from '@/models/Media';
import Event from '@/models/Event';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();

    const [totalUsers, totalMedia, totalEvents, totalImages, totalVideos] = await Promise.all([
      User.countDocuments(),
      Media.countDocuments(),
      Event.countDocuments(),
      Media.countDocuments({ type: 'image' }),
      Media.countDocuments({ type: 'video' }),
    ]);

    // Top uploaders
    const topUploaders = await Media.aggregate([
      { $group: { _id: '$uploader', count: { $sum: 1 }, totalSize: { $sum: '$size' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', avatar: '$user.avatar', count: 1, totalSize: 1 } },
    ]);

    // Popular events
    const popularEvents = await Event.find()
      .sort({ 'members.length': -1 })
      .limit(5)
      .select('title date category members');

    // Uploads over time (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const uploadTrends = await Media.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Total storage
    const storageResult = await Media.aggregate([{ $group: { _id: null, total: { $sum: '$size' } } }]);
    const totalStorage = storageResult[0]?.total || 0;

    // Role distribution
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    return NextResponse.json({
      totalUsers,
      totalMedia,
      totalEvents,
      totalImages,
      totalVideos,
      totalStorage,
      topUploaders,
      popularEvents,
      uploadTrends,
      roleDistribution,
      mediaDistribution: { images: totalImages, videos: totalVideos },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
