// config/db.js
import mongoose from 'mongoose';

const connectToMongoDb = async () => {
    try {
        // Ensure you're using the correct environment variable
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true, // Optional: For MongoDB version < 5
            useFindAndModify: false, // Optional: For MongoDB version < 5
        });
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process if the connection fails
    }
};

export default connectToMongoDb;
