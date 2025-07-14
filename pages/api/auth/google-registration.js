// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { cors } from "@/middlevares/cors";
import sql from "@/db/connection";

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "POST") {
    try {
      const { name, sername, googleID, email } = req.body;
      const result = await sql`
        INSERT INTO users (name, sername, googleid, email)
        VALUES (${name}, ${sername}, ${googleID}, ${email})
        RETURNING *;
      `;
      console.log(result);

      res.status(200).json({ name: "John Doe" });
    } catch (err) {
      console.log(err);
      res.status(400).end();
    }
    return;
  }
  res.status(404).end();
}
