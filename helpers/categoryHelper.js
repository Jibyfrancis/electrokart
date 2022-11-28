var db = require("../config/connections");
var collection = require("../config/collections");
var objectId = require("mongodb").ObjectId;

module.exports = {
  addCategory: (catData) => {
    return new Promise(async(resolve, reject) => {
        let cat={}
        console.log(catData);
      let category=await db.get().collection(collection.CATEGORY_COLLECTION).findOne({category:catData.category})
      console.log(category);
      if (category){
        cat.status='Already Exist'
        resolve(cat)
      }else{
        db.get().collection(collection.CATEGORY_COLLECTION).insertOne(catData).then((data)=>{
            resolve(data.insertedId);
        })

      }
        // .then((data) => {
        //   resolve(data.insertedId);
        // });
    });
  },

  getCategory: () => {
    return new Promise(async (resolve, reject) => {
      let category = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .toArray();
      resolve(category);
    });
  },

  deleteCategory: (cId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .deleteOne({ _id: objectId(cId) })
        .then(() => {
          resolve();
        });
    });
  },
  editCategory: (cId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ _id: objectId(cId) })
        .then((data) => {
          resolve(data);
        });
    });
  },

  updateCategory: (cId, categoryData) => {

    let offer=parseInt(categoryData.category_offer)
    console.log(offer);

    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .updateOne(
          { _id: objectId(cId) },
          {
            $set: {
              category: categoryData.category,
              category_offer:parseInt (categoryData.category_offer),
              updated_on: new Date(),
              images:categoryData.imageFileNames

            },
          }
        )
        .then(async() => {
          
          if(categoryData.category_offer!=NaN){
            let product= await  db.get().collection(collection.PRODUCT_COLLECTION).find({category:categoryData.category}).toArray()
            console.log(product);
            product.forEach(async (element) => {
              element.price=parseInt(element.price)
              element.offerPrice=element.price-(offer*element.price)/100

              await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({category:categoryData.category,_id:objectId(element._id)},{
                $set:{"offerPrice": element.offerPrice,
                "categoryOffer":offer
              }

              })
              resolve()
             
            });
            
        
          }
          else{
            resolve()
          }
      
        });
    });
  },
};
