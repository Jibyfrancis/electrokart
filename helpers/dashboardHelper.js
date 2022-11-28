var db = require("../config/connections");
var collection = require("../config/collections");
var objectId = require("mongodb").ObjectId;

module.exports = {
  paymentCount: () => {
    return new Promise(async (resolve, reject) => {
      let paymentcount = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          { $match: { paymentStatus: "Success" } },
          { $group: { _id: "$payment", sum: { $sum: 1 } } },
          { $project: { _id: 1, sum: 1 } },
        ])
        .toArray();
      resolve(paymentcount);
    });
  },

  totalsaleAmount: () => {
    return new Promise(async (resolve, reject) => {
      let totalsale = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([{ $group: { _id: null, sum: { $sum: "$amount" } } }])
        .toArray();
      resolve(totalsale);
    });
  },

  totalProductByDate: () => {
    return new Promise(async (resolve, reject) => {
      let totalproduct = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          { $match: { paymentStatus: "Success" } },
          {
            $project: {
              date: {
                $dateToString: { format: "%d-%m-%Y", date: "$orderDate" },
              },
            },
          },
          { $group: { _id: "$date", sum: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ])
        .toArray();
      resolve(totalproduct);
    });
  },

  allSaledProduct: () => {
    return new Promise(async (resolve, reject) => {
      let allprod = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          { $unwind: "$products" },
          { $match: { paymentStatus: "Success" } },
          { $group: { _id: 0, sum: { $sum: "$products.qty" } } },
        ])
        .toArray();
      resolve(allprod);
    });
  },

  dailysale: () => {
    return new Promise(async (resolve, reject) => {
      let dailysale = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              $and: [
                { paymentStatus: "Success" },
                {
                  orderDate: {
                    $gt: new Date(new Date() - 1 * 60 * 60 * 12 * 1000),
                  },
                },
              ],
            },
          },
          { $group: { _id: null, sum: { $sum: "$amount" } } },
        ])
        .toArray();
      resolve(dailysale);
    });
  },

  dailysalePtoduct: () => {
    return new Promise(async (resolve, reject) => {
      let dailysaleProduct = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              $and: [
                { paymentStatus: "Success" },
                {
                  orderDate: {
                    $gt: new Date(new Date() - 1 * 60 * 60 * 12 * 1000),
                  },
                },
              ],
            },
          },
          { $group: { _id: null, sum: { $sum: 1 } } },
        ])
        .toArray();
      resolve(dailysaleProduct);
    });
  },

  amountGeneratedThroughEachMethod: () => {
    return new Promise(async (resolve, reject) => {
      let amountBymethod = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          { $match: { paymentStatus: "Success" } },
          { $group: { _id: "$payment", sum: { $sum: "$amount" } } },
          { $project: { _id: 1, sum: 1 } }
        ]).toArray()
        resolve(amountBymethod)
    });
  },
};
