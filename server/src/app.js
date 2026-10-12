
const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./routes");

const app = express();

app.use(cors());

app.use(
    express.json({
        verify: (req, res, buffer) => {
            if (req.originalUrl.includes("/api/webhooks/sepay")) {
                req.rawBody = Buffer.from(buffer);
            }
        },
    })
);

app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api", routes);

module.exports = app;
