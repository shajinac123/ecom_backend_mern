import usermodel from "../models/User_model.js";
import jwt from "jsonwebtoken"

// Register user
export const RegisterUser= async (req, res) => {

  const { email, password } = req.body

  usermodel.create({

    email,
    password
  })



  res.send("done")

}

// login user

export const LoginUser=async (req, res) => {
  const { email, password } = req.body
  console.log({ email, password })

  const user = await usermodel.findOne({
    email
  })


  console.log(user)

  if (user) {
    console.log("here")
    if (user.password == password) {

     const token=jwt.sign(
  { id: user._id }, 
  "your_secret_key", { expiresIn: '24h' });

      res.status(200).send({
        message:"login done",
        token
      })


    } else {
      res.status(401).send("password is wrong")
    }
  } else {
    res.status(401).send("user not found")
  }

}



export const GetUser = async (req, res) => {
  try {

    const user = await usermodel.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
}

