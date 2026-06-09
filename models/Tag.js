import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [100, 'Tag name cannot exceed 100 characters'],
    },
    count: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: ['ai_generated', 'manual', 'location', 'object', 'activity'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for sorting by popularity
tagSchema.index({ count: -1 });
tagSchema.index({ category: 1 });

export default mongoose.models.Tag || mongoose.model('Tag', tagSchema);
