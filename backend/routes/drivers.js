const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = require('../middleware/storage')
const destination = "alldrivers";
const upload = multer({ storage: storage(destination) }).single("dimage");

const {getAllDrivers} = require('../controllers/drivers/get_drivers')
const {sampleDriver} = require('../controllers/drivers/sample')
const {addBankAcc} = require('../controllers/drivers/add_bankAccount')
const {saveDriver} = require('../controllers/drivers/save_driver')
const {updateDriver} = require('../controllers/drivers/update_driver')
const {deleteDriver} = require('../controllers/drivers/delete_driver')
const {onSelectService,updateDriverStatus} = require('../controllers/drivers/on_select_service')
const {availableService} = require('../controllers/drivers/available_services')

router.post('/get_drivers',getAllDrivers)
router.post('/save_driver',upload,saveDriver)
router.post('/update_driver',upload,updateDriver)
router.post('/delete_driver',deleteDriver)
router.post('/addBankAccount',addBankAcc)
router.post('/sampleDriver',sampleDriver)


// Services and status 

router.post('/update_status',updateDriverStatus) // To update Declined or Approved status 
router.post('/select_service',onSelectService) // User selects the service 
router.post('/available_service',availableService) // To send the available vehicle service in that city


module.exports = router;