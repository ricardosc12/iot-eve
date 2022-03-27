const http = require("http");
const host = 'localhost';
const ngrok = require('ngrok');
const port = 90;
var qrcode = require('qrcode-terminal');
const open = require('open');

function generateQRCode(text){
    console.log("")
    qrcode.generate(text, {small: true});
}
async function getTunnel(){
    return ngrok.connect({addr:90,proto:'http'})
    
}

let DATA = {
    Orquidea:{
        t:"91.2",
        h:"56",
        l:'Luz Alta',
        n:"Orquidea",
        m:false
    },
    Jasmim:{
        t:"54.5",
        h:"30",
        l:'Luz Baixa',
        n:"Jasmim",
        m:false,
    },
}

getTunnel().then(url=>{
    console.log("[*] Iniciando...")
    let ngrok_url = url.split('//')
    let qr_id = ngrok_url[1]
    let link = "https://ricardosc12.github.io/iot-eve?"+qr_id
    open(link);
    generateQRCode(link)
    const server = http.createServer(requestListener);
    server.listen(port, host, () => {
        // console.log(`[*] Aplicação iniciada ID: ${qr_id} --> http://${host}:${port}`)
        console.log(`[*] Aplicação iniciada`)
        console.log(`[*] ID: ${qr_id}`)
    });
})

const getData = (res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.writeHead(200);
    res.end(JSON.stringify(DATA));
}

const apis = {
    "getData":getData
}

const requestListener = function (req, res) {
    const endPoint = req.url.split("/")[1]
    if(req.method === "GET"){   
        try{
            apis[endPoint](res)
        }catch{
            res.setHeader("Content-Type", "application/json");
            res.writeHead(200);
            const data = {
                messagem:"Api não encontrada",
            }
            res.end(JSON.stringify(data));
        }
    }
    else{
        let data_received = ''
        req.on('data', function(data) {
            data_received += data
          })
        req.on('end', function() {
            const resp = convertData(data_received)
            let m0 = false
            let m1 = false
            if(resp) {
                if(parseFloat(resp.Orquideas.h) >=0 && parseFloat(resp.Orquideas.h) <= 30){
                    m0 = true
                }
                if(parseFloat(resp.Jasmin.h) >=0 && parseFloat(resp.Jasmin.h) <= 30){
                    m1 = true
                }
                resp.Jasmin.m = m0
                resp.Orquideas.m = m1
                DATA = resp
            }
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.end(`${m0}&${m1}`)
        })
    }
};

function convertData(string){
    try{
        const data = string.split("&").filter(item=>item)
        let resposta = {}
        data.map(d=>{
            let res = d.split("$").filter(item=>item)
            const req = {}
            let key = ""
            res.map(r=>{
                let aux = r.split('=')
                if(aux[0]=='n'){
                    key=aux[1]
                    resposta[key] = {}
                }
                req[aux[0]] = aux[1].replace("  ","")
            })
            resposta[key] = req
        })
        return resposta
    }
    catch{
        return false
    }
}

