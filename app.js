const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bodyParser = require("body-parser");
const session = require("express-session");
const expressValidator = require("express-validator");
const hbs = require("hbs");
const partialpath = path.join(__dirname, "views/partials");

// connection for db
const mongoose = require("mongoose");
require("dotenv").config();

hbs.registerPartials(partialpath);

const usersRouter = require("./routes/users");
const adminRouter = require("./routes/admin");
const categoryRouter = require("./routes/category");
const productRouter = require("./routes/product");
const offerRouter = require("./routes/offers");

const { log } = require("console");
const moment = require("moment/moment");
const app = express();

//db
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
  })
  .then(() => console.log("DB connected"));

// view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "hbs");

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

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
hbs.registerHelper('if_or', function (a, b, opts) {
  if (a || b)
    // Or === depending on your needs
    return opts.fn(this);
  else return opts.inverse(this);
});
hbs.registerHelper('formatTime', function (date, format) {
  var mmnt = moment(date);
  return mmnt.format(format);
});
// app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))
app.use(expressValidator());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json())

app.use(
  session({
    secret: "key",
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false,
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});

app.use("/", usersRouter);
app.use("/admin", adminRouter);
app.use("/category", categoryRouter);
app.use("/product", productRouter);
app.use("/offers", offerRouter);

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
