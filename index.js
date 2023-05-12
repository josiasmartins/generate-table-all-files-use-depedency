const express = require('express');
const path = require('path');
const fs = require('fs');
const html = require('html');
const readline = require('readline');

const app = express();
const port = 3001;

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
  console.log("CLIENTE")
});

app.post('/buscar-dependencia', (req, res) => {
  const pasta = req.body.pasta;
  const dependencia = req.body.dependencia;

  const resultados = buscarDependenciaSync(pasta, dependencia);
  
  res.header("Access-Control-Allow-Origin", "*");
  res.json(resultados);
  console.log(resultados, "IBAG THEN");
});

app.listen(port, () => {
  console.log(`Servidor escutando na porta ${port}`)
});



// function buscarDependenciaSync(pasta, dependencia) {
//   const arquivos = fs.readdirSync(pasta);
//   const resultados = [];

//   for (let i = 0; i < arquivos.length; i++) {
//     const arquivo = arquivos[i];
//     const caminhoCompleto = path.join(pasta, arquivo);
//     const stats = fs.statSync(caminhoCompleto);

//     if (stats.isDirectory()) {
//       const subresultados = buscarDependenciaSync(caminhoCompleto, dependencia);
//       resultados.push(...subresultados);
//     } else {
//       const texto = fs.readFileSync(caminhoCompleto, { encoding: 'utf-8' });
//       let linhas = [];
//       let linhaAtual = 1;
//       let ultimaPosicao = -1;
      
//       while (true) {
//         const posicao = texto.indexOf(dependencia, ultimaPosicao + 1);
//         if (posicao === -1) {
//           break;
//         }
//         if (ultimaPosicao === -1) {
//           linhas.push(linhaAtual);
//         } else if (linhaAtual !== linhas[linhas.length - 1]) {
//           linhas.push(linhaAtual);
//         }
//         ultimaPosicao = posicao;
//         while (texto[ultimaPosicao - 1] !== '\n' && ultimaPosicao > 0) {
//           ultimaPosicao--;
//         }
//         linhaAtual = texto.slice(0, ultimaPosicao).split('\n').length;
//       }
      
//       if (linhas.length > 0) {
//         const objeto = {
//           nomeArquivo: arquivo,
//           caminhoRelativo: path.relative(pasta, caminhoCompleto),
//           linha: linhas.join(', '),
//         };
//         console.log(objeto, "OBJETO");
//         resultados.push(objeto);
//       }
//     }
//   }

//   console.log(resultados, "RS");
//   console.log(`Busca concluída na pasta ${pasta}`);
//   return resultados;
// }



// function buscarDependenciaSync(pasta, dependencia) {
//   const arquivos = fs.readdirSync(pasta);
//   const resultados = [];

//   for (let i = 0; i < arquivos.length; i++) {
//     const arquivo = arquivos[i];
//     const caminhoCompleto = path.join(pasta, arquivo);
//     const stats = fs.statSync(caminhoCompleto);

//     if (stats.isDirectory()) {
//       const subresultados = buscarDependenciaSync(caminhoCompleto, dependencia);
//       resultados.push(...subresultados);
//     } else {
//       const linhas = fs.readFileSync(caminhoCompleto, { encoding: 'utf-8' }).split('\n');
//       for (let j = 0; j < linhas.length; j++) {
//         const linha = linhas[j];
//         if (linha.includes(dependencia)) {
//           const objeto = {
//             nomeArquivo: arquivo,
//             caminhoRelativo: path.relative(pasta, caminhoCompleto),
//             linha: j + 1,
//           };
//           console.log(objeto, "OBJETO");
//           resultados.push(objeto);
//           break;
//         }
//       }
//     }
//   }

//   console.log(resultados, "RS");
//   console.log(`Busca concluída na pasta ${pasta}`);
//   return resultados;
// }

function buscarDependenciaSync(pasta, dependencia, raiz = pasta) {
  const arquivos = fs.readdirSync(pasta);
  const resultados = [];

  for (let i = 0; i < arquivos.length; i++) {
    const arquivo = arquivos[i];
    const caminhoCompleto = path.join(pasta, arquivo);
    const caminhoRelativo = path.relative(raiz, caminhoCompleto);
    const stats = fs.statSync(caminhoCompleto);

    if (stats.isDirectory()) {
      const subresultados = buscarDependenciaSync(caminhoCompleto, dependencia, raiz);
      resultados.push(...subresultados);
    } else {
      const linhas = fs.readFileSync(caminhoCompleto, { encoding: 'utf-8' }).split('\n');
      for (let j = 0; j < linhas.length; j++) {
        const linha = linhas[j];
        if (linha.includes(dependencia)) {
          const objeto = {
            nomeArquivo: arquivo,
            caminhoRelativo: caminhoRelativo,
            linha: j + 1,
          };
          console.log(objeto, "OBJETO");
          resultados.push(objeto);
          break;
        }
      }
    }
  }

  console.log(resultados, "RS");
  console.log(`Busca concluída na pasta ${pasta}`);
  return resultados;
}



