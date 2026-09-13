import mongoose from "mongoose";
export const connectDB = async () => {
    await mongoose.connect("mongodb+srv://kushdhiraj8_db_user:mCfiUhmho68I4HfP@cluster0.tggv21h.mongodb.net/Expense").then(() => {
        console.log("Database connected successfully");
    }).catch((err) => {
        console.log(err);
    });
}