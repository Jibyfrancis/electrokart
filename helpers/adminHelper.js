var db = require("../config/connections");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const { response } = require("express");
const { PRODUCT_COLLECTION } = require("../config/collections");
const {
  MonthlyInstance,
} = require("twilio/lib/rest/api/v2010/account/usage/record/monthly");
var objectId = require("mongodb").ObjectId;

module.exports = {
  getAllUsers: (uId) => {
    return new Promise((resolve, reject) => {
      let users = db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    });
  },

  blockUser: (uID) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(uID) },
          {
            $set: {
              block: false,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  
  unblockUser: (uID) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(uID) },
          {
            $set: {
              block: true,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },

  dailyReport: () => {
    return new Promise(async (resolve, reject) => {
      let daily = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              orderDate: {
                $gt: new Date(new Date() - 1 * 60 * 60 * 12 * 1000),
              },
            },
          },
          {
            $unwind: "$products",
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "products.prodId",
              foreignField: "_id",
              as: "daily",
            },
          },
        ])
        .toArray();
      resolve(daily);
    
    });
  },

  weeklyReport: () => {
    return new Promise(async (resolve, reject) => {
      let report = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              orderDate: {
                $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000),
              },
            },
          },
          { $unwind: "$products" },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "products.prodId",
              foreignField: "_id",
              as: "daily",
            },
          },
        ])
        .toArray();
      resolve(report);
    });
  },

  yearlyReport: () => {
    return new Promise(async (resolve, reject) => {
      let report = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              orderDate: { $gte: new Date(new Date() - 365 * 60 * 24 * 1000) }
            },
          },
          { $unwind: "$products" },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "products.prodId",
              foreignField: "_id",
              as: "daily",
            },
          },
        ])
        .toArray();
      resolve(report);
    });
  },
  
  selectByDate: (data) => {
    return new Promise(async (resolve, reject) => {
      from = data.fdate
      // from.setUTCHours(0, 0, 0, 0);
      to = data.todate
      console.log(from);
      console.log(to);
      let oreder = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match:

              { paymentStatus: "Success" },

          },
          {
            $project: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$orderDate" },
              },
              products: 1,

            }
          },
          {
            $match: {
              date: {
                $gte: from, $lte: to,
              }
            }
          },

          {
            $unwind: "$products",
          },

          {
            $group: {
              _id: "$products.product",
              quantity: { $sum: "$products.qty" },
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "_id",
              foreignField: "_id",
              as: "cartitem",
            },
          },
          {
            $project: {
              quantity: 1,
              product: { $arrayElemAt: ["$cartitem", 0] },
            },
          },
          {
            $addFields: {
              total: { $multiply: ["$quantity", "$product.offerPrice"] },
            },
          },
        ])
        .toArray();
      resolve(oreder);
    });
  },

  selectByMonth: (date) => {
    return new Promise(async (resolve, reject) => {

      let oreder = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          { $match: { paymentStatus: "Success" } },

          {
            $project: {
              products: 1,
              amount: 1,
              month: {
                $dateToString: { format: "%Y-%m", date: "$orderDate" },
              },

              date: {
                $dateToString: { format: "%d-%m-%Y", date: "$orderDate" },
              },
            },
          },
          { $match: { month: date.month } },
          {
            $unwind: "$products",
          },
          {
            $group: { _id: "$date", quantity: { $sum: "$products.qty" }, total: { $sum: "$amount" } }
          },

        ])
        .toArray();

      resolve(oreder);
    });
  },
  selectByYear: (date) => {
    return new Promise(async (resolve, reject) => {

      let oreder = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          { $match: { paymentStatus: "Success" } },

          {
            $project: {
              products: 1,
              amount: 1,


              month: {
                $dateToString: { format: "%Y-%m", date: "$orderDate" },
              },


              year: {
                $dateToString: { format: "%Y", date: "$orderDate" },
              },
            },
          },
          { $match: { year: date.year } },
          {
            $unwind: "$products",
          },
          {
            $group: { _id: "$month", quantity: { $sum: "$products.qty" }, total: { $sum: "$amount" } }
          },


        ])
        .toArray();

      resolve(oreder);
    });
  },
};
