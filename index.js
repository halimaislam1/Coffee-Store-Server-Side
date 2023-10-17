const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion ,ObjectId} = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

//Middleware
app.use (cors())
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l0z6c5i.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);


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
    await client.connect();

    const coffeeCollection = client.db('coffeeDB').collection('coffee');
    const userCollection = client.db('coffeeDB').collection('user')

    //read 
    app.get('/coffee', async (req, res) =>{
        const cursor = coffeeCollection.find()
        const result = await cursor.toArray();
        res.send(result);  
    })

    //Create[post]
    app.post('/coffee', async(req, res) => {
        const newCoffee = req.body;
        console.log(newCoffee);
        const result = await coffeeCollection.insertOne(newCoffee);
        res.send(result)
    })

    //update
    app.get('/coffee/:id',async(req, res) => {
        const id = req.params.id;
        const query = {
            _id: new ObjectId(id)
        }
        const result = await coffeeCollection.findOne(query);
        res.send(result)
    })

    app.put('/coffee/:id', async(req, res) => {
        const id = req.params.id;
        const filter = {
            _id: new ObjectId(id)
        }
        const options = {upsert: true}

        const updatedCoffee = req.body;

        const coffee = {
          $set: {
            name: updatedCoffee.name,
            quantity: updatedCoffee.quantity,
            supplier: updatedCoffee.supplier,
            taste: updatedCoffee.taste,
            category: updatedCoffee.category,
            details: updatedCoffee.details,
            photo: updatedCoffee.photo,
          }
        }
        const result = await coffeeCollection.updateOne(filter, coffee, options);
        res.send(result)
        
    })



    //delete
    app.delete("/coffee/:id", async (req, res) => {
        const id = req.params.id;
        const query = {
          _id: new ObjectId(id),
        };
        const result = await coffeeCollection.deleteOne(query);
        console.log(result);
        res.send(result);
      });


      //user related api
      //get
      app.get('/user', async(req,res) => {
        const cursor = userCollection.find();
        const users = await cursor.toArray();
        res.send(users)
      })

      //post
      app.post('/user', async(req, res) => {
        const user = req.body;
        console.log(user);
        const result = await userCollection.insertOne(user);
        res.send(result);
      });

      app.patch('/user',async(req, res) => {
        const user = req.body;
        const filter= {
          email: user.email
        }
        const updateDoc = {
          $set: {
            lastLoggedAt: user.lastLoggedAt
          }
        }
        const result = await userCollection.updateOne(filter, updateDoc)
        res.send(result)
      })

      app.delete('/user/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await userCollection.deleteOne(query);
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



//
app.get('/', (req, res) => {
    res.send('coffee making server is running')
})

app.listen(port , () =>{
    console.log(`Coffee server is running on port ${port}`);
})