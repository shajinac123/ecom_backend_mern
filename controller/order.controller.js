import Order from "../models/order.models.js";
import Cart from "../models/cart.model.js";
import Product from "../models/Product_model.js";
import User from "../models/User_model.js";
import axios from "axios";

// ======================================================
// GET DASHBOARD DATA
// GET /api/dashboard
// ======================================================

export const getdashboardData = async (req, res) => {
  try {
    // ------------------------------------------
    // TOTAL ORDERS
    // ------------------------------------------
    const totalOrders = await Order.countDocuments();

    // ------------------------------------------
    // TOTAL PRODUCTS
    // ------------------------------------------
    const totalProducts = await product.countDocuments();

    // ------------------------------------------
    // TOTAL CUSTOMERS
    // ------------------------------------------
    const totalCustomers = await user.countDocuments();

    // ------------------------------------------
    // TOTAL SALES
    // Only successfully paid orders
    // ------------------------------------------
    const totalSalesResult = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalSales =
      totalSalesResult.length > 0
        ? totalSalesResult[0].totalSales
        : 0;

    // ------------------------------------------
    // RECENT 5 ORDERS
    // ------------------------------------------
    const recentOrders = await Order.find()
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .limit(5);

    // ------------------------------------------
    // RESPONSE
    // ------------------------------------------
    res.status(200).json({
      success: true,
      totalSales,
      totalOrders,
      totalProducts,
      totalCustomers,
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
      error: error.message,
    });
  }
};


// ======================================================
// GET SINGLE ORDER
// GET /api/order/:id
// ======================================================

export const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// ======================================================
// POST ORDER
// POST /api/order
// ======================================================

export const PostOrder = async (req, res) => {
  try {
    // ------------------------------------------
    // AUTH CHECK
    // ------------------------------------------
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      items,
      shippingAddress,
      paymentMethod,
    } = req.body;

    // ------------------------------------------
    // VALIDATE ITEMS
    // ------------------------------------------
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items in order",
      });
    }

    // ------------------------------------------
    // SHIPPING VALIDATION
    // ------------------------------------------
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
        success: false,
        message: "Incomplete shipping address",
      });
    }

    // ------------------------------------------
    // PHONE VALIDATION
    // ------------------------------------------
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    // ------------------------------------------
    // PAYMENT METHOD VALIDATION
    // ------------------------------------------
    if (!["COD", "UPI", "CARD"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // ------------------------------------------
    // CALCULATE TOTAL
    // ------------------------------------------
    const totalAmount = items.reduce(
      (sum, item) =>
        sum +
        Number(item.price) * Number(item.quantity),
      0
    );

    // ------------------------------------------
    // CREATE ORDER
    // ------------------------------------------
    const order = new Order({
      user: req.user.id,

      items,

      shippingAddress,

      paymentMethod,

      totalAmount,

      paymentStatus:
        paymentMethod === "COD"
          ? "PENDING"
          : "INITIATED",
    });

    const savedOrder = await order.save();

    // ------------------------------------------
    // COD ORDER
    // ------------------------------------------
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

    // ------------------------------------------
    // CASHFREE ORDER
    // ------------------------------------------
    const cashfreeResponse = await axios.post(
      "https://sandbox.cashfree.com/pg/orders",
      {
        order_id: savedOrder._id.toString(),

        order_amount: Number(totalAmount),

        order_currency: "INR",

        customer_details: {
          customer_id: req.user.id.toString(),

          customer_name: fullName,

          customer_phone: phone,

          customer_email:
            req.user.email || "test@gmail.com",
        },

        order_meta: {
          return_url:
            "https://ecom.shajinac.online/orderdetails?order_id={order_id}",
        },
      },
      {
        headers: {
          "x-client-id":
            process.env.CASHFREE_APP_ID,

          "x-client-secret":
            process.env.CASHFREE_SECRET_KEY,

          "x-api-version":
            "2023-08-01",

          "Content-Type":
            "application/json",
        },
      }
    );

    // ------------------------------------------
    // SAVE CASHFREE DETAILS
    // ------------------------------------------
    savedOrder.cashfree_order_id =
      cashfreeResponse.data.cf_order_id;

    savedOrder.payment_session_id =
      cashfreeResponse.data.payment_session_id;

    await savedOrder.save();

    // ------------------------------------------
    // RESPONSE
    // ------------------------------------------
    res.status(201).json({
      success: true,

      message: "Cashfree order created",

      payment_session_id:
        cashfreeResponse.data
          .payment_session_id,

      order: savedOrder,
    });
  } catch (err) {
    console.log(
      "CASHFREE ERROR:",
      err.response?.data ||
        err.message
    );

    res.status(500).json({
      success: false,

      message: "Server Error",

      error:
        err.response?.data ||
        err.message,
    });
  }
};


// ======================================================
// GET ALL ORDERS
// GET /api/order
// ======================================================

export const GetOrder = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({
      message: "Server error",
    });
  }
};


// ======================================================
// UPDATE ORDER STATUS
// ======================================================

export const UpdateOrderStatus = async (
  req,
  res
) => {
  try {
    const updatedOrder =
      await Order.findByIdAndUpdate(
        req.params.id,
        {
          orderStatus: req.body.status,
        },
        {
          new: true,
        }
      );

    if (!updatedOrder) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({
      message: "Status update failed",
    });
  }
};


// ======================================================
// CASHFREE WEBHOOK
// ======================================================

export const cashfreeWebhook = async (
  req,
  res
) => {
  try {
    console.log(
      "Cashfree Webhook:",
      req.body
    );

    const data = req.body;

    // ------------------------------------------
    // CASHFREE DATA
    // ------------------------------------------
    const orderId =
      data?.data?.order?.order_id;

    const paymentStatus =
      data?.data?.payment?.payment_status;

    console.log(
      "Order ID:",
      orderId
    );

    console.log(
      "Payment Status:",
      paymentStatus
    );

    // ------------------------------------------
    // FIND ORDER
    // ------------------------------------------
    const order =
      await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ------------------------------------------
    // PAYMENT SUCCESS
    // ------------------------------------------
    if (
      paymentStatus === "SUCCESS"
    ) {
      order.isPaid = true;

      // IMPORTANT:
      // Dashboard uses this value
      order.paymentStatus = "Paid";

      order.orderStatus = "Processing";

      await order.save();

      // Clear cart after successful payment
      await Cart.deleteMany({
        user: order.user,
      });

      console.log(
        "Payment Successful"
      );
    }

    // ------------------------------------------
    // PAYMENT FAILED
    // ------------------------------------------
    if (
      paymentStatus === "FAILED"
    ) {
      order.isPaid = false;

      order.paymentStatus = "Failed";

      order.orderStatus =
        "Cancelled";

      await order.save();

      console.log(
        "Payment Failed"
      );
    }

    // ------------------------------------------
    // RESPONSE TO CASHFREE
    // ------------------------------------------
    return res.status(200).json({
      success: true,

      message:
        "Webhook processed successfully",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,

      message: err.message,
    });
  }
};