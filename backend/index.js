const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const UserModel = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");

const Ticket = require("./models/Ticket");

const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = "bsbsfbrnsftentwnnwnwn";

//image upload related
const router = express.Router();
const uploadPhoto = multer({ dest: "uploads/" }); // Set the upload directory

// Import WebSocket
const WebSocket = require('ws');

app.use(express.json());
app.use(cookieParser());
app.use(
   cors({
      credentials: true,
      origin: "http://localhost:5173",
   })
);

mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));


const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, "uploads/");
   },
   filename: (req, file, cb) => {
      cb(null, file.originalname);
   },
});

const upload = multer({ storage });
 

// Store connected clients
const clients = new Set();
const server = require('http').createServer(app);
// Attach WebSocket server to the same HTTP server
const wss = new WebSocket.Server({ server });

// Broadcast function
const broadcast = (message) => {
   console.log("message", message)
   clients.forEach(client => {
     if (client.readyState === WebSocket.OPEN) {
       client.send(JSON.stringify(message));
     }
   });
 };

 // Handle WebSocket connections
 wss.on('connection', (ws) => {
   console.log('WebSocket client connected');
   clients.add(ws);
 
   ws.on('close', () => {
     console.log('WebSocket client disconnected');
     clients.delete(ws);
   });
 
   ws.on('error', (err) => console.error('WebSocket error:', err));
 });
 
 // Notify all clients when an event is created
 const notifyEventCreated = (eventName) => {
   broadcast({
     type: 'eventCreated',
     content: `A new event "${eventName}" has been created!`
   });
 };
 
 // Notify all clients when a user signs up for an event
 const notifyUserSignedUp = (eventName, userName) => {
   broadcast({
     type: 'userSignedUp',
     content: `${userName} has signed up for the event "${eventName}".`
   });
 };
 
 // Notify all clients when an event is liked
 const notifyEventLiked = (eventName, userName) => {
   broadcast({
     type: 'eventLiked',
     content: `${userName} liked the event "${eventName}".`
   });
 };



app.get("/test", (req, res) => {
   res.json("test ok");
});

//Add a simple test route to verify database connectivity
app.get('/test-db', async (req, res) => {
   try {
     const events = await Event.find();
     res.json(events);
   } catch (error) {
     console.error('Database error:', error);
     res.status(500).json({ error: 'Database connection failed' });
   }
 });
//ends here

app.post("/register", async (req, res) => {
   // const { name, email, password } = req.body;

   // try {
   //    const userDoc = await UserModel.create({
   //       name,
   //       email,
   //       password: bcrypt.hashSync(password, bcryptSalt),
   //    });
   //    res.json(userDoc);
   // } catch (e) {
   //    res.status(422).json(e);
   // }
   const { name, email, password } = req.body;

   console.log("Incoming register request:");
   console.log("Name:", name);
   console.log("Email:", email);

   try {
      // Hash the password before storing it
      const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
      console.log("Hashed Password:", hashedPassword);

      // Attempt to create the user
      const userDoc = await UserModel.create({
         name,
         email,
         password: hashedPassword,
      });

      console.log("User created successfully:", userDoc);
      res.json(userDoc);
   } catch (error) {
      console.error("Error during registration:", error.message);
      res.status(422).json({ error: "Failed to register user", details: error });
   }
});

app.post("/login", async (req, res) => {
   const { email, password } = req.body;

   const userDoc = await UserModel.findOne({ email });

   if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
   }

   const passOk = bcrypt.compareSync(password, userDoc.password);
   if (!passOk) {
      return res.status(401).json({ error: "Invalid password" });
   }

   jwt.sign(
      {
         email: userDoc.email,
         id: userDoc._id,
      },
      jwtSecret,
      {},
      (err, token) => {
         if (err) {
            return res.status(500).json({ error: "Failed to generate token" });
         }
         res.cookie("token", token).json(userDoc);
      }
   );
});

app.get("/profile", (req, res) => {
   const { token } = req.cookies;
   if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, userData) => {
         if (err) throw err;
         const user = await UserModel.findById(userData.id);
         console.log("user", user)
         if (user) {
            const { name, email, _id, image } = user;
            res.json({ name, email, _id, image });
         }
      });
   } else {
      res.json(null);
   }
});

app.post("/logout", (req, res) => {
   res.cookie("token", "").json(true);
});

const eventSchema = new mongoose.Schema({
   owner: String,
   title: String,
   description: String,
   organizedBy: String,
   eventDate: Date,
   eventTime: String,
   location: String,
   Participants: Number,
   Count: Number,
   Income: Number,
   ticketPrice: Number,
   Quantity: Number,
   image: String,
   likes: Number,
   Comment: [String],
});

const Event = mongoose.model("Event", eventSchema);


//image upload related
app.use("/uploads", express.static("uploads"));

