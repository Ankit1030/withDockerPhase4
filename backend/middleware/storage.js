const multer = require('multer')
const path = require('path');


const storage = (destination) => multer.diskStorage({
  destination:(req,file,cb)=>{ 
    console.log("Multer is running successfully",__dirname);
    console.log("Destinaetion");
      cb(null, path.join(__dirname,`../uploads/${destination}`))},
    filename: (req,file,cb)=>{ 
      const baseName = path.basename(file.originalname, path.extname(file.originalname));
      console.log("FILEoriginalnaem storage--->>>>> :" +file.originalname);
      
      // Append a unique identifier to the base name
      const uniqueFilename = baseName + '-' + Date.now() + path.extname(file.originalname);
  cb(null,uniqueFilename );
  console.log('-----------')
  console.log("THIS uniquefilename by multer ",uniqueFilename);
  // console.log(baseName);
}
});
module.exports = storage;
