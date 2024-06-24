const express = require('express');
const router = express.Router();
const getAllCountry = require('../controllers/country/get_country')
const addCountry = require('../controllers/country/add_country')

router.post('/add_country',addCountry) //To add new country
router.post('/get_country',getAllCountry) // To get country table with searching also

module.exports = router;