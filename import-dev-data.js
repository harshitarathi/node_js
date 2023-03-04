const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Asset = require('./models/assetModule');

dotenv.config({path : './config.env'});

const asset_master = require('./asset_master');
const { argv } = require('process');

 const URL = `mongodb+srv://Harshita:cse@1620@cluster0.ebbayra.mongodb.net/?retryWrites=true&w=majority`;

 mongoose
    .connect(URL,{
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology:true,
        useFindAndModify: false
    }).then(con =>{
        //console.log(con.connections);
        console.log("DB connected succesfully");
    });

    //Read JSON file
    const assets = JSON.parse(fs.readFileSync(`${__dirname}/asset_master_values.json`,'utf-8'));

//IMPORT DATA INTO DB
const importData = async() =>{
    try{
        await Asset.create(assets);
        console.log('data successfully added');
}catch(err){
    console.log(err);
}
};
//DELETE ALL THE DATA FROM DATABASE
const deleteAll = async() =>{
    try{
        await Asset.deleteMany();
        console.log('data removed successfully');
    }catch(err){
        console.log(err);
    }
    process.exit();
};

if(process.argv[2]==='--import'){
    importData();
}else if(process.argv[2]=== '--delete'){
    deleteAll();
}
console.log(process.argv);