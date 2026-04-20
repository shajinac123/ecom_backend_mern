
import categorymodel from "../models/category.model.js"

export const createCategory=async (req, res) => {

  const { image, name } = req.body


  await categorymodel.create({
    image,
    name
  })


  res.json({ message: "Category created" })
}



export const GetAllCategory=async (req, res) => {
  try {
    const categories = await categorymodel.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const updateCategory=async (req, res) => {
  try {
    const { id } = req.params;

    const updatedCategory = await categorymodel.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(updatedCategory);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}


export const DeleteCategory=async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const products = await promodel.find({ category: id });
    if (products.length > 0) {
      return res.status(400).json({
        message: "Cannot delete category with existing products",
      });
    }

    const deleted = await categorymodel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const GetCtegoryById=async (req, res) => {
  try {
    const { id } = req.params;

    const category = await categorymodel.findById(id);
    console.log("Requested ID:", id);

    if (!category) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

