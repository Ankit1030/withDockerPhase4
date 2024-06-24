const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = require('../middleware/storage')

// const {}
const {getAllUsers} = require('../controllers/users/get_users')
const {saveUser} = require('../controllers/users/save_user')
const {updateUser} = require('../controllers/users/update_user')
const {deleteUser} = require('../controllers/users/delete_user')
const {getDefaultCardDetails, addCardToCustomer, setDefaultCard, deleteSourceCard } = require('../controllers/users/stripe_user')
const destination = 'allusers'
const upload = multer({ storage: storage(destination) }).single('uimage');

router.post('/get_users',getAllUsers)

router.post('/save_user',upload,saveUser)
router.post('/update_user',upload,updateUser)
router.post('/delete_user',deleteUser)

//----- CARD STRIPE API KEYS ----------------------
router.post('/get_defaultcard',getDefaultCardDetails)
router.post('/add_card',addCardToCustomer)
router.post('/set_defaultcard',setDefaultCard)
router.post('/delete_card',deleteSourceCard)


module.exports = router;