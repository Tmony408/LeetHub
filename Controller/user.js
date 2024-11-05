const User = require("../Models/User")
const asyncHandler = require("express-async-handler")
const { generateEmailVerificationToken, generateToken } = require("../configs/jwt")

const signUp = asyncHandler(async (req, res) => {
    let { email, password } = req.body;
    email = email.toLowerCase();
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res
                .status(409)
                .json({ success: false, message: "User already exists" });
        }
        const token = generateEmailVerificationToken(email, password);

        const context = {
            Name: email.split("@")[0].split(".")[1],
            Token: token
        };
        newSendMail(
            context,
            email,
            "Email Verification Link",
            "emailVerification"
        );

        return res.status(200).json({
            success: true,
            message:
                "Verify your email to register successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }



})

// verify email controller
const VerifyUserEmail = asyncHandler(async (req, res) => {
    // Get and Confirm token
    const { token } = req.params;
    if (!token) return res
        .status(401)
        .json({ success: false, message: "Invalid request" });
    try {
        // Validate and decode token
        try {
            let decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            console.log(error);
            return res
                .status(401)
                .json({ success: false, message: "Token expired, signup again" });
        }

        // Get name from email
        let name = decoded.email.split("@")[0].split(".");

        // create User 
        const newUser = await User.create({
            email: decoded.email.toLowerCase(),
            password: decoded.password,
            firstName: name[1],
            lastName: name[0]
        })
        res.status(201).json({
            success: true,
            message: "User created successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

//User login controller
const userLogin = asyncHandler(async (req, res) => {
    let { email, password } = req.body;
    email = email.toLowerCase();
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        // Check if passwords match
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message:
                    "The username or password provided is incorrect. Please try again."
            });
        }

        // Generate refresh token and update user status
    const refreshToken = await generateToken(user._id);
    await User.findByIdAndUpdate(
      user._id,
      { refreshToken},
      { new: true }
    );
    // Send response with cookies and tokens
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 2 * 60 * 60 * 1000 // 2 hours
      })
      .json({
        success: true,
        message: "Login successful",
        data: {
          _id: user._id,
          firstName: user.firstName,
          lastname: user.lastName,
          mail: user.mail,
          token: generateToken(user.id),
        }
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


// Get test expiry time controller
const getTestExpirytime = asyncHandler(async (req, res) => {
    const {_id} = req.user

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        if(!user.takenTest) return res.status(200).json({
            success: true,
            message: "User has not started test"
        });
        else
        return res.status(200).json({
            success: true,
            message: "User has started test",
            data: {expiryTime: user.testTimeExpiresAt}
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }

})