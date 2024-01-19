const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const { Client } = require('ssh2');
const concatStream = require('concat-stream');
const { error } = require('console');
const app = express();
const port = 3000;

app.use(bodyParser.json());

//SERVICIO DE CARGA DE ARCHIVO EN SERVIDOR SFTP
app.post('/uploadFile', async (req, res) => {

  const fileName = req[`body`][`fileName`];
  const fileUrl = req[`body`][`fileUrl`];
  const host = req[`body`][`host`];
  const port = req[`body`][`port`];
  const username = req[`body`][`username`];
  const password = req[`body`][`password`];
  const remotePath2 = req[`body`][`remotePath`];
  const respuesta = await axios.get(fileUrl);

  console.log(`24. fileName: ${fileName} - fileUrl: ${fileUrl} - host: ${host} - port: ${port} - username: ${username} - password: ${password} - remotePath: ${remotePath2}\n`);

  const sftpConfig = {
    host: host,
    port: port,
    username: username,
    password: password,
    algorithms: {
      kex: [
        "diffie-hellman-group1-sha1",
        "ecdh-sha2-nistp256",
        "ecdh-sha2-nistp384",
        "ecdh-sha2-nistp521",
        "diffie-hellman-group-exchange-sha256",
        "diffie-hellman-group14-sha1"
      ],
      cipher: [
        "3des-cbc",
        "aes128-ctr",
        "aes192-ctr",
        "aes256-ctr",
        "aes128-gcm",
        "aes128-gcm@openssh.com",
        "aes256-gcm",
        "aes256-gcm@openssh.com"
      ],
      serverHostKey: [
        "ssh-rsa",
        "ecdsa-sha2-nistp256",
        "ecdsa-sha2-nistp384",
        "ecdsa-sha2-nistp521"
      ],
      hmac: [
        "hmac-sha2-256",
        "hmac-sha2-512",
        "hmac-sha1"
      ]
    }
  };

  const conn = new Client();

  try 
  {
    await conn.connect(sftpConfig);

    conn.on('ready', () => {
      console.log(`71. Host: ${host} - Conexión SFTP ready`);

      //Armado de rutas
      const localPath = `ArchivosTXT/${fileName}`;
      const remotePath = `${remotePath2}${fileName}`;

      //Se genera archivo TXT en carpeta del proyecto
      require('fs').writeFileSync(localPath, respuesta.data, 'utf-8');

      console.log(`80. Host: ${host} - localPath: ${localPath} - remotePath: ${remotePath}\n`);
      
      conn.sftp((err, sftp) => {
        if (err)
        {
          let message = `Host: ${host} - Error al establecer la conexión SFTP. Detalle: ${err}`;
          console.error(message);
          
          res.status(500).json({
            error: true,
            message: message,
            fileName: fileName,
            fileContent: null
          });

          return;
        }

        const readStream = require('fs').createReadStream(localPath);

        //Se crea archivo en servidor sftp
        const writeStream = sftp.createWriteStream(remotePath);
        readStream.pipe(writeStream);

        writeStream.on(`close`, () => {
          let message =  `Host: ${host} - Directorio : ${remotePath} - Nombre archivo: ${fileName} - Archivo cargado exitosamente`;
          console.log(message);
          
          res.status(200).json({
            error: false,
            message: message,
            fileName: fileName,
            fileContent: null
          });

          sftp.end();
          conn.end();
          return;
        });

        writeStream.on(`error`, (uploadError) => {
          let message =  `Host: ${host} - Directorio : ${remotePath} - Nombre archivo: ${fileName} - Archivo no pude ser cargado. Detalles: ${uploadError.message}`;
          res.status(500).json({
            error: true,
            message: message,
            fileName: fileName,
            fileContent: null
          });

          sftp.end();
          conn.end();
          return;
        });
      });
    });

    conn.on(`error`, (err) => {
      
      let message = `Host: ${host} - Conexión SFTP error - servicio uploadFile`;

      console.log(message);

      res.status(500).json({
        error: true,
        message: message,
        fileName: fileName,
        fileContent: null
      });

      return;
    });
  }
  catch (connectError)
  {
    let message = `Excepción genereal en servicio uploadFile`;
    res.status(500).json({
      error: true,
      message: message,
      fileName: fileName,
      fileContent: null
    });

    return;
  }

});

