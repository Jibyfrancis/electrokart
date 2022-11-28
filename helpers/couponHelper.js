var db = require("../config/connections");
var collection = require("../config/collections");
const { response } = require("express");
var objectId = require("mongodb").ObjectId;

module.exports = {
  addcoupon: (couponData) => {
    return new Promise((resolve, reject) => {
      let coupon = {
        couponName: couponData.coupon,
        expairyDate: new Date(couponData.expairy_Date),
        maxAmount: parseInt(couponData.max_amount),
        minAmount: parseInt(couponData.min_amount),
        percentage: parseInt(couponData.percentage),
      };
      console.log(coupon);
      db.get()
        .collection(collection.COUPON_COLLETION)
        .insertOne(coupon)
        .then(() => {
          resolve();
        });
    });
  },

  getCoupon: () => {
    return new Promise((resolve, reject) => {
      let coupon = db
        .get()
        .collection(collection.COUPON_COLLETION)
        .find()
        .toArray();
      resolve(coupon);
    });
  },

  findCoupon: (code, user) => {
    return new Promise(async (resolve, reject) => {
      console.log(user);
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(user), coupon: code })
        .then(async (data) => {
          if (data) {
            reject("coupon already used");
          } else {
            let coupon = await db
              .get()
              .collection(collection.COUPON_COLLETION)
              .findOne({ couponName: code });
            if (coupon) {
              if (coupon.expairyDate >= new Date()) {
                console.log("valid");

                resolve(coupon);
              } else {
                reject("Coupon Expaired");
              }
            } else {
              console.log("not found");
              reject("Not found");
            }
          }
        });
    });
  },

  findCouponId: (cId) => {
    return new Promise(async (resolve, reject) => {
      let coupon = await db
        .get()
        .collection(collection.COUPON_COLLETION)
        .findOne({ _id: objectId(cId) });
      resolve(coupon);
    });
  },

  insertcoupon: (code, userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { user: objectId(userId) },
          {
            $set: {
              coupon: objectId(code),
            },
          }
        );
    });
  },

  removecoupon: (code, userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { user: objectId(userId) },
          {
            $unset: {
              coupon: "",
            },
          }
        );
    });
  },
  
  deleteCoupon: (cId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLETION)
        .deleteOne({ _id: objectId(cId) });
    });
  },
};
