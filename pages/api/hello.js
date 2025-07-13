// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { cors } from "@/middlevares/cors";

export default function handler(req, res) {
  cors(req, res);
  res.status(200).json({ name: "John Doe" });
}