app.post("/createEvent", upload.single("image"), async (req, res) => {
   console.log("Incoming request to /createEvent:");
   console.log("Request body:", req.body);
   console.log("Uploaded file:", req.file);

   try {
      const eventData = req.body;
      eventData.image = `/uploads/${req.file.filename}`;
      const newEvent = new Event({...eventData, likes: 0});
      await newEvent.save();
      notifyEventCreated(newEvent.title);
      console.log("Event saved successfully:", newEvent);
      res.status(201).json(newEvent);
   } catch (error) {
      console.error("Error saving event:", error);
      res.status(500).json({ error: "Failed to save event to MongoDB" });
   }
});

app.get("/createEvent", async (req, res) => {
   try {
      const events = await Event.find();
      res.status(200).json(events);
   } catch (error) {
      res.status(500).json({ error: "Failed to fetch events from MongoDB" });
   }
});

app.get("/event/:id", async (req, res) => {
   const { id } = req.params;
   try {
      const event = await Event.findById(id);
      res.json(event);
   } catch (error) {
      res.status(500).json({ error: "Failed to fetch event from MongoDB" });
   }
});

app.post("/event/:eventId", (req, res) => {
   const eventId = req.params.eventId;

   Event.findById(eventId)
      .then((event) => {
         if (!event) {
            return res.status(404).json({ message: "Event not found" });
         }
         console.log("event", event)
         event.likes += 1;
         return event.save();
      })
      .then((updatedEvent) => {
         res.json(updatedEvent);
      })
      .catch((error) => {
         console.error("Error liking the event:", error);
         res.status(500).json({ message: "Server error" });
      });
});

app.get("/events", (req, res) => {
   Event.find()
      .then((events) => {
         res.json(events);
      })
      .catch((error) => {
         console.error("Error fetching events:", error);
         res.status(500).json({ message: "Server error" });
      });
});

app.get("/event/:id/ordersummary", async (req, res) => {
   const { id } = req.params;
   try {
      const event = await Event.findById(id);
      res.json(event);
   } catch (error) {
      res.status(500).json({ error: "Failed to fetch event from MongoDB" });
   }
});

app.get("/event/:id/ordersummary/paymentsummary", async (req, res) => {
   const { id } = req.params;
   try {
      const event = await Event.findById(id);
      res.json(event);
   } catch (error) {
      res.status(500).json({ error: "Failed to fetch event from MongoDB" });
   }
});

app.post("/tickets", async (req, res) => {
   try {
      const ticketDetails = req.body;
      const newTicket = new Ticket(ticketDetails);
      await newTicket.save();
      return res.status(201).json({ ticket: newTicket });
   } catch (error) {
      console.error("Error creating ticket:", error);
      return res.status(500).json({ error: "Failed to create ticket" });
   }
});

app.get("/tickets/:id", async (req, res) => {
   try {
      const tickets = await Ticket.find();
      res.json(tickets);
   } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ error: "Failed to fetch tickets" });
   }
});

app.get("/tickets/user/:userId", (req, res) => {
   const userId = req.params.userId;

   Ticket.find({ userid: userId })
      .then((tickets) => {
         res.json(tickets);
      })
      .catch((error) => {
         console.error("Error fetching user tickets:", error);
         res.status(500).json({ error: "Failed to fetch user tickets" });
      });
});

app.delete("/tickets/:id", async (req, res) => {
   try {
      const ticketId = req.params.id;
      await Ticket.findByIdAndDelete(ticketId);
      res.status(204).send();
   } catch (error) {
      console.error("Error deleting ticket:", error);
      res.status(500).json({ error: "Failed to delete ticket" });
   }
});


//image upload related
app.use("/uploads", express.static("uploads"));

app.post("/api/upload-profile-photo", upload.single("image"), async (req, res) => {
   try {
     const { email } = req.body;
     const imageUrl = `/uploads/${req.file.filename}`;
 
     // Update user's profile photo in the database
     const user = await UserModel.findOneAndUpdate({ email }, { image: imageUrl });
 
     res.json({ imageUrl });
   } catch (error) {
     console.error("Error uploading profile photo:", error);
     res.status(500).send("Failed to upload profile photo.");
   }
 });

 app.post('/notifications/events', (req, res) => {
   const { eventName } = req.body;
   
   // Logic for creating an event in the database
   // ...
 
   // Notify all clients
   notifyEventCreated(eventName);
 
   res.status(201).json({ message: 'Event created successfully!' });
 });

 app.post('/notifications/events/signup', (req, res) => {
   const { userName, eventName } = req.body;
 
   // Logic for user signup
   // ...
 
   // Notify all clients
   notifyUserSignedUp(eventName, userName);
 
   res.status(200).json({ message: 'Signed up successfully!' });
 });

 app.post('/notifications/events/like', (req, res) => {
   const { userName, eventName } = req.body;
 
   // Logic for liking an event
   // ...
 
   // Notify all clients
   notifyEventLiked(eventName, userName);
 
   res.status(200).json({ message: 'Event liked successfully!' });
 });
 
 
module.exports = router;

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
   console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
