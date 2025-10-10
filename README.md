# AethraGen — Chat educativo local (Ollama, gratis)

**AethraGen** es un asistente estudiantil (primaria, secundaria y universidad) que corre **100% local** usando **Ollama**.  
No requiere claves ni servicios pagos. Incluye:

- 🌓 **Modo oscuro / claro** con botones ☀️/🌙
- 🖼️ **Imagen de fondo fija** por tema (oscuro/claro)
- ⏳ Indicador “**pensando…**” (texto pequeño y muted) mientras llega la respuesta
- ⚡ Backend Node/Express conectado a **Ollama** vía `http://127.0.0.1:11434`



---

## 🧰 Stack
- **Frontend:** `index.html` (HTML/CSS/JS puros, sin build)
- **Backend:** `Node 18+` + `Express` (`server.js`)
- **Modelo local:** **Ollama** (p. ej., `gemma3:4b`, `llama3.2`, `llama3.2:1b`, `phi3:mini`, etc.)

---

## 🚀 Requisitos
- **Node 18+**
- **Ollama** instalado y accesible en `http://127.0.0.1:11434`

### Instalar Ollama (Windows)
```powershell
winget install --id Ollama.Ollama -e
# reabrí PowerShell si fue la primera instalación
ollama --version

# bajá al menos un modelo:
ollama pull gemma3:4b
# o (más liviano y rápido)
ollama pull llama3.2:1b
# o
ollama pull llama3.2


## Archivos y propósito

- **index.html**  
  Interfaz minimal con:
  - selector de **modo oscuro/claro** (☀️/🌙) con preferencia guardada  
  - **imagen de fondo fija** por tema  
  - controles de **Nivel** y **Materia**  
  - indicador **“Aethra Bot está pensando…”** (muted y fuente chica)  
  - envío al backend: `POST /api/chat`

- **server.js**  
  Servidor **Node + Express** que:
  - sirve los estáticos (`index.html` y `assets/`)  
  - expone `GET /health` (chequeo de Ollama)  
  - expone `POST /api/chat` (pasa mensajes a Ollama con opciones de rendimiento)  

- **.env.example**  
  Plantilla de configuración:
  ```env
  PORT=8787
  OLLAMA_BASE_URL=http://127.0.0.1:11434
  OLLAMA_MODEL=gemma3:4b   # o llama3.2, llama3.2:1b, phi3:mini, etc.