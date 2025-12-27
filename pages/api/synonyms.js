// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { cors } from "@/middlevares/cors";
import sql from "@/db/connection";
import { checkJWT } from "@/middlevares/JWT";

const getSynonymsOfWord = async (word_id) => {
  const result = await sql`
    WITH SID AS(SELECT synonym_id
    FROM synonyms
    WHERE word_id=${word_id}
    UNION
    SELECT word_id
    FROM synonyms
    WHERE synonym_id=${word_id})
    SELECT * 
    FROM SID s
    JOIN words w
    ON w.id = s.synonym_id
    `;
  return result;
};

const checkPosibleSynonyms = async (word_id, synonym_id) => {
  const list = await getSynonymsOfWord(word_id);
  return !list.some((item) => "" + synonym_id == item.synonym_id);
};

const onPOST = async (req, res) => {
  try {
    await checkJWT(req, res);
    const { word_id, synonym_id } = req.body;
    if (!word_id || !synonym_id) {
      throw new Error("Missing data");
    }
    if (!(await checkPosibleSynonyms(word_id, synonym_id))) {
      throw new Error("Already synonyms");
    }
    const result =
      await sql`INSERT INTO synonyms (word_id, synonym_id) VALUES (${word_id}, ${synonym_id}) RETURNING *;`;
    res.status(200).json(result);
    return;
  } catch (err) {
    console.error("Error in POST /types:", err.message);
    res.status(400).json({ error: err.message });
  }
};

const onDELETE = async (req, res) => {
  try {
    await checkJWT(req, res);
    const { word_id, synonym_id } = req.body;
    if (!word_id || !synonym_id) {
      throw new Error("Missing data");
    }

    const result = await sql`DELETE FROM synonyms 
      WHERE (word_id = ${word_id} AND synonym_id=${synonym_id}) 
      OR (synonym_id = ${word_id} AND word_id=${synonym_id})`;
    res.status(200).json(result);
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
    if (!word_id) {
      throw new Error("Missing data");
    }
    const result = await getSynonymsOfWord(word_id);

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
