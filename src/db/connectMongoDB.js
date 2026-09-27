import mongoose from 'mongoose';
import { Location } from '../models/location';

console.log(process.env.DB_HOST);

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.DB_HOST);
    console.log('Successfully connect database');

    console.log(`DataBase Name: ${mongoose.connection.name}`);

    await Location.syncIndexes();
    console.log('Indexes synced successfully');
  } catch (error) {
    console.log('Failed connect database', error.message);
    throw error;
  }
};
