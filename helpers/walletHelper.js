var db = require("../config/connections");
var collection = require("../config/collections");
var objectId = require("mongodb").ObjectId;

module.exports={
    getWallet:(user)=>{
        return new Promise(async(resolve, reject) => {
            
            let wallet=await db.get().collection(collection.WALLET_COLLECTION).aggregate([{$match:{user:objectId(user)}},
                {
                    $unwind:'$history'
                },
            {
                $project:{
                    user:1,
                    name:1,
                    amount:1,
                    history:1
                }
            }]).toArray()
            resolve(wallet)
            console.log(wallet);
            
            
        })

    }

}