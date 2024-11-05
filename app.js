const express = require('express')
const dotenv = require('dotenv');
const connectDB = require("./DB/connect");
const cors = require("cors");
const { notFound, errorHandler } = require("./Middlewares/errorUtils");
const cookieParser = require("cookie-parser");

//Routes
const userRoutes = require("./Routes/userRoutes");



// app
const app = express();

//DB connection
connectDB();

//middlewares
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Middleware for handling 404 (Not Found) errors
app.use(notFound);

// Middleware for handling errors
app.use(errorHandler);

module.exports = app;