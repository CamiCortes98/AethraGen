
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const app = express();
app.use(cors());
app.use(express.json());

// Servir el frontend desde la misma carpeta
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/', express.static(__dirname));

const PORT = process.env.PORT || 8787;
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:1b';

// Prompt base educativo para todos los niveles
const SYSTEM_PROMPT =
  process.env.SYSTEM_PROMPT ||
  [
    'Sos Aethra Bot, un asistente educativo para primaria, secundaria y universidad.',
    'Explicá paso a paso, usando ejemplos simples y lenguaje claro.',
    'Evitá “dar la respuesta” sin explicación: fomentá el razonamiento y no repitas informacion en el chat.',
    'Si hay cálculos, mostrálos; si hay conceptos, definí brevemente y profundizá si te lo piden.',
    'Respondé en español argentino como si fueras docente, es muy importante que apliques psicopedagogía cuando explicas un tema sin ser muy extenso para que el entendimiento sea claro y conciso, solo respondes extensamente cuando te lo piden.'
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
        ? { role: 'system', content:
            `Nivel: ${context.level || 'general'}. ` +
            `Materia: ${context.subject || 'general'}. ` +
            `Ajustá vocabulario y ejemplos a ese nivel.` }
        : null,
      ...history.filter(m => m && m.role && m.content),
      { role: 'user', content: message }
    ].filter(Boolean);

    const NUM_THREADS = Math.max(2, Math.min(os.cpus().length, 8)); // usa hasta 8 hilos (CPU)

    const r = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,             // (ver §4 para streaming real)
        keep_alive: "30m",         // ⚡ evita recarga fría por 30 min
        options: {
          // ⚙️ parámetros que aceleran:
          num_ctx: 1024,           // menos contexto = menos memoria/tiempo
          num_predict: 220,        // límite de tokens de salida (ajustá a gusto)
          temperature: 0.4,
          top_k: 40,
          top_p: 0.9,
          repeat_penalty: 1.1,
          num_thread: NUM_THREADS  // hilos CPU
        }
      })
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
