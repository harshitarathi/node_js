const express = require('express');
const path = require('path');
const fs = require('fs');
const { get } = require('http');

const app = express();

app.use(express.json());

let outDate=0, inDate=0;
function validateInDate(){
  inDate = new Date(document.getElementById('indate').value);
      if(inDate > new Date()){
      alert(inDate+" "+"is not valid");
      indate.value=false;
      }
}
function validateOutDate(){
  outDate = new Date(document.getElementById('outdate').value);
  if(outDate > new Date()|| outDate < inDate ){
    alert(outDate+" "+"is not valid");
    outdate.value=false;
    }

}
function disableDeptSelect(){
    const fromDept=document.getElementById('fromdept').value;
    const toDept=document.getElementById('todept');
    for(let i = 0; i < toDept.length ; i++){
        var opt=toDept.options[i];
        if(fromDept==opt.value){
            toDept[i].disabled=true;
        }
        else{
            toDept[i].disabled=false;
        }

    }
}

const assets = JSON.parse(
    fs.readFileSync(`${__dirname}/asset_master_values.json`)
    
);
