import express from "express";
import session from "express-session";
import bodyParser from "body-parser";

const app = express();
const PORT = 7700;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

app.set("view engine", "ejs");

app.use(
  session({
    secret: "mysecret",
    cookie: { maxAge: 300000 },
    saveUninitialized: true,
  })
);

app.get("/set/:name", (req, res) => {
  req.session.user = { name: req.params.name };
  res.json({ message: "Logged in, now you can access the page" });
});

app.get("/getname", (req, res) => {
  if (!req.session.user?.name) {
    return res.status(403).json({ error: "please log in" });
  }
  return res.json({ message: `Hello ${req.session.user.name} welcome back` });
});

app.get("/login", (req, res) => {
  console.log(`first:${req.sessionID}`);
  return res.render("index");
});

app.post("/connect", (req, res) => {
  console.log(`second:${req.sessionID}`);
  const { login, password } = req.body;

  if (password === "doe" && login === "john") {
    req.session.isConnected = true;
    return res.redirect("/admin");
  } else {
    return res.redirect("/login");
  }
});

app.get("/admin", (req, res) => {
  if (req.session.isConnected) {
    res.send("Successfully loged in!");
  } else {
    return res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) return res.json(error.message);
  });
  res.json({ message: "session destroyed" });
});

app.listen(PORT, () => {
  console.log(`Your app listening on port ${PORT}`);
});
