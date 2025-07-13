export const cors = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // или твой домен
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};
