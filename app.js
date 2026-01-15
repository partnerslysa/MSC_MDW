const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const { Client } = require('ssh2');
const concatStream = require('concat-stream');
const jwt = require('jsonwebtoken');
require('dotenv').config();

let auth = function(req, res, next){
  const token = req.header('x-auth-token');
  if(!token)
    return res.status(401).json({Auth: 'Sin token, no tienes autorizacion'});

  try{
    const decoded = jwt.verify(token, process.env.API_KEY);
    next();
  } catch(e){
    res.status(400).json({Auth: 'Token invalido'});
  }
}

const app = express();
const port = 4000;
app.use(bodyParser.json());

// === CONFIG SFTP PARA QGTUNNEL ===
// Todo tráfico SFTP saldrá por QGTunnel en localhost:2222
const QGTUNNEL_HOST = '127.0.0.1';
const QGTUNNEL_PORT = 2222;

// -------------------------
// SERVICIO CARGA DE ARCHIVO
// -------------------------
app.post('/uploadFile', auth, async (req, res) => {
  const { fileName, fileUrl, username, password, remotePath } = req.body;
  const respuesta = await axios.get(fileUrl);

  const localPath = `ArchivosTXT/${fileName}`;
  require('fs').writeFileSync(localPath, respuesta.data, 'utf-8');

  const conn = new Client();
  const sftpConfig = {
    host: QGTUNNEL_HOST,
    port: QGTUNNEL_PORT,
    username,
    password
  };

  conn.on('ready', () => {
    conn.sftp((err, sftp) => {
      if(err) {
        conn.end();
        return res.status(500).json({error: true, message: err.message});
      }

      const writeStream = sftp.createWriteStream(`${remotePath}${fileName}`);
      require('fs').createReadStream(localPath).pipe(writeStream);

      writeStream.on('close', () => {
        sftp.end();
        conn.end();
        res.status(200).json({error: false, message: `Archivo ${fileName} cargado correctamente.`});
      });

      writeStream.on('error', (uploadError) => {
        sftp.end();
        conn.end();
        res.status(500).json({error: true, message: uploadError.message});
      });
    });
  }).connect(sftpConfig);

  conn.on('error', (err) => {
    res.status(500).json({error: true, message: `Error SFTP: ${err.message}`});
  });
});

// -------------------------
// SERVICIO BUSQUEDA DE ARCHIVOS
// -------------------------
app.post('/searchFiles', auth, async (req, res) => {
  const { username, password, remotePath } = req.body;

  const conn = new Client();
  const sftpConfig = {
    host: QGTUNNEL_HOST,
    port: QGTUNNEL_PORT,
    username,
    password
  };

  conn.on('ready', () => {
    conn.sftp((err, sftp) => {
      if(err) {
        conn.end();
        return res.status(500).json({error: true, message: err.message});
      }

      sftp.readdir(remotePath, (err, files) => {
        sftp.end();
        conn.end();
        if(err) return res.status(500).json({error: true, message: err.message});

        const fileNames = files.map(f => f.filename);
        res.status(200).json({
          error: false,
          message: `Archivos listados correctamente`,
          fileName_array: fileNames
        });
      });
    });
  }).connect(sftpConfig);

  conn.on('error', (err) => {
    res.status(500).json({error: true, message: `Error SFTP: ${err.message}`});
  });
});

// -------------------------
// SERVICIO ELIMINAR ARCHIVO
// -------------------------
app.post('/deleteFile', auth, async (req, res) => {
  const { fileName, username, password, remotePath } = req.body;

  const conn = new Client();
  const sftpConfig = {
    host: QGTUNNEL_HOST,
    port: QGTUNNEL_PORT,
    username,
    password
  };

  conn.on('ready', () => {
    conn.sftp((err, sftp) => {
      if(err) {
        conn.end();
        return res.status(500).json({error: true, message: err.message});
      }

      sftp.unlink(`${remotePath}${fileName}`, (unlinkErr) => {
        sftp.end();
        conn.end();
        if(unlinkErr) return res.status(500).json({error: true, message: unlinkErr.message});
        res.status(200).json({error: false, message: `Archivo ${fileName} eliminado correctamente.`});
      });
    });
  }).connect(sftpConfig);

  conn.on('error', (err) => {
    res.status(500).json({error: true, message: `Error SFTP: ${err.message}`});
  });
});

// -------------------------
// SERVICIOS DE PRUEBA
// -------------------------
app.get("/", auth, (req, res) => res.json({Status: 'OK'}));

app.get("/getJWT", (req, res) => {
  const token = req.header('x-auth-token');
  if(!token) return res.status(401).json({error: true, message: 'Sin token, no tienes autorizacion'});
  try{
    const JWT = jwt.sign("{}", token);
    const decoded = jwt.verify(JWT, process.env.API_KEY);
    res.status(200).json({error: false, JWT});
  } catch(e){
    res.status(400).json({error: true, Auth: 'Token invalido'});
  }
});

// -------------------------
// INICIAR SERVIDOR
// -------------------------
app.listen(port, () => console.log(`Servidor escuchando en http://localhost:${port}`));
