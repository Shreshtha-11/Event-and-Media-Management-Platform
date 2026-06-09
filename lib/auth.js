import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

/**
 * NextAuth.js configuration options.
 * Uses JWT strategy with CredentialsProvider (email/password)
 * and optional GoogleProvider.
 */
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await dbConnect();

        // Explicitly select password field since it's excluded by default
        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
        }).select('+password');

        if (!user) {
          throw new Error('No account found with this email');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        };
      },
    }),
    // Only add GoogleProvider if env vars are present
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    /**
     * Sign-in callback: auto-creates user in MongoDB for OAuth providers.
     * First registered user automatically receives the 'admin' role.
     */
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await dbConnect();

          const existingUser = await User.findOne({
            email: user.email.toLowerCase(),
          });

          if (!existingUser) {
            // Check if this is the first user (auto-admin)
            const userCount = await User.countDocuments();
            const role = userCount === 0 ? 'admin' : 'viewer';

            await User.create({
              name: user.name,
              email: user.email.toLowerCase(),
              password: await bcrypt.hash(
                Math.random().toString(36).slice(-12),
                12
              ),
              avatar: user.image || '',
              role,
            });
          }
        } catch (error) {
          console.error('Error during Google sign-in:', error);
          return false;
        }
      }
      return true;
    },

    /**
     * JWT callback: attach user data from MongoDB to the token.
     */
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar;
      }

      // Handle session update (e.g., after profile edit)
      if (trigger === 'update' && session) {
        token.name = session.name || token.name;
        token.avatar = session.avatar || token.avatar;
        token.role = session.role || token.role;
      }

      // Refresh user data from DB periodically
      if (token.id) {
        try {
          await dbConnect();
          const dbUser = await User.findById(token.id).lean();
          if (dbUser) {
            token.role = dbUser.role;
            token.name = dbUser.name;
            token.avatar = dbUser.avatar || '';
          }
        } catch {
          // Silently fail — use cached token data
        }
      }

      return token;
    },

    /**
     * Session callback: expose user id, role, name, email, and avatar
     * to the client-side session object.
     */
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.avatar = token.avatar || '';
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
