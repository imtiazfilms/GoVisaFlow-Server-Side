const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();

const uri = "mongodb+srv://imtiaz-visa-flow:xNFY8jcMlOhNSxXh@cluster0.8kima.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.use(express.json());
app.use(cors());

async function run() {
    try {
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    catch (err) {
        console.log(err)
    }
}

run()

app.get("/", (req, res) => {
    res.send("hello")
})

app.listen(port, () => {
    console.log("Server is running")
})