import mongoose from "mongoose";

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product", 
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    totalAmount: {
      type: Number,
      default: 0, 
    },
  },
  { timestamps: true }
);


// ✅ Auto-calculate total before saving
CartSchema.pre("save", function () {
  this.totalAmount = this.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
});

export default mongoose.model("Cart", CartSchema);