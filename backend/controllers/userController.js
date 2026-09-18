import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

//login user

const loginUser = async (req, res) => {
    const { email, password, requestedRole } = req.body;
    try{
        if (requestedRole && !["customer", "admin"].includes(requestedRole)) {
            return res.json({ success: false, message: "Invalid role" });
        }

        const user= await userModel.findOne({ email: email.toLowerCase().trim() });
        if(!user){
            return res.json({success:false,message:"Invalid credentials"});
        }

        if (requestedRole && user.role !== requestedRole) {
            return res.json({
                success: false,
                message: `This account is not registered as a ${requestedRole}`
            });
        }

        if (!user.password) {
            return res.json({
                success: false,
                message: "Use Google login for this account"
            });
        }

        const isMatch= await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.json({success:false,message:"Invalid credentials"});
        }
        const token= createToken(user);
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch(error){
        res.json({success:false,message:error.message});
    }
}

const createToken = (user) => {
    return jwt.sign(
        {
            id: user._id.toString(),
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );
}

//register user

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const exists = await userModel.findOne({ email });
        // Checking if user already exists
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }
        //validating email and password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Invalid email" })
        }

        //Strong password validation
        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters long" })
        }

        //hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name: name,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: "customer",
            provider: "local",
            cartData: {}
        })
        const user = await newUser.save();
        const token = createToken(user);
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
       
    }
    catch (error) {
        res.json({ success: false, message: error.message });
    }
}

const googleCallback = (req, res) => {
    try {
        const oauthState = jwt.verify(req.query.state, process.env.JWT_SECRET);

        if (oauthState.requestedRole !== req.user.role) {
            return res.status(403).send("The selected role does not match this account.");
        }
    } catch {
        return res.status(400).send("Invalid or expired OAuth state.");
    }

  const token = createToken(req.user);

  const destination =
    req.user.role === "admin"
            ? process.env.ADMIN_URL
            : process.env.CUSTOMER_URL || process.env.FRONTEND_URL;

  res.redirect(
    `${destination}/oauth/callback?token=${encodeURIComponent(token)}`
  );
};

const getCurrentUser = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
};

export { loginUser, registerUser, googleCallback, getCurrentUser };
