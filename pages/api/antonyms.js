// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { cors } from "@/middlevares/cors";
import sql from "@/db/connection";
import { checkJWT } from "@/middlevares/JWT";

const getAntonymsOfWord = async (word_id) => {
  const result = await sql`
    WITH SID AS(SELECT antonym_id
    FROM antonyms
    WHERE word_id=${word_id}
    UNION
    SELECT word_id
    FROM antonyms
    WHERE antonym_id=${word_id})
    SELECT * 
    FROM SID s
    JOIN words w
    ON w.id = s.antonym_id
    `;
  return result;
};

const checkPosibleAntonyms = async (word_id, antonym_id) => {
  const list = await getAntonymsOfWord(word_id);
  return !list.some((item) => "" + antonym_id == item.antonym_id);
};

const onPOST = async (req, res) => {
  try {
    await checkJWT(req, res);
    const { word_id, antonym_id } = req.body;
    if (!word_id || !antonym_id) {
      throw new Error("Missing data");
    }
    if (!(await checkPosibleAntonyms(word_id, antonym_id))) {
      throw new Error("Already antonym");
    }
    const result =
      await sql`INSERT INTO antonyms (word_id, antonym_id) VALUES (${word_id}, ${antonym_id}) RETURNING *;`;
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
    const { word_id, antonym_id } = req.body;
    if (!word_id || !antonym_id) {
      throw new Error("Missing data");
    }

    const result = await sql`DELETE FROM antonyms 
      WHERE (word_id = ${word_id} AND antonym_id=${antonym_id}) 
      OR (antonym_id = ${word_id} AND word_id=${antonym_id})`;
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
    const result = await getAntonymsOfWord(word_id);

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
