import { server } from "./app/app";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
  console.log(`✅ FileVault API running on http://localhost:${PORT}`),
);
