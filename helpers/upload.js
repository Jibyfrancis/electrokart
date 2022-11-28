const uploadFilesMiddleware=require('../midleware/multer');
var db = require('../config/connections')

const multipleUpload=async(req,res,next)=>{
    try{
        await uploadFilesMiddleware(req,res);
        next();


    }
    catch(error){
        console.log(error);
        if(error.code==="LIMIT_UNEXPECTED-FILE"){   

            return res.send('too many files to upload');
        }
        
        return res.send(`error when trying upload many files:${error}`)
    }
};
module.exports={multipleUpload}