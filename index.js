const express = require('express');
const path = require('path')
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

  buscarDependencia(pasta, dependencia).then((resultados) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.json(resultados);
    console.log(resultados, "IBAG THEN");
  }).catch((err) => {
    console.log(err);
    res.status(500).send('Erro ao buscar dependência');
  });
});

app.listen(port, () => {
  console.log(`Servidor escutando na porta ${port}`)
});

async function buscarDependencia(pasta, dependencia) {
  const arquivos = await fs.promises.readdir(pasta);
  const promessas = arquivos.map(async (arquivo) => {
    const caminhoCompleto = path.join(pasta, arquivo);
    const stats = await fs.promises.stat(caminhoCompleto);

    if (stats.isDirectory()) {
      return buscarDependencia(caminhoCompleto, dependencia);
    } else {
      const leitor = readline.createInterface({
        input: fs.createReadStream(caminhoCompleto, { encoding: 'utf-8' }),
        crlfDelay: Infinity,
      });

      let numLinha = 1;
      let encontrado = false;

      return new Promise((resolve) => {
        leitor.on('line', (linha) => {
          if (linha.includes(dependencia)) {
            encontrado = true;
            resolve({
              nomeArquivo: arquivo,
              caminhoRelativo: path.relative(pasta, caminhoCompleto),
              linha: numLinha,
            });
            leitor.close();
          }
          numLinha++;
        });

        leitor.on('close', () => {
          if (!encontrado) {
            resolve(null);
          }
        });

        leitor.on('error', (err) => {
          console.error(`Erro ao ler o arquivo ${caminhoCompleto}: ${err}`);
          resolve(null);
        });
      });
    }
  });

  const resultados = (await Promise.all(promessas)).filter(
    (resultado) => resultado !== null
  );

  console.log(`Busca concluída na pasta ${pasta}`);
  return resultados;
}


// async function buscarDependencia(pasta, dependencia) {
//   return new Promise((resolve, reject) => {
//     const resultados = [];

//     const percorrerPasta = (pastaAtual) => {
//       const arquivos = fs.readdirSync(pastaAtual);

//       arquivos.forEach((arquivo) => {
//         const caminhoCompleto = path.join(pastaAtual, arquivo);
//         const stats = fs.statSync(caminhoCompleto);

//         if (stats.isDirectory()) {
//           // se o arquivo atual for um diretório, chamar a função recursivamente para percorrer a subpasta
//           percorrerPasta(caminhoCompleto);
//         } else {
//           // se o arquivo atual for um arquivo, ler o arquivo em busca da dependência
//           const leitor = readline.createInterface({
//             input: fs.createReadStream(caminhoCompleto, { encoding: 'utf-8' }),
//             crlfDelay: Infinity
//           });

//           let numLinha = 1;

//           leitor.on('line', (linha) => {
//             if (linha.includes(dependencia)) {
//               console.log("INCLUI")
//               resultados.push({
//                 nomeArquivo: arquivo,
//                 caminhoRelativo: path.relative(pasta, caminhoCompleto),
//                 linha: numLinha,
//               });
//               console.log(resultados, "RESULTADO")
//             }
//             numLinha++;
//           });

//           leitor.on('close', () => {
//             console.log(`Busca concluída no arquivo ${caminhoCompleto}`);
//           });

//           leitor.on('error', (err) => {
//             console.error(`Erro ao ler o arquivo ${caminhoCompleto}: ${err}`);
//           });
//         }
//       });
//     };

//     console.log(pasta, "PASTAS")

//     percorrerPasta(pasta);

//     console.log(`Busca concluída na pasta ${pasta}`);
//     resolve(resultados);
//   });
// }

