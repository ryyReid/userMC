const express = require("express");
const multer = require("multer");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("."));
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".png");
  }
});

const upload = multer({ storage });

app.post("/upload", upload.single("skin"), (req, res) => {

  const newSkin = {
    name: req.body.name,
    description: req.body.description,
    file: req.file.filename
  };

  let skins = [];

  if (fs.existsSync("skins.json")) {
    skins = JSON.parse(fs.readFileSync("skins.json"));
  }

  skins.push(newSkin);

  fs.writeFileSync("skins.json", JSON.stringify(skins, null, 2));

  res.json({ success: true });
});

app.get("/skins", (req, res) => {

  if (!fs.existsSync("skins.json")) {
    return res.json([]);
  }

  const skins = JSON.parse(fs.readFileSync("skins.json"));

  res.json(skins);
});

app.listen(PORT, () =>
  console.log("Server running http://localhost:" + PORT)
);
