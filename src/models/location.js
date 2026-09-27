import { model, Schema } from 'mongoose';

const locationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 96,
    },
    locationType: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    region: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
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
      required: true,
      minlength: 20,
      maxlength: 6000,
    },
    images: {
      type: [String],
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
  { timestamps: true, versionKey: false },
);

locationSchema.index({ ownerId: 1 });
locationSchema.index({ region: 1, locationType: 1 });

export const Location = model('Location', locationSchema);
