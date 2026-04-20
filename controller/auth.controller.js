import usermodel from "../models/User_model.js";


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
      res.status(200).send("login done")
    } else {
      res.status(401).send("password is wrong")
    }
  } else {
    res.status(401).send("user not found")
  }

}



