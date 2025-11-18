import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event_id: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
  },
  { timestamps: true }
);

export default mongoose.models.Wishlist ||
  mongoose.model("Wishlist", WishlistSchema);
