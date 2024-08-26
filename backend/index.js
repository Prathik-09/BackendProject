const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.get('/api/jokes', (req, res) => {
  const jokes = [
    { id: 1, joke: "Joke 1" },
    { id: 2, joke: "Joke 2" },
    { id: 3, joke: "Joke 3" }
  ];
  res.json(jokes);  // Use `res.json()` instead of `res.send()` for sending JSON data
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
