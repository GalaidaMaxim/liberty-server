// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { cors } from "@/middlevares/cors";
import sql from "@/db/connection";
import { checkJWT } from "@/middlevares/JWT";

const onPOST = async (req, res) => {
  try {
    const userId = await checkJWT(req, res);
    const { word, translation, type_id, dictionaryID } = req.body;

    if (!userId || !word || !translation) {
      throw new Error("postgresMissing data");
    }

    let wordsResult;

    if (type_id) {
      wordsResult = await sql`
    INSERT INTO words (word, translation, type_id, dictionary_id)
    VALUES (${word}, ${translation}, ${type_id}, ${dictionaryID})
    RETURNING *;
  `;
    } else {
      wordsResult = await sql`
    INSERT INTO words (word, translation, dictionary_id)
    VALUES (${word}, ${translation}, ${dictionaryID})
    RETURNING *;
  `;
    }

    res.status(200).json(wordsResult[0]);
    return;
  } catch (err) {
    console.error("Error in POST /types:", err.message);
    res.status(400).json({ error: err.message });
  }
};

const onDELETE = async (req, res) => {
  try {
    const id = await checkJWT(req, res);
    const { wordsID } = req.body;

    if (!id || !wordsID) {
      throw new Error("no data");
    }
    const result = await sql`DELETE FROM words WHERE id = ${wordsID}`;

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
    const { dictionaryID, typeID } = req.query;
    if (!id || !dictionaryID) {
      throw new Error("no data");
    }
    let result;
    if (typeID) {
      result =
        await sql`SELECT * FROM words WHERE dictionary_id = ${dictionaryID} AND type_id = ${typeID} ORDER BY word ASC`;
    } else {
      result =
        await sql`SELECT * FROM words WHERE dictionary_id = ${dictionaryID} ORDER BY word ASC`;
    }
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
    const { word, translation, type } = req.body;
    const result = await sql`
      UPDATE words
      SET ${word ? sql`word = ${word}` : sql``}
      ${word && (translation || type) ? sql`,` : sql``}
      ${translation ? sql`translation = ${translation}` : sql``}
      ${(word || translation) && type ? sql`,` : sql``}
      ${type ? sql`type = ${type}` : sql``}
      WHERE id = ${id}
      RETURNING *
    `;

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
