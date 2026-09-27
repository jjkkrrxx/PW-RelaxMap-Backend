import mongoose from 'mongoose';

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.DB_HOST);
    console.log('Successfully connect database');

    console.log(`DataBase Name: ${mongoose.connection.name}`);
    console.log('Indexes synced successfully');
  } catch (error) {
    console.log('Failed connect database', error.message);
    throw error;
  }
};
