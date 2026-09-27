import {connect} from "mongoose";

console.log(process.env.DB_HOST)

export const connectMongoDB = async () => {
  try {
    await connect(process.env.DB_HOST);
    console.log("Successfully connect database");
  }

  catch (error) {
    console.log("Failed connect database", error.message);
    throw error;
  }
}