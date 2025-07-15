import { cors } from "@/middlevares/cors";
import sql from "@/db/connection";
import { checkJWT } from "@/middlevares/JWT";

const onGET = async (req, res) => {
  try {
    const id = await checkJWT(req, res);

    if (!id) {
      throw new Error("no data");
    }
    await sql`UPDATE users SET token=NULL WHERE id=${id}`;

    res.status(200).end();
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
