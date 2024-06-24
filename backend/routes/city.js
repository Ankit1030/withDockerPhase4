const express = require('express');
const router = express.Router();
const {getAllreadyAddedCities} = require('../controllers/city/get_added_cities')
const {saveZone} = require('../controllers/city/save_zone')
const {verifyExistingCity} = require('../controllers/city/check_existing_city')

router.post('/get_selected_cities',getAllreadyAddedCities)// Aftetr selecting country get ALL cities of that country
router.post('/save_zone',saveZone) //To Save OR Update the zone 
router.post('/check_existing_city',verifyExistingCity) //to verify the city is allready Existing in DB $cityzone

module.exports = router;