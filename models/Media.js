import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    thumbnailUrl: {
      type: String,
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      required: [true, 'Media type is required'],
    },
    size: {
      type: Number, // in bytes
    },
    dimensions: {
      width: { type: Number },
      height: { type: Number },
    },
    mimeType: {
      type: String,
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader is required'],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album',
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    aiCaption: {
      type: String,
    },
    faces: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        coordinates: {
          type: Object, // bounding box / polygon data
        },
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likeCount: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: 1000,
        },
        taggedUsers: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    commentCount: {
      type: Number,
      default: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    isModerated: {
      type: Boolean,
      default: false,
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    hash: {
      type: String, // perceptual hash for duplicate detection
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying and search
mediaSchema.index({ uploader: 1 });
mediaSchema.index({ event: 1 });
mediaSchema.index({ album: 1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index({ hash: 1 });
mediaSchema.index({ visibility: 1 });
mediaSchema.index({ createdAt: -1 });
mediaSchema.index({ likeCount: -1 });

export default mongoose.models.Media || mongoose.model('Media', mediaSchema);
