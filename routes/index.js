require('dotenv').config();
const
    router = require('express').Router(),
    axios = require('axios');

const
    API_URL = 'http://api.carsxe.com',
    API_KEY = process.env.API_KEY;

const restClient = axios.create({ baseURL: API_URL, params: { key: API_KEY } });

const catchError = (handler) => async (req, res) => {
    try {
        await handler(req, res)
    } catch (e) {
        res.status(500).json({ error: e.toString() })
    }
}

router.get('/specs', catchError(async (req, res) => {
    const { vin } = req.query;
    const { data } = await restClient.get(`/specs`, {
        params: {
            vin
        }
    })
    res.json({ data })
}))

router.get('/images', catchError(async (req, res) => {
    const { make, model, color, trim, year } = req.query;
    const { data } = await restClient.get(`/images`, {
        params: {
            make, model, color, trim, year, transparent: 'true', photoType: 'exterior', angle: 'side'
        }
    })
    res.json({ data })
}))

module.exports = router;
