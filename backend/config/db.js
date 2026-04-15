import mongoose from 'mongoose';
import colors from 'colors';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);

    console.error(
      `✅ Connected To MongoDB: ${conn.connection.host}`.bgMagenta.white
    );

  } catch (error) {
    console.error(
      `❌ MongoDB Error: ${error.message}`.bgRed.white
    );

    process.exit(1); // 🔥 STOP SERVER if DB fails
  }
};

export default connectDB;