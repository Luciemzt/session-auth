require("dotenv").config();
const express = require("express");
const connectDb = require("./configs/db.config");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const connectSession = require("./configs/session.config");
const authRoutes = require("./routes/auth.routes");
const app = express();

connectDb();
connectSession(app);

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send(req.session));
app.use("/auth", authRoutes);

app.listen(process.env.PORT, () => console.log("server running on port 4000"));
