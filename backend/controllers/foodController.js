import foodModel from "../models/foodModel.js";
import fs from 'fs';

//add food-item
const addFood = async (req, res) => {

    const image_filename = req.file.filename;

    const food = new foodModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: image_filename
    })
    try {
        await food.save();
        res.json({
            success: "true",
            message: "Item is added"
        })
    }
    catch (error) {
        console.log(error);
        res.json({
            success: "false",
            message: "Error"
        })
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
        fs.unlink(`uploads/${food.image}`, () => { });
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