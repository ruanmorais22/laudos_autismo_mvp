const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

const authRoutes = require('./routes/auth.routes');

app.get('/', (req, res) => {
  res.send('API do Sistema de Geração de Laudos de Autismo está no ar!');
});

// Rotas de Autenticação
app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`Servidor backend rodando na porta ${port}`);
});
