const fs = require('fs');
const request = require('request');

//default option
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

app.use(bodyParser.json());

const port = process.env.PORT || 5000

const multer = require('multer');
var mystorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null,  './uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({storage: mystorage});


const imageToBase64 = require('image-to-base64');
const { Base64 } = require('js-base64');

function hand_ptt(filepath) {
    return new Promise(resolve => {
        imageToBase64(filepath)
        .then((response) => {
            const url = "https://251acafd6a0b47f6b7b963e40eec84c9.apigw.ntruss.com/custom/v1/6243/820e40bd5bc75cd1e8159211ebbfbca5530d141810ec0b1b4529acf4d9ec84af/general";
            const requestConfig = {
                url:url,
                method:'POST',
                headers: {
                    "Content-Type":"application/json",
                    "X-OCR-SECRET":"YlNzc05LdnNxbkhKRHdSS1RVcUhBYklwRG5RRnZoQ3I="
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
            
                console.log("bodyType:"+typeof(body));
                var obj = body;
                var images= body.images;
                console.log("typeofImages:"+typeof(images));
                
                var arr=[];
                console.log("@@@@@@@@@@@@@@@@@@@");
                for (var k = 0 ;k < images.length; k++){
                    for(var z = 0 ; z<images[k].fields.length; z++) {
                        console.log(images[k].fields[z].inferText);
                        arr.push(images[k].fields[z].inferText);
                    }
                }
                console.log("#################");
                resolve(arr)
            });
        })
        .catch( (error) => {
            console.log(error);
        })
    })
}



app.post('/api/hand_photo',upload.single('photoBlob'), function(req,res) {
    hand_ptt("./uploads/"+req.file.originalname).then(function(result) {
        console.log(result);
        res.send(result);
    });

    /*
    console.log("######About to start to call PTT#####");
    ptt("./uploads/"+req.file.originalname)
    .then(function (result){
        console.log("resolve result:"+result);
        //res.send(result);
        res.json({"text": result })
        console.log("result:"+result);
        //const myJson  = JSON.stringify(response.data);
        //console.log()
    })
    */

    



});

app.listen(port, () => console.log(`Listening on port ${port}`));