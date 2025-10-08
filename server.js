// server.js — Backend solo Ollama (GRATIS, local)
// Aethra Bot · asistente educativo (primaria, secundaria y universidad)
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json());

// Servir el frontend desde la misma carpeta
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/', express.static(__dirname));

const PORT = process.env.PORT || 8787;
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
// Por defecto uso "gemma3:4b" porque ya lo tenés instalado.
// Podés cambiarlo por "llama3.2" o el que prefieras.
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma3:4b';

// Prompt base educativo para todos los niveles
const SYSTEM_PROMPT =
  process.env.SYSTEM_PROMPT ||
  [
    'Sos Aethra Bot, un asistente educativo para primaria, secundaria y universidad.',
    'Explicá paso a paso, usando ejemplos simples y lenguaje claro.',
    'Evitá “dar la respuesta” sin explicación: fomentá el razonamiento.',
    'Si hay cálculos, mostrálos; si hay conceptos, definí brevemente y profundizá si te lo piden.',
    'Respondé en español rioplatense.'
  ].join(' ');

// Salud: confirma conexión con Ollama y si está el modelo
app.get('/health', async (_req, res) => {
  try {
    const r = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!r.ok) return res.status(502).json({ ok: false, error: `Ollama ${r.status}` });
    const data = await r.json();
    const models = (data?.models || []).map(m => m.name);
    const hasModel = models.includes(OLLAMA_MODEL);
    res.json({ ok: true, base_url: OLLAMA_URL, model: OLLAMA_MODEL, model_present: hasModel });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message });
  }
});

// Chat: message (string), history (array de {role, content}), context {level, subject}
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], context = {} } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).send('message requerido (string).');
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      (context.level || context.subject)
        ? {
            role: 'system',
            content:
              `Nivel: ${context.level || 'general'}. ` +
              `Materia: ${context.subject || 'general'}. ` +
              `Adecuá el vocabulario, el detalle y los ejemplos a ese nivel.`
          }
        : null,
      ...history.filter(m => m && m.role && m.content),
      { role: 'user', content: message }
    ].filter(Boolean);

    const r = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: OLLAMA_MODEL, messages, stream: false })
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).send(`Ollama error ${r.status}: ${txt}`);
    }

    const data = await r.json();
    const reply = data?.message?.content?.trim() || 'Sin respuesta.';
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || 'Error interno' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Aethra Bot listo en http://localhost:${PORT}`);
  console.log(`   Ollama: ${OLLAMA_URL} · Modelo: ${OLLAMA_MODEL}`);
});
