var express = require('express');
var http = require('http');

var app = express();
var server = http.createServer(app);

var io = require('socket.io')(server);
var path = require('path');

const multer  = require('multer')
let i = 1

const fs = require('fs').promises;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `s${i}.png`)
        i = i+1
    }
});

const upload = multer({ storage })

app.use(express.static(path.join(__dirname, './public')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
app.get('/control', (req, res) => {
    res.sendFile(__dirname + '/public/PAGES/control.html');
});
app.get('/sobre', (req, res) => {
    res.sendFile(__dirname + '/public/PAGES/sobre.html');
});
app.get('/apresentacao', (req, res) => {
    res.sendFile(__dirname + '/public/PAGES/apresentacao.html');
});

app.post('/imagensApresentacao', upload.array('imagesApresentation'), async function  (req, res, next) {
    i = 1

    return res.sendFile(__dirname + '/public/PAGES/control.html');
},
(error, req, res, next)=>{
    res.status(400).send({error: error.message})
})

var name;  

io.on('connection', (socket) => {

    socket.on('chat message', (msg) => {
        socket.broadcast.emit('chat message', msg);         //sending message to all except the sender
    });

    socket.on('verify Images', async (info) => {
        let arquivos = await listarArquivosDoDiretorio('./public/uploads');

        let obj = {
            arquivosIMG: arquivos,
            inforIMG: info
        }

        socket.broadcast.emit('verify Images', obj)
    })

    socket.on('send images', (imgs) => {
        socket.broadcast.emit('send images', imgs)
    })
    
});

server.listen(3000, () => {
    console.log('Server listening on :3000');
});

async function listarArquivosDoDiretorio(diretorio, arquivos) {

    if(!arquivos)
        arquivos = [];

    let listaDeArquivos = await fs.readdir(diretorio);
    for(let k in listaDeArquivos) {
        let stat = await fs.stat(diretorio + '/' + listaDeArquivos[k]);
        if(stat.isDirectory())
            await listarArquivosDoDiretorio(diretorio + '/' + listaDeArquivos[k], arquivos);
        else
            arquivos.push(diretorio + '/' + listaDeArquivos[k]);
    }

    return arquivos;

}





