import { model, Schema } from 'mongoose';

const regionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 64 },
    slug: { type: String, required: true, trim: true, lowercase: true },
  },
  { timestamps: true, versionKey: false },
);

regionSchema.index({ slug: 1 }, { unique: true });

export const Region = model('Region', regionSchema);
