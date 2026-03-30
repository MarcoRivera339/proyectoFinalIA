const express = require('express');
const { OpenAI } = require("openai");
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const upload = multer({ storage: multer.memoryStorage() });
const openai = new OpenAI({ apiKey: process.env.PROYECT_API_KEY });

const systemPrompt = `
You are a Strict and Precise Math Professor. 
Your goal is to perform a Deep Audit of the student's work.

### CRITICAL INSTRUCTIONS:
1. INTERNAL RESOLUTION: Before looking at the student's image, solve the exercise yourself. 
2. COMPARISON: Compare your correct result with the student's result. If they differ, find exactly which step has the error (calculation, sign, or concept).
3. NO FALSE POSITIVES: Do not say "Correct" if the result is wrong. Be honest and pedagogical.
4. DETAIL: In 'full_resolution', show the perfect path. In 'steps_analysis', point out the specific error found in the image.

### OUTPUT FORMAT (JSON):
{
  "global_total_score": number,
  "global_max_score": number,
  "general_feedback": "Resumen crítico en ESPAÑOL",
  "exercises": [
    {
      "exercise_id": number,
      "exercise_title": "string",
      "full_resolution": "Resolución Maestra Paso a Paso en ESPAÑOL",
      "total_score": number,
      "max_score": number,
      "feedback": "Explicación de por qué falló en ESPAÑOL",
      "steps_analysis": [
        { 
          "step_number": number, 
          "description": "Análisis del paso", 
          "student_work": "Lo que escribió el alumno",
          "is_correct": boolean, 
          "correction": "Qué debió escribir el alumno" 
        }
      ]
    }
  ]
}
...
### FORMATTING RULES:
1. For matrices, DO NOT use LaTeX commands like \\begin{pmatrix}.
2. Use a visual text format instead, for example:
   | 2  0  0 |
   | 4  8  0 |
   | -4 -7 2 |
3. Ensure all qualitative feedback is in SPANISH.
...
`;
app.post('/evaluar-chat', upload.array('imagenes', 10), async (req, res) => {
    console.log("Archivos recibidos:", req.files?.length); // Ver en terminal
    try {
        const { instrucciones } = req.body;
        const archivos = req.files;

        if (!archivos || archivos.length === 0) {
            return res.status(400).json({ error: "No se subieron imagenes" });
        }

        const contenidoImagenes = archivos.map(file => ({
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${file.buffer.toString("base64")}` }
        }));

        const response = await openai.chat.completions.create({
            model: "gpt-5.2",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: [{ type: "text", text: instrucciones || "Evalua" }, ...contenidoImagenes] }
            ],
            response_format: { type: "json_object" }
        });

        res.json({ evaluacion: JSON.parse(response.choices[0].message.content) });
    } catch (error) {
        console.error("Error OpenAI:", error);
        res.status(500).json({ error: "Error interno" });
    }
});

app.listen(3000, () => console.log("🚀 Servidor en puerto 3000"));