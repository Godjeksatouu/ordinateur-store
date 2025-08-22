import cli from "next/dist/cli/next-start.js";
import dotenv from "dotenv";

dotenv.config();

cli.nextStart({
  port: Number(process.env.PORT) || 3000,
  hostname: process.env.HOSTNAME || "0.0.0.0",
});
