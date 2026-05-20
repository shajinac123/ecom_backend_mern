import Cart from "../models/cart.model.js";
import promodel from "../models/Product_model.js";

// CREATE CART
export const CreateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const userId = req.user?.id;

    // Check user
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Check product
    const product = await promodel.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Find cart
    let cart = await Cart.findOne({ user: userId });

    // Create new cart
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [
          {
            product: productId,
            quantity: quantity || 1,
            price: product.price,
          },
        ],
      });
    } else {
      // Check existing product
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        // Increase quantity
        cart.items[itemIndex].quantity += quantity || 1;
      } else {
        // Add new item
        cart.items.push({
          product: productId,
          quantity: quantity || 1,
          price: product.price,
        });
      }
    }

    // Save cart
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Item added to cart",
      cart,
    });

  } catch (err) {
    console.error("CREATE CART ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
// Get CART

export const GetCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId })
      .populate("items.product"); 

    res.json(cart || { items: [] });

  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Server error" });
  }
};



// Delete Cart Item

export const removeCartItem= async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    //  remove item from array
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    res.json({ message: "Item removed", cart });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error removing item" });
  }
};




// Update CART

export const UpdateCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.product.toString() === productId
    );

    if (!item) return res.status(404).json({ message: "Item not found" });

    item.quantity = quantity;

    await cart.save();

    res.json(cart);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};