const express = require('express');
const { OpenAI } = require("openai");
const multer = require('multer');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
const upload = multer();

const openai = new OpenAI({
    apiKey: process.env.PROYECT_API_KEY
});

// Instrucciones basadas en el notebook OpenAiVesp
const systemPrompt = `
You are an autonomous grading agent specialized in evaluating handwritten mathematical solutions from images.
Your task is to analyze the student's solution, interpret the reasoning, and assign partial credit.

Follow this logic for evaluation:
1. Extract student steps.
2. Compare with expected canonical steps.
3. Identify error types (algebra, arithmetic, concept, etc.).
4. Assign procedure score and final answer score.

Format the output as a valid JSON object matching the structure:
{
  "total_score": number,
  "max_score": number,
  "general_feedback": "string",
  "exercises": [
    {
      "student_answer": "string",
      "expected_answer": "string",
      "procedure_score": number,
      "total_score": number,
      "feedback": "string",
      "steps": [
        { "step_number": number, "student_step": "string", "is_correct": boolean, "feedback": "string" }
      ]
    }
  ]
}
`;

app.post('/evaluar', upload.single('imagen'), async (req, res) => {
    try {
        const { instrucciones } = req.body;
        const imagenBase64 = req.file.buffer.toString("base64");

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: [
                        { type: "text", text: instrucciones },
                        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imagenBase64}` } }
                    ]
                }
            ],
            temperature: 0,
            response_format: { type: "json_object" }
        });

        res.json({ evaluacion: JSON.parse(response.choices[0].message.content) });
    } catch (error) {
        console.error("Error en OpenAI:", error);
        res.status(500).json({ error: "Error procesando la evaluación" });
    }
});

app.listen(3000, () => {
    console.log("✅ Servidor activo en http://localhost:3000");
});