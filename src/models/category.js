import { model, Schema } from 'mongoose';

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 64 },
    slug: { type: String, required: true, trim: true, lowercase: true },
  },
  { timestamps: true, versionKey: false },
);

categorySchema.index({ slug: 1 }, { unique: true });

export const Category = model('Category', categorySchema);
