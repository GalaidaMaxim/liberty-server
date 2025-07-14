// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { cors } from "@/middlevares/cors";
import sql from "@/db/connection";
import { createJWT } from "@/middlevares/JWT";

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "POST") {
    try {
      const { id } = req.body;
      const result = await sql`select id from users where googleID = ${id}`;
      if (result.length === 0) {
        throw new Error("No such user");
      }
      const token = createJWT(result[0].id);

      res.status(200).json({ token });
    } catch (err) {
      console.log(err.message);
      res.status(400).end();
    }
    return;
  }
  res.status(404).end();
}
