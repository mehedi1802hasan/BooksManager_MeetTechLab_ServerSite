const express =require ('express');
const cors = require ('cors');
const app=express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

// middleware
app.use(express.json());
app.use(cors());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rin8xcl.mongodb.net/?retryWrites=true&w=majority`;

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

const booksCollections = client.db('BooksMeetTechLab').collection('books')
const usersCollection = client.db("BooksMeetTechLab").collection("users");

// ---------Post  the book----------

app.post('/books',async(req,res)=>{
  const addbook=req.body;
  const result=await booksCollections.insertOne(addbook);
  res.send(result);
})

// -------get the all books ----------
 app.get('/books',async(req,res)=>{
    const result =await booksCollections.find().toArray();
    res.send(result);
    console.log(result)
 })

 // ---------get id ways Book--------
 

 // ----------new user post(AuthenTication) ---------------
 app.post('/users', async (req, res) => {

  const user = req.body;
  console.log(user);
  const query = { email: user.email };
  const existingUser = await usersCollection.findOne(query);
  console.log('existing User', existingUser);
  if (existingUser) {
    return res.send({ message: 'User already exists' });
  }
  const result = await usersCollection.insertOne(user);
  res.send(result);


});


///-------- update the book information-------
app.put('/books/:id', async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      name: body.name,
      author: body.author,
      description: body.description,
      image: body.image,
    },
  };
  const result = await booksCollections.updateOne(filter, updateDoc);
  console.log(result)
  res.send(result);
});

///----------delete the spacypic book -------------
app.delete('/books/:id',async(req,res)=>{
  const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await booksCollections.deleteOne(query);
    console.log(result)
      res.send(result);
 })

 //--------searching books by author name and Title--(title means name) -------
 app.get('/books/:text', async (req, res) => {
  try {
    const searchText = req.params.text;
    console.log('Search Text:', searchText); // Add this line for debugging
    const result = await booksCollections
      .find({
        $or: [
          { author: { $regex: searchText, $options: 'i' } },
          { name: { $regex: searchText, $options: 'i' } },
        ],

      })
      .toArray();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/',(req,res)=>{
    res.send('user manager is running on')
});
app.listen(port,()=>{
    console.log(`server is running on port : ${port}`)
})