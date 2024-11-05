const { body, param, validationResult } = require("express-validator");
const sanitizeHtml = require("sanitize-html");

// custom sanitizer for HTML inputs
const htmlSanitizer = (value) => {
  return sanitizeHtml(value, {
    allowedTags: [], // Disallow all HTML tags
    allowedAttributes: {} // Disallow all HTML attributes
  });
};

// const idParameterRules = [
//   param("id").isMongoId().withMessage("Invalid user ID")
// ];

const signUpRules = [

  // Validate email 
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom((value) => {
        if (!value.endsWith("@lmu.edu.ng")) {
            throw new Error("Use your school email");
        }
        return true;
    })
    .customSanitizer(htmlSanitizer),

  // Validate password (min length, max length)
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .customSanitizer(htmlSanitizer)
];

const loginRules = [
  // Validate email format and sanitize
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom((value) => {
        if (!value.endsWith("@lmu.edu.ng")) {
            throw new Error("Use your school email");
        }
        return true;
    })
    .customSanitizer(htmlSanitizer),

  // Validate password (min length, max length)
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .customSanitizer(htmlSanitizer)
];


// Validation middleware function
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

// Middleware to validate params
// const validateParams = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res
//       .status(400)
//       .json({ success: false, message: errors.array()[0].msg });
//   }
//   next();
// };

module.exports = {
  signUpRules,
  loginRules,
//   idParameterRules,
  validate,
//   validateParams
};
