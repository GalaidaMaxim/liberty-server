// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { cors } from "@/middlevares/cors";
import sql from "@/db/connection";
import { checkJWT } from "@/middlevares/JWT";

const onPOST = async (req, res) => {
	try {
		const userId = await checkJWT(req, res);
		const { word, translation, language } = req.body;

		if (!userId || !word || !translation) {
			throw new Error("Missing data");
		}

		const dictionaryResult = await sql`
      SELECT id FROM dictionary WHERE user_id = ${userId} AND name = ${language} LIMIT 1
    `;

		if (dictionaryResult.length === 0) {
			throw new Error("Dictionary not found");
		}

		const dictionaryId = dictionaryResult[0].id;

		const typesResult = await sql` SELECT id FROM types WHERE dictionary_id = ${dictionaryId} LIMIT 1`;

		if (typesResult.length === 0) {
			throw new Error("Types not found");
		}

		const typesID = typesResult[0].id;

		const wordsResult = await sql`
      INSERT INTO words (word, translation, type_id)
      VALUES (${word}, ${translation}, ${typesID})
      RETURNING *
    `;

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
		const result = await sql`DELETE FROM types WHERE id = ${wordsID}`;

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
	if (req.method === "POST") {
		await onPOST(req, res);
		return;
	}
	if (req.method === "DELETE") {
		await onDELETE(req, res);
		return;
	}
	res.status(404).end();
	return;
}
