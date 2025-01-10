const express = require("express");
const axios = require("axios");
const path = require("path");
const cors = require("cors");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Middleware para processar JSON
app.use(express.json());

// Nome do chatbot (em português)
const chatbotName = "Luma";

// Rota para consumir a API Gemini
app.post("/api/generate-content", async (req, res) => {
  const { text, history } = req.body;

  if (!text) {
    return res.status(400).json({ error: "O campo 'text' é obrigatório." });
  }

  try {
    const apiKey = process.env.API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      system_instruction: {
        parts: {
          text: `Seu nome é Luma. Por favor, forneça suas respostas utilizando tags HTML que simulem o formato do Markdown. Para negrito, use a tag <strong>. Para itálico, use a tag <em>. Para um cabeçalho de nível 1, utilize a tag <h1>. Para criar listas, utilize as tags <ul> para listas não ordenadas e <ol> para listas ordenadas, com itens dentro das tags <li>. Para links, utilize a tag <a href="URL">texto do link</a>. A ideia é que a estrutura da resposta seja clara, com as tags HTML mimetizando o estilo do Markdown, mantendo a formatação simples e legível. Evite ser repetitivo nas saudações e sempre leve em consideração o contexto da conversa.`,
        },
      },
      contents: {
        parts: {
          text: `Contexto da conversa: ${safeHistory}\nPergunta ou mensagem: ${text}`,
        },
      },
    };

    const response = await axios.post(url, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Manipula a resposta para garantir que o texto seja puro
    const botResponse = response.data;

    // Enviar a resposta com o nome do chatbot e formatada como texto simples
    res.status(200).json({
      sender: chatbotName,
      message: botResponse,
    });
  } catch (error) {
    console.error("Erro ao consumir a API Gemini:", error.message);

    const { response } = error;
    const errorMessage = response?.data || {
      error: "Erro interno no servidor.",
    };

    res.status(response?.status || 500).json(errorMessage);
  }
});

// Rota de teste
app.get("/", (req, res) => {
  res.send("Servidor do Gemini está funcionando!");
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
