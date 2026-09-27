import mongoose from 'mongoose';

console.log(process.env.DB_HOST);

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.DB_HOST);
    console.log('Successfully connect database');
    console.log(mongoose.connection.name);
  } catch (error) {
    console.log('Failed connect database', error.message);
    throw error;
  }
};
