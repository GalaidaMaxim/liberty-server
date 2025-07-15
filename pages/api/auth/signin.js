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
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("no data");
    }
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (!bcrypt.compareSync(password, result[0].password_hash)) {
      throw new Error("wrong password");
    }
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
