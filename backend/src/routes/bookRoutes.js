import express from "express";
import cloudinary from "../lib/cloudinary";
import protectRoute from "../middleware/auth.middleware";
const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
    try{
        
        const {title, caption, rating, image} = req.body;

        if(!image || !title || !caption || !rating) {
            return res.status(400).json({ message: "Please provide all fields"})
        }

        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url

        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id,
        })
        await newBook.save()

        res.status(201).json(newBook)
    } catch(error){
        console.log("error creating book", error);
        res.status(500).json({message: error.message})
    }
})
export default router;