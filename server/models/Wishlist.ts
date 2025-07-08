import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlistItem {
  product: mongoose.Types.ObjectId;
  addedAt: Date;
}

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const wishlistItemSchema = new Schema<IWishlistItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const wishlistSchema = new Schema<IWishlist>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true
  },
  items: [wishlistItemSchema]
}, {
  timestamps: true
});

// Create indexes for better query performance
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'items.product': 1 });

export default mongoose.model<IWishlist>('Wishlist', wishlistSchema);
