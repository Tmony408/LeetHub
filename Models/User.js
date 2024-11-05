const mongoose = require('mongoose');
const bcrypt = requre("bcrypt")
const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  refreshToken: {
    type: String
  },
  stage:{
    type: Number,
    default: 1,
    required: true
  },
  tokens: [
    {
      token: {
        type: String
      },
      expiresAt: {
        type: Date
      }
    }
  ],
  // answerdQuestions:[{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Question"
  // }],
  takenTest:{
    type:Boolean,
    default: false,
    required:true
  },
  testTimeExpiresAt: {
    type: Date,
  },


}, { timestamps: true })


// Hash password before saving the user
UserSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    const saltRounds = 8;
    const salt = await bcrypt.genSalt(saltRounds);
    user.password = await bcrypt.hash(user.password, salt);
  }
  next();
});

// Compare plain password with hashed password
UserSchema.methods.comparePassword = async function (password) {
  const isMatch = await bcrypt.compare(password, this.password);
  return isMatch;
};


// Create verification OTP
UserSchema.methods.createVerificationOtp = async function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.passwordResetOTP = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
  this.otpExpires = Date.now() + 10 * 60 * 1000; //10mins;
  return otp;
};

// Verify Verification OTP
UserSchema.methods.verifyVerificationOtp = async function (otp) {
  if (this.otpExpires > Date.now()) return false
  const token = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
  if (this.passwordResetOTP === token) return true
  return false

};
const User = mongoose.model("User", userSchema);

module.exports = User;