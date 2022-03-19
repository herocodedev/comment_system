require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;

const cors = require("cors");
app.use(cors());

const socketio = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const io = socketio(server);

// MongoDB
const mongoose = require("mongoose");
const MONGO_URL =
  "mongodb+srv://admin:123456abc@cluster0.y9xdo.mongodb.net/COMMENT?retryWrites=true&w=majority";
const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log(">>>>>>>>>>>>>>>> Connect Successfully! <<<<<<<<<<<<<<<<<");
  } catch (error) {
    console.log(error);
    console.log("Connect fail!");
  }
};

connectMongoDB();

// Router
app.get("/", (req, res, next) => {
  res.send("Hello");
});

const Comment = require("./models/Comments");
io.on("connection", async (socket) => {
  console.log("A user connected");
  // Get comment from db
  await Comment.find({}).then((result) => {
    // console.log(data);
    socket.emit("comment", result);
  });

  // Send comment
  socket.on("sendComment", async (comment, callback) => {
    if (comment) {
      const newComment = new Comment({ comment });
      await newComment.save();
      console.log(newComment);
      io.emit("comment", [newComment]);
      callback();
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
