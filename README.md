# 📷 Event Frame

> A centralized **Event & Media Management Platform** for clubs, photographers, and members to upload, organize, discover, and share event media seamlessly.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **MongoDB Atlas** cluster (or local MongoDB)
- **Google Cloud Platform** account (for Storage and Vision API)

### Installation

```bash
# Clone and install
cd mogger-manages
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, GCS credentials, etc.

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🎨 Color Themes

Event Frame features **3 color schemes** × **2 modes** = **6 theme variants**:

| Scheme | Light | Dark | Accent |
|--------|-------|------|--------|
| 🌊 Ocean Breeze | Blue / White | Deep Navy | Cyan |
| 🌅 Sunset Ember | Orange / Warm White | Rich Brown | Pink |
| 🌲 Forest Mist | Green / Mint White | Dark Forest | Lime |

Users can switch themes from **Settings → Theme Settings** or via the navbar's moon/sun toggle for dark/light mode.

---

## ✨ Features

### 📸 Media Management
- [x] Drag & drop multi-file upload (images and videos)
- [x] Automatic AI tagging via Google Cloud Vision API
- [x] AI-powered image captions
- [x] Duplicate detection via MD5 hashing
- [x] Masonry grid gallery with infinite scroll
- [x] Fullscreen lightbox viewer with zoom, keyboard navigation
- [x] Dynamic watermarking on downloads (club name, event, role-based)
- [x] Image thumbnails and previews
- [x] Video support with inline preview

### 🎉 Event Management
- [x] Create, edit, and delete events with rich metadata
- [x] Event categories: Photoshoot, Workshop, Trip, Competition, Cultural Fest, Party
- [x] Event date, location, organizer, and cover image
- [x] Event visibility (Public/Private)
- [x] Event tags and member management
- [x] Albums within events

### 📁 Album Management
- [x] Create albums linked to events
- [x] Album collaborators
- [x] QR code sharing for albums
- [x] Album cover images

### 💬 Social Features
- [x] Like media with double-click heart animation and particle effects
- [x] Comment system with user avatars
- [x] User tagging with autocomplete search
- [x] Share via URL, QR code, Twitter, Facebook, WhatsApp
- [x] Real-time notifications (like, comment, tag, role change, system)

### 🔐 Access Control (Admin-Only Role Changes)
- [x] **4 user roles**: Viewer, Club Member, Photographer, Admin
- [x] **Only admins** can change user roles
- [x] Role-based access to features:
  - **Viewer**: Browse, like, comment, download
  - **Club Member**: Upload, create albums
  - **Photographer**: Create events, all club member perms
  - **Admin**: Full access, user management, analytics, moderation

### 🤖 AI Features
- [x] Smart image tagging (Vision API labels)
- [x] AI caption generation from image analysis
- [x] Content moderation (safety annotations)
- [x] Facial recognition - upload selfie to find your photos

### 🔍 Search & Discovery
- [x] Global search across media, events, albums
- [x] Filter by tags, type, date range, user, event
- [x] Sort by date, popularity, name
- [x] Tag cloud discovery
- [x] Explore page with filter chips

### 📊 Admin Dashboard
- [x] User management with role assignment table
- [x] Platform analytics: total users, media, events, storage
- [x] Upload trends (30-day bar chart)
- [x] Media distribution (pie chart)
- [x] Top uploaders leaderboard
- [x] Role distribution visualization
- [x] Content moderation queue (approve/reject)

### 🎨 Design & UX
- [x] 3 color schemes with light/dark modes (6 total themes)
- [x] Glassmorphism design language
- [x] Micro-animations on all interactions
- [x] Skeleton loading states
- [x] Responsive design (desktop → mobile)
- [x] PWA support with service worker
- [x] Smooth transitions and hover effects

### 📱 Pages
- [x] Landing page with animated hero, stats, features, steps
- [x] Login with Google OAuth + credentials
- [x] Register with password strength indicator
- [x] Dashboard with stats, quick actions, recent uploads
- [x] Events listing with search, filter, sort
- [x] Event detail with banner, tabs (media/albums/details)
- [x] Create event form
- [x] Albums grid
- [x] Album detail with media + QR share
- [x] Upload page with dropzone, event selector, progress
- [x] Explore page with search, filters, tag cloud
- [x] Profile page with banner, stats, upload/favorites tabs
- [x] Notifications with filters and mark-all-read
- [x] Admin dashboard, user management, analytics, moderation
- [x] Settings with theme selector, account, privacy, notifications
- [x] My Photos - facial recognition selfie search

---

## 📁 Project Structure

```
mogger-manages/
├── app/
│   ├── layout.js              # Root layout with providers
│   ├── page.js                # Landing page
│   ├── (auth)/
│   │   ├── login/page.js      # Login
│   │   └── register/page.js   # Register
│   ├── dashboard/page.js      # Main dashboard
│   ├── events/
│   │   ├── page.js            # Events listing
│   │   ├── create/page.js     # Create event
│   │   └── [eventId]/page.js  # Event detail
│   ├── albums/
│   │   ├── page.js            # Albums listing
│   │   └── [albumId]/page.js  # Album detail
│   ├── upload/page.js         # File upload
│   ├── explore/page.js        # Media explore
│   ├── profile/
│   │   ├── page.js            # Redirect
│   │   └── [userId]/page.js   # User profile
│   ├── notifications/page.js  # Notifications
│   ├── admin/
│   │   ├── page.js            # Admin dashboard
│   │   ├── users/page.js      # User management
│   │   ├── analytics/page.js  # Analytics
│   │   └── moderation/page.js # Content moderation
│   ├── settings/page.js       # User settings
│   ├── my-photos/page.js      # Face recognition
│   └── api/                   # 23 API routes
├── components/
│   ├── layout/ (Navbar, Sidebar, Footer)
│   ├── ui/ (Button, Card, Modal, Input, Badge, etc.)
│   ├── media/ (MediaCard, MediaGrid, MediaViewer, UploadDropzone)
│   ├── social/ (LikeButton, CommentSection, ShareModal, TagUsers)
│   ├── events/ (EventCard, EventForm)
│   └── admin/ (UserRoleManager, AnalyticsCharts, ModerationQueue)
├── context/ (Theme, Auth, Notification, Socket)
├── hooks/ (useInfiniteScroll, useMediaUpload)
├── lib/ (db, gcs, auth, utils, watermark, vision, qr, socket)
├── models/ (User, Event, Album, Media, Comment, Notification, Tag)
├── styles/ (themes.js, animations.css)
└── public/ (manifest.json, sw.js)
```

---

## 🔧 Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Cloud Storage
GCS_PROJECT_ID=your-project-id
GCS_BUCKET_NAME=your-bucket-name
GCS_KEY_FILE=path/to/service-account-key.json

# Vision API
VISION_API_ENABLED=false

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CLUB_NAME=Event Frame
```

