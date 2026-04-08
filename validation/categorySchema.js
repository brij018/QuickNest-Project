import Joi from "joi";

const categorySchema = Joi.object({
  name: Joi.string().min(2).label("Name").messages({
    "string.base": "name must be a string",
    "string.empty": "name is required",
    "string.min": "name must be at least 2 characters long",
  }),

  description: Joi.string().min(5).label("Description").messages({
    "string.base": "description must be a string",
    "string.empty": "description is required",
    "string.min": "description must be at least 5 characters long",
  }),
});

export const createCategorySchema = categorySchema
  .fork(["name"], (field) => field.required())
  .fork(["description"], (field) => field.optional())

  .messages({
    "any.required": "{#label} is required",
  });

export const updateCategorySchema = categorySchema
  .fork(["name", "description"], (field) => field.optional())
  .or("name", "description")
  .messages({
    "object.missing":
      "At least one field (name or description) is required to update",
  });
