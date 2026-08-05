const { Redis } = require("@upstash/redis");
const redis = Redis.fromEnv();

// Código da família: 4-10 letras/números maiúsculos (ex: CASA7X2K)
function isValidCode(code) {
  return typeof code === "string" && /^[A-Z0-9]{4,12}$/.test(code);
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  try {
    if (req.method === "GET") {
      const code = String(req.query.code || "").toUpperCase();
      if (!isValidCode(code)) {
        return res.status(400).json({ error: "codigo_invalido" });
      }
      const record = await redis.get(`financas:${code}`);
      return res.status(200).json({ data: record || null });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const code = String(body.code || "").toUpperCase();
      const payload = body.payload;
      if (!isValidCode(code)) {
        return res.status(400).json({ error: "codigo_invalido" });
      }
      if (!payload || typeof payload !== "object") {
        return res.status(400).json({ error: "payload_invalido" });
      }
      const record = { ...payload, updatedAt: Date.now() };
      await redis.set(`financas:${code}`, record);
      return res.status(200).json({ ok: true, updatedAt: record.updatedAt });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "metodo_nao_suportado" });
  } catch (err) {
    return res.status(500).json({ error: "erro_interno", message: String(err && err.message ? err.message : err) });
  }
};
