import express from 'express';
import CLASign from '../models/CLASign.js';

const router = express.Router();

// Route to sign the CLA
router.post('/cla-sign', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    try {
        const signatureExists = await CLASign.findOne({ username });
        if (signatureExists) {
            return res.status(400).json({ error: 'User has already signed the CLA' });
        }

        const newSign = new CLASign({ username });
        await newSign.save();
        return res.status(200).json({ message: '✅ CLA signed successfully' });
    } catch (err) {
        return res.status(500).json({ error: 'Error signing CLA', details: err.message });
    }
});

// Route to check if a user has signed the CLA
router.post('/check-cla', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    try {
        const signatureExists = await CLASign.findOne({ username });
        if (signatureExists) {
            return res.status(200).json({ signed: true });
        } else {
            return res.status(401).json({ signed: false });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Error checking CLA status', details: err.message });
    }
});

export default router;
