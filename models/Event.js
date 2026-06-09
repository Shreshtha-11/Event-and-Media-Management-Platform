import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    coverImage: {
      type: String,
    },
    category: {
      type: String,
      enum: [
        'photoshoot',
        'workshop',
        'trip',
        'competition',
        'cultural_fest',
        'party',
        'other',
      ],
      default: 'other',
    },
    date: {
      type: Date,
    },
    location: {
      type: String,
      trim: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer is required'],
    },
    albums: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album',
      },
    ],
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
eventSchema.index({ date: -1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ visibility: 1 });
eventSchema.index({ tags: 1 });

export default mongoose.models.Event || mongoose.model('Event', eventSchema);
