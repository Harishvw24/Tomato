import foodModel from "../models/foodModel.js";
import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (buffer) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "food-del" },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        stream.end(buffer);
    });

//add food-item
const addFood = async (req, res) => {
    try {
        const uploadResult = await uploadToCloudinary(req.file.buffer);

        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: uploadResult.secure_url,
            imagePublicId: uploadResult.public_id,
        });

        await food.save();
        res.json({
            success: "true",
            message: "Item is added"
        });
    }
    catch (error) {
        console.log(error);
        res.json({
            success: "false",
            message: "Error"
        });
    }
}

//List Food

const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({
            success: true,
            data: foods
        })
    }
    catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error
        })
    }
}
//Remove food 

const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        if (!food) {
            return res.json({ success: false, message: "Food not found" });
        }
        if (food.imagePublicId) {
            await cloudinary.uploader.destroy(food.imagePublicId);
        }
        await foodModel.findByIdAndDelete(req.body.id);
        res.json({
            success: true,
            message: "food is removed"
        })
    }
    catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error
        })
    }
}

export { addFood, listFood, removeFood }