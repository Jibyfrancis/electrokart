var db = require('../config/connections')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectId

module.exports = {
    addProduct: (productData) => {
        
       
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productData).then((data) => {
                resolve(data.insertedId)
            })

        })
    },
    getProduct:()=>{
        return new Promise(async(resolve, reject) => {
           let product= await  db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
           resolve(product)

        })
    },
    editProduct:(pId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(pId)}).then((product)=>{
                console.log(product);
                resolve(product)
            })
        })

    },
    deleteProduct:(pId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(pId)}).then(()=>{
            resolve()
            })
            
        })
        
    },


    updateProduct:(pId,productData)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(pId)},{
                $set:{
                    name:productData.name,
                    brand:productData.brand,
                    category:productData.category,
                    description:productData.description,
                    qty:productData.qty,
                    price:productData.price,
                    offerPrice:productData.offerPrice,
                    updated_on: new Date(),
                    images:productData.imageFileNames
                }
                }).then((response)=>{
                    resolve()
            })
            
        })
    },
    getLaptop:(data)=>{
            return new Promise(async(resolve, reject) => {
            let laptop= await db.get().collection(collection.PRODUCT_COLLECTION).find({category:data}).toArray()
            
            resolve(laptop)

        })
    },

    getProductWithCategory:(catName)=>{
        return new Promise(async(resolve,reject)=>{
            let product= await db.get().collection(collection.PRODUCT_COLLECTION).find({category:catName}).toArray()
    
            resolve(product)

        })

    }
}  