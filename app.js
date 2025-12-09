import express from "express";
import cors from "cors";
import { PORT } from "./config/envConfig.js";

const app = express();

app.use(express.json());
app.use(cors());

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});