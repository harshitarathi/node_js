const fs = require('fs');
const server = require('http').createServer();

server.on("request" , (req,res) => {
/*    //solution
    fs.readFile("test-file.txt", (err,data) => {
        if(err) console.log(err);
        res.end(data);
    });
    */
//solution 2
    const readable = fs.createReadStream('test-file.txt');
    readable.on("data" , chunk => {
        res.write(chunk);
    });
    readable.on("end" , () => {
        res.end();
    });
    readable.on("error" , err =>{
        res.status(500);
        res.end("file not found")
        console.log(err);
    })

});




server.listen(8000 , '127.0.0.1' , () => {
    console.log('listening');
})