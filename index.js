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
    await client.connect();
    console.log("Successfully connected to MongoDB!");

    const database = client.db("visaFlow");
    const visaCollection = database.collection("visas");
    const applicationCollection = database.collection("applications");

    app.post("/visas", async (req, res) => {
      const visaData = req.body;
      try {
        const result = await visaCollection.insertOne(visaData);
        res.status(201).send({ message: "Visa added successfully", result });
      } catch (err) {
        console.error("Error adding visa:", err);
        res.status(500).send({ message: "Failed to add visa", error: err.message });
      }
    });

    app.get("/visas", async (req, res) => {
      try {
        const visas = await visaCollection.find().toArray();
        res.send(visas);
      } catch (err) {
        console.error("Error fetching visas:", err);
        res.status(500).send({ message: "Failed to fetch visas", error: err.message });
      }
    });

    app.get("/addedVisas", async (req, res) => {
        const { email } = req.query;
        try {
          const visas = await visaCollection.find({ email }).toArray();
          console.log('Visas fetched from DB:', visas);
          
          if (visas.length === 0) {
            return res.status(404).send({ message: "No visas found for this user" });
          }
          
          res.send(visas);
        } catch (err) {
          console.error("Error fetching added visas:", err);
          res.status(500).send({ message: "Failed to fetch added visas", error: err.message });
        }
      });
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

    app.post("/visaApplications", async (req, res) => {
      const applicationData = req.body;
      try {
        const result = await applicationCollection.insertOne(applicationData);
        res.status(201).send({ message: "Application submitted successfully", result });
      } catch (err) {
        console.error("Error adding application:", err);
        res.status(500).send({ message: "Failed to save application", error: err.message });
      }
    });

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

    app.put('/visas/:id', async (req, res) => {
        try {
          const visaId = req.params.id;
          const updatedVisa = req.body;
          const updatedVisaData = await Visa.findByIdAndUpdate(visaId, updatedVisa, { new: true });
          if (!updatedVisaData) {
            return res.status(404).json({ message: "Visa not found." });
          }
          res.status(200).json(updatedVisaData);
        } catch (error) {
          console.error("Error updating visa:", error);
          res.status(500).json({ message: "Failed to update visa." });
        }
      });

      app.delete("/visas/:id", async (req, res) => {
        const { id } = req.params;
        try {
          const result = await visaCollection.deleteOne({ _id: new ObjectId(id) });
          if (result.deletedCount > 0) {
            res.send({ message: "Visa deleted successfully" });
          } else {
            res.status(404).send({ message: "Visa not found" });
          }
        } catch (err) {
          console.error("Error deleting visa:", err);
          res.status(500).send({ message: "Failed to delete visa", error: err.message });
        }
      });

    app.delete("/visaApplications/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const result = await applicationCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount > 0) {
          res.send({ message: "Application successfully deleted" });
        } else {
          res.status(404).send({ message: "Application not found" });
        }
      } catch (err) {
        console.error("Error deleting application:", err);
        res.status(500).send({ message: "Failed to delete application", error: err.message });
      }
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
  }
}

run();

app.get("/", (req, res) => {
  res.send("Hello, Visa Flow is running!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
