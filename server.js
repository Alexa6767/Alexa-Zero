const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use(express.static('.')); // يخلي ملفات index.html و css و js متاحة

app.post('/ai', async (req, res) => {
  const userInput = req.body.input;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":"Bearer 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"
    },
    body: JSON.stringify({
      model:"gpt-4",
      messages:[
        {role:"system", content:"You are a therapist in the style of Katana Zero."},
        {role:"user", content:userInput}
      ],
      max_tokens:150
    })
  });
  const data = await response.json();
  res.json({reply: data.choices[0].message.content});
});

app.listen(3000, ()=>console.log("Server running on http://localhost:3000"));
