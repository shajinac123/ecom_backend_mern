import mongoose from "mongoose";


const ProSchema= new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  image: {
    type: String,
  },

  description: {
    type: String,
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },

  sizes: {
    type: [String],
    default: [],
  },
});



const promodel=mongoose.model('product',ProSchema)

export default promodel