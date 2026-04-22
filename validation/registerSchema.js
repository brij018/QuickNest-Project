import Joi from "joi";

const userSchema = Joi.object({
  name: Joi.string().min(2).label("Name").messages({
    "string.base": "name must be a string",
    "string.empty": "name is requires",
    "string.min": "Name must be at least 2 characters long",
  }),

  email: Joi.string().email().label("Email").messages({
    "string.email": "invalid email format",
    "string.empty": "email is required",
  }),

  password: Joi.string()
    .min(6)
    .pattern(/^[a-zA-Z0-9]{6,30}$/)
    .label("Password")
    .messages({
      "string.pattern.base":
        "Password must be 6-30 characters and contain only letters and numbers",
      "string.empty": "Password is required",
    }),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .label("Phone")
    .messages({
      "string.pattern.base": "Phone number must be exactly 10 digits",
      "string.empty": "Phone number is required",
    }),

  profilePic: Joi.string().label("profilePic").messages({
    "string.base": "url must be in string format",
  }),
});

export const createUserSchema = userSchema
  .fork(["name", "email", "password", "phone"], (fields) => fields.required())
  .messages({
    "any.required": "{#label} is required",
  });

export const updateUserSchema = userSchema
  .fork(["name", "password", "phone", "profilePic"], (fields) =>
    fields.optional(),
  )
  .fork(["email"], (fields) => fields.forbidden())
  .append({
    services: Joi.array()
      .items(
        Joi.string()
          .pattern(/^[a-fA-F0-9]{24}$/)
          .message("Each service must be a valid MongoDB ObjectId"),
      )
      .min(1)
      .optional()
      .label("Services")
      .messages({
        "array.min": "Services must contain at least one item",
      }),

    role: Joi.string()
      .valid("customer", "provider", "admin")
      .optional()
      .label("Role"),
    isVerified: Joi.boolean().optional().label("isVerified"),
  })
  .or(
    "name",
    "password",
    "phone",
    "profilePic",
    "services",
    "role",
    "isVerified",
  )
  .messages({
    "object.missing":
      "At least one of name, password, phone, profilePic, or services is required when updating",
  });

export const providerSchema = Joi.object({
  services: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[a-fA-F0-9]{24}$/)
        .message("Each service must be a valid MongoDB ObjectId"),
    )
    .min(1)
    .required()
    .label("Services")
    .messages({
      "array.base": "Services must be an array",
      "array.min": "Provider must select at least one service",
      "any.required": "Services are required",
    }),
});
