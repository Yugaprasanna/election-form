const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Set relaxed CSP for development
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; style-src 'self' 'unsafe-inline';"
    );
    next();
  });
}

// Connect to MongoDB Atlas
mongoose
  .connect(
    "mongodb+srv://election-form:1BdKL6xIzlEu4ZZo@atlascluster.q3bmrqh.mongodb.net/election_datas?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Schema and Model
// Schema and Model
const formSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  mobile: { type: String, unique: true }, // Updated from `phone` to `mobile`
  address1: String,
  address2: String,
  address3: String,
  address4: String,
  fatherName: String,
  motherName: String,
  constituency: String,
  wardNumber: String,
  pinCode: String,
  state: String,
  district: String,
});

const Form = mongoose.model("Form", formSchema);

// Routes
app.post("/submit-form", async (req, res) => {
  try {
    const { email, mobile } = req.body; // Updated `phone` to `mobile`

    // Check if the email or mobile number already exists in the database
    const existingForm = await Form.findOne({
      $or: [{ email }, { mobile }], // Updated `phone` to `mobile`
    });

    if (existingForm) {
      let errorMessage = "";
      if (existingForm.email === email) {
        errorMessage += "Email is already registered. ";
      }
      if (existingForm.mobile === mobile) { // Updated `phone` to `mobile`
        errorMessage += "Mobile number is already registered.";
      }
      return res.status(400).send(errorMessage.trim());
    }

    // Create a new form entry
    const newForm = new Form(req.body);
    await newForm.save();

    res.status(200).send("Form submitted successfully.");
  } catch (error) {
    console.error("Error saving form data:", error);
    res.status(500).send("Failed to submit form.");
  }
});




// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
