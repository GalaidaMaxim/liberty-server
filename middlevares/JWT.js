import JWT from "jsonwebtoken";

export const createJWT = (id) => {
  const token = JWT.sign({ id }, process.env.SECRET_WORD);
  return token;
};

export const checkJWT = (token) => {
  const decoded = JWT.verify(token.split(" ")[1], process.env.SECRET_WORD);
  return decoded.id;
};
