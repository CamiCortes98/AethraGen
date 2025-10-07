import express from "express";
import cors from "cors";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";
import 'dotenv/config';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Config
const PORT = process.env.PORT || 8787;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT || "Sos un asistente breve y claro. Respondé en español rioplatense.";

// Sirve el frontend (opcional): coloca index.html junto a server.js
app.use("/", express.static(__dirname));

app.post("/api/chat", async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.status(500).send("Falta OPENAI_API_KEY en variables de entorno.");
    }
    const { message, history = [] } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).send("message requerido (string).");
    }

    const client = new OpenAI({ apiKey: OPENAI_API_KEY });

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.filter(m => m && m.role && m.content),
      { role: "user", content: message }
    ];

    // Chat Completions estable para texto
    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.4,
      messages
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || "No tengo respuesta.";
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).send(err?.message || "Error interno");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor listo en http://localhost:${PORT}`);
  console.log("   GET  / -> sirve index.html (si existe en el mismo folder)");
  console.log("   POST /api/chat -> endpoint para el frontend");
});
