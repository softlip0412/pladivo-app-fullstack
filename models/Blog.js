import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },

    content: { type: String, required: true },
    excerpt: { type: String, trim: true, default: null },

    category: { type: String, trim: true, default: null },
    tags: [{ type: String, trim: true }],

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    published: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },

    coverImage: {
      url: { type: String, trim: true, default: null },
      alt: { type: String, trim: true, default: null },
    },

    views: { type: Number, default: 0 },

    meta: {
      title: { type: String, trim: true, default: null },
      description: { type: String, trim: true, default: null },
    },

    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        content: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

BlogSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    const base = this.title
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9\- ]+/g, "")
      .trim()
      .replace(/\s+/g, "-");
    this.slug = `${base}-${Date.now().toString(36)}`;
  }
  if (this.isModified("published") && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
