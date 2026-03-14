const env = require("./config/env");

const app = require("./app");
require("./config/firebase");
const prisma = require("./config/prisma");

prisma
    .$connect()
    .then(() => {
        console.log("Database connected");
    })
    .catch(() => {
        console.log("Database not connected");
    });

app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
});
