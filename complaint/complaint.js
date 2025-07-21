const express = require("express");
const app = express();
const bp = require("body-parser");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

const uri = "mongodb+srv://srikanthperi77:srikanth2004@cluster0.gzdok.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


app.use(bp.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

let dbClient; 


async function connectToDB() {
  if (!dbClient) {
    try {
      dbClient = new MongoClient(uri);
      await dbClient.connect();
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      process.exit(1); 
    }
  }
}


connectToDB();


app.get("/", async (req, res) => {
  try {
    const storage = dbClient.db("complaintsDB").collection("complaints");

    const complaints = await storage.find({}).sort({ likes: -1 }).toArray();
    res.render("home", { complaints });
  } catch (error) {
    console.log("Error fetching complaints:", error);
  }
});

app.get("/form", (req, res) => {
  res.render("form");
});


app.post("/form", async (req, res) => {
  const data = req.body; 
  console.log("Form data received:", data);

  try {
    const storage = dbClient.db("complaintsDB").collection("complaints");
    await storage.insertOne({ ...data, likes: 0 });
    console.log("Data submitted:", data);
    res.redirect("/");
  } catch (error) {
    console.log("Error inserting complaint:", error);
  }
});


app.post("/like/:id", async (req, res) => {
  const complaintId = req.params.id;
  try {
    const storage = dbClient.db("complaintsDB").collection("complaints");
    await storage.updateOne(
      { _id: new ObjectId(complaintId) },
      { $inc: { likes: 1 } }
    );
    
    res.redirect("/");
  } catch (error) {
    console.log("Error adding like:", error);

  }
});


app.post("/filter", async (req, res) => {
  const filter = req.body.filtervalue;  
  try {
    const storage = dbClient.db("complaintsDB").collection("complaints");

    
    let query = {};
    if (filter !== "all") {
      query = { department: filter };
    }

    const filteredComplaints = await storage.find(query).toArray();
    res.render("home", { complaints: filteredComplaints });
  } catch (error) {
    console.log("Error filtering complaints:", error);
  }
});


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
