import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import { Router } from "express";

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
  console.log(`first:${req.sessionID}`);
  return res.render("index");
});

sessionRoute.post("/connect", (req, res) => {
  console.log(`second:${req.sessionID}`);
  const { login, password } = req.body;
  console.log(req.session);
  console.log(store);

  if (password === "doe" && login === "john") {
    req.session.isConnected = true;
    req.session.user = { login, password };
    return res.redirect("/admin");
  } else {
    return res.redirect("/session/login");
  }
});

sessionRoute.get("/admin", (req, res) => {
  if (req.session.isConnected) {
    console.log(req.session);
    console.log(store);
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
