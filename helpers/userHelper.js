var db = require("../config/connections");
require('dotenv').config()
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
var objectId = require("mongodb").ObjectId;
const Razorpay = require("razorpay");
const paypal = require("paypal-rest-sdk");

var instance = new Razorpay({
  key_id:process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET
});
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:process.env.CLIENT_ID,
   
  client_secret:process.env.CLIENT_SECRET
    
});
const referralCodeGenerator = require("referral-code-generator");

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      let query = {};

      console.log(userData);
      userData.Password = await bcrypt.hash(userData.Password, 10);

      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Email: userData.Email })
        .then((response) => {
          if (response) {
            query.status = false;
            query.message = "Email Already Exist";

            resolve(query);
          } else {
            db.get()
              .collection(collection.USER_COLLECTION)
              .findOne({ mobile: userData.mobile })
              .then((response) => {
                if (response) {
                  // console.log("haiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
                  query.status = false;
                  query.message = "Mobile number Already Exist";
                  resolve(query);
                } else {
                  if (userData.referal) {
                    db.get()
                      .collection(collection.USER_COLLECTION)
                      .findOne({ refcode: userData.referal })
                      .then((user) => {
                        if (user) {
                          db.get()
                            .collection(collection.WALLET_COLLECTION)
                            .findOneAndUpdate(
                              { user: objectId(user._id) },
                              {
                                $push: { history:{ reference_got:userData.Name},type:'Refereal',amount:100},
                                $inc: { amount: 100 },
                              },
                              { new: true }
                            )
                            .then((response) => {
                              userData.block = true;
                              userData.refcode = referralCodeGenerator.alpha(
                                "uppercase",
                                6
                              );
                              db.get()
                                .collection(collection.USER_COLLECTION)
                                .insertOne(userData)
                                .then((data) => {
                                  // let newuser=data
                                  let wallet = {
                                    user: objectId(data.insertedId),
                                    name: userData.Name,
                                    referedBy: user.Name,
                                    amount: 500,
                                  };
                                  db.get()
                                    .collection(collection.WALLET_COLLECTION)
                                    .insertOne(wallet);

                                  query.status = true;
                                  query.message = "";
                                  console.log(query);
                                  resolve(query);
                                });
                            });
                        } else {
                          query.message = "Invalid referance code";
                          resolve(query);
                        }
                      });
                  } else {
                    console.log("elsecondition");

                    userData.block = true;
                    userData.refcode = referralCodeGenerator.alpha(
                      "uppercase",
                      6
                    );
                    db.get()
                      .collection(collection.USER_COLLECTION)
                      .insertOne(userData)
                      .then((data) => {
                        let newuser = data;
                        let wallet = {
                          user: objectId(data.insertedId),
                          name: userData.Name,
                          amount: 0,
                        };
                        db.get()
                          .collection(collection.WALLET_COLLECTION)
                          .insertOne(wallet);

                        query.status = true;
                        query.message = "";
                        console.log(query);
                        resolve(query);
                      });
                  }
                }
              });
          }
        });
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};

      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Email: userData.Email });

      if (user) {
        if (user.block === true) {
          // console.log(user)
          bcrypt.compare(userData.Password, user.Password).then((status) => {
            if (status) {
              console.log("login correct");
              response.user = user;
              response.status = true;

              resolve(response);
            } else {
              console.log("login failedwwwwwwww");
              response.notlog = true;

              resolve(response);
            }
          });
        } else {
          response.blocked = true;
          resolve(response);
        }
      } else {
        console.log("login failed else");
        resolve({ status: false });
      }
    });
  },

  doOtp: (userData) => {
    let response = {};
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ mobile: userData })
        .then((response) => {
          if (response) {
            response.status = true;
            resolve(response);
          } else {
            resolve(response);
          }
        });
    });
  },

  editUserDetails: (user) => {
    return new Promise(async (resolve, reject) => {
      console.log(user);

      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(user.userId) })
        .then((data) => {
          bcrypt.compare(user.Password, data.Password).then(async (status) => {
            if (status) {
              console.log("password match");
              user.Password = await bcrypt.hash(user.newpassword, 10);
              console.log(user.Password);
              let update = {
                Name: user.Name,
                Email: user.Email,
                mobile: user.mobile,
                Password: user.Password,
              };
              db.get()
                .collection(collection.USER_COLLECTION)
                .updateOne(
                  { _id: objectId(user.userId) },
                  {
                    $set: update,
                  },
                  { upsert: true }
                );
              resolve();
            } else {
              reject("Invalid Password");
            }
          });
        });
    });
  },
  
  findUser: (user) => {
    return new Promise(async (resolve, reject) => {
      let userData = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(user) });
      resolve(userData);
    });
  },

  addToCart: (proId, userId) => {
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      console.log(userCart);

      if (userCart) {
        let proInt = userCart.products.findIndex((pro) => pro.prodId == proId);
        console.log(proInt);
        if (proInt == -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: { prodId: objectId(proId), qty: 1 } },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          resolve();
        }
      } else {
        let carObj = {
          user: objectId(userId),
          products: [{ prodId: objectId(proId), qty: 1 }],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(carObj)
          .then((response) => {
            // console.log(response);
            resolve();
          });
      }
    });
  },

  getCartProduct: (userid) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userid) });
      console.log(user);
      if (user) {
        if (user.products.length == 0) {
          let data = {};
          data.message = true;
          resolve(data);
        } else {
          let usercart = await db
            .get()
            .collection(collection.CART_COLLECTION)
            .aggregate([
              { $match: { user: ObjectId(userid) } },
              { $unwind: "$products" },
              {
                $project: {
                  product: "$products.prodId",
                  productName:'$products.name',
                  qty: "$products.qty",
                  coupon: "$coupon",
                },
              },

              {
                $lookup: {
                  from: collection.PRODUCT_COLLECTION,
                  localField: "product",
                  foreignField: "_id",
                  as: "cartitem",
                },
              },
              {
                $project: {
                  product: 1,
                  qty: 1,
                  coupon: 1,
                  cartitem: { $arrayElemAt: ["$cartitem", 0] },
                },
              },
              {
                $addFields: {
                  convertedPrice: { $toInt: ["$cartitem.price"] },
                  convertedOfferprice: { $toInt: ["$cartitem.offerPrice"] },
                },
              },
              {
                $project: {
                  product: 1,
                  qty: 1,
                  cartitem: 1,
                  coupon: 1,
                  total: {
                    $sum: { $multiply: ["$qty", "$convertedOfferprice"] },
                  },
                },
              },
            ])
            .toArray();

          resolve(usercart);
        }
      } else {
        let data = {};
        data.message = true;
        resolve(data);
      }
    });
  },

  getCartExisting: (proId, userId) => {
    console.log(userId);
    return new Promise(async (resolve, reject) => {
      let check = {};
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      console.log("usercart     " + userCart);
      if (userCart) {
        let proInt = userCart.products.findIndex((pro) => pro.prodId == proId);
        console.log(proInt);
        if (proInt == -1) {
          check.status = true;
          resolve(check);
        } else {
          check.status = false;

          resolve(check);
        }
      } else {
        check.status = true;
        resolve(check);
      }
    });
  },
  
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },

  getWishlistCount:(user)=>{
    return new Promise(async(resolve, reject) => {
        let count=0;
        let wish= await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:objectId(user)})
        if(wish){
            count=wish.products.length
        }
        console.log(count);
        resolve(count)
    })

  },

  addToWishlist: (proId, userId) => {
    return new Promise(async (resolve, reject) => {
      
        let wishlist = await db
          .get()
          .collection(collection.WISHLIST_COLLECTION)
          .findOne({ user: objectId(userId) });
        if (wishlist) {
          let wishlistcheck = wishlist.products.findIndex(
            (pro) => pro.prodId == proId
          );
          console.log(wishlistcheck);
          if (wishlistcheck == 0) {
            resolve();
          } else {
            db.get()
              .collection(collection.WISHLIST_COLLECTION)
              .updateOne(
                { user: objectId(userId) },
                {
                  $push: {
                    products: { prodId: objectId(proId) ,wishlist: true}
                    
                  },
                }
              )
              .then(() => {
                resolve({ status: true });
              });
          }
        } else {
          let wishlist = {
            user: objectId(userId),
            products: [{ prodId: objectId(proId), wishlist: true }],
          };
          db.get()
            .collection(collection.WISHLIST_COLLECTION)
            .insertOne(wishlist)
            .then((response) => {
              resolve({ status: true });
            });
        };
      })
    },
   
  findWishList: (prodId,userId) => {     
  
    return new Promise(async(resolve, reject) => {
     let prolist=await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([{$match:{user:objectId(userId)}},{$unwind:'$products'},{$match:{'products.prodId':objectId(prodId)}}]).toArray()

        if (prolist.length>0){
           resolve({status:true})
        
        }else{
            resolve({status:false})

        }
       
      })
      
  },

  getWishlist: (userid) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .findOne({ user: ObjectId(userid) });
      // console.log(user);
      if (user) {
        if (user.products.length == 0) {
          let data = {};
          data.message = true;
          resolve(data);
        } else {
          let userwishlist = await db
            .get()
            .collection(collection.WISHLIST_COLLECTION)
            .aggregate([
              { $match: { user: ObjectId(userid) } },
              { $unwind: "$products" },
              {
                $project: { product: "$products.prodId" ,wishlist:'$products.wishlist'},
              },

              {
                $lookup: {
                  from: collection.PRODUCT_COLLECTION,
                  localField: "product",
                  foreignField: "_id",
                  as: "wishlistItems",
                },
              },
              {
                $project: {
                  product: 1,
                  
                  wishlist: { $arrayElemAt: ["$wishlistItems", 0] },
                },
              },
            ])
            .toArray();

          resolve(userwishlist);
        }
      } else {
        let data = {};
        data.message = true;
        resolve(data);
      }
    });
  },

  removeWishlist:(user,proId)=>{
    console.log('kkkkkkkkkkkkkkkkkkkkkkkk');
    console.log(user);
    console.log(proId);
    return new Promise((resolve, reject) => {
        db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:objectId(user)},{$pull:{products:{prodId: objectId(proId)}}}).then((data)=>{
            console.log(data);
            resolve({status:true})
        })
    })

  },

  getTotalAmount: (userid) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userid) });
      console.log(user);
      if (user) {
        let total = await db
          .get()
          .collection(collection.CART_COLLECTION)
          .aggregate([
            { $match: { user: ObjectId(userid) } },
            { $unwind: "$products" },
            {
              $project: { product: "$products.prodId", qty: "$products.qty" },
            },

            {
              $lookup: {
                from: collection.PRODUCT_COLLECTION,
                localField: "product",
                foreignField: "_id",
                as: "cartitem",
              },
            },
            {
              $project: {
                product: 1,
                qty: 1,
                cartitem: { $arrayElemAt: ["$cartitem", 0] },
              },
            },
            {
              $addFields: {
                convertedPrice: { $toInt: ["$cartitem.price"] },
                convertedOfferprice: { $toInt: ["$cartitem.offerPrice"] },
              },
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: { $multiply: ["$qty", "$convertedOfferprice"] },
                },
              },
            },
          ])
          .toArray();
        console.log(total);
        resolve(total[0]);
      } else {
        let data = {};
        data.message = "Cart is Empty";
        resolve(data);
      }
    });
  },

  findCart: (userId) => {
    return new Promise(async (resolve, request) => {
      let cartItem = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      // console.log('cartitems findcart');
      // console.log(cartItem.products);

      resolve(cartItem.products);
    });
  },
  getWalletAmount:(user,cartTotal,orederId)=>{
    return new Promise(async(resolve, reject) => {
      let wallet= await db.get().collection(collection.WALLET_COLLECTION).findOne({user:objectId(user)})
      if(wallet){
        if(wallet.amount>=cartTotal){
          db.get().collection(collection.WALLET_COLLECTION).updateOne({user:objectId(user)},{
            $inc:{amount:-cartTotal},
            $push: { history:{orderid:orederId,type:'Wallet Purchase',purchseAmount:cartTotal}},
          }).then((response)=>{
            resolve(response)
          })
        }else{
          resolve({message:'Insufficient Balance Select Other Options'})
        }

      }else{
       resolve()

      }

    })

  },

  generateRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      console.log("total" + total);

      var options = {
        amount: total * 100,
        currency: "INR",
        receipt: "" + orderId,
      };

      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else {
          console.log("new order:", order);
          resolve(order);
        }
      });
    });
  },

  verifyPayment: (data) => {
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "FvWoXwi6gHYF4KwRBSM3H3C1");
      hmac.update(
        data["payment[razorpay_order_id]"] +
          "|" +
          data["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if (hmac == data["payment[razorpay_signature]"]) {
        console.log("resolved");
        resolve();
      } else {
        console.log("rejected");
        reject();
      }
    });
  },

  changePaymentStatus: (receipt) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(receipt) },
          {
            $set: {
              paymentStatus: "Success",
            },
          }
        );
      resolve();
    });
  },
  // getpaypalproduct: (userid) => {
  //     return new Promise(async (resolve, reject) => {
  //         let proid1 = await db.get().collection(collection.CART_COLLECTION).aggregate([{ $match: { user: ObjectId(userid) } },
  //         { $unwind: "$products" },
  //         { $lookup: { from: collection.PRODUCT_COLLECTION, localField: 'product.prodId', foreignField: '_id', as: 'orderitem' } },
  //         { $project: { prodId: '$products.prodId', quantity: '$products.qty', orderlist: { $arrayElemAt: ['$orderitem', 0] } } },
  //         { $project: { _id: 0, prodId: 1, qty: 1, time: 1, orderlist: 1 } },
  //         { $project: { name: "$orderlist.name", total: '$orderlist.offerPrice', quantity: 1, } },
  //         { $project: { name: 1, quantity: 1, "sku": "item", "currency": "USD", price: { $round: [{ $multiply: ['$total', 0.012] }, 0] } } }]).toArray()

  //         console.log(proid1);

  //         resolve(proid1)
  //     })

  // },

  generatePaypal: (total) => {
    console.log(total);
    return new Promise((resolve, reject) => {
      var create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: "http://localhost:3000/ordersuccess-paypal",
          cancel_url: "http://localhost:3000/cancel-paypal",
        },
        transactions: [
          {
            item_list: {
              items: [
                {
                  name: "laptop",
                  sku: "001",
                  price: total,
                  currency: "USD",
                  quantity: 1,
                },
              ],
            },
            amount: {
              currency: "USD",
              total: total,
            },
            description: "This is the payment description.",
          },
        ],
      };
      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          console.log(error);
          throw error;
        } else {
          console.log(payment);
          resolve(payment);
        }
      });
    });
  },
  changePaymentStatusPaypal: (oId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(oId) },
          {
            $set: {
              paymentStatus: "Success",
            },
          }
        );
      resolve();
    });
  },
  insertcoupon: (cId, uId) => {
    console.log(cId);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLETION)
        .findOne({ _id: objectId(cId) })
        .then((response) => {
          db.get()
            .collection(collection.USER_COLLECTION)
            .updateOne(
              { _id: objectId(uId) },
              {
                $addToSet: {
                  coupon: response.couponName,
                },
              }
            );
          console.log(response.couponName);
        });
    });
  },
};
