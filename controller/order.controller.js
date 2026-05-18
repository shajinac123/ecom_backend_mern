import Order from "../models/order.models.js";
import Cart from "../models/cart.model.js";

// POST /api/order

import axios from "axios";



export const PostOrder = async (req, res) => {
  try {
    // Auth check
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { items, shippingAddress, paymentMethod } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "No items in order",
      });
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

    // Validate shipping address
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

    // Validate payment method
    if (!["COD", "UPI", "CARD"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    // Calculate total
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create order in MongoDB
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
      paymentStatus: paymentMethod === "COD" ? "PENDING" : "INITIATED",
    });

    const savedOrder = await order.save();

    // COD order
    if (paymentMethod === "COD") {

      await Cart.deleteMany({
        user: req.user.id,
      });

      return res.status(201).json({
        success: true,
        message: "Order placed successfully",
        order: savedOrder,
      });
    }

    // CASHFREE ORDER CREATE
    const cashfreeResponse = await axios.post(
      "https://sandbox.cashfree.com/pg/orders",
      {
        order_id: savedOrder._id.toString(),
        order_amount: totalAmount,
        order_currency: "INR",

        customer_details: {
          customer_id: req.user.id.toString(),
          customer_name: fullName,
          customer_phone: phone,
          customer_email: req.user.email || "test@gmail.com",
        },

        order_meta: {
          return_url:
            "http://localhost:3000/payment-success?order_id={order_id}",
        },
      },
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": "2025-01-01",
          "Content-Type": "application/json",
        },
      }
    );

    // Save Cashfree details
    savedOrder.cashfree_order_id =
      cashfreeResponse.data.cf_order_id;

    savedOrder.payment_session_id =
      cashfreeResponse.data.payment_session_id;

    await savedOrder.save();

    // Response to frontend
    res.status(201).json({
      success: true,
      message: "Cashfree order created",
      order: savedOrder,

      payment_session_id:
        cashfreeResponse.data.payment_session_id,
    });

  } catch (err) {
    console.error(err.response?.data || err);

    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};
// export const PostOrder = async (req, res) => {
//   try {
//     //  Auth check
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const { items, shippingAddress, paymentMethod } = req.body;

//     //  Validate items
//     if (!items || items.length === 0) {
//       return res.status(400).json({ message: "No items in order" });
//     }

//     for (let item of items) {
//       if (
//         !item.product ||
//         !item.name ||
//         !item.price ||
//         !item.quantity ||
//         !item.image
//       ) {
//         return res.status(400).json({
//           message: "Invalid item structure",
//         });
//       }
//     }

//     //  Validate shipping address 
//     const {
//       fullName,
//       phone,
//       address,
//       city,
//       state,
//       pincode,
//     } = shippingAddress || {};

//     if (
//       !fullName ||
//       !phone ||
//       !address ||
//       !city ||
//       !state ||
//       !pincode
//     ) {
//       return res.status(400).json({
//         message: "Incomplete shipping address",
//       });
//     }

//     //  Validate payment method
//     if (!["COD", "UPI", "CARD"].includes(paymentMethod)) {
//       return res.status(400).json({
//         message: "Invalid payment method",
//       });
//     }

//     //  Calculate total 
//     const totalAmount = items.reduce(
//       (sum, item) => sum + item.price * item.quantity,
//       0
//     );

//     //  Create order
//     const order = new Order({
//       user: req.user.id,
//       items,
//       shippingAddress: {
//         fullName,
//         phone,
//         address,
//         city,
//         state,
//         pincode,
//       },
//       paymentMethod,
//       totalAmount,
//     });

//     const savedOrder = await order.save();

//     await Cart.deleteMany({
//   user: req.user.id,
// });

//     res.status(201).json({
//       message: "Order placed successfully",
//       order: savedOrder,
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       message: "Server Error",
//       error: err.message,
//     });
//   }
// };



export const GetOrder = async (req, res) => {
  try {
    const orders = await Order.find()

    res.json(orders);
  }
  catch (err) {
    
    res.status(500).json({ message: "Server error" });

  }
}

export const UpdateOrderStatus = async (req, res) => {

  try {

    const updatedOrder =
      await Order.findByIdAndUpdate(
        req.params.id,
        {
          orderStatus: req.body.status,
        },
        { new: true }
      );

    res.json(updatedOrder);

  } catch (err) {

    res.status(500).json({
      message: "Status update failed",
    });

  }
};