//SERVICIO DE BUSQUEDA DE ARCHIVOS EN SERVIDOR SFPT
app.post('/searchFile', async (req, res) => {

  const fileName = req[`body`][`fileName`];
  const host = req[`body`][`host`];
  const port = req[`body`][`port`];
  const username = req[`body`][`username`];
  const remotePath = req[`body`][`remotePath`];
  const password = req[`body`][`password`];

  console.log(`177. fileName: ${fileName} - host: ${host} - port: ${port} - username: ${username} - password: ${password} - remotePath: ${remotePath}\n`);
  
  const sftpConfig = {
    host: host,
    port: port,
    username: username,
    password: password,
    algorithms: {
      kex: [
        "diffie-hellman-group1-sha1",
        "ecdh-sha2-nistp256",
        "ecdh-sha2-nistp384",
        "ecdh-sha2-nistp521",
        "diffie-hellman-group-exchange-sha256",
        "diffie-hellman-group14-sha1"
      ],
      cipher: [
        "3des-cbc",
        "aes128-ctr",
        "aes192-ctr",
        "aes256-ctr",
        "aes128-gcm",
        "aes128-gcm@openssh.com",
        "aes256-gcm",
        "aes256-gcm@openssh.com"
      ],
      serverHostKey: [
        "ssh-rsa",
        "ecdsa-sha2-nistp256",
        "ecdsa-sha2-nistp384",
        "ecdsa-sha2-nistp521"
      ],
      hmac: [
        "hmac-sha2-256",
        "hmac-sha2-512",
        "hmac-sha1"
      ]
    }
  };

  const conn = new Client();

  try
  {
    await conn.connect(sftpConfig);

    conn.on(`ready`, () => {
      
      console.log(`225. Host: ${host} - Conexión SFTP ready`);

      conn.sftp((err, sftp) => {
        if (err)
        {
          let message = `Host: ${host} - Error al establecer la conexión SFTP. Detalle: ${err}`;
          console.error(message);
          
          res.status(500).json({
            error: true,
            message: message,
            fileName: fileName,
            fileContent: null
          });

          return;
        }
  
        //Obtener lista de archivos en el directorio remoto
        sftp.readdir(remotePath, (readdirErr, listaArchivos) => {
          if (readdirErr)
          {
            let message = `Host: ${host} - Directorio: ${remotePath} - Error al leer el directorio remoto. Detalle: ${err}`;
            console.error(message);

            res.status(500).json({
              error: true,
              message: message,
              fileName: fileName,
              fileContent: null
            });

            sftp.end();
            conn.end();
            return;
          }
          
          const nombresArchivos = listaArchivos.map((archivo) => archivo.filename);
          console.log(`263. Host: ${host} - Directorio: ${remotePath} - Nombres de archivos encontrados: ${nombresArchivos}`);

          //Busqueda de archivo especifico
          const archivoEncontrado = listaArchivos.find((archivo) => archivo.filename === fileName);
  
          if (archivoEncontrado)
          {
            console.log(`270. Host: ${host} - Directorio: ${remotePath} - Nombre archivo: ${fileName} - Archivo encontrado`);

            //Extracción de contenido del archivo
            const readStream = sftp.createReadStream(`${remotePath}/${fileName}`);

            readStream.on('error', (error) => {
              console.error(`Error al leer el archivo ${fileName}: ${error.message}`);
              // Manejo del error
           });

           readStream.on('open', () => {
            console.log(`Comenzando a leer el archivo ${fileName}.`);
            // Acciones al abrir el archivo para lectura
              readStream.pipe(concatStream((contenido) =>
              {
                console.log(`277. Host: ${host} - Directorio: ${remotePath} - Nombre archivo: ${fileName} - Contenido: ${contenido.toString()}`);
                let message = `Host: ${host} - Directorio: ${remotePath} - Nombre archivo: ${fileName} - Archivo encontrado`;

                res.status(200).json({
                  error: false,
                  message: message,
                  fileName: fileName,
                  fileContent: contenido.toString()
                });

                sftp.end();
                conn.end();            
                readStream.close();
                return;
              }));
            });

          }
          else
          {
            let message = `Host: ${host} - Directorio: ${remotePath} - Nombre archivo: ${fileName} - Archivo no encontrado`;

              res.status(500).json({
                error: true,
                message: message,
                fileName: fileName,
                fileContent: null
              });

              sftp.end();
              conn.end();
              return;
          }

        });

      });

    });

    conn.on(`error`, (err) => {
      
      let message = `Host: ${host} - Conexión SFTP error - servicio searchFile`;

      console.log(message);

      res.status(500).json({
        error: true,
        message: message,
        fileName: fileName,
        fileContent: null
      });

      return;
    });
  }
  catch(e)
  {
    let message = `Excepción genereal en servicio searchFile`;
    res.status(500).json({
      error: true,
      message: message,
      fileName: fileName,
      fileContent: null
    });

    return;
  }

});

