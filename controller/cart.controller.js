import Cart from "../models/cart.model.js";

//create cart


export const CreateCart = async (req, res) => {
  try {
    const { _id, price, quantity } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [
          {
            product: _id,
            quantity: quantity || 1,
            price,
          },
        ],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === _id
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity || 1;
      } else {
        cart.items.push({
          product: _id,
          quantity: quantity || 1,
          price,
        });
      }
    }

    await cart.save();

    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
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