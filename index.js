const express = require("express");
const express_fileupload = require("express-fileupload");
require("express-async-errors");
const cors = require("cors");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize");

const db = require("./src/models/index.js");
const dotenv = require("dotenv");
const errorHandlerMiddleware = require("./src/middleware/error_handler.js");
const not_found = require("./src/middleware/not_found.js");

const auth_router = require("./src/routes/auth.route.js");
const user_status_router = require("./src/routes/user_status.route.js");
const location_router = require("./src/routes/location.route.js");
const devision_router = require("./src/routes/devision.route.js");
const ticket_access_router = require("./src/routes/ticket_access.route.js");
const ticket_category_router = require("./src/routes/ticket_category.route.js");
const ticket_status_router = require("./src/routes/ticket_status.route.js");
const area_router = require("./src/routes/area.route.js");
const application_router = require("./src/routes/application.route.js");
const company_router = require("./src/routes/company.route.js");
const customer_router = require("./src/routes/customer.route.js");
const shift_schedule_router = require("./src/routes/shift_schedule.route.js");
const user_shift_schedule_router = require("./src/routes/user_shift_schedule.route.js");
const ticket_router = require("./src/routes/ticket.route.js");
const ticket_attachment_router = require("./src/routes/ticket_attachment.route.js");
const ticket_activity_router = require("./src/routes/ticket_activities.route.js");
const ticket_activity_attachment_router = require("./src/routes/ticket_activity_attachment.route.js");
const ticket_activity_comment_router = require("./src/routes/ticket_activity_comment.route.js");
const ticket_user_reminder_router = require("./src/routes/ticket_user_reminder.route.js");
const user_router = require("./src/routes/user.route.js");

const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config();

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
  db: db.sequelize,
});

app.use(
  session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
      secure: "auto",
      expires: 1000 * 60 * 60 * process.env.SESS_EXPIRES,
    },
  })
);

app.use(
  cors({
    credentials: true,
    origin: [process.env.LINK_FRONTEND],
  })
);

app.use(express.json());
app.use(express_fileupload());
app.use(express.static("public"));

//route
app.use("/api/v1/auth", auth_router);
app.use("/api/v1/user_status", user_status_router);
app.use("/api/v1/location", location_router);
app.use("/api/v1/devision", devision_router);
app.use("/api/v1/ticket_access", ticket_access_router);
app.use("/api/v1/ticket_category", ticket_category_router);
app.use("/api/v1/ticket_status", ticket_status_router);
app.use("/api/v1/area", area_router);
app.use("/api/v1/application", application_router);
app.use("/api/v1/company", company_router);
app.use("/api/v1/customer", customer_router);
app.use("/api/v1/shift_schedule", shift_schedule_router);
app.use("/api/v1/user_shift_schedule", user_shift_schedule_router);
app.use("/api/v1/ticket", ticket_router);
app.use("/api/v1/ticket_attachment", ticket_attachment_router);
app.use("/api/v1/ticket_activity", ticket_activity_router);
app.use(
  "/api/v1/ticket_activity_attachment",
  ticket_activity_attachment_router
);
app.use("/api/v1/ticket_activity_comment", ticket_activity_comment_router);
app.use("/api/v1/ticket_user_reminder", ticket_user_reminder_router);
app.use("/api/v1/user", user_router);

app.use(errorHandlerMiddleware);
app.use(not_found);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
