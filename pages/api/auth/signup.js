import { cors } from "@/middlevares/cors";
import sql from "@/db/connection";
import { createJWT } from "@/middlevares/JWT";
import bcrypt from "bcrypt";

async function createTokenResponse(id, res) {
  const token = createJWT(id);
  await sql`update users set token = ${token} where id = ${id}`;
  return res.status(200).json({ token });
}

const onPOST = async (req, res) => {
  try {
    const { name, sername, email, password } = req.body;
    if (!name || !sername || !email || !password) {
      throw new Error("no data");
    }
    const hash = bcrypt.hashSync(password, 10);
    const result = await sql`
        INSERT INTO users (name, sername, email, password_hash)
        VALUES (${name}, ${sername}, ${email}, ${hash})
        RETURNING *;
      `;
    await createTokenResponse(result[0].id, res);
    return;
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
    return;
  }
};

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "POST") {
    await onPOST(req, res);
    return;
  }

  res.status(404).end();
  return;
}
