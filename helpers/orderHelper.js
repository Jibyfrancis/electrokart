var db = require("../config/connections");
var collection = require("../config/collections");
const { ReturnDocument, ObjectId } = require("mongodb");
const productHelper = require("./productHelper");
var objectId = require("mongodb").ObjectId;

module.exports = {
    createOrder: (form, order, product, total) => {
        return new Promise((resolve, reject) => {
            console.log(product);

            product.forEach((element) => {
                delete element.cartitem;
                element.orderStatus = "placed";
                element.uppdated = new Date();
            });
            order.PaymentStatus = form.payment === "COD" || "wallet" ? "Success" : "Pending";
            orderDetails = {
                user: objectId(form.userid),
                name: order.name,
                mobile: order.mobile,
                email: order.email,
                products: product,
                payment: form.payment,
                amount: total, //changed from the hbs for coupon
                paymentStatus: order.PaymentStatus,
                deliveryAddress: {
                    name: order.name,
                    address: order.address,
                    city: order.city,
                    pin: order.pin,
                },

                status: "Order Placed",
                orderDate: new Date(),
                orderTime: new Date().getTime(),
            };
            db.get()
                .collection(collection.ORDER_COLLECTION)
                .insertOne(orderDetails)
                .then((response) => {
                    resolve(response.insertedId);
                });
        });
    },

    getOrders: (orderId) => {
        // for view in separate page view order
        return new Promise(async (resolve, reject) => {
            let orders = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    { $match: { _id: objectId(orderId) } },
                    {
                        $unwind: "$products",
                    },
                    //   {
                    //     $match: { "products.orderStatus": "placed" },
                    //   },
                    {
                        $project: {
                            user: 1,
                            name: 1,
                            amount: 1,
                            mobile: 1,
                            payment: 1,
                            status: 1,
                            deliveryAddress: 1,
                            productTotal: "$products.total",
                            product: "$products.product",
                            qty: "$products.qty",
                            orderStatus: "$products.orderStatus",
                            orderDate: {
                                $dateToString: { format: "%d-%m-%Y", date: "$orderDate" },
                            },
                            orderTime: 1,
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
                            user: 1,
                            name: 1,
                            amount: 1,
                            mobile: 1,
                            payment: 1,
                            status: 1,
                            orderDate: 1,
                            orderStatus: 1,
                            deliveryAddress: 1,
                            qty: 1,
                            productTotal: 1,
                            orderTime: 1,
                            cartitem: { $arrayElemAt: ["$cartitem", 0] },
                        },
                    },
                ])
                .toArray();
            resolve(orders);
            console.log(orders);
        });
    },

    // getAllOrders:(userId)=>{
    //   return new Promise(async(resolve, reject) => {
    //       let orders= await db.get().collection(collection.ORDER_COLLECTION).find({user:objectId(userId)},{sort:{orderDate:-1}}).toArray()
    //       resolve(orders)

    //   })
    // },

    getAllOrders: (user) => {
        // for view in order page
        return new Promise(async (resolve, reject) => {
            let orders = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    { $match: { user: objectId(user) } },
                    {
                        $unwind: "$products",
                    },
                    // {
                    //   $match: { "products.orderStatus": "placed" },
                    // },
                    {
                        $project: {
                            name: 1,
                            amount: 1,
                            mobile: 1,
                            payment: 1,
                            status: 1,
                            deliveryAddress: 1,
                            productTotal: "$products.total",
                            product: "$products.product",
                            qty: "$products.qty",
                            orderStatus: "$products.orderStatus",
                            orderDate: {
                                $dateToString: { format: "%d-%m-%Y", date: "$orderDate" },
                            },
                            orderTime: 1,
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
                            name: 1,
                            amount: 1,
                            mobile: 1,
                            payment: 1,
                            status: 1,
                            orderDate: 1,
                            orderStatus: 1,
                            deliveryAddress: 1,
                            qty: 1,
                            productTotal: 1,
                            orderTime: 1,
                            cartitem: { $arrayElemAt: ["$cartitem", 0] },
                        },
                    },
                    {
                        $sort: { orderDate: -1 },
                    },
                ])
                .toArray();
            resolve(orders);
            console.log(orders);
        });
    },

    deletePendingPayment: (user) => {
        return new Promise((resolve, reject) => {
            try {
                db.get()
                    .collection(collection.ORDER_COLLECTION)
                    .deleteMany({ "user": objectId(user), "paymentStatus": { $eq: "Pending" } }).then(() => {
                        resolve()
                    });
            } catch (e) {
                print(e)
            }

        })
    },

    // cancelOrder:(orderId)=>{
    //     return new Promise((resolve, reject) => {
    //         db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},{
    //             $set:{
    //               "products.$.orderStatus":'Canceled'
    //             }
    //         }).then(()=>{
    //             resolve()
    //         })
    //     })
    // },

    cancelOrder: (orderId, proId, amount, user) => {
        console.log('wa');
        var refund = parseInt(amount)
        return new Promise(async (resolve, reject) => {

            let check = await db.get().collection(collection.ORDER_COLLECTION).findOne({ $and: [{ _id: objectId(orderId) }, { payment: 'COD' }] });
            console.log(check);
            if (check) {
                db.get()
                    .collection(collection.ORDER_COLLECTION)
                    .updateOne(
                        { _id: objectId(orderId), "products.product": objectId(proId) },
                        {
                            $set: {
                                "products.$.orderStatus": "Cancelled",
                                "products.$.uppdated": new Date(),
                            },
                        }
                    )
                    .then((response) => {
                        resolve(response);
                    });

            } else {
                db.get().collection(collection.WALLET_COLLECTION).updateOne({ user: objectId(user) }, {

                    $push: { history: { type: 'Refund', refundAmount: refund } },
                    $inc: { amount: refund },

                }).then(() => {
                    db.get()
                        .collection(collection.ORDER_COLLECTION)
                        .updateOne(
                            { _id: objectId(orderId), "products.product": objectId(proId) },
                            {
                                $set: {
                                    "products.$.orderStatus": "Cancelled",
                                    "products.$.uppdated": new Date(),
                                },
                            }
                        )
                        .then((response) => {
                            resolve(response);
                        });

                })

            }

        })

    },

    returnOrder: (orderId, proId) => {
        console.log(orderId);
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ORDER_COLLECTION)
                .updateOne(
                    { _id: objectId(orderId), "products.product": objectId(proId) },
                    {
                        $set: {
                            "products.$.orderStatus": "Returned",
                            "products.$.uppdated": new Date(),
                        },
                    }
                )
                .then((response) => {
                    resolve(response);
                });
        });
    },


    //   getllOrderHistory: (userId) => {
    //     return new Promise(async (resolve, reject) => {
    //       let orders = await db
    //         .get()
    //         .collection(collection.ORDER_COLLECTION)
    //         .aggregate([
    //           { $match: { $and: [{ user: objectId(userId) }] } },
    //           {
    //             $unwind: "$products",
    //           },
    //           {
    //             $project: {
    //               amount: 1,
    //               mobile: 1,
    //               payment: 1,
    //               status: 1,
    //               product: "$products.prodId",
    //               qty: "$products.qty",
    //               orderStatus: "$products.orderStatus",
    //               orderDate: 1,
    //               orderTime: 1,
    //             },
    //           },
    //           {
    //             $lookup: {
    //               from: collection.PRODUCT_COLLECTION,
    //               localField: "product",
    //               foreignField: "_id",
    //               as: "cartitem",
    //             },
    //           },
    //           {
    //             $project: {
    //               amount: 1,
    //               mobile: 1,
    //               payment: 1,
    //               status: 1,
    //               orderStatus: 1,
    //               orderDate: 1,
    //               orderTime: 1,
    //               cartitem: { $arrayElemAt: ["$cartitem", 0] },
    //             },
    //           },
    //         ])
    //         .toArray();
    //       resolve(orders);
    //       console.log(orders);
    //     });
    //   },
    changeStatus: (details) => {
        return new Promise(async (resolve, reject) => {
            console.log(details);
            if (details.action === "Refund Approved") {
                let product = await db
                    .get()
                    .collection(collection.ORDER_COLLECTION)
                    .aggregate([
                        { $match: { _id: objectId(details.order) } },
                        {
                            $unwind: "$products",
                        },
                        {
                            $match: { "products.product": objectId(details.product) },
                        },
                        {
                            $project: {
                                products: 1,
                                refund: '$products.total',
                                payment: 1,
                            }

                        },
                    ])
                    .toArray();

                db.get().collection(collection.WALLET_COLLECTION).updateOne({ user: objectId(details.userid) }, {

                    $push: { history: { payment: product[0].payment, type: 'Refund', refundAmount: product[0].refund } },
                    $inc: { amount: product[0].refund },

                }).then(() => {
                    resolve()
                })
            }

            db.get()
                .collection(collection.ORDER_COLLECTION)
                .updateOne(
                    {
                        _id: objectId(details.order),
                        "products.product": objectId(details.product),
                    },
                    {
                        $set: {
                            "products.$.orderStatus": details.action,
                        },
                    }
                )
                .then(() => {
                    resolve();
                });
        });
    },

    order: (uid, firstindex, last) => {
        return new Promise(async (resolve, reject) => {
            let value = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .aggregate([
                    { $match: { user: objectId(uid) } },
                    {
                        $unwind: "$products",
                    },
                    // {
                    //   $match: { "products.orderStatus": "placed" },
                    // },

                    {
                        $project: {
                            name: 1,
                            amount: 1,
                            mobile: 1,
                            payment: 1,
                            status: 1,
                            deliveryAddress: 1,
                            productTotal: "$products.total",
                            product: "$products.product",
                            qty: "$products.qty",
                            orderStatus: "$products.orderStatus",
                            orderDate: {
                                $dateToString: { format: "%d-%m-%Y", date: "$orderDate" },
                            },
                            orderTime: 1,
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

                            name: 1,
                            amount: 1,
                            mobile: 1,
                            payment: 1,
                            status: 1,
                            orderDate: 1,
                            orderStatus: 1,
                            deliveryAddress: 1,
                            qty: 1,
                            productTotal: 1,
                            orderTime: 1,
                            cartitem: { $arrayElemAt: ["$cartitem", 0] },
                        },
                    },
                    { $sort: { orderTime: -1 } }, { $skip: firstindex }, { $limit: last }
                ])
                .toArray();
            resolve(value);
            console.log(value);
        });

    },
    ordercount: (uid) => {
        return new Promise(async (resolve, reject) => {
            let count = await db.get().collection(collection.ORDER_COLLECTION)
                .aggregate([
                    { $match: { user: objectId(uid) } },
                    {
                        $unwind: "$products",
                    },
                    {
                        $group: { _id: null, count: { $sum: 1 } }
                    }
                ]).toArray()
            resolve(count[0].count)

        })

    },


    createAddress: (userdata, formdata) => {
        return new Promise(async (resolve, reject) => {
            let value = {
                _id: objectId(userdata._id),
                name: userdata.name,
                mobile: userdata.mobile,
                email: userdata.email,
                address: userdata.address,
                city: userdata.city,
                country: userdata.country,
                pin: userdata.pin,
            };

            let user = await db
                .get()
                .collection(collection.ADDRESS_COLLECTION)
                .findOne({ user: objectId(formdata.userid) });
            if (user) {
                console.log(user);
                db.get()
                    .collection(collection.ADDRESS_COLLECTION)
                    .updateOne(
                        { user: objectId(formdata.userid) },
                        {
                            $addToSet: {
                                address: value,
                            },
                        }
                    )
                    .then((response) => {
                        resolve(response);
                    });
            } else {
                let add = {
                    user: objectId(userdata.userid),
                    address: [value],
                };

                db.get()
                    .collection(collection.ADDRESS_COLLECTION)
                    .insertOne(add)
                    .then(() => {
                    });
            }
        });
    },

    findAddress: (userid) => {
        return new Promise(async (resolve, reject) => {
            let address = await db
                .get()
                .collection(collection.ADDRESS_COLLECTION)
                .aggregate([
                    { $match: { user: objectId(userid) } },
                    { $project: { _id: 0, address: 1 } },
                    { $unwind: "$address" },
                    { $sort: { "address.date": -1 } },
                    { $limit: 1 },
                ])
                .toArray();
            resolve(address);

        });
    },

    findAllAddress: (userid) => {
        return new Promise(async (resolve, reject) => {
            let address = await db
                .get()
                .collection(collection.ADDRESS_COLLECTION)
                .aggregate([
                    { $match: { user: objectId(userid) } },
                    { $project: { _id: 0, address: 1 } },
                    { $unwind: "$address" },
                    { $sort: { "address.date": -1 } },
                    { $skip: 1 },
                ])
                .toArray();
            resolve(address);

        });
    },

    getAddress: (userid) => {
        return new Promise(async (resolve, reject) => {
            let address = await db
                .get()
                .collection(collection.ADDRESS_COLLECTION)
                .aggregate([
                    { $match: { user: objectId(userid) } },
                    { $project: { _id: 0, address: 1 } },
                    { $unwind: "$address" },
                    { $sort: { "address.date": -1 } },
                    { $limit: 4 },
                ])
                .toArray();
            resolve(address);

        });
    },

    defaultAddress: (id) => {
        return new Promise(async (resolve, reject) => {
            let defAdd = await db
                .get()
                .collection(collection.ADDRESS_COLLECTION)
                .aggregate([
                    { $unwind: "$address" },
                    { $match: { "address._id": objectId(id) } },
                ])
                .toArray();
            resolve(defAdd);

        });
    },

    editAddress: (data) => {
        return new Promise((resolve, reject) => {
            let value = {
                _id: objectId(),
                name: data.name,
                mobile: data.mobile,
                email: data.email,
                address: data.address,
                city: data.city,
                country: data.country,
                pin: data.pin,
            };

            db.get()
                .collection(collection.ADDRESS_COLLECTION)
                .findOneAndUpdate(
                    {
                        user: objectId(data.userid),
                        "address._id": objectId(data.address_id),
                    },
                    {
                        $set: { "address.$": value },
                    }
                )
                .then((response) => {
                    resolve(response);
                });
        });
    },

    findAddressById: (addressId, userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(addressId);
            let address = await db
                .get()
                .collection(collection.ADDRESS_COLLECTION)
                .aggregate([
                    { $match: { user: objectId(userId) } },
                    {
                        $unwind: "$address",
                    },
                    {
                        $match: { "address._id": objectId(addressId) },
                    },
                    {
                        $project: {
                            _id: 0,
                            address: 1,
                        },
                    },
                ])
                .toArray();
            resolve(address);

        });
    },
    deleteAddress: (user, addressId) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ADDRESS_COLLECTION)
                .updateOne(
                    { user: objectId(user) },
                    {
                        $pull: {
                            address: { _id: objectId(addressId) },
                        },
                    }
                )
                .then((data) => {
                    resolve(data);
                });
        });
    },
};
