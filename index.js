const express = require('express');
var cors = require('cors');
const app = express();
require('dotenv').config();
const tokenGen = require("./tokenGenerator");
const ObjectId = require('mongodb').ObjectId;

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

        // GET list of url from database
        app.get('/', async(req,res) => {
            const cursor = urlsCollection.find({});
            const urlList = await cursor.toArray();
            res.send(urlList);
            
        })

        // POST url into database
        app.post('/url', async(req,res) => {
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
                    const visitCount = 0;
                    const doc = {
                        longUrl : longUrl,
                        urlcode : urlcode,
                        shortUrl : shortUrl,
                        visitCount: visitCount
                    }
        
                    const result = await urlsCollection.insertOne(doc);
                    res.json(req.body);
                    
                }


            }
            catch(error){
                console.log(error);
                res.json(error.massage)
            }

           
        })

        // url count
        app.put('/url/visits/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id : ObjectId(id)};
            const options = { upsert: true };
            const updateDoc = {$inc : {visitCount: 1}}

            const result = await urlsCollection.updateOne(query,updateDoc,options);
        })


        app.get('/:urlcode', async(req,res) => {
            const urlcode = req.params.urlcode;
            const query = {urlcode : urlcode};

            try{
                const url = await urlsCollection.findOne(query);

                if(url){
                    return res.redirect(url.longUrl);
                }
                else{
                    return res.status(404).json("Url not Found");
                }

            }
            catch(error){
                res.json(error);
            }
            
        })
       
    }
    catch(err){
        console.error(err.massage);
    }
}

run().catch(console.dir);



app.listen(port, () => {
    console.log("listenig to port : ", port);
});