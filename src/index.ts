import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import multer from 'multer';
const handlebars = require('express-handlebars');
const tus = require('tus-node-server');
import mime from 'mime-types';
dotenv.config();
const app = express();
const PORT = process.env['PORT'] || 3000;
const staticPath = path.join(__dirname,"./public");
const uploadPath = staticPath+"/uploads";
const uploader = multer();

const hbs = handlebars.create({ 
    extname:'hbs',
    defaultLayout: 'default'
});
app.set('views',path.join(__dirname,"./views"));
app.engine('hbs',hbs.engine);
app.set('view engine','hbs');

app.use(express.static(staticPath));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({extended:false}));

const tusServer = new tus.Server();
const tusRoute = express();
tusRoute.all('*', tusServer.handle.bind(tusServer));
tusServer.datastore = new tus.FileStore({
    path: '/uploads'
});
app.use('/tus', tusRoute);

app.get("/",(req,res)=>{
    res.render('index',{
        pageTitle:"Home"
    });
});

app.post("/upload",uploader.single('userfiles'),async(req,res)=>{
    if(!req.file){
        return res.status(400).send({ message:"file is required" })
    }
    let file = req.file;
    let extension = mime.extension(file.mimetype);
    let filename = Date.now()+"."+extension;
    let writableStream = fs.createWriteStream(uploadPath+"/"+filename);
    try{
        writableStream.write(file.buffer);
        writableStream.end();
        let data = await new Promise((resolve,reject)=>{
            writableStream.on('error',(error)=>{
               reject(`error: ${error.message}`);
            });
            writableStream.on('finish',()=>{
               resolve({
                path:req.protocol+"//"+req.hostname+"/uploads/"+filename,
                filename
               });
            })
        });
        res.send(data);
    }catch(err){
        res.status(400).send(err);
    }
});

app.listen(PORT,()=>{
    console.log(`server runing at ${PORT}`);
});