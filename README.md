# ChatBot web simple (con pantalla que simula caja de texto)

Interfaz **minimal** lista para usar. Funciona en **modo DEMO** (sin API) y, si montás el backend, responde con **OpenAI (ChatGPT)**.

## 🚀 Cómo usar (DEMO, sin API)
1. Abrí `index.html` en tu navegador (doble clic). 
2. Escribí y probá — responde localmente con reglas simples.

> DEMO no requiere clave ni servidor, ideal para entregar una maqueta.

## 🧠 Modo real con OpenAI
1. Instalá dependencias y arrancá el servidor:

```bash
cd /ruta/al/proyecto
npm install
OPENAI_API_KEY="tu_clave" npm start
```

Opcional:
```bash
export OPENAI_MODEL="gpt-4o-mini"   # por defecto
export SYSTEM_PROMPT="Sos un asistente..." # personalizá el tono
```

2. Abrí en el navegador: **http://localhost:8787**  
   (El servidor sirve `index.html` y expone `POST /api/chat`)

3. En el frontend, si querés, editá `index.html` y cambiá:
```js
const DEMO_MODE = true; // -> false si usás backend
```

## 🧩 Estructura
- `index.html` → UI completa (CSS + JS embebidos).  
- `server.js` → Express + OpenAI (endpoint `/api/chat`).  
- `package.json` → dependencias.

## ⚠️ Nota de seguridad
No pongas tu `OPENAI_API_KEY` en el frontend (visible para cualquiera). Usá el backend (`server.js`).

¡Listo!