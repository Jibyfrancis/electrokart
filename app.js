var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var hbs = require("express-handlebars");
var session = require("express-session");
var db = require("./config/connections");
var hbs = require("hbs");
var adminRouter = require("./routes/admin");
var userRouter = require("./routes/user");
require('dotenv').config()

var app = express();

// view engine setup
const partialPath = path.join(__dirname, "views/partials");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
hbs.registerPartials(partialPath);
// app.engine('hbs',hbs.engine ({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))

app.use(
  session({
    secret: "key",
    cookie: { maxAge: 6000 * 60 * 60 * 24 },
  })
);


app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use(express.static(path.join(__dirname, 'public/admin/')));

db.connect((err) => {
  if (err) console.log("connection error");
  else console.log("db connected");
});

app.use((req, res, next) => {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});

// handlebar Indexin

hbs.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});

hbs.registerHelper('ifCond', function (v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

hbs.registerHelper('if_eq', function (a, b, opts) {
  if (a == b)
    // Or === depending on your needs
    return opts.fn(this);
  else return opts.inverse(this);
});

hbs.registerHelper('if_Neq', function (a, b, opts) {
  if (a != b)
    // Or === depending on your needs
    return opts.fn(this);
  else return opts.inverse(this);
});

app.use("/", userRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
