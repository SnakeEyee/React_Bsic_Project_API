const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const BodyParser = require("body-parser");
app.use(express.json());
const { createDatabase } = require("./utils/createTables");
const PORT = process.env.PORT || 3030;
const User = require("./routes/user");

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});

app.use(BodyParser.json({ limit: "50mb" }));
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      callback(null, true);
    },
    credentials: true,
  })
);

createDatabase();

app.use(User);
