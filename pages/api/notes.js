// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { cors } from "@/middlevares/cors";
import sql from "@/db/connection";
import { checkJWT } from "@/middlevares/JWT";

const onPOST = async (req, res) => {
  try {
    const userId = await checkJWT(req, res);
    const { word_id, text } = req.body;

    if (!userId || !word_id || !text) {
      throw new Error("Missing data");
    }
    console.log(word_id, text);

    const result =
      await sql`INSERT INTO associations (text, word_id) VALUES (${text}, ${word_id}) RETURNING *;`;
    console.log(result);

    res.status(200).json(result[0]);
    return;
  } catch (err) {
    console.error("Error in POST /types:", err.message);
    res.status(400).json({ error: err.message });
  }
};

const onDELETE = async (req, res) => {
  try {
    const id = await checkJWT(req, res);
    const { note_id } = req.body;

    if (!id || !note_id) {
      throw new Error("no data");
    }
    const result = await sql`DELETE FROM associations WHERE id = ${note_id}`;

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
    const { word_id } = req.query;
    if (!id || !word_id) {
      throw new Error("no data");
    }
    let result =
      await sql`SELECT * FROM associations WHERE word_id = ${word_id}`;

    res.status(200).json(result);
    return;
  } catch (err) {
    console.log(err.message);
    res.status(400).end();
    return;
  }
};

const onPATCH = async (req, res) => {
  try {
    await checkJWT(req, res);

    const { id } = req.query;
    if (!id) throw new Error("Invalid ID");
    const { text } = req.body;
    if (text) {
      throw new Error("no data");
    }
    const result =
      await sql`UPDATE associations SET text=${text} WHERE id=${id} RETURNING *;`;
    res.status(200).json(result[0]);
  } catch (err) {
    console.error("PATCH error:", err);
    res.status(400).json({ error: err.message });
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
