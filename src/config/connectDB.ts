import mongoose from "mongoose";

const connectDB = async () => { 
  const url = process.env.MONGO_URL;
  try {  
    if (!url) {  
      throw new Error("mongoDB connect url is not find in env file");
    }
    await mongoose.connect(url);
    console.log("Database connection successfully");
  } catch (error: any) {
    console.log("Failed to connect database", error);
  }
};

export default connectDB;
