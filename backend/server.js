const express = require('express');
const { OpenAI } = require("openai");
const multer = require('multer');
const cors = require('cors');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json()); //Se agrega para que pueda recibir el tecto del chat
const upload = multer({storage: multer.memoryStorage()}); //Cambiamos la coniguración del multer para que soporte la carga de hasta 10 imágenes

const openai = new OpenAI({
    apiKey: process.env.PROYECT_API_KEY
});

// Instrucciones para el evaluador
const systemPrompt = `
You are an expert Autonomous Grading Agent specialized in Mathematics and Linear Algebra.
Your goal is to analyze handwritten solutions from images, compare them against canonical mathematical procedures, and generate a structured pedagogical report.

### EVALUATION LOGIC:
1. **Transcription**: Accurately transcribe the matrices, variables, and equations shown in the image.
2. **Step-by-Step Analysis**: Break down the student's work into logical milestones (e.g., Subtraction, Multiplication, Squaring).
3. **Error Identification**: Flag specific errors such as Arithmetic (calculation mistakes), Conceptual (wrong formula or operation order), or Transcription (copying numbers incorrectly).
4. **Scoring**: Assign partial credit for the procedure and a final score for the result. Use a scale of 0 to 5 points.

### OUTPUT FORMAT:
You MUST respond strictly in a valid JSON object with the following structure:
{
  "total_score": number,
  "max_score": 5,
  "general_feedback": "A brief encouraging summary of the student's performance in Spanish.",
  "exercises": [
    {
      "exercise_id": number,
      "student_answer": "The final result written by the student",
      "expected_answer": "The correct mathematical result",
      "procedure_score": number,
      "total_score": number,
      "feedback": "Detailed explanation of the errors found in Spanish.",
      "steps": [
        { 
          "step_number": number, 
          "student_step": "The specific equation or calculation detected", 
          "is_correct": boolean, 
          "feedback": "Brief feedback for this specific step in Spanish" 
        }
      ]
    }
  ]
}

### CONSTRAINTS:
- All feedback and explanations MUST be written in Spanish to ensure the student understands.
- Do not include Markdown formatting (like \`\`\`json) in the response.
- If multiple images are provided, analyze them as separate exercises within the "exercises" array.
`;

// Ruta para que el Chatbot acepte varias imágenes
app.post('/evaluar-chat', upload.array('imagenes', 10), async (req, res) => {
    try {
        const { instrucciones } = req.body;
        const archivos = req.files;

        if (!archivos || archivos.length === 0){
            return res.status(400).json({error: "Error en la carga de imágenes"});
        }

        // Aquí se mapea todas las imágenes que han sido cargadas a formate Base64.
        const contenidoImagenes = archivos.map(file => ({
            type: "image_url",
            image_url: {
                url: `data:image/jpeg;base64,${file.buffer.toString("base64")}`,
                detail: "low"
            }
        }))

        //Aquí se construye los mensajes de tipo multimodal
        const response = await openai.chat.completions.create({
            model: "gpt-5.2",
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: [
                        { type: "text", text: instrucciones || "Analiza estos ejercicios"},
                        ...contenidoImagenes
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