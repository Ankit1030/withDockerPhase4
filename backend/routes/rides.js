const express = require('express');
const router = express.Router();
const { getCallCodes} = require('../controllers/rides/create_ride')
const {getfilteredRidesHistory,feedbackForm} = require('../controllers/rides/ride_history')
const { isUser,getAllVehiclesPricing,bookRide,isLocationInsideZone} = require('../controllers/rides/create_ride')
const { getAllRides,getfilteredRides,getAllConfirmedRideStatus,AssignSpecificDriver,getAllfreeDrivers,assignNearestDriver} = require('../controllers/rides/confirmed_ride')
const {getAllRunningRequests,rejectRequest, AcceptRide,ArrivedRide,PickedRide,CompletedRide,CancelRide,getApprovalTime} = require('../controllers/rides/running_request')
const {cronefn} = require('../utils/nearestcrone')
const {sample1} = require('../controllers/rides/sample')
// const { getAllRides} = require('../controllers/rides/confirmed_ride')
// const { sampletesting} = require('../controllers/rides/create_ride')
// const { getAllVehiclesPricing} = require('../controllers/rides/create_ride')
// const rides = require('../controllers/login')
const {sampletesting} =require('../utils/nodemailer')
//create rides
router.get('/call_codes',getCallCodes)
router.post('/is_user',isUser)
router.post('/get_pricing',getAllVehiclesPricing)
router.post('/create_ride',bookRide)

router.post('/getAllfreeDrivers',getAllfreeDrivers)
router.post('/isLocationInsideZone',isLocationInsideZone)
router.post('/assignSpecificDriver',AssignSpecificDriver)

//confirmed rides
router.post('/getfilteredRides',getfilteredRides)
router.post('/sample',sample1)
router.post('/assignNearestDriver',assignNearestDriver)
router.post('/getAllConfirmedRideStatus',getAllConfirmedRideStatus)


//Running Requests
router.post('/getAllRunningRequests',getAllRunningRequests)
router.post('/rejectRequest',rejectRequest)
router.post('/getApprovalTime',getApprovalTime)
router.post('/acceptRide',AcceptRide)
router.post('/arriveRide',ArrivedRide)
router.post('/pickupRide',PickedRide)
router.post('/completeRide',CompletedRide)
router.post('/cancelRide',CancelRide)

// router.post('/cronefn',cronefn)
//sample Testing purpose only
// router.post('/sampletesting',sampletesting)
// router.post('/sampletesting',getfilteredRides)


//Ride History

router.post('/feedbackForm',feedbackForm)
router.post('/getfilteredRidesHistory',getfilteredRidesHistory)


module.exports = router;