const express = require('express');
const router = express.Router();
const {getZonedAllCountry} = require('../controllers/vehicle-pricing/get_zoned_country')
const {get_all_pricing} = require('../controllers/vehicle-pricing/fetch_pricing_table')
const {saveNewVehiclePricing} = require('../controllers/vehicle-pricing/add_pricing')
const {getRemainingVehicles} = require('../controllers/vehicle-pricing/get_remaining_vehicles')
const {updatePricing} = require('../controllers/vehicle-pricing/update_pricing')



router.get('/get_pricing_table',get_all_pricing) // To get the pricing table on page load
router.post('/get_zoned_country',getZonedAllCountry) // To get the countries which had zones created in it Not all countries
router.post('/save_new_pricing',saveNewVehiclePricing) // Save new pricing
router.post('/get_remaining_vehicles',getRemainingVehicles) // To get the vehicles which are remaining to add pricing inside selected city
router.post('/update_pricing',updatePricing)

module.exports = router;