const mongoose = require('mongoose');
const dotenv = require('dotenv');


dotenv.config({ path: './config.env' });
const app = require('./app');
 const URL = `mongodb+srv://Harshita:cse@1620@cluster0.ebbayra.mongodb.net/?retryWrites=true&w=majority`
mongoose
  .connect(URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology:true,
    useFindAndModify: false
  })
  .then(con =>{ 
    console.log('DB connection successful!')
  });
  

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
