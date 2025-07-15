// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { cors } from "@/middlevares/cors";
import sql from "@/db/connection";
import { checkJWT } from "@/middlevares/JWT";

const onGET = async (req, res) => {
  try {
    const id = await checkJWT(req, res);

    if (!id) {
      throw new Error("no data");
    }
    const result = await sql`SELECT * FROM users WHERE id = ${id}`;
    const response = {
      name: `${result[0].name} ${result[0].sername}`,
      passwordSet: result[0].password_hash ? true : false,
      googleLinked: result[0].googleid ? true : false,
    };
    res.status(200).json(response);
    return;
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
    return;
  }
};

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "GET") {
    await onGET(req, res);
    return;
  }
  res.status(404).end();
  return;
}
