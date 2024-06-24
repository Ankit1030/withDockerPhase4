const DriverModel = require("../../models/driver");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const { totalcountDocuments, searchResult } = require("./get_drivers");
const SettingModel = require('../../models/settings')

// const StripePrivatekey = process.env.STRIPE_PRIVATE_KEY;
// const stripe = require("stripe")(StripePrivatekey);

const saveDriver = async (req, res) => {
  // console.log("SAVE NEW SUBMIT driver is called");
  let newimage,
    imgflag = 0;
  try {
    const { dname, demail, dphone } = req.body;
    console.log("REQ BODY SAVE DRIVER", req.body);
    const dcity = new mongoose.Types.ObjectId(req.body.dcity);
    const ccode = new mongoose.Types.ObjectId(req.body.ccode);

    // console.log({dcity,ccode});

    if (req.file) {
      // dimage = req.file.filename;
      newimage = req.file.filename;
      // console.log('newimage',newimage);
      imgflag = 1;
    }
    // console.log("SAVE NEW USER DATA");
    const existingRecord = await DriverModel.findOne({ ccode, dphone });

    if (existingRecord) {
      if (imgflag === 1) {
        deletedriverimg(newimage);
      }

      // console.log("DUPLicate phone number ", existingRecord);
      res
        .status(401)
        .json({ success: false, message: "Phone number already exists" }); //Duplicate phone number
      return;
    }
    // console.log(req.body);
    // console.log(req.file);
    // console.log("NEW -------------- Driver Submits new data VISITED --------------->>>>>>>>>>>>>");
    const dataPerPage = Number(req.body.dataPerPage);
    const currentPage = Number(req.body.currentPage);
    // console.log(dataPerPage, currentPage);
    // console.log("NEW -------------- USER Submits new data VISITED --------------->>>>>>>>>>>>>");

    const totalData = await totalcountDocuments({});

    const newUser = new DriverModel({
      dname,
      dimage: newimage,
      ccode,
      demail,
      dphone,
      dcity,
    });
    const saved = await newUser.save();
    console.log("New Driver savced", saved);

    if (saved) {
      let stripe;
      await SettingModel.findOne().then(async (data) => {
        stripe = require('stripe')(data.stripe_privateKey);
    }
    ).catch((error) => console.log("STRIPE",error))

   
   
      const customer = await stripe.accounts.create({
        type: 'custom',
        country: 'US',
        email: saved.demail,
        business_type: 'individual',
        individual: {
          first_name: saved.dname,
          last_name: saved.dname,
          email: saved.demail,
          phone: `+1${saved.dphone}`, // Use the valid test phone number
          ssn_last_4: '0000',
           id_number:'000000000',
          dob: {
            day: 1,
            month: 1,
            year: 1990,
          },
          address: {
            line1: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            postal_code: '12345',
            country: 'US',
          },
        //   verification: {
        //     document: {
        //       front: 'file_12345',
        //       back: 'file_67890',
        //     },
        //   },
        },
        business_profile: {
          mcc: '5734',
          url: 'https://www.elluminatiinc.com/',
        },
        tos_acceptance: {
          date: Math.floor(Date.now() / 1000),
          ip: '192.168.1.1',
        },
        capabilities: {
          card_payments: {
            requested: true,
          },
          transfers: {
            requested: true,
          },
        },});

      console.log("Driver Stripe Customer-->", customer);
      let addcardtocustomer = null;
      if (customer) {
        console.log("Driver customer", customer);
        const { id } = customer;

        addcardtocustomer = await DriverModel.findByIdAndUpdate(
          { _id: saved._id },
          { $set: { customerid: id } },
          { new: true }
        ).populate({ path: "dcity ccode", select: "city ccallcode" });
        // ).populate({path:'ccode',select:'ccallcode'});
        // const populatedUser = await DriverModel.populate(addcardtocustomer, { path: 'dcity ccode', select:'city ccallcode' })
        console.log("POPulartesd-->>", addcardtocustomer);
        const newPageNumber = Math.ceil((totalData + 1) / dataPerPage);
        console.log(
          addcardtocustomer + "------------------------>" + addcardtocustomer
        );
        // console.log("USER SAVED AND CUSTOMER TURNS START------------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        if (currentPage == newPageNumber) {
          res.status(200).json({
            success: true,
            currentPage: currentPage,
            data: addcardtocustomer,
            message: "User saved successfully",
          });
        } else {
          const alltable = await searchResult(
            {},
            newPageNumber,
            dataPerPage,
            null
          );

          res.status(200).json({
            success: true,
            data: alltable,
            currentPage: newPageNumber,
            message: "User saved successfully",
          });
          return;
        }
      }
    }
  } catch (error) {
    // console.log("SAVE driver", error);
    console.log("Duplicate Driver ERror", error);
    if (error.code === 11000) {
      if (imgflag === 1 && newimage) {
        deletedriverimg(newimage);
      }
      const duplicateKeyError = {
        message: "Duplicate email or phone already in USE",
        code: "DUPLICATE_KEY",
        duplicateKeyDetails: error.keyPattern,
      };
      res.status(401).json({
        success: false,
        message: "duplicate",
        error: duplicateKeyError,
      });
      return;
    }
    return res.status(500).json({ success: false, message: error });
  }
};

const alldrivers_folder_path = path.join(__dirname, "../../uploads/alldrivers");
function deletedriverimg(filename) {
  const imagePath = path.join(alldrivers_folder_path, filename);

  fs.unlink(imagePath, (err) => {
    if (err) {
      console.log(`Error deleting image: ${err.message}`);
    } else {
      console.log(`Image '${filename}' deleted successfully.`);
    }
  });
}

module.exports = { deletedriverimg, saveDriver };
