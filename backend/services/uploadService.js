import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const cloudinaryFolder = process.env.CLOUDINARY_FOLDER || "food-del";

export const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: cloudinaryFolder,
                resource_type: "auto",
                format: "webp", // Enforce webp format
                transformation: [
                    { quality: "auto:good" }, // Optimize quality
                    { fetch_format: "auto" }  // Let Cloudinary decide best format if webp not supported (fallback)
                ]
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    return reject(new Error(error?.message || "Image upload failed"));
                }
                resolve(result);
            }
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error("Cloudinary Delete Error:", error);
        throw new Error("Failed to delete image");
    }
};
