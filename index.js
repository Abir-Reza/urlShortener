const express = require('express');
var cors = require('cors');
const app = express();
require('dotenv').config();
const tokenGen = require("./tokenGenerator");

const port = process.env.PORT || 5000;

// use middlewire
app.use(cors());
app.use(express.json());


// connect to mongoDB
const { MongoClient } = require('mongodb');
const tokenGenerator = require('./tokenGenerator');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mflix.feluh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try{

        await client.connect();
        const database = client.db("urlShortener");
        const urlsCollection = database.collection('urls');

        app.post('/shortUrl', async(req,res) => {
            const {longUrl} = req.body;
            const query = {longUrl:longUrl};

            try{
                const url = await urlsCollection.findOne(query);

                if(url){
                    res.json(url);
                }
                else{
                    
                    const count =await urlsCollection.countDocuments();
                    let id = 1000000000+ count; 
                    
                    const urlcode = tokenGenerator(id);
                    const shortUrl = "http://localhost:5000/" + urlcode;
                    const doc = {
                        longUrl : longUrl,
                        urlcode : urlcode,
                        shortUrl : shortUrl
                    }
        
                    const result = await urlsCollection.insertOne(doc);
                    res.json(result);
                    
                }


            }
            catch(error){
                console.log(error);
                res.json(error.massage)
            }

           
        })
       
    }
    catch(err){
        console.error(err.massage);
    }
}

run().catch(console.dir);



app.get('/', (req,res) => {
    res.send('Hello from express ');
})


app.listen(port, () => {
    console.log("listenig to port : ", port);
});