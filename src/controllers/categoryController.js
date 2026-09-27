import { Category } from '../models/category.js';
import { Region } from '../models/region.js';

export const getCategoriesAndRegions = async (req, res) => {
  const [locationTypes, regions] = await Promise.all([
    Category.find({}, '_id name slug')
      .collation({ locale: 'uk' })
      .sort({ name: 1 })
      .lean(),
    Region.find({}, '_id name slug')
      .collation({ locale: 'uk' })
      .sort({ name: 1 })
      .lean(),
  ]);

  res.status(200).json({ locationTypes, regions });
};
