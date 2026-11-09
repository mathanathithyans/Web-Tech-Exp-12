require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();

app.use(cors());
app.use(express.json());

let client;
let articles;

const sampleArticles = [
    {
        title: "10 Ways to Reduce Plastic Waste",
        category: "Eco Tips",
        description: "Simple ways to reduce plastic usage in everyday life.",
        author: "EcoLife Team"
    },
    {
        title: "The Benefits of Sustainable Fashion",
        category: "Lifestyle",
        description: "Discover how eco-friendly clothing helps the planet.",
        author: "EcoLife Team"
    },
    {
        title: "Growing Your Own Organic Garden",
        category: "Gardening",
        description: "Learn how to grow vegetables naturally at home.",
        author: "EcoLife Team"
    }
];

app.get("/", (req, res) => {
    res.send("EcoLife API is running");
});

app.get("/api/articles", async (req, res) => {
    try {
        const result = await articles.find({}).toArray();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/api/articles/:id", async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid article ID" });
        }

        const article = await articles.findOne({
            _id: new ObjectId(req.params.id)
        });

        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        res.json(article);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post("/api/articles", async (req, res) => {
    try {
        const { title, category, description, author } = req.body;

        if (!title || !category || !description || !author) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        const newArticle = {
            title,
            category,
            description,
            author
        };

        const result = await articles.insertOne(newArticle);

        res.status(201).json({
            message: "Article added successfully",
            article: {
                _id: result.insertedId,
                ...newArticle
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put("/api/articles/:id", async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid article ID" });
        }

        const { title, category, description, author } = req.body;

        const result = await articles.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { title, category, description, author } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Article not found" });
        }

        res.json({ message: "Article updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete("/api/articles/:id", async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid article ID" });
        }

        const result = await articles.deleteOne({
            _id: new ObjectId(req.params.id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Article not found" });
        }

        res.json({ message: "Article deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

async function startServer() {
    try {
        if (!process.env.MONGO_URI || process.env.MONGO_URI.startsWith("YOUR_")) {
            throw new Error("Set a valid MONGO_URI in backend/.env");
        }

        client = new MongoClient(process.env.MONGO_URI);
        await client.connect();

        const database = client.db("EcoLifeDB");
        articles = database.collection("Articles");

        const count = await articles.countDocuments();

        if (count === 0) {
            await articles.insertMany(sampleArticles);
            console.log("Sample articles inserted");
        }

        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`EcoLife backend running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);
        if (client) {
            await client.close().catch((closeError) => {
                console.error("Database client cleanup failed:", closeError.message);
            });
        }
        process.exit(1);
    }
}

startServer();
