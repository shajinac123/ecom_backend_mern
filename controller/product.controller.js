import promodel from "../models/Product_model.js";

// create product

export const CreateProduct = async (req, res) => {

    console.log("BODY:", req.body);
    try {
        const newproduct = new promodel(req.body)
        await newproduct.save()
        res.json({ message: "product saved" })

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


// get product

export const GetAllProduct = async (req, res) => {
  try {
    const products = await promodel.find().populate("category", "name");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}



// delete product

export const DeleteProduct = async (req, res) => {
    try {
        const deleted = await promodel.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const UpdateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedProduct = await promodel.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(updatedProduct);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

export const GetProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await promodel.findById(id);
        console.log("Requested ID:", id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

export const GetProductByCategory = async (req, res) => {
    try {
        const products = await promodel.find({ category: req.params.id });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

// Search bar products

export const SearchBarProduct=async (req, res) => {
  try {
    const key = req.params.key;

    const products = await promodel.find({
      item: { $regex: key, $options: "i" }
    });
    console.log("ok")
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Search error" });
  }
}