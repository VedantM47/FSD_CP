const express = require("express");
const cors = require("cors");

const judgeRoutes = require("./routes/judgeRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/judge", judgeRoutes);
app.use("/admin", judgeRoutes);

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Backend running at http://localhost:${PORT}`)
);
