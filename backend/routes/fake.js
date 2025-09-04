// TODO: delete this file
import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { fake } from '../dbConfig/mongoCollections.js';


const router = Router();

router.route('/').get(async (req, res) => {
    return res.json({ test: 'test' });
})
/* 
    Generated routes to test the db

    in the format: 
    {
        _id: ObjectId
        description: String
        price: int
        category: string
        createdAt: Date
    }
*/
router.route('/items').post(async (req, res) => {
    try {
        const fakeCollection = await fake();

        const newItem = {
            name: req.body.name || 'Test Item',
            description: req.body.description || 'Test Description',
            price: req.body.price || 0,
            category: req.body.category || 'general',
            createdAt: new Date()
        };

        const result = await fakeCollection.insertOne(newItem);
        res.status(201).json({
            success: true,
            insertedId: result.insertedId,
            item: newItem
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.route('/items').get(async (req, res) => {
    try {
        const fakeCollection = await fake();

        const items = await fakeCollection.find({}).toArray();
        res.json({
            success: true,
            count: items.length,
            items: items
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.route('/items/:id').get(async (req, res) => {
    try {
        const fakeCollection = await fake();

        const item = await fakeCollection.findOne({ _id: new ObjectId(req.params.id) });

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json({
            success: true,
            item: item
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.route('/items/:id').put(async (req, res) => {
    try {
        const fakeCollection = await fake();

        const updateData = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            updatedAt: new Date()
        };

        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        const result = await fakeCollection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json({
            success: true,
            modifiedCount: result.modifiedCount,
            message: 'Item updated successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.route('/items/:id').delete(async (req, res) => {
    try {
        const fakeCollection = await fake();

        const result = await fakeCollection.deleteOne({ _id: new ObjectId(req.params.id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json({
            success: true,
            deletedCount: result.deletedCount,
            message: 'Item deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;