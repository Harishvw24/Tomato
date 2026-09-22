import {
    getAllFoods
} from "../services/foodService.js";
import { deleteCache } from "../services/cacheService.js";
import foodModel from "../models/foodModel.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../services/uploadService.js";

//add food-item
const addFood = async (req, res) => {
    try {
        if (!req.file) {
            return res.json({
                success: false,
                message: "Image file is required"
            });
        }

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
        await deleteCache("food:list");
        res.json({
            success: true,
            message: "Item is added"
        });
    }
    catch (error) {
        console.error("Error adding food:", error);
        res.json({
            success: false,
            message: error?.message || "Error adding food"
        });
    }
}

//List Food

const listFood = async (req, res) => {
    try {
        const foods = await getAllFoods();
        res.json({
            success: true,
            data: foods
        })
    }
    catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error fetching food list"
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
            await deleteFromCloudinary(food.imagePublicId);
        }

        await foodModel.findByIdAndDelete(req.body.id);
        await deleteCache("food:list");
        res.json({
            success: true,
            message: "food is removed"
        })
    }
    catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error removing food"
        })
    }
}

export { addFood, listFood, removeFood }