---

## ⚠️ Features That Need Manual Configuration / Perfecting

### Must Be Configured Manually

1. **MongoDB Atlas Connection**: Replace `MONGODB_URI` in `.env` with your actual cluster connection string.

2. **Google Cloud Storage Setup**:
   - Create a GCS bucket
   - Configure CORS for the bucket
   - Create a service account with Storage Admin role
   - Download the JSON key file and set `GCS_KEY_FILE` path

3. **Google OAuth Credentials**:
   - Create OAuth 2.0 credentials in Google Cloud Console
   - Set authorized redirect URI to `http://localhost:3000/api/auth/callback/google`
   - Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`

4. **Google Vision API**:
   - Enable Cloud Vision API in your GCP project
   - Set `VISION_API_ENABLED=true` in `.env`
   - The service account needs Vision API permissions

5. **NextAuth Secret**: Generate a strong random secret for `NEXTAUTH_SECRET`

### Features That Can Be Improved Further

6. **Facial Recognition Pipeline**: Currently uses basic face detection from Vision API. For production, implement a proper face embedding + comparison system (e.g., using FaceAPI.js or AWS Rekognition).

7. **Real-Time Features**: Socket.io is set up but requires a custom server (not the default Next.js server) for WebSocket support. Consider using Vercel's `@vercel/functions` or a separate WebSocket server.

8. **Video Processing**: Currently no video transcoding. Consider adding FFmpeg-based processing for thumbnails and format conversion.

9. **Image Thumbnails**: The current implementation uses the original image as thumbnail. Add Sharp-based thumbnail generation during upload for better performance.

10. **Push Notifications**: The service worker supports push notifications but requires:
    - VAPID keys generation
    - Push subscription management
    - Backend notification sending via Web Push API

11. **Content Moderation**: Vision API SafeSearch detection is set up but the automated moderation flow (auto-flag → queue → admin review) needs testing with real content.

12. **Batch Operations**: Admin bulk delete, bulk approve, and bulk role change are not yet implemented.

13. **Export Functionality**: No CSV/ZIP export for event media or analytics data yet.

14. **Password Reset**: The "Forgot Password" link on the login page is not functional yet. Implement email-based password reset flow.

15. **Email Notifications**: No email notification system. Consider integrating SendGrid or AWS SES for email alerts on important events.

16. **Advanced Search**: Elasticsearch integration for better full-text search across large media libraries.

17. **CDN Integration**: For production, set up a CDN (CloudFlare, CloudFront) in front of GCS for faster media delivery.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | MongoDB + Mongoose |
| Auth | NextAuth.js (Credentials + Google OAuth) |
| Cloud Storage | Google Cloud Storage |
| AI/ML | Google Cloud Vision API |
| Styling | Vanilla CSS (Custom Design System) |
| Image Processing | Sharp |
| QR Codes | qrcode |
| Real-time | Socket.io |
| PWA | Service Worker + Web App Manifest |

---

## 📄 License

Made with ❤️ for event lovers.
