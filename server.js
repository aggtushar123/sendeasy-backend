const app = require("./app");
const express = require("express");
const passport = require("passport");
const cookieSession = require("cookie-session");
const { errorHandler } = require("./middleware/errorMiddleware");
const PORT = process.env.PORT || 5000;
const connectDB = require("./config/db");
const cors = require("cors");
const passportSetup = require("./passport");
const GoogleAuthRoutes = require("./user/googleAuth");
const FacebookAuthRoutes = require("./user/FacebookAuth");

//Connect to Database
connectDB();

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to Send Easy" });
});

//Routes
app.use("/api/users", require("./user/userRoutes"));
app.use("/api/listing", require("./listing/listingRoutes"));
app.use("/api/chats", require("./chat/chatRoutes"));
app.use("/api/message", require("./message/messageRoutes"));
app.use("/api/booking", require("./booking/bookingRoutes"));
app.use(errorHandler);
app.use(
  cookieSession({
    name: "Session",
    keys: ["aryansaini"],
    maxAge: 24 * 60 * 60 * 100,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use("/auth", GoogleAuthRoutes);
app.use("/authFacebook", FacebookAuthRoutes);

const server = app.listen(PORT, () =>
  console.log(`Server sarted on port ${PORT}`)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