//SERVICIO DE BUSQUEDA DE ARCHIVOS EN SERVIDOR SFPT
app.post('/searchFiles', async (req, res) => {

  const host = req[`body`][`host`];
  const port = req[`body`][`port`];
  const username = req[`body`][`username`];
  const remotePath = req[`body`][`remotePath`];
  const password = req[`body`][`password`];

  console.log(`177. host: ${host} - port: ${port} - username: ${username} - password: ${password} - remotePath: ${remotePath}\n`);
  
  const sftpConfig = {
    host: host,
    port: port,
    username: username,
    password: password,
    algorithms: {
      kex: [
        "diffie-hellman-group1-sha1",
        "ecdh-sha2-nistp256",
        "ecdh-sha2-nistp384",
        "ecdh-sha2-nistp521",
        "diffie-hellman-group-exchange-sha256",
        "diffie-hellman-group14-sha1"
      ],
      cipher: [
        "3des-cbc",
        "aes128-ctr",
        "aes192-ctr",
        "aes256-ctr",
        "aes128-gcm",
        "aes128-gcm@openssh.com",
        "aes256-gcm",
        "aes256-gcm@openssh.com"
      ],
      serverHostKey: [
        "ssh-rsa",
        "ecdsa-sha2-nistp256",
        "ecdsa-sha2-nistp384",
        "ecdsa-sha2-nistp521"
      ],
      hmac: [
        "hmac-sha2-256",
        "hmac-sha2-512",
        "hmac-sha1"
      ]
    }
  };

  const conn = new Client();

  try
  {
    await conn.connect(sftpConfig);

    conn.on(`ready`, () => {
      
      console.log(`225. Host: ${host} - Conexión SFTP ready`);

      conn.sftp((err, sftp) => {
        if (err)
        {
          let message = `Host: ${host} - Error al establecer la conexión SFTP. Detalle: ${err}`;
          console.error(message);
          
          res.status(500).json({
            error: true,
            message: message,
            fileContent: null
          });

          return;
        }

        //Obtener lista de archivos en el directorio remoto
        sftp.readdir(remotePath, (readdirErr, listaArchivos) => {
          if (readdirErr)
          {
            let message = `Host: ${host} - Directorio: ${remotePath} - Error al leer el directorio remoto. Detalle: ${err}`;
            console.error(message);

            res.status(500).json({
              error: true,
              message: message
            });

            sftp.end();
            conn.end();
            return;
          }
          let fileName_array = [];

          for(let i =0; i < listaArchivos.length; i++){
            console.log(`263. Host: ${host} - Directorio: ${remotePath} - Archivos: ${JSON.stringify(listaArchivos[i])}`);
            const fileName = listaArchivos[i].filename;
            fileName_array.push(fileName);
          }
          console.log(`453. listaArchivos: ${JSON.stringify(fileName_array)}`);
          let message = `Host: ${host} - Conexión SFTP exito - servicio searchFiles`;

          res.status(200).json({
            error: false,
            message: message,
            fileName_array: fileName_array,
          });
          sftp.end();
          conn.end();
          return;

        });

      });

    });

    conn.on(`error`, (err) => {
      
      let message = `Host: ${host} - Conexión SFTP error - servicio searchFiles`;

      console.log(message);

      res.status(500).json({
        error: true,
        message: message,
        fileName_array: null,
        contenido_array: null,
        errorm: JSON.stringify(err)
      });

      return;
    });
  }
  catch(e)
  {
    let message = `Excepción general en servicio searchFile`;
    res.status(500).json({
      error: true,
      message: message,
      fileName_array: null,
      contenido_array: null
    });

    return;
  }

});

