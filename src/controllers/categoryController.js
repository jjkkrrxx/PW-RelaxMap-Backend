import { LocationType } from '../models/locationType.js';
import { Region } from '../models/region.js';

export const getCategoriesAndRegions = async (req, res) => {
  const [types, regions] = await Promise.all([
    LocationType.find({}, 'type slug shortDescription')
      .collation({ locale: 'uk' })
      .sort({ type: 1 })
      .lean(),
    Region.find({}, 'region slug')
      .collation({ locale: 'uk' })
      .sort({ region: 1 })
      .lean(),
  ]);

  res.status(200).json({
    data: {
      locationTypes: types.map(({ _id, type, slug, shortDescription }) => ({
        _id,
        name: type,
        slug,
        shortDescription,
      })),
      regions: regions.map(({ _id, region, slug }) => ({
        _id,
        name: region,
        slug,
      })),
    },
  });
};
