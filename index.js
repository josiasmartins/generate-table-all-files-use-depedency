const express = require('express');
const path = require('path')
const fs = require('fs');
const html = require('html');

const app = express();
const port = 3001;

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
  console.log("CLIENTE")
});

// app.post('/buscar-dependencia', (req, res) => {
//   const pasta = req.body.pasta;
//   const dependencia = req.body.dependencia;

//   console.log(pasta, dependencia, " depdendencia");

//   const resultado = buscarDependencia(pasta, dependencia);

//   console.log(resultado);

//   res.render('resultado.html', { resultado });
// });

app.post('/buscar-dependencia', (req, res) => {
  const pasta = req.body.pasta;
  const dependencia = req.body.dependencia;

  console.log(pasta, dependencia, " depdendencia");

  const resultado = buscarDependencia(pasta, dependencia);

  console.log(resultado);

  res.sendFile(path.join(__dirname, 'public', 'resultado.html'));
});

app.listen(port, () => {
  console.log(`Servidor escutando na porta ${port}`)
});

function buscarDependencia(pasta, dependencia) {
  const resultado = [];

  function buscarRecursivamente(pastaAtual) {
    const arquivos = fs.readdirSync(pastaAtual);

    arquivos.forEach(arquivo => {
      const caminhoCompleto = path.join(pastaAtual, arquivo);
      const stat = fs.statSync(caminhoCompleto);

      if (stat.isDirectory()) {
        buscarRecursivamente(caminhoCompleto);
      } else if (stat.isFile()) {
        const conteudoArquivo = fs.readFileSync(caminhoCompleto, 'utf-8');
        const linhas = conteudoArquivo.split('\n');

        linhas.forEach((linha, index) => {
          if (linha.includes(dependencia)) {
            resultado.push({
              nomeArquivo: arquivo,
              caminhoRelativo: path.relative(pasta, caminhoCompleto),
              linha: index + 1
            });
          }
        });
      }
    });
  }

  buscarRecursivamente(pasta);

  console.log(resultado);
  return resultado;
}
