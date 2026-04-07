import HttpError from "../middleware/HttpError.js";
import Service from "../model/Service.js";

const add = async (req, res, next) => {
  try {
    const { name, price, duration, description, category } = req.body;

    const newService = await Service.create({
      name,
      price,
      duration,
      description,
      category,
    });
    res.status(201).json({ success: true, message: "new service created" });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

const getAllServices = async (req, res, next) => {
  try {
    const services = await Service.find().populate("category");

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, duration, description, category } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new HttpError("Invalid service ID", 400));
    }

    const service = await Service.findById(id);

    if (!service) {
      return next(new HttpError("Service not found", 404));
    }

    if (name !== undefined) service.name = name;
    if (price !== undefined) service.price = price;
    if (duration !== undefined) service.duration = duration;
    if (description !== undefined) service.description = description;
    if (category !== undefined) service.category = category;

    await service.save();

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: service,
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      return next(new HttpError("Service not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    next(new HttpError(error.message, 500));
  }
};

export default { getAllServices, updateService, deleteService };
