// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { cors } from "@/middlevares/cors";
import sql from "@/db/connection";
import { checkJWT } from "@/middlevares/JWT";

const onPOST = async (req, res) => {
  try {
    const id = await checkJWT(req, res);
    const { name } = req.body;

    if (!id || !name) {
      throw new Error("no data");
    }
    const result =
      await sql`insert into dictionary (name, user_id) values (${name}, ${id}) RETURNING *`;
    res.status(200).json(result[0]);
    return;
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
    return;
  }
};

const onDELETE = async (req, res) => {
  try {
    const id = await checkJWT(req, res);
    const { dictionaryID } = req.body;

    if (!id || !dictionaryID) {
      throw new Error("no data");
    }
    const result = await sql`DELETE FROM dictionary WHERE id = ${dictionaryID}`;

    res.status(200).end();
    return;
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
    return;
  }
};

const onGET = async (req, res) => {
  try {
    const id = await checkJWT(req, res);

    if (!id) {
      throw new Error("no data");
    }
    const result = await sql`SELECT * FROM dictionary WHERE user_id = ${id}`;

    res.status(200).json(result);
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
  if (req.method === "DELETE") {
    await onDELETE(req, res);
    return;
  }
  if (req.method === "GET") {
    await onGET(req, res);
    return;
  }
  res.status(404).end();
  return;
}
