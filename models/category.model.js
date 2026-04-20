import mongoose from "mongoose";


const CategorySchema=new mongoose.Schema({
    image:String,
    name:String

})



const categorymodel=mongoose.model('category',CategorySchema)

export default categorymodel