//SERVICIO DE BUSQUEDA DE ARCHIVOS EN SERVIDOR SFPT
app.post('/deleteFile', async (req, res) => {

  const fileName = req[`body`][`fileName`];
  const host = req[`body`][`host`];
  const port = req[`body`][`port`];
  const username = req[`body`][`username`];
  const remotePath = req[`body`][`remotePath`];
  const password = req[`body`][`password`];

  console.log(`177. fileName: ${fileName} - host: ${host} - port: ${port} - username: ${username} - password: ${password} - remotePath: ${remotePath}\n`);
  
  const sftpConfig = {
    host: host,
    port: port,
    username: username,
    password: password,
    algorithms: {
      kex: [
        "diffie-hellman-group1-sha1",
        "ecdh-sha2-nistp256",
        "ecdh-sha2-nistp384",
        "ecdh-sha2-nistp521",
        "diffie-hellman-group-exchange-sha256",
        "diffie-hellman-group14-sha1"
      ],
      cipher: [
        "3des-cbc",
        "aes128-ctr",
        "aes192-ctr",
        "aes256-ctr",
        "aes128-gcm",
        "aes128-gcm@openssh.com",
        "aes256-gcm",
        "aes256-gcm@openssh.com"
      ],
      serverHostKey: [
        "ssh-rsa",
        "ecdsa-sha2-nistp256",
        "ecdsa-sha2-nistp384",
        "ecdsa-sha2-nistp521"
      ],
      hmac: [
        "hmac-sha2-256",
        "hmac-sha2-512",
        "hmac-sha1"
      ]
    }
  };

  const conn = new Client();

  try
  {
    await conn.connect(sftpConfig);

    conn.on(`ready`, () => {
      
      console.log(`561. Host: ${host} - Conexión SFTP ready`);

      conn.sftp((err, sftp) => {
        if (err)
        {
          let message = `Host: ${host} - Error al establecer la conexión SFTP. Detalle: ${err}`;
          console.error(message);
          
          res.status(500).json({
            error: true,
            message: message,
            fileName: fileName,
            fileContent: null
          });

          return;
        }
  
        //Obtener lista de archivos en el directorio remoto
        sftp.readdir(remotePath, (readdirErr, listaArchivos) => {
          if (readdirErr)
          {
            let message = `Host: ${host} - Directorio: ${remotePath} - Error al leer el directorio remoto. Detalle: ${err}`;
            console.error(message);

            res.status(500).json({
              error: true,
              message: message,
              fileName: fileName,
              fileContent: null
            });

            sftp.end();
            conn.end();
            return;
          }
          
          const nombresArchivos = listaArchivos.map((archivo) => archivo.filename);
          console.log(`599. Host: ${host} - Directorio: ${remotePath} - Nombres de archivos encontrados: ${nombresArchivos}`);

          //Busqueda de archivo especifico
          const archivoEncontrado = listaArchivos.find((archivo) => archivo.filename === fileName);
  
          if (archivoEncontrado)
          {
            console.log(`606. Host: ${host} - Directorio: ${remotePath} - Nombre archivo: ${fileName} - Archivo encontrado: ${archivoEncontrado}`);

            sftp.unlink(`${remotePath}${fileName}`, (unlinkErr) => {
              if (unlinkErr) {

                let message = `Host: ${host} - Directorio: ${remotePath} - Nombre archivo: ${fileName} - Error al intentar eliminar archivo - Detalle: ${unlinkErr}`;
                console.log(`612. ${message}`);

                res.status(500).json({
                  error: false,
                  message: message,
                  fileName: fileName,
                  eliminado: false
                });
    
                sftp.end();
                conn.end();
                return;

              }
              else
              {
                
                let message = `Host: ${host} - Directorio: ${remotePath} - Nombre archivo: ${fileName} eliminado correctamente`;
                console.log(`630. ${message}`);
    
                res.status(200).json({
                  error: false,
                  message: message,
                  fileName: fileName,
                  eliminado: true
                });
    
                sftp.end();
                conn.end();
                return;
              }
           });
          }
          else
          {
            let message = `Host: ${host} - Directorio: ${remotePath} - Nombre archivo: ${fileName} - Archivo no encontrado`;
            console.log(`648. ${message}`);
            res.status(500).json({
              error: true,
              message: message,
              fileName: fileName,
              fileContent: null
            });

            sftp.end();
            conn.end();
            return;
          }

        });

      });

    });

    conn.on(`error`, (err) => {
      
      let message = `Host: ${host} - Conexión SFTP error - servicio deleteFile - Detalle: ${JSON.stringify(err.message)}`;

      console.log(`671. ${message}`);

      res.status(500).json({
        error: true,
        message: message,
        fileName: fileName,
        fileContent: null
      });

      return;
    });
  }
  catch(e)
  {
    let message = `Excepción general en servicio deleteFile`;
    res.status(500).json({
      error: true,
      message: message,
      fileName: fileName,
      fileContent: null
    });

    return;
  }

});

//SERVICIO DESTINADO A PROBAR LA DISPONIBLIDAD DE LA APLICACION
app.get("/", (req, res) => {
	res.json({
		Status: 'OK'
	})
}); 
  
//INICIAR SERVIDOR
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});