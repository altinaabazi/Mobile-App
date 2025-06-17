import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;

        if (!image || !title || !caption || !rating) {
            return res.status(400).json({ message: "Please provide all fields" });
        }

        // image duhet të jetë base64 ose url i cloudinary në frontend
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;

        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id,
        });

        await newBook.save();

        res.status(201).json(newBook);
    } catch (error) {
        console.log("error creating book", error);
        res.status(500).json({ message: error.message });
    }
});

// GET me pagination
router.get("/", protectRoute, async (req, res) => {
    try {
        // Marrim page dhe limit si numra (me parseInt)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const books = await Book.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "username profileImage");

        const totalBooks = await Book.countDocuments();

        res.json({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
        });
    } catch (error) {
        console.log("Error in get all books route", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
// bookRoute.js ose ku e ke router-in për librat
router.get("/notifications", protectRoute, async (req, res) => {
  try {
    const lastChecked = req.query.lastChecked ? new Date(req.query.lastChecked) : new Date(0);

    const newBooksCount = await Book.countDocuments({
      createdAt: { $gt: lastChecked }
    });

    res.json({ newBooksCount });
  } catch (error) {
    console.log("Error fetching notifications", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Merr librat e përdoruesit të loguar
// router.get("/user", protectRoute, async (req, res) => {
//     try {
//         const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
//         res.json(books);
//     } catch (error) {
//         console.error("Get user books error:", error.message);
//         res.status(500).json({ message: "Server error" });
//     }
// });
router.get("/new", protectRoute, async (req, res) => {
  try {
    const since = req.query.since ? new Date(req.query.since) : new Date(0);

    const newBooks = await Book.find({
      createdAt: { $gt: since },
    })
      .populate("user", "username profileImage")
      .sort({ createdAt: -1 });

    res.json({ newBooks });
  } catch (error) {
    console.error("Error fetching new books", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/user", protectRoute, async (req, res) => {
    try {
        const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(books);
    } catch (error) {
        console.error("Get user books error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});

// Pastaj vetëm pas këtij, endpoint për libër me id
router.get("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("user", "username profileImage");

    if (!book) {
      return res.status(404).json({ message: "Libri nuk u gjet" });
    }

    res.json({ book });
  } catch (error) {
    console.error("Gabim në GET /api/books/:id", error);
    res.status(500).json({ message: "Gabim serveri" });
  }
});

// Fshije libër me kontrollin e pronësisë
router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Kontrollo nëse përdoruesi është pronar i librit
        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Nëse ka image në cloudinary, fshi atë
        if (book.image && book.image.includes("cloudinary")) {
            try {
                // Merr publicId nga URL-ja e imazhit
                // Shembull URL: https://res.cloudinary.com/demo/image/upload/v1234567/sample.jpg
                const parts = book.image.split("/");
                const filename = parts[parts.length - 1]; // p.sh. sample.jpg
                const publicId = filename.split(".")[0]; // p.sh. sample

                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.log("Error deleting image from cloudinary", deleteError);
            }
        }

        await book.deleteOne();

        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        console.log("Error deleting book", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
// Përditëso libër (edit) me kontrollin e pronësisë
// router.put("/:id", protectRoute, async (req, res) => {
//   console.log("PUT /api/books/:id called");
//   console.log("User ID:", req.user._id);
//   console.log("Param ID:", req.params.id);
//   console.log("Body:", req.body);

//   try {
//     const book = await Book.findById(req.params.id);
//     if (!book) {
//       console.log("Libri nuk u gjet");
//       return res.status(404).json("Libri nuk u gjet");
//     }
//     if (book.user.toString() !== req.user._id.toString()) {
//       console.log("Nuk ke leje për të modifikuar librin");
//       return res.status(403).json("Nuk ke leje për të modifikuar librin");
//     }

//     // Përditëso vetëm titullin në shembull
//     book.title = req.body.title || book.title;

//     const savedBook = await book.save();
//     res.json(savedBook);
//   } catch (error) {
//     console.error("Gabim ne PUT /api/books/:id", error);
//     res.status(500).json("Gabim serveri");
//   }
// });
router.put("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json("Libri nuk u gjet");
    }
    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(403).json("Nuk ke leje për të modifikuar librin");
    }

    if (req.body.title !== undefined) book.title = req.body.title;
    if (req.body.caption !== undefined) book.caption = req.body.caption;
    if (req.body.rating !== undefined) book.rating = req.body.rating;

    const savedBook = await book.save();
    res.json(savedBook);
  } catch (error) {
    console.error("Gabim ne PUT /api/books/:id", error);
    res.status(500).json("Gabim serveri");
  }
});



export default router;
