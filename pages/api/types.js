// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { cors } from "@/middlevares/cors";
import sql from "@/db/connection";
import { checkJWT } from "@/middlevares/JWT";

const onPOST = async (req, res) => {
  try {
    const userId = await checkJWT(req, res);
    const { name, dictionaryId } = req.body;

    if (!userId || !name || !dictionaryId) {
      throw new Error("Missing data");
    }

    const typeResult = await sql`
      INSERT INTO types (name, dictionary_id)
      VALUES (${name}, ${dictionaryId})
      RETURNING * `;

    res.status(200).json(typeResult[0]);
    return;
  } catch (err) {
    console.error("Error in POST /types:", err.message);
    res.status(400).json({ error: err.message });
  }
};

const onPATCH = async (req, res) => {
  try {
    const userId = await checkJWT(req, res);
    const { name, id } = req.body;
    if (!userId || !name || !id) {
      throw new Error("Missing data");
    }
    const result =
      await sql`UPDATE types SET name = ${name} WHERE id = ${id} RETURNING *`;
    res.status(200).json(result);

    return;
  } catch (err) {
    console.error("Error in PATCH /types:", err.message);
    res.status(400).json({ error: err.message });
  }
};

const onDELETE = async (req, res) => {
  try {
    const id = await checkJWT(req, res);
    const { typesID } = req.body;

    if (!id || !typesID) {
      throw new Error("no data");
    }
    const result = await sql`DELETE FROM types WHERE id = ${typesID}`;

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
    const userId = await checkJWT(req, res);
    const { dictionaryId } = req.query;

    if (!userId || !dictionaryId) {
      throw new Error("Missing data");
    }

    const result =
      await sql`SELECT * FROM types WHERE dictionary_id = ${dictionaryId} ORDER BY id ASC`;
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
  if (req.method === "PATCH") {
    await onPATCH(req, res);
    return;
  }
  res.status(404).end();
  return;
}
