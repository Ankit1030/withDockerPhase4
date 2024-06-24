const CreateRideModel = require("../../models/create_ride");
const DriverModel = require("../../models/driver");
const VehiclePricing = require("../../models/vehicle_pricing");
const SettingModel = require("../../models/settings");

function calculateProfitAmount(totalAmount, percentageProfit) {
  const profitAmount = (totalAmount * percentageProfit) / 100;
  return parseFloat(profitAmount.toFixed(2));
}

const Payment = async (user, driver, Ride) => {
  let stripe;

  let userPayment;
  let driverPayment;
  // console.log("Payment gb is called",data);
  try {
    if (Ride.paymentType === "card") {
      await SettingModel.findOne()
        .then(async (data) => {
          stripe = require("stripe")(data.stripe_privateKey);
        })
        .catch((error) => console.log("STRIPE", error));

      const customer = await stripe.customers.retrieve(user.customerid);
      const defaultSource = customer.default_source;
      if (defaultSource) {
        const paymentIntent = await stripe.paymentIntents.create({
          // amount: 100,
          amount: Ride.estimatedFarePrice * 100,
          currency: "usd",
          customer: user.customerid,
          payment_method: defaultSource,
          confirm: true,
          setup_future_usage: "off_session",
          description: `Payment for ride ${Ride._id}`,
          return_url: "http://localhost:4500/dashboard/ride-history",
        });
        console.log("PAYMENT INTENT USER ", paymentIntent);
        if (paymentIntent.status === "succeeded") {
          userPayment = { status: 1 };
        } else if (paymentIntent.status === "requires_action") {
          console.log(
            "REDIRECT LINK CONDITION------------------------->>>>>>>>>>>>>>>>>>>>>"
          );
          userPayment = {
            status: 2,
            link: paymentIntent.next_action.redirect_to_url.url,
          };
        } else {
          // console.log('PaymentIntent is ',paymentIntent);
          console.log("FAILED TO charge amount to user paymenrintent status");
          userPayment = { status: 3 };
        }
      } else {
        console.log("DEFAULT SOURCE NOT FOUND selected Card");
      }
    } else {
      console.log("CASH payment mode -> Else PaymentIntent is ", paymentIntent);
      userPayment = { status: 1 };
    }

    if (driver.bankstatus == true) {
      const PricingData = await VehiclePricing.findOne({
        cityid: Ride.cityid,
        vehicleid: Ride.vehicleid,
      });
      console.log("PricingData", PricingData);
      const DriverProfitPercentage = PricingData.driverProfit;
      console.log("DriverProfitPercentage", DriverProfitPercentage);
      const driverAmount = calculateProfitAmount(
        Ride.estimatedFarePrice,
        DriverProfitPercentage
      );
      console.log("driverAmount", driverAmount);
      const transfer = await stripe.transfers.create({
        amount: driverAmount * 100,
        currency: "usd",
        destination: driver.customerid,
        description: `Payment received for the Ride ${Ride._id}`,
      });
      console.log("DRIVER TRANSFER is", transfer);
      if (transfer && transfer.id) {
        driverPayment = { status: 1 };
      } else {
        console.log("Failed to give money to driver");
        driverPayment = { status: 3 };
      }
    } else {
      driverPayment = { status: 1 };
    }
    return { userPayment: userPayment, driverPayment: driverPayment };
  } catch (error) {
    console.log("make_Payment ", error);
  }
};

module.exports = { Payment };
