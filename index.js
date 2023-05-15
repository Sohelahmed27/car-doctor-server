const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb'); 

const app = express();
const port = process.env.port || 5000;

//Middleware
 app.use(cors());
 app.use(express.json());


 console.log(process.env.DB_PASSWORD)
const uri =`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-shard-00-00.fbfgu.mongodb.net:27017,cluster0-shard-00-01.fbfgu.mongodb.net:27017,cluster0-shard-00-02.fbfgu.mongodb.net:27017/?ssl=true&replicaSet=atlas-m0zpta-shard-0&authSource=admin&retryWrites=true&w=majority`

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fbfgu.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();



    const userCollection =  client.db('carDoctor').collection('services')
    const bookingCollection = client.db('carDoctors').collection('bookings')


    app.get('/services', async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/services/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id:new ObjectId(id)}
        const options = {
         
          // Include only the `title` and `imdb` fields in the returned document
          projection: { _id: 0, title: 1, price: 1, img:1 },
        };
        const result = await userCollection.findOne(query, options);
        res.send(result);
    })

    //find bookings from database
    app.get('/bookings', async (req, res) => {
      let query={};
      if(req.query?.email){
        query = {email:req.query.email};
      }
      const result = await bookingCollection.find(query).toArray()
      res.send(result);
    })

    //booking
    app.post('/bookings', async(req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingCollection.insertOne(booking)
      res.send(result);
    })
    //update bookings
    app.patch('/bookings/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)};
      const updatedBooking = req.body;
      console.log(updatedBooking);
      const updateDoc = {
        $set: {
          status: updatedBooking.status 
        },
      };

      const result = await bookingCollection.updateOne(filter, updateDoc);
      res.send(result);
  

    })

    //delete from db
   app.delete('/bookings/:id', async (req, res) => {
     const id = req.params.id;
     const query = {_id : new ObjectId(id)};
     const result = await bookingCollection.deleteOne(query)
     res.send(result);
   })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


 app.get('/', (req, res) => {
  res.send('Car-doctor is running')

 })

 app.listen(port, ()=>{
  console.log(`listening on port ${port}`)
 })