import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import { Router } from "express";
import bcrypt from "bcrypt";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.CONNECTION_STRING,
});

const app = express();
const PORT = process.env.PORT || 9000;
const store = new session.MemoryStore();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

app.use(
  session({
    secret: "mysecret",
    cookie: { maxAge: 300000 },
    saveUninitialized: true,
    resave: true,
    store,
  })
);

const sessionRoute = Router();
app.use("/session", sessionRoute);

app.set("view engine", "ejs");

sessionRoute.get("/set/:name", (req, res) => {
  req.session.user = { name: req.params.name };
  res.json({ message: "Logged in, now you can access the page" });
});

sessionRoute.get("/getname", (req, res) => {
  if (!req.session.user?.name) {
    return res.status(403).json({ error: "please log in" });
  }
  return res.json({ message: `Hello ${req.session.user.name} welcome back` });
});

sessionRoute.get("/login", (req, res) => {
  // console.log(`first:${req.sessionID}`);
  return res.render("index");
});

sessionRoute.post("/connect", async (req, res) => {
  // console.log(`second:${req.sessionID}`);
  const { login, password } = req.body;
  // console.log(req.session);
  // console.log(store);

  const myQuery = "SELECT * FROM entries WHERE login = $1 AND password = $2";
  const { rows: entry } = await pool.query(myQuery, [login, password]);
  console.log(entry);

  if (entry.length !== 0) {
    req.session.isConnected = true;
    req.session.user = { login, password };
    return res.redirect("/session/admin");
  } else {
    return res.redirect("/session/login");
  }
});

sessionRoute.get("/admin", (req, res) => {
  if (req.session.isConnected) {
    // console.log(req.session);
    // console.log(store);
    res.send("Successfully loged in!");
  } else {
    return res.redirect("/session/login");
  }
});

sessionRoute.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) return res.json(error.message);
  });
  res.json({ message: "session destroyed" });
});

app.listen(PORT, () => {
  console.log(`Your app listening on port ${PORT}`);
});
