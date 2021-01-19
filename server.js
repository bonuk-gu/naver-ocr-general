const fs = require('fs');
const request = require('request');

//default option
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

app.use(bodyParser.json());

const port = process.env.PORT || 5000




//database

/*
const data= fs.readFileSync('./database.json');
const conf = JSON.parse(data);
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: conf.host,
    user: conf.user,
    password:conf.password,
    port:conf.port,
    database:conf.database
});

connection.connect();
*/

//////////////////////////////////

/*
app.delete('/api/receipts/:id',(req, res) => {
    let sql = 'DELETE FROM Receipt WHERE id=?';
    let params =[req.params.id];
    connection.query(sql,params,
        (err, rows, fields) => {
            res.send(rows);
        })
})
*/

/*
app.get('/api/receipts',(req, res)=>{
    connection.query(
        "SELECT * FROM Receipt",
        (err, rows, fields) => {
            res.send(rows);
        }
    )
});
*/

const multer = require('multer');
//const upload = multer({dest:'./uploads'});
var mystorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null,  './uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({storage: mystorage});

/*
app.post('/api/receipt', upload.fields([]),(req, res) => {
    
    let sql = 'INSERT INTO Receipt VALUES (null,1,?,?,?,?,?,?)';
    let shop = req.body.shop;
    let item = req.body.item;
    let standard = req.body.standard;
    let quantity = req.body.quantity;
    let unit = req.body.unit;
    let price = req.body.price;

    let params = [shop,item, standard, quantity, unit, price];


    console.log('------@@@@@@@@@@@@@@------');
    
    console.log(req.body);
    console.log(shop);
    console.log(item);
    console.log(standard);
    console.log(quantity);
    console.log(unit);
    console.log(price);
    console.log('!!!!!!!!!!!!!!!!!!!!!!');

    

    connection.query(sql, params,
        (err, rows, fields) => {
            console.log(err);
            //console.log(sql);
            res.send(rows);
        });

});
*/


/* naver cloud

const clientId ='tdxdo1d5eq';
const clientSecret = 'mxEGYzJh41lIfHnhMFX02LMq34NyOZaZAm5Q8WY4';
function stt(language, filePath) {
    return new Promise(resolve => {
    
        
        const url = `https://naveropenapi.apigw.ntruss.com/recog/v1/stt?lang=${language}`;
        const requestConfig = {
            url: url,
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
                'X-NCP-APIGW-API-KEY-ID': clientId,
                'X-NCP-APIGW-API-KEY': clientSecret
            },
            body: fs.createReadStream(filePath)
        };

        
        request(requestConfig, (err, response, body) => {
            if (err) {
                console.log(err);
                return;
                
            }

            resolve(body);
            console.log(response.statusCode);
            //res.send(body);
            console.log(body);
            
        });
    })

    //return retBody;
}
*/


const imageToBase64 = require('image-to-base64');

function ptt(filepath) {
    return new Promise(resolve => {
        imageToBase64(filepath)
        .then((response) => {
            const url = "https://251acafd6a0b47f6b7b963e40eec84c9.apigw.ntruss.com/custom/v1/6312/bf1e35694959687c452a73a993b245ce8d7fb9fbd6f758d1c9ffad6b957dfc51/infer";
            const requestConfig = {
                url:url,
                method:'POST',
                headers: {
                    "Content-Type":"application/json",
                    "X-OCR-SECRET":"UnJTTkJUTUl0b0RTSmltQXJsbE1ZSWhJbVdZbnVNVVQ="
                },
                json: {
                    "version": "V1",
                    "requestId": "sample_id",
                    'timestamp': 0,
                    "images":[
                        {
                            "name": "sample_image",
                            "format": "jpg",
                            "data":response
                        }
                    ]
                }   
            };

            request(requestConfig, (err, response, body) => {
                if(err){
                    console.log(err);
                    return;
                }
                
                var images = body.images;
                var arr=[];
                console.log("@@@@@@@@@@@@@@@@@");
                for(var k = 0; k < images.length; k++) {
                    for(var z = 0; z < images[k].fields.length; z++) {
                        console.log(images[k].fields[z].inferText);
                        arr.push(images[k].fields[z].inferText);
                    }
                }

                console.log("###################");
                resolve(arr)
            });
        })
        .catch( (error) => {
            console.log(error);
        })
    })
}



app.post('/api/photo', upload.single('photoBlob'), function(req,res) {
    ptt("./uploads/"+req.file.originalname).then(function(result) {
        console.log(result);
        res.send(result);
    })
});


/* naver stt
app.post('/api/voice', upload.single('soundBlob'),(req,res) =>{
    //console.log(req.file);
    //console.log("original:"+req.file.originalname);
    var text='';

    stt('Kor','./uploads/'+req.file.originalname)
    .then(function(result){
        console.log("result!!:"+result);
        text = result.text;
        res.send(result);
        //console.log('text!!:'+text);
    })


   // res.send(text);
    //console.log("Body:"+Body);
    //res.send(Body);
    //var json = Body.json();
    //res.send(json.text);
    //stt('Kor','./uploads/6f825ef9a02bbe17c2d2d78211700756');
    try {
        console.log('NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN');
        //console.log(req.body);
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let avatar = req.files.avatar;
            console.log('AAAAAAAAAAAAAAAANNNNNNNNNNNNNNNNNNNN');
            console.log(avatar);
            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            avatar.mv('./uploads/' + avatar.name);

            //send response
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: avatar.name,
                    mimetype: avatar.mimetype,
                    size: avatar.size
                }
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
});
*/

app.listen(port, () => console.log(`Listening on port ${port}`));