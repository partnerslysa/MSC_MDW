const express = require('express');
const multer = require('multer');
const axios = require('axios');
const bodyParser = require('body-parser');
const SftpClient = require('ssh2-sftp-client');
const app = express();
const port = 3000;

// Configuración de Multer para gestionar la carga de archivos
//const storage = multer.memoryStorage();
//const upload = multer({ storage: storage });
app.use(bodyParser.json());

app.post('/upfile', async (req, res) => {

  //const data = req.body;
  //console.log(`data: ${JSON.stringify(data)}`);
    const fileName = req[`body`][`fileName`];
    const fileUrl =req[`body`][`fileUrl`];//'https://3799749-sb1.app.netsuite.com/core/media/media.nl?id=526659&c=3799749_SB1&h=7lP9gQ91BTppGg5ModPdsaYZzJ2P_sxtWzSbjMNyDnCeX2Y7&_xt=.txt';
    const respuesta = await axios.get(fileUrl);

    console.log(`fileName: ${fileName}`);
    console.log(`fileUrl: ${fileUrl}`);
    console.log(`Contenido archivo: ${respuesta.data}`);
    
    const SftpClient = require('ssh2-sftp-client');

    const config = {
        host: '44.197.47.56',
        port: 22,
        username: 'ec2-user',
        privateKey: require('fs').readFileSync('PEM/SantaCarmen.pem')
      };
    
    const sftp = new SftpClient();
    
    // Conectar al servidor SFTP
    sftp.connect(config)
      .then(() => {
        console.log('Conexión establecida con el servidor SFTP');
        //const fileBuffer = req.file.buffer;
        //console.log('fileBuffer: '+fileBuffer);
        //const fileContent = fileBuffer.toString(); // Convertir el buffer a cadena de texto
        
    // Puedes realizar operaciones con el contenido del archivo aquí

    // Enviar respuesta al cliente
    //console.log('fileContent:'+fileContent);
        // Realizar operaciones con el servidor SFTP, por ejemplo:
         
        // sftp.get(remotePath, localFile)
    

      })
      .then(() => {
        const rutaLocal = `ArchivosTXT/${fileName}`;
        //const fileBuffer = req.file.buffer;
        //const fileContent = fileBuffer.toString();
        //console.log('69.fileBuffer: '+fileBuffer);
        //console.log('70.fileContent: '+fileContent);
        const remotePath = `/home/ec2-user/test/${fileName}`;
        //const contenidoArchivo = require('fs').readFileSync('C:/Users/ingaa/Downloads/Archivo Prueba2.txt');
        //console.log('74. contenidoArchivo: '+contenidoArchivo);
        require('fs').writeFileSync(rutaLocal, respuesta.data, 'utf-8');
        //await sftp.put(contenidoArchivo, rutaRemota);
        sftp.put(rutaLocal, remotePath)
        console.log('Desconexión exitosa');
                // Desconectar después de realizar las operaciones
                //return sftp.end();
                res.status(200).json({ message: 'Archivo cargado con éxito.', content: respuesta.data });
      })
      .catch((err) => {
        console.error('Error:', err.message);
      })
    
  });

//SERVICIO DESTINADO A PROBAR LA DISPONIBLIDAD DE LA APLICACION
app.get("/", (req, res) => {
	res.json({
		API: 'Checkout',
		Status: 'OK'
	})
}); 
  
// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
