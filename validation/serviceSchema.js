import Joi from "joi";

const serviceSchema = Joi.object({
  name: Joi.string().trim().label("Name").messages({
    "String.base": "name must be a string",
    "string.empty": "name is requires",
  }),
  price: Joi.number().trim().label("Price").messages({
    "Number.base": "Price must be a number",
    "Number.empty": "price is necessary",
  }),
  duration: Joi.number().label("Duration").messages({
    "Number.base": "Time must be in number",
    "Number.empty": "Time duration is must.",
  }),
  description: Joi.string().trim().label("Description").messages({
    "String.base": "Description must be in string",
    "String.empty": "Add something in description",
  }),
});

export const createServiceSchema = serviceSchema
  .fork(["name", "price", "duration"], (fields) => fields.required())
  .fork(["description"], (fields) => fields.optional())
  .messages({
    "any.required": "{#label} is required",
  });

export const updateServiceSchema = serviceSchema
  .fork(["name", "price", "duration", "description"], (fields) =>
    fields.optional(),
  )
  .or("name", "price", "duration", "description")
  .messages({
    "object.missing":
      "name,price or duration any of these field required while updating",
  });
