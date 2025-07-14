// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { cors } from "@/middlevares/cors";
import sql from "@/db/connection";
import { checkJWT } from "@/middlevares/JWT";
import { verify } from "jsonwebtoken";

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "POST") {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res
          .status(401)
          .json({ message: "Authorization header missing" });
      }
      const id = checkJWT(authHeader);
      const { name } = req.body;
      console.log(id, name);

      if (!id || !name) {
        throw new Error("no data");
      }
      const result =
        await sql`insert into dictionary (name, user_id) values (${name}, ${id})`;
      console.log(result);

      res.status(200).end();
    } catch (err) {
      console.log(err.message);
      res.status(400).end();
    }
    return;
  }
  if (req.method === "DELETE") {
  }
  res.status(404).end();
}
