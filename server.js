// const express = require("express");
// const cors = require("cors");
// const fs = require("fs");
// const path = require("path");

// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(express.json());
// app.use(express.static(path.join(__dirname, "public")));
// app.post("/payment-success", (req, res) => {
//   const { name, email, mobile, address, aadhaar, plan } = req.body;

//   // ✅ Simple validation
//   if (!name || !email || !mobile || !address || !aadhaar || !plan) {
//     return res.status(400).json({ error: "Missing fields" });
//   }

//   // ✅ Load existing data
//   const dataPath = path.join(__dirname, "registrations.json");
//   let existingData = [];

//   if (fs.existsSync(dataPath)) {
//     existingData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
//   }

//   // ✅ Add new registration
//   existingData.push({ name, email, mobile, address, aadhaar, plan, timestamp: new Date().toISOString() });

//   // ✅ Save to file
//   fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2));

//   console.log("✅ Payment received and saved:", req.body);
//   res.status(200).json({ message: "Payment recorded successfully!" });
// });
// app.get("/registrations", (req, res) => {
//   const dataPath = path.join(__dirname, "registrations.json");

//   if (!fs.existsSync(dataPath)) {
//     return res.json([]); // Return empty array if file doesn't exist yet
//   }

//   const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
//   res.json(data);
// });


// app.listen(PORT, () => {
//   console.log(`✅ Server listening on http://localhost:${PORT}`);
// });
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const app = express();
// const PORT = 3000;
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ Setup Gmail transporter using App Password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// ✅ Route to receive registration & send email
app.post("/payment-success", (req, res) => {
  const { name, email, mobile, address, aadhaar, plan } = req.body;

  // ✅ Check for missing fields
  if (!name || !email || !mobile || !address || !aadhaar || !plan) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // ✅ Load existing data
  const dataPath = path.join(__dirname, "registrations.json");
  let existingData = [];

  if (fs.existsSync(dataPath)) {
    existingData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  }

  // ✅ Add new registration
  const newEntry = {
    name,
    email,
    mobile,
    address,
    aadhaar,
    plan,
    timestamp: new Date().toISOString()
  };
  existingData.push(newEntry);

  // ✅ Save to JSON file
  fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2));

  // ✅ Send confirmation email to admin
  const mailOptions = {
    from: '"SK Gym" <srikanth1282004@gmail.com>',
    to: "srikanth1282004@gmail.com",   // You can add multiple emails like "you@gmail.com, another@gmail.com"
    subject: "💪 New Gym Registration",
    text: `
📌 New member registered:

👤 Name: ${name}
📧 Email: ${email}
📱 Mobile: ${mobile}
🏠 Address: ${address}
🆔 Aadhaar: ${aadhaar}
💳 Plan: ${plan}
📅 Time: ${newEntry.timestamp}
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Failed to send email:", error);
      return res.status(500).json({ error: "Email send failed" });
    }

    console.log("📧 Email sent:", info.response);
    res.status(200).json({ message: "Payment recorded and email sent!" });
  });
});

// ✅ Get all registrations (for admin)
app.get("/registrations", (req, res) => {
  const dataPath = path.join(__dirname, "registrations.json");

  if (!fs.existsSync(dataPath)) {
    return res.json([]);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  res.json(data);
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`🌐 Server running at http://192.168.137.163:${PORT}`);
// });
