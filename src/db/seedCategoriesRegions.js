import { readFile } from 'node:fs/promises';

const seedFiles = [
  {
    fileUrl: new URL(
      './data/relax_map_db.location_types.json',
      import.meta.url,
    ),
    sourceNameField: 'type',
    label: 'categories',
  },
  {
    fileUrl: new URL('./data/relax_map_db.regions.json', import.meta.url),
    sourceNameField: 'region',
    label: 'regions',
  },
];

const loadSeedData = async ({ fileUrl, sourceNameField, label }) => {
  const records = JSON.parse(await readFile(fileUrl, 'utf8'));

  if (!Array.isArray(records)) {
    throw new Error(`Seed data for ${label} must be an array`);
  }

  const ids = new Set();
  const slugs = new Set();

  return records.map((record, index) => {
    const id = record._id?.$oid;
    const name = record[sourceNameField]?.trim();
    const slug = record.slug?.trim().toLowerCase();

    if (!/^[0-9a-f]{24}$/i.test(id ?? '') || !name || !slug) {
      throw new Error(`Invalid ${label} record at index ${index}`);
    }

    if (ids.has(id) || slugs.has(slug)) {
      throw new Error(`Duplicate _id or slug in ${label}: ${id} / ${slug}`);
    }

    ids.add(id);
    slugs.add(slug);

    return { id, name, slug };
  });
};

const seedData = await Promise.all(seedFiles.map(loadSeedData));
const [categories, regions] = seedData;

console.log(
  `Validated ${categories.length} categories and ${regions.length} regions.`,
);

if (!process.argv.includes('--apply')) {
  console.log('Dry run only. Pass --apply to write these records to MongoDB.');
} else {
  await import('dotenv/config');

  if (!process.env.DB_HOST) {
    throw new Error('DB_HOST is required to seed MongoDB');
  }

  const mongoose = (await import('mongoose')).default;
  const { Category } = await import('../models/category.js');
  const { Region } = await import('../models/region.js');

  try {
    await mongoose.connect(process.env.DB_HOST);

    const toObjectIds = (records) =>
      records.map(({ id }) => new mongoose.Types.ObjectId(id));

    const toUpsertOperations = (records) =>
      records.map(({ id, name, slug }) => ({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(id) },
          update: { $set: { name, slug } },
          upsert: true,
        },
      }));

    const [deletedCategories, deletedRegions] = await Promise.all([
      Category.deleteMany({ _id: { $nin: toObjectIds(categories) } }),
      Region.deleteMany({ _id: { $nin: toObjectIds(regions) } }),
    ]);

    const [categoryResult, regionResult] = await Promise.all([
      Category.bulkWrite(toUpsertOperations(categories)),
      Region.bulkWrite(toUpsertOperations(regions)),
    ]);

    await Promise.all([Category.syncIndexes(), Region.syncIndexes()]);

    console.log(
      `Removed ${deletedCategories.deletedCount} old categories and ` +
        `${deletedRegions.deletedCount} old regions. ` +
        `Seed complete. Categories: ${categoryResult.upsertedCount} inserted, ` +
        `${categoryResult.modifiedCount} updated; regions: ` +
        `${regionResult.upsertedCount} inserted, ` +
        `${regionResult.modifiedCount} updated.`,
    );
  } finally {
    await mongoose.disconnect();
  }
}
