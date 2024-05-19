const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;
//assignment-6-backend-relief-goods.vercel.app
// https://relief-fund-management.netlify.app/

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
// Enable CORS for all requests
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
//   next();
// });

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("cleaningStorebackend-assignment8");
    const categoriesCollection = db.collection("categories");
    const flashSaleCollection = db.collection("flashSale");

    // User Registration
    app.post("/api/v1/register", async (req, res) => {
      const { name, email, password } = req.body;

      // Check if email already exists
      const existingUser = await categoriesCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into the database
      await collection.insertOne({ name, email, password: hashedPassword });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    });

    // User Login
    app.post("/api/v1/login", async (req, res) => {
      const { email, password } = req.body;

      // Find user by email
      const user = await categoriesCollection.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN,
      });

      res.json({
        success: true,
        message: "Login successful",
        token,
      });
    });
    app.get("/products/dishwashing-items", async (req, res) => {
      const { category } = req.query;
      const query = category ? { category: category } : {}; // Ensure the query object correctly references the name field

      try {
        const result = await categoriesCollection.find(query);
        const supplies = await result.toArray();
        res.status(200).json({
          success: true,
          message: "Product Categories Fetched Successfully!",
          data: supplies,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "An error occurred while fetching the product categories.",
          error: error.message,
        });
      }
    });

    //  app.get("/products/dishwashing-items", async (req, res) => {
    //    try {
    //      const category = req.query.category;
    //      let query = {};

    //      if (category) {
    //        query = { name: category }; // Adjust based on your schema
    //      }

    //      const result = await categoriesCollection.find(query).toArray();
    //      res.status(200).json({
    //        success: true,
    //        message: "Products Fetched Successfully!",
    //        data: result,
    //      });
    //    } catch (err) {
    //      console.error("Error fetching products:", err);
    //      res.status(500).json({
    //        success: false,
    //        message: "Internal Server Error",
    //      });
    //    }
    //  });
    //  flash-sale api here
    app.get("/flash-sale", async (req, res) => {
      const query = {};
      const result = await flashSaleCollection.find(query);
      const reliefs = await result.toArray();
      res.status(200).json({
        success: true,
        message: "Flash Sales Fetched Successfully!",
        data: reliefs,
      });
    });

    app.get("/products/dishwashing-items/:id", async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid ID" });
        }

        const result = await categoriesCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!result) {
          return res
            .status(404)
            .json({ success: false, message: "Relief not found" });
        }
        res.status(200).json({
          success: true,
          message: "Single Products Fetched Successfully!",
          result,
        });
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Clearning store server is running smoothly",
    timestamp: new Date(),
  };
  res.json(serverStatus);
});
