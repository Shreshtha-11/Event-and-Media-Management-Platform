import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    media: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media',
      required: [true, 'Media reference is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    taggedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for fetching comments by media and by user
commentSchema.index({ media: 1, createdAt: -1 });
commentSchema.index({ user: 1 });

export default mongoose.models.Comment ||
  mongoose.model('Comment', commentSchema);
