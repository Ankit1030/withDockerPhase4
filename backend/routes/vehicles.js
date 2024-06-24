const express = require('express');
const router = express.Router();
const multer = require('multer')
const storage = require('../middleware/storage')
const destination = "vehicles";
const upload = multer({ storage: storage(destination) }).single('vimage');

const getAllVehicles = require('../controllers/vehicles/get_all_vehicle')
const addVehicle = require('../controllers/vehicles/add_vehicle')
const updateVehicle = require('../controllers/vehicles/update_vehicle')



router.get('/get_all_vehicles',getAllVehicles)
router.post('/add_new_vehicles',upload,addVehicle)
router.put('/update_vehicle/:id',upload,updateVehicle)

module.exports = router;