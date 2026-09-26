import { model, Schema } from 'mongoose';

const locationSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 96,
      required: true,
    },
    image: {
      type: String,
      trim: true,
      required: true,
    },
    locationType: {
      type: String,
      trim: true,
      required: true,
    },
    region: {
      type: String,
      trim: true,
      required: true,
    },
    rate: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    description: {
      type: String,
      minLength: 20,
      maxLength: 6000,
      trim: true,
      required: true,
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
      },
      lon: {
        type: Number,
        required: true,
      },
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    feedbacksId: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Feedback',
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

locationSchema.index({ ownerId: 1 });
locationSchema.index({ region: 1, locationType: 1 });

export const Location = model('Location', locationSchema);
