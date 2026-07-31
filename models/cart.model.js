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
          min: 1,
        },

        price: {
          type: Number,
          required: true,
        },

        // Selected size for clothing products
        // Example: S, M, L, XL, XXL
        size: {
          type: String,
          default: null,
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


// ==========================================
// AUTO CALCULATE TOTAL
// ==========================================
CartSchema.pre("save", function () {
  this.totalAmount = this.items.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );
});


export default mongoose.model("Cart", CartSchema);

