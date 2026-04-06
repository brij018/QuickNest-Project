import HttpError from "./HttpError.js";

const validate = (schema) => (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return next(new HttpError(error.details[0].message, 400));
    }
    req.body = value;
    next();
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

export default validate;
