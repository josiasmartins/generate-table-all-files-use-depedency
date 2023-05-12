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

// app.post('/buscar-dependencia', (req, res) => {
//   const pasta = req.body.pasta;
//   const dependencia = req.body.dependencia;

//   console.log(pasta, dependencia, " depdendencia");

//   const resultado = buscarDependencia(pasta, dependencia);

//   console.log(resultado);

//   res.render('resultado.html', { resultado });
// });

// app.post('/buscar-dependencia', (req, res) => {
//   const pasta = req.body.pasta;
//   const dependencia = req.body.dependencia;

//   console.log(pasta, dependencia, " depdendencia");

//   const resultado = buscarDependencia(pasta, dependencia);

//   console.log(resultado);

//   res.sendFile(path.join(__dirname, 'public', 'resultado.html'));
// });

// app.post('/buscar-dependencia', (req, res) => {
//   const pasta = req.body.pasta;
//   const dependencia = req.body.dependencia;

//   buscarDependencia(pasta, dependencia)
//     .then((resultados) => {
//       res.header("Access-Control-Allow-Origin", "*");
//       res.json(resultados);
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).send("Erro ao buscar dependência");
//     });
// });

// app.post('/buscar-dependencia', (req, res) => {
//   const pasta = req.body.pasta;
//   const dependencia = req.body.dependencia;

//   buscarDependencia(pasta, dependencia).then((resultados) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.json(resultados);
//   }).catch((err) => {
//     console.log(err);
//     res.status(500).send('Erro ao buscar dependência');
//   });
// });

app.post('/buscar-dependencia', (req, res) => {
  const pasta = req.body.pasta;
  const dependencia = req.body.dependencia;

  const resultados = [];
  percorrerRecursivamente(pasta, dependencia, resultados)
    .then(() => {
      console.log(resultados)
      res.header("Access-Control-Allow-Origin", "*");
      res.json(resultados);
    }).catch((err) => {
      console.log(err);
      res.status(500).send('Erro ao buscar dependência');
    });
});



app.listen(port, () => {
  console.log(`Servidor escutando na porta ${port}`)
});

async function percorrerRecursivamente(pasta, dependencia, resultados) {
  const arquivos = await fs.promises.readdir(pasta, { withFileTypes: true });
  for (const arquivo of arquivos) {
    const caminho = path.join(pasta, arquivo.name);
    if (arquivo.isDirectory()) {
      await percorrerRecursivamente(caminho, dependencia, resultados);
    } else {
      const extensao = path.extname(arquivo.name);
      if (extensao === '.js') { // buscar apenas em arquivos .js
        try {
          const resultadosArquivo = await buscarDependencia(caminho, dependencia);
          if (resultadosArquivo.length > 0) {
            resultados.push(...resultadosArquivo);
          }
        } catch (err) {
          console.error(`Erro ao buscar dependência em ${caminho}: ${err.message}`);
        }
      }
    }
  }
}

async function buscarDependencia(arquivo, dependencia) {
  return new Promise((resolve, reject) => {
    const resultados = [];

    const leitor = readline.createInterface({
      input: fs.createReadStream(arquivo, { encoding: 'utf-8' }),
      crlfDelay: Infinity
    });

    let numLinha = 1;

    leitor.on('line', (linha) => {
      if (linha.includes(dependencia)) {
        resultados.push({
          nomeArquivo: arquivo,
          caminhoRelativo: path.relative(appRoot.path, arquivo),
          linha: numLinha,
        });
      }
      numLinha++;
    });

    leitor.on('close', () => {
      resolve(resultados);
    });

    leitor.on('error', (err) => {
      reject(err);
    });
  });
}

// async function buscarDependencia(pasta, dependencia) {
//   return new Promise((resolve, reject) => {
//     const resultados = [];

//     // Verifica se o caminho é de fato um arquivo
//     fs.stat(pasta, (err, stats) => {
//       if (err) {
//         reject(err);
//       } else if (!stats.isFile()) {
//         reject(new Error(`${pasta} não é um arquivo`));
//       } else {
//         const leitor = readline.createInterface({
//           input: fs.createReadStream(pasta, { encoding: 'utf-8' }),
//           crlfDelay: Infinity
//         });

//         let numLinha = 1;
//         let arquivoAtual = '';

//         leitor.on('line', (linha) => {
//           if (linha.includes(dependencia)) {
//             resultados.push({
//               nomeArquivo: arquivoAtual,
//               caminhoRelativo: path.relative(pasta, arquivoAtual),
//               linha: numLinha,
//             });
//           }
//           numLinha++;
//         });

//         leitor.on('close', () => {
//           console.log(`Busca concluída no arquivo ${pasta}`);
//           resolve(resultados);
//         });

//         leitor.on('error', (err) => {
//           reject(err);
//         });
//       }
//     });
//   });
// }


// async function buscarDependencia(pasta, dependencia) {
//   return new Promise((resolve, reject) => {
//     const resultados = [];

//     const leitor = readline.createInterface({
//       input: fs.createReadStream(pasta, { encoding: 'utf-8' }),
//       crlfDelay: Infinity
//     });

//     let numLinha = 1;
//     let arquivoAtual = '';

