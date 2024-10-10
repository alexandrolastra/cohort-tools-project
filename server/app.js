require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const PORT = 5005;
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./model/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("./middlewares/route-guard.middleware");
// STATIC DATA
// Devs Team - Import the provided files with JSON data of students and cohorts here:
const cohorts = require("./cohorts.json");
const students = require("./students.json");

// INITIALIZE EXPRESS APP - https://expressjs.com/en/4x/api.html#express
const app = express();
const Cohort = require("./model/Cohorts.model");
const Student = require("./model/Students.model");
// MIDDLEWARE
// Research Team - Set up CORS middleware here:
/* app.use(
  cors({
    // Add the URLs of allowed origins to this array
    origin: ["http://localhost:5005", "http://example.com"],
  })
); */
app.use(express.json());

app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const MONGODB_URI = "mongodb://127.0.0.1:27017/cohort-tools-api";

mongoose
  .connect(MONGODB_URI)
  .then((x) =>
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  )
  .catch((err) => console.error("Error connecting to mongo", err));

// ROUTES - https://expressjs.com/en/starter/basic-routing.html
// Devs Team - Start working on the routes here:

// authentification route

app.post("/signup", (req, res, next) => {
  const userToCreate = req.body;
  const salt = bcrypt.genSaltSync(13);

  userToCreate.passwordHash = bcrypt.hashSync(req.body.password, salt); //Pay attention
  User.create(userToCreate)
    .then((newUser) => {
      res.status(201).json(newUser);
    })
    .catch((error) => {
      next(error);
    });
});

app.post("/login", (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((potentialUser) => {
      if (potentialUser) {
        if (bcrypt.compareSync(req.body.password, potentialUser.passwordHash)) {
          console.log(process.env.TOKEN_SECRET);
          const authToken = jwt.sign(
            { userId: potentialUser._id },
            process.env.TOKEN_SECRET,
            {
              algorithm: "HS256",
              expiresIn: "5h",
            }
          );
          res.json({ token: authToken });
        } else {
          res.json({ message: "Incorrect password" });
        }
      } else {
        res.json({ message: "No user with this username" });
      }
    })
    .catch((error) => {
      next(error);
    });
});

app.get("/verify", isAuthenticated, (req, res, next) => {
  User.findById(req.tokenPayload.userId)
    .then((currentUser) => {
      res.json(currentUser);
    })
    .catch((error) => {
      next(error);
    });
});

app.get("/api/users/:id", isAuthenticated, (req, res, next) => {
  const { id } = req.params;
  User.findById(id)
    .then((currentUser) => {
      res.json(currentUser);
    })
    .catch((error) => {
      next(error);
    });
});
app.get("/api/cohorts", (req, res) => {
  Cohort.find()
    .then((allCohorts) => {
      res.status(200).json(allCohorts);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

app.get("/api/cohorts/:id", (req, res, next) => {
  Cohort.findById(req.params.id)
    .then((cohort) => {
      res.status(200).json(cohort);
    })
    .catch((error) => {
      next(error);
      // res.status(500).json({ error });
    });
});

app.put("/api/cohorts/:id", (req, res) => {
  Cohort.findByIdAndUpdate(req.params.id, req.body)
    .then((updateCohort) => {
      res.status(200).json(updateCohort);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

app.post("/api/cohorts", (req, res) => {
  Cohort.create(req.body)
    .then((createdCohort) => {
      res.status(201).json(createdCohort);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json(error);
    });
});

app.delete("/cohorts/:id", (req, res) => {
  Cohort.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).send();
    })
    .catch((error) => {
      console.log(error);
      res.json(error);
      res.status(400).json({ error });
    });
});

app.get("/api/students", (req, res) => {
  Student.find()
    .then((allStudents) => {
      res.status(200).json(allStudents);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

app.get("/api/students/:id", (req, res) => {
  Student.findById(req.params.id)
    .then((student) => {
      res.status(200).json(student);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

app.put("/api/students/:id", (req, res) => {
  Student.findByIdAndUpdate(req.params.id, req.body)
    .then((updateStudent) => {
      res.status(200).json(updateStudent);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
});

app.post("/students", (req, res) => {
  Student.create(req.body)
    .then((createdStudent) => {
      res.status(201).json(createdStudent);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json(error);
    });
});

app.delete("/students/:id", (req, res) => {
  Student.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).send();
    })
    .catch((error) => {
      console.log(error);
      res.json(error);
      res.status(400).json({ error });
    });
});

app.get("/docs", (req, res) => {
  res.sendFile(__dirname + "/views/docs.html");
});
app.get("/api/cohorts", (req, res) => {
  res.json(cohorts);
});

app.get("/api/students", (req, res) => {
  res.json(students);
});
require("./error-handling")(app);
// START SERVER
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
