import Order from "../models/order.models.js";

// POST /api/order
export const PostOrder = async (req, res) => {
  try {
    //  Auth check
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { items, shippingAddress, paymentMethod } = req.body;

    //  Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    for (let item of items) {
      if (
        !item.product ||
        !item.name ||
        !item.price ||
        !item.quantity ||
        !item.image
      ) {
        return res.status(400).json({
          message: "Invalid item structure",
        });
      }
    }

    //  Validate shipping address 
    const {
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
    } = shippingAddress || {};

    if (
      !fullName ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        message: "Incomplete shipping address",
      });
    }

    //  Validate payment method
    if (!["COD", "UPI", "CARD"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    //  Calculate total 
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    //  Create order
    const order = new Order({
      user: req.user.id,
      items,
      shippingAddress: {
        fullName,
        phone,
        address,
        city,
        state,
        pincode,
      },
      paymentMethod,
      totalAmount,
    });

    const savedOrder = await order.save();

    res.status(201).json({
      message: "Order placed successfully",
      order: savedOrder,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};



export const GetOrder=  async (req,res)=>
    {
    try {
    const orders = await order.find()
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}