//     leitor.on('line', (linha) => {
//       if (linha.includes(dependencia)) {
//         resultados.push({
//           nomeArquivo: arquivoAtual,
//           caminhoRelativo: path.relative(pasta, arquivoAtual),
//           linha: numLinha,
//         });
//       }
//       numLinha++;
//     });

//     leitor.on('close', () => {
//       console.log(`Busca concluída na pasta ${pasta}`);
//       resolve(resultados);
//     });

//     leitor.on('error', (err) => {
//       reject(err);
//     });
//   });
// }


// function buscarDependencia(pasta, dependencia) {
//   return new Promise((resolve, reject) => {
//     const resultados = [];

//     // Cria uma instância do objeto 'readline' para ler o conteúdo dos arquivos linha por linha
//     const leitor = readline.createInterface({
//       input: fs.createReadStream(pasta, { encoding: 'utf-8' }),
//       crlfDelay: Infinity
//     });

//     let numLinha = 1;
//     let arquivoAtual = '';

//     leitor.on('line', (linha) => {
//       if (linha.includes(dependencia)) {
//         resultados.push({
//           nomeArquivo: arquivoAtual,
//           caminhoRelativo: path.relative(pasta, arquivoAtual),
//           linha: numLinha,
//         });
//       }
//       numLinha++;
//     });

//     leitor.on('close', () => {
//       console.log(`Busca concluída na pasta ${pasta}`);
//       resolve(resultados);
//     });
//   });
// }

// function buscarDependencia(pasta, dependencia, callback) {
//   const resultados = [];

//   // Cria uma instância do objeto 'readline' para ler o conteúdo dos arquivos linha por linha
//   const leitor = readline.createInterface({
//     input: fs.createReadStream(pasta, { encoding: 'utf-8' }),
//     crlfDelay: Infinity
//   });

//   let numLinha = 1;
//   let arquivoAtual = '';

//   leitor.on('line', (linha) => {
//     if (linha.includes(dependencia)) {
//       resultados.push({
//         nomeArquivo: arquivoAtual,
//         caminhoRelativo: path.relative(pasta, arquivoAtual),
//         linha: numLinha,
//       });
//     }
//     numLinha++;
//   });

//   leitor.on('close', () => {
//     console.log(`Busca concluída na pasta ${pasta}`);
//     callback(resultados);
//   });

//   leitor.on('error', (err) => {
//     console.error(err);
//     callback([]);
//   });
// }


// function buscarDependencia(caminho, dependencia) {
//   const resultados = [];

//   if (fs.statSync(caminho).isDirectory()) {
//     // O caminho especificado é um diretório, então percorre todos os arquivos dentro dele
//     fs.readdirSync(caminho).forEach((arquivo) => {
//       const caminhoArquivo = path.join(caminho, arquivo);
//       const stat = fs.statSync(caminhoArquivo);

//       if (stat.isFile()) {
//         // Cria uma instância do objeto 'readline' para ler o conteúdo dos arquivos linha por linha
//         const leitor = readline.createInterface({
//           input: fs.createReadStream(caminhoArquivo, { encoding: 'utf-8' }),
//           crlfDelay: Infinity
//         });

//         let numLinha = 1;

//         leitor.on('line', (linha) => {
//           if (linha.includes(dependencia)) {
//             resultados.push({
//               nomeArquivo: arquivo,
//               caminhoRelativo: path.relative(caminho, caminhoArquivo),
//               linha: numLinha,
//             });
//           }
//           numLinha++;
//         });

//         leitor.on('close', () => {
//           console.log(`Busca concluída no arquivo ${caminhoArquivo}`);
//         });
//       }
//     });
//   } else {
//     // O caminho especificado é um arquivo, então cria uma instância do objeto 'readline' para ler o conteúdo dele
//     const leitor = readline.createInterface({
//       input: fs.createReadStream(caminho, { encoding: 'utf-8' }),
//       crlfDelay: Infinity
//     });

//     let numLinha = 1;

//     leitor.on('line', (linha) => {
//       if (linha.includes(dependencia)) {
//         resultados.push({
//           nomeArquivo: path.basename(caminho),
//           caminhoRelativo: '',
//           linha: numLinha,
//         });
//       }
//       numLinha++;
//     });

//     leitor.on('close', () => {
//       console.log(`Busca concluída no arquivo ${caminho}`);
//     });
//   }

//   return resultados;
// }

// function buscarDependencia(pasta, dependencia) {
//   const resultado = [];

//   function buscarRecursivamente(pastaAtual) {
//     const arquivos = fs.readdirSync(pastaAtual);

//     arquivos.forEach(arquivo => {
//       const caminhoCompleto = path.join(pastaAtual, arquivo);
//       const stat = fs.statSync(caminhoCompleto);

//       if (stat.isDirectory()) {
//         buscarRecursivamente(caminhoCompleto);
//       } else if (stat.isFile()) {
//         const conteudoArquivo = fs.readFileSync(caminhoCompleto, 'utf-8');
//         const linhas = conteudoArquivo.split('\n');

//         linhas.forEach((linha, index) => {
//           if (linha.includes(dependencia)) {
//             resultado.push({
//               nomeArquivo: arquivo,
//               caminhoRelativo: path.relative(pasta, caminhoCompleto),
//               linha: index + 1
//             });
//           }
//         });
//       }
//     });
//   }

//   buscarRecursivamente(pasta);

//   console.log(resultado);
//   return resultado;
// }
