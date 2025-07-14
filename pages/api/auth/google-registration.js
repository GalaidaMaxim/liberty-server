// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { cors } from "@/middlevares/cors";
import sql from "@/db/connection";
import axios from "axios";
import { createJWT } from "@/middlevares/JWT";

async function createTokenResponse(id, res) {
  const token = createJWT(id);
  await sql`update users set token = ${token} where id = ${id}`;
  return res.status(200).json({ token });
}

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "POST") {
    try {
      const { token } = req.body;
      const user = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { name, sername, email, googleID } = {
        name: user.data.given_name,
        sername: user.data.family_name,
        email: user.data.email,
        googleID: user.data.sub,
      };
      const dbUser =
        await sql`select * from users where googleid = ${googleID}`;
      if (dbUser.length !== 0) {
        return createTokenResponse(dbUser[0].id, res);
      }

      const result = await sql`
        INSERT INTO users (name, sername, googleid, email)
        VALUES (${name}, ${sername}, ${googleID}, ${email})
        RETURNING *;
      `;
      return createTokenResponse(result[0].id, res);
    } catch (err) {
      console.log(err);
      return res.status(400).end();
    }
  }
  res.status(404).end();
}
