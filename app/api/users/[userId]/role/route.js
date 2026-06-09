import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Notification from '@/models/Notification';

const VALID_ROLES = ['viewer', 'club_member', 'photographer', 'admin'];

/**
 * PUT /api/users/[userId]/role
 * Change a user's role. Admin only.
 * Creates a notification for the affected user.
 */
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Strict admin check
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can change user roles' },
        { status: 403 }
      );
    }

    const { userId } = await params;
    const body = await request.json();
    const { role } = body;

    // Validate role
    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        {
          error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Prevent admins from changing their own role (safety)
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const previousRole = user.role;

    if (previousRole === role) {
      return NextResponse.json(
        { error: `User already has the '${role}' role` },
        { status: 400 }
      );
    }

    user.role = role;
    await user.save();

    // Create notification for the user about role change
    await Notification.create({
      recipient: userId,
      sender: session.user.id,
      type: 'role_change',
      title: 'Role Updated',
      message: `Your role has been changed from '${previousRole}' to '${role}' by an administrator.`,
      link: '/profile',
    });

    return NextResponse.json({
      message: `User role updated from '${previousRole}' to '${role}'`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Role change error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
