import mongoose from "mongoose";


const UserSchema=new mongoose.Schema({

    email:String,
    password:String

})



const usermodel=mongoose.model('user',UserSchema)

export default usermodel