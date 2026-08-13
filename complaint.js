// Complaint management application
// Updated complaint application
const express = require("express");

const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

const uri = "mongodb+srv://srikanthperi77:srikanth2004@cluster0.gzdok.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

app.use(bodyParser.urlencoded({ extended: true }));


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

let dbClient;

async function connectToDB() {
  if (!dbClient) {
    try {
      dbClient = new MongoClient(uri);
      await dbClient.connect();
      console.log("✅ Connected to MongoDB");
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error);
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
    res.status(500).send("Error loading page");
  }
});

// Show form
app.get("/form", (req, res) => {
  res.render("form");
});

// Submit complaint
app.post("/form", async (req, res) => {
  const data = req.body;

  try {
    const storage = dbClient.db("complaintsDB").collection("complaints");

    const complaintData = {
      name: data.name,
      reg_no: data.reg_no,
      com_type: data.com_type,
      department: data.department,
      likes: 0
    };

    await storage.insertOne(complaintData);
    console.log("✅ Complaint submitted:", complaintData);

    res.redirect("/");
  } catch (error) {
    console.log("❌ Error inserting complaint:", error);
    res.status(500).send("Error submitting complaint");
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
    console.log("❌ Error adding like:", error);
    res.status(500).send("Error liking complaint");
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

    const filteredComplaints = await storage.find(query).sort({ likes: -1 }).toArray();
    res.render("home", { complaints: filteredComplaints });
  } catch (error) {
    console.log("❌ Error filtering complaints:", error);
    res.status(500).send("Error filtering complaints");
  }
});


app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
