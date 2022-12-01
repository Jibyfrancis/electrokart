var db = require('../config/connections')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectId

module.exports = {
    removeCartItem: (proId, userId) => {
        return new Promise(async (resolve, reject) => {

            let user = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            console.log(user)
            if (user) {
                db.get().collection(collection.CART_COLLECTION).update({ user: objectId(userId) },
                    {
                        $pull: { products: { prodId: objectId(proId) } }
                    }
                )
                resolve("tset")
            }
            else {
                resolve("hi")
            }
        })
    },
    changeProductQty:(details)=>{
        details.count=parseInt(details.count)
        details.qty=parseInt(details.qty)
        console.log(details);
        
        // console.log(details.count+"  and  "+details.qty);
            return new Promise((resolve, reject) => {
                if(details.count==-1&&details.qty==1){
                    // db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(details.cart)},
                    // {
                    //     $pull:{
                    //         products:{prodId:objectId(details.product)}
                    //     }
                    // }).then(()=>{
                    //     resolve({removeProduct:true})
                    // })
                      resolve()
                }
                else{
                console.log('+++++++++++++++++++');
                    db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(details.cart),'products.prodId':objectId(details.product)},
                    {
                        $inc:{
                            'products.$.qty':details.count
                        }
                    }).then((response)=>{
                        
                        resolve(true)
        
                    })


                }
                
            })

    },
    getOrders:()=>{
        
        return new Promise((resolve, reject) => {
            let orders=db.get().collection(collection.ORDER_COLLECTION).find().toArray()
         
            resolve(orders)

            
        })

    },
    
    deleteCart:(user)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(user) })
            .then(() => {
              resolve();
            });
        })
    }


}