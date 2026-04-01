import Joi from "joi";

const registerSchema = Joi.object({
  name: Joi.string().min(2).required().messages({
    "string.base": "name must be a string",
    "string.empty": "name is requires",
    "string.min": "Name must be at least 2 characters long",
  }),
  email: Joi.string().required().messages({
    "string.email": "invalid email format",
    "string.empty": "email is required",
  }),
  password: Joi.string()
    .min(6)
    .pattern(/^[a-zA-Z0-9]{6,30}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must be 6-30 characters and contain only letters and numbers",
      "string.empty": "Password is required",
    }),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be exactly 10 digits",
      "string.empty": "Phone number is required",
    }),
  role: Joi.string()
    .valid("customer", "provider", "admin")
    .default("customer")
    .messages({
      "any.only": "Role must be one of customer, provider, admin",
    }),
});

export default registerSchema;
