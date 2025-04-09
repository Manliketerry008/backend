const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const path = require('path');

app.use(express.json());

app.set('port', process.env.PORT || 3000);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
        });

let db;

    const mongoUri = "mongodb+srv://Ahmed:afterschool@cluster0.jkphv63.mongodb.net/";

    async function connectDB() {
    try {
        const client = await MongoClient.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        db = client.db('afterschool');
        console.log("✅ Connected to MongoDB successfully");

        app.listen(app.get('port'), () => {
            console.log(`🚀 Server running at http://localhost:${app.get('port')}`);
        });

    } catch (err) {
        console.error("❌ Database connection error:", err);
        process.exit(1); 
    }
        }

    connectDB();

    app.param('collectionName', (req, res, next, collectionName) => {
        if (!db) {
            console.error("❌ Database not connected yet!");
            return res.status(500).json({ error: "Database connection not established yet" });
                }
        req.collection = db.collection(collectionName);
            next();
        });

    

    app.get('/', (req, res) => {
        res.send('Select a collection, e.g., /collection/messages');
        });

    app.get('/collection/:collectionName', async (req, res, next) => {
        try {
            const results = await req.collection.find({}).toArray();
            res.json(results);
            } catch (err) {
            next(err);
            }
        });

    app.post('/collection/:collectionName', async (req, res, next) => {
        try {
            const result = await req.collection.insertOne(req.body);
            res.status(201).json({
                msg: 'Document inserted successfully',
                insertedId: result.insertedId
        });
            } catch (err) {
            next(err);
            }
        });

        app.put('/collection/Lessons/:_id', async (req, res, next) => {
            try {
                const { _id } = req.params;
                const { spaces } = req.body;
        
                if (!ObjectId.isValid(_id)) {
                    return res.status(400).json({ msg: 'Invalid product ID.' });
                }
        
                if (typeof Spaces !== 'number') {
                    return res.status(400).json({ msg: 'Spaces must be a number.' });
                }
        
                const collection = db.collection('Products');
                const result = await collection.updateOne(
                    { _id: new ObjectId(_id) },
                    { $set: { spaces: spaces } } // 👈 lowercase 'spaces'
                );
        
                console.log('Matched:', result.matchedCount, '| Modified:', result.modifiedCount);
                if (result.modifiedCount === 1) {
                    res.json({ msg: 'Update successful', updatedId: _id });
                } else {
                    res.status(404).json({ msg: 'No matching product found or no update made.' });
                }
            } catch (err) {
                console.error('Update error:', err);
                next(err);
            }
        });
        

    app.get('/collection/:collectionName/:_id', async (req, res, next) => {
        try {
            const result = await req.collection.findOne({ _id: new ObjectId(req.params._id) });
            res.json(result);
            } catch (err) {
            next(err);
            }
});
