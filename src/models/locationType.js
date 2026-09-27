import { model, Schema } from 'mongoose';

const locationTypeSchema = new Schema(
  {
    type: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    shortDescription: { type: String, trim: true },
  },
  { versionKey: false },
);

locationTypeSchema.index({ slug: 1 }, { unique: true });

export const LocationType = model(
  'LocationType',
  locationTypeSchema,
  'location_types',
);
