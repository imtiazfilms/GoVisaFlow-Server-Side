const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(express.json());
app.use(cors());

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Successfully connected to MongoDB!");

    const database = client.db("visaFlow");
    const visaCollection = database.collection("visas");
    const applicationCollection = database.collection("applications");

    // Add new visa
    app.post("/visas", async (req, res) => {
      try {
        const visaData = req.body;
        const result = await visaCollection.insertOne(visaData);
        res.status(201).send(result);
      } catch (err) {
        console.error("Error adding visa:", err);
        res.status(500).send({ message: "Failed to add visa", error: err.message });
      }
    });

    // Get all visas
    app.get("/visas", async (req, res) => {
      try {
        const visas = await visaCollection.find().toArray();
        res.send(visas);
      } catch (err) {
        console.error("Error fetching visas:", err);
        res.status(500).send({ message: "Failed to fetch visas", error: err.message });
      }
    });

    // Get visa details by ID
    app.get("/visas/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const visa = await visaCollection.findOne({ _id: new ObjectId(id) });
        if (visa) {
          res.send(visa);
        } else {
          res.status(404).send({ message: "Visa not found" });
        }
      } catch (err) {
        console.error("Error fetching visa:", err);
        res.status(500).send({ message: "Error fetching visa", error: err.message });
      }
    });

    // Add a visa application
    app.post("/visaApplications", async (req, res) => {
      const applicationData = req.body;
      try {
        const result = await applicationCollection.insertOne(applicationData);
        res.status(201).send(result);
      } catch (err) {
        console.error("Error adding application:", err);
        res.status(500).send({ message: "Failed to save application", error: err.message });
      }
    });

    // Get user visa applications by email
    app.get("/myApplications", async (req, res) => {
      const { email } = req.query;
      try {
        const applications = await applicationCollection.find({ email }).toArray();
        res.send(applications);
      } catch (err) {
        console.error("Error fetching applications:", err);
        res.status(500).send({ message: "Failed to fetch applications", error: err.message });
      }
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
  }
}

run();

app.get("/", (req, res) => {
  res.send("hello");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
