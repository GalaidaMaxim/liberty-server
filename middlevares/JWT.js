import JWT from "jsonwebtoken";
import sql from "@/db/connection";

export const createJWT = (id) => {
  const token = JWT.sign({ id }, process.env.SECRET_WORD);
  return token;
};

export const checkJWT = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error("Authorization header missing");
  }
  const token = authHeader.split(" ")[1];
  const decoded = JWT.verify(token, process.env.SECRET_WORD);
  const result = await sql`SELECT token FROM users WHERE id = ${decoded.id}`;

  if (result[0].token !== token) {
    throw new Error("wrong token");
  }

  return decoded.id;
};
