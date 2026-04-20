import mongoose from "mongoose";


const ProSchema=new mongoose.Schema({

    item:String,
    price:Number,
    image:String,
    
    category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category"
  }

})



const promodel=mongoose.model('product',ProSchema)

export default promodel