var express = require("express");
var router = express.Router();
require('dotenv').config()
// var otpconfig = require("../config/otpconfig");
const productHelpers = require("../helpers/productHelper");
const userHelpers = require("../helpers/userHelper");
const categoryHelpers = require("../helpers/categoryHelper");
const cartHelper = require("../helpers/cartHelper");
const orderHelper = require("../helpers/orderHelper");
const userHelper = require("../helpers/userHelper");
// const client = require("twilio")(process.env.accountSID,process.env.authToken);
const accountSID=process.env.ACCOUNTSID;
const authToken=process.env.AUTHTOKEN;
const serviceID=process.env.SERVICEID
const client = require("twilio")(accountSID,authToken);
const paypal = require("paypal-rest-sdk");
const couponHelper = require("../helpers/couponHelper");
// const userAuth = require("../midleware/authentication");
const walletHelper = require("../helpers/walletHelper");
// const { LogInstance } = require("twilio/lib/rest/serverless/v1/service/environment/log");



module.exports = {
    home: (async function (req, res, next) {
        let user = req.session.user;
        console.log("loginrender");
        var cat = await categoryHelpers.getCategory();
        var products = await productHelpers.getProduct();
        req.session.categoty = cat;
        if (req.session.loggedIn) {
            var getcount = await userHelpers.getCartCount(req.session.user._id);
            var getwishcount = await userHelpers.getWishlistCount(req.session.user._id);
            products.forEach((element) => {
                userHelpers.findWishList(element._id, user._id).then((wishlist) => {
                    if (wishlist.status === true) {
                        element.iswhislist = true;
                    }
                });
            });
        }
        res.render("user/homepage", { user, getcount, cat, products, getwishcount });
    }),

    login: (async (req, res) => {
        let cat = await categoryHelpers.getCategory();
        console.log("logincheck");
        if (req.session.loggedIn) {
            res.redirect("/");
        } else {
            res.render("user/userlogin", { cat, loginErr: req.session.loginErr });
            req.session.loginErr = false;
        }
    }),

    userLogin: ((req, res) => {
        userHelpers.doLogin(req.body).then((response) => {
            console.log(response);
            if (response.status) {
                req.session.loggedIn = true;
                req.session.user = response.user;
                const redirect = req.session.returnToUrl || "/";
                console.log(redirect);
                delete req.session.returnToUrl;
                res.redirect(redirect);
                // res.redirect("/");
            } else if (response.notlog) {
                console.log("invalid pswd");
                req.session.loginErr = "invalid password";
                res.redirect("/login");
            } else if (response.blocked) {
                console.log("blocked");
                req.session.loginErr = "blocked";
                res.redirect("/login");
            } else {
                console.log("emailinvalid");
                req.session.loginErr = "invalid username password";
                res.redirect("/login");
            }
        });
    }),

    signup: (async (req, res) => {
        var cat = await categoryHelpers.getCategory();
        if (req.session.loggedIn) {
            res.redirect("/");
        } else {
            res.render("user/usersignup", { cat, errorMessage: req.session.loggErr });
            req.session.loggErr = false;
        }
    }),

    userSignup: ((req, res) => {
        userHelpers.doSignup(req.body).then((response) => {
            console.log(response);

            if (response.status) {
                res.redirect("/login");
            } else {
                console.log("signup check");
                req.session.loggErr = response.message;
                res.redirect("/signup");
            }
        });
    }),

    otpLogin: (async(req, res) => {
        var cat = await categoryHelpers.getCategory();
        res.render("user/otp-login", { cat,numError: req.session.numErr });
        req.session.numErr = false;
    }),

    otpSignUp: ((req, res) => {
        let number = {};
        number.mobile = parseInt(req.body.phonenumber);
        console.log(number.mobile);
        userHelpers.doOtp(req.body.phonenumber).then((response) => {
            console.log(response);
            if (response) {
                req.session.user = response;

                console.log(client);
                console.log(serviceID)
                console.log(accountSID)
                console.log(authToken);

                req.session.phonenumber = req.body.phonenumber;
                client.verify
                    .services(serviceID)
                    .verifications.create({
                        to: `+91${req.body.phonenumber}`,
                        channel: "sms",
                    })
                    .then((data) => {
                        console.log(data);
                        res.render("user/otp-login", { number });
                    }).catch((error)=>{
                        console.log(error);
                    });

            } else {
                req.session.numErr = "Mobile Number is not registerd";
                console.log("otpfailcheck");
                res.redirect("/otp-login");
            }
        });
    }),

    verifyOtp: ((req, res) => {
        client.verify
            .services(serviceID)
            .verificationChecks.create({
                to: `+91${req.session.phonenumber}`,
                code: req.body.code,
            })
            .then((data) => {
                console.log(data);
                req.session.loggedIn = true;
                res.redirect("/");
            });
    }),
    userProfile: (async (req, res) => {
        let cat = req.session.categoty;
        console.log(req.session.user);
        let user = req.session.user;

        if (req.session.loggedIn) {
            var getcount = await userHelpers.getCartCount(req.session.user._id);
            var getwishcount = await userHelpers.getWishlistCount(req.session.user._id);
            let userData = await userHelpers.findUser(req.session.user._id);
            req.session.user = userData;
            user = req.session.user;
            res.render("user/user_profile", {
                user,
                getcount,
                cat,
                getwishcount,
                errorMessage: req.session.error,
            });
            req.session.error = null;
        }
    }),
    editUserData: (async (req, res) => {
        userHelpers
            .editUserDetails(req.body)
            .then(async () => {
                console.log(req.session.user);
                res.json(response);
            })
            .catch((err) => {
                res.json({ response, err });
            });
    }),
    product: (async (req, res) => {
        let cat = req.session.categoty;
        req.session.returnToUrl = req.originalUrl;
        if (req.session.loggedIn) {
            let user = req.session.user;
            var getcount = await userHelpers.getCartCount(req.session.user._id);
            var getwishcount = await userHelpers.getWishlistCount(req.session.user._id);
            let wishlist = await userHelpers.findWishList(req.params.id, user._id);
            userHelpers
                .getCartExisting(req.params.id, req.session.user._id)
                .then((check) => {
                    if (check) {
                        productHelpers.editProduct(req.params.id).then((product) => {
                            res.render("user/product", {
                                product,
                                user,
                                getcount,
                                check,
                                cat,
                                wishlist,
                                getwishcount,
                            });
                        });
                    } else {
                        console.log(check);
                        let user = req.session.user;

                        res.render("user/product", {
                            product,
                            user,
                            getcount,
                            check,
                            cat,
                            wishlist,
                            getwishcount,
                        });
                    }
                });
        } else {
            productHelpers.editProduct(req.params.id).then((product) => {
                console.log(product);
                let check = { status: true };
                res.render("user/product", { product, check, cat });
            });
        }
    }),

    categoty: (async (req, res) => {
        var product = await productHelpers.getProductWithCategory(
            req.params.categoty
        );
        let cat = req.session.categoty;
        let user = req.session.user;
        if (req.session.loggedIn) {
            var getcount = await userHelpers.getCartCount(req.session.user._id);
            var getwishcount = await userHelpers.getWishlistCount(req.session.user._id);

            product.forEach((element) => {
                userHelpers.findWishList(element._id, user._id).then((wishlist) => {
                    if (wishlist.status === true) {
                        element.iswhislist = true;
                    }
                    console.log(wishlist);
                });
                console.log(element);
            });
        }
        console.log(product);

        console.log(req.params.categoty);
        res.render("user/categorywise", { product, user, getcount, cat, getwishcount });
    }),

    addtocart: ((req, res) => {
        console.log("addtocart");
        if (req.session.loggedIn) {
            userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
                res.json({ status: true });
            });
        } else {
            // res.redirect('/login')
            res.json({ status: false });
        }
    }),
    cart: (async (req, res) => {
        let cat = req.session.categoty;
        let getcount = await userHelpers.getCartCount(req.session.user._id);
        var getwishcount = await userHelpers.getWishlistCount(req.session.user._id);
        // req.session.count=getcount
        console.log("ajaxcall");
        if (req.session.loggedIn) {
            // let getcount=req.session.count
            let user = req.session.user;
            let cartTotal = await userHelpers.getTotalAmount(req.session.user._id);

            let products = await userHelpers
                .getCartProduct(req.session.user._id)
                .then((data) => {
                    // console.log(data.qty);
                    if (data.message) {
                        req.session.cartmsg = data.message;
                        res.render("user/cart", {
                            user,
                            getcount,
                            carterror: req.session.cartmsg,
                            cat,
                        });
                        req.session.cartmsg = false;
                    } else {
                        console.log(data);
                        res.render("user/cart", {
                            data,
                            user,
                            getcount,
                            cartTotal,
                            cat,
                            getwishcount,
                        });
                    }
                });
        }
    }),
    changeQuantity: ((req, res, next) => {
        console.log(req.body);
        cartHelper.changeProductQty(req.body).then((response) => {
            res.json(response);
        });
    }),
    removeProduct: ((req, res) => {
        if (req.session.loggedIn) {
            userId = req.session.user._id;
            proId = req.params.id;
            console.log(proId + "ddd" + userId);
            cartHelper.removeCartItem(proId, userId).then((resolve) => {
                res.redirect("/cart");
            });
        }
    }),
    addtoWishlist: ((req, res) => {
        console.log("wishlist");
        console.log(req.params);
        if (req.session.loggedIn) {
            userHelpers
                .addToWishlist(req.params.id, req.session.user._id)
                .then((response) => {
                    console.log("item und");
                    res.json(response);
                });
        } else {
            res.json({ status: false });
        }
    }),
    viewWishlist: (async (req, res) => {
        let user = req.session.user;
        let wishlist = await userHelpers.getWishlist(req.session.user._id);
        let getwishcount = await userHelpers.getWishlistCount(req.session.user._id);
        let getcount = await userHelpers.getCartCount(req.session.user._id);
        let cat = await categoryHelpers.getCategory();
        if (wishlist.message) {
            wishlist.emptystatus = true;
        }
        console.log(wishlist);

        res.render("user/wishlist", { wishlist, getcount, getwishcount, user, cat });
    }),
    deletewishlist: ((req, res) => {
        console.log(req.params);
        userHelpers.removeWishlist(req.session.user._id, req.params.id).then(() => {
            res.redirect("/view-wishlist");
        });
    }),
    removeWishlist: ((req, res) => {
        userHelpers
            .removeWishlist(req.session.user._id, req.params.id)
            .then((response) => {
                res.json(response);
            });
    }),
    proceed: (async (req, res) => {
        console.log(req.query.id);
        let cat = req.session.categoty;
        // req.session.count=getcount
        if (req.session.loggedIn) {
            let user = req.session.user;
            let getcount = await userHelpers.getCartCount(req.session.user._id);
            var getwishcount = await userHelpers.getWishlistCount(req.session.user._id);
            let cartTotal = await userHelpers.getTotalAmount(req.session.user._id);
            let products = await userHelpers.getCartProduct(req.session.user._id);
            let address = await orderHelper.findAddress(user._id);
            let allAddress = await orderHelper.findAllAddress(user._id);
            if (req.query.id) {
                couponHelper.insertcoupon(req.query.id, req.session.user._id);
                let coupon = await couponHelper.findCouponId(req.query.id);
                let maxDiscount = cartTotal.total - (cartTotal.total * coupon.percentage) / 100;
                let limitAmount = Math.round(cartTotal.total * coupon.percentage) / 100;
                if (maxDiscount > coupon.maxAmount && limitAmount > coupon.maxAmount) {
                    cartTotal.total = cartTotal.total - coupon.maxAmount

                    for (i = 0; i < products.length; i++) {
                        products[i].total = (products[i].total - (coupon.maxAmount / products.length));

                    }
                } else {
                    cartTotal.total = cartTotal.total - (cartTotal.total * coupon.percentage) / 100;

                    for (i = 0; i < products.length; i++) {
                        products[i].total =
                            products[i].total - (products[i].total * coupon.percentage) / 100;
                    }

                }


            } else {
                couponHelper.removecoupon(req.query.id, req.session.user._id);
                req.session.coupon = null;
            }
            res.render("user/proceed", {
                user,
                getcount,
                cartTotal,
                products,
                address,
                cat,
                getwishcount,
                allAddress,
            });
        }
    }),

    defaultAddress: (async (req, res) => {
        if (req.session.loggedIn) {
            let address = await orderHelper.defaultAddress(req.body.select);
            console.log(address);
            req.session.addAddress = address;

            res.redirect("/checkout");
        }
    }),

    newAddress: (async (req, res) => {
        if (req.session.loggedIn) {
            let address = await orderHelper.defaultAddress(req.body.select);
            console.log(address);
            req.session.addAddress = address;

            res.redirect("/checkout");
        }
    }),
    editAddress: ((req, res) => {
        console.log(req.body);
        console.log("form editaddressssss");

        orderHelper.editAddress(req.body).then((response) => {
            res.json(response);
        });
    }),

    manageAddress: (async (req, res) => {
        let cat = await categoryHelpers.getCategory();
        let address = await orderHelper.getAddress(req.session.user._id);
        let user = req.session.user;
        console.log(address);
        res.render("user/manage-address", { cat,address, user });
    }),

    displyAdderss: ((req, res) => {
        orderHelper
            .findAddressById(req.query.addressId, req.session.user._id)
            .then((response) => {
                console.log(response[0]);
                res.json(response[0]);
            });
    }),

    deleteAddress: ((req, res) => {
        console.log(req.params);
        orderHelper
            .deleteAddress(req.session.user._id, req.params.id)
            .then((response) => {
                res.json(response);
            });
    }),

    addAddress: ((req, res) => {
        let user = {
            userid: req.session.user._id,
        };
        orderHelper.createAddress(req.body, user).then((response) => {
            res.json(response);
        });
    }),
    checkout: (async (req, res) => {
        let cat = req.session.categoty;
        if (req.session.loggedIn) {
            let getcount = await userHelpers.getCartCount(req.session.user._id);
            var getwishcount = await userHelpers.getWishlistCount(req.session.user._id);
            let cartTotal = await userHelpers.getTotalAmount(req.session.user._id);
            let products = await userHelpers.getCartProduct(req.session.user._id);
            address = req.session.addAddress;
            let user = req.session.user;

            console.log(products[0].coupon);
            if (products[0].coupon) {

                console.log("couponfound");
                req.session.coupon = products[0].coupon;
                let coupon = await couponHelper.findCouponId(products[0].coupon);
                let maxDiscount = cartTotal.total - (cartTotal.total * coupon.percentage) / 100;
                let limitAmount = Math.round(cartTotal.total * coupon.percentage) / 100;
                console.log(maxDiscount);
                console.log(limitAmount);

                if (maxDiscount > coupon.maxAmount && limitAmount > coupon.maxAmount) {
                    cartTotal.total = cartTotal.total - coupon.maxAmount
                    console.log(products.length);

                    for (i = 0; i < products.length; i++) {
                        products[i].total = (products[i].total - (coupon.maxAmount / products.length));

                    }
                }
                else {
                    for (i = 0; i < products.length; i++) {
                        products[i].total =
                            products[i].total - (products[i].total * coupon.percentage) / 100;
                    }
                    cartTotal.total =
                        cartTotal.total - (cartTotal.total * coupon.percentage) / 100;
                }

            }
            else {
                req.session.coupon = null;
            }

            res.render("user/check-out", {
                user,
                getcount,
                cartTotal,
                products,
                address,
                cat,
                getwishcount,
            });
        }
    }),
    postCheckout: (async (req, res) => {
        console.log(req.body);
        if (req.session.loggedIn) {
            formData = req.body;
            addAddress = req.session.addAddress;
            order = addAddress[0].address;
            let products = await userHelpers.getCartProduct(req.session.user._id);
            // let cartTotal = await userHelpers.getTotalAmount(req.session.user._id);
            let cartTotal = parseInt(formData.total);
            console.log("carttotal");
            console.log(cartTotal);
            console.log(products);

            orderHelper.createAddress(addAddress[0].address, formData);
            console.log("coupon check");
            console.log(req.session.coupon);
            if (req.session.coupon) {
                console.log("couponfound");
                req.session.coupon = products[0].coupon;
                let coupon = await couponHelper.findCouponId(req.session.coupon);
                let maxDiscount = cartTotal - (cartTotal * coupon.percentage) / 100;
                let limitAmount = Math.round(cartTotal * coupon.percentage) / 100;
                console.log(maxDiscount);
                console.log(limitAmount);

                if (maxDiscount > coupon.maxAmount && limitAmount > coupon.maxAmount) {
                    console.log('coupondisccccccccccccccccccccc');
                    // cartTotal = cartTotal -coupon.maxAmount
                    console.log(products.length);

                    for (i = 0; i < products.length; i++) {
                        products[i].total = (products[i].total - (coupon.maxAmount / products.length));

                    }
                    ;
                } else {
                    for (i = 0; i < products.length; i++) {
                        products[i].total = products[i].total - (products[i].total * coupon.percentage) / 100;

                    }
                    // cartTotal = cartTotal - (cartTotal * coupon.percentage) / 100;


                }

                userHelper.insertcoupon(req.session.coupon, req.session.user._id);
            }
            console.log('pppppppppppppppppppppp');
            console.log(products);

            orderHelper
                .createOrder(formData, order, products, cartTotal)
                .then((orderId) => {
                    console.log("orderid");
                    console.log(orderId);
                    req.session.ordergetId = orderId;
                    if (formData.payment === "COD") {
                        // console.log(response);
                        res.json({ codSuccess: true });
                    } else if (formData.payment === "Razorpay") {
                        userHelper.generateRazorpay(orderId, cartTotal).then((response) => {
                            console.log("razorpayyyyyyyy");
                            console.log(response);
                            response.razorpay = true;
                            response.user = req.session.user;
                            res.json(response);
                        });
                    } else if (formData.payment === "Wallet") {
                        userHelper
                            .getWalletAmount(req.session.user._id, cartTotal, orderId)
                            .then((response) => {
                                console.log("Wallet");
                                console.log(response);
                                response.wallet = true;
                                response.user = req.session.user;
                                console.log(response.message);
                                res.json(response);
                            });
                    } else {
                        total = cartTotal * 0.0125;
                        req.session.paypaltotal = total;
                        userHelper.generatePaypal(total).then((payment) => {
                            for (let i = 0; i < payment.links.length; i++) {
                                if (payment.links[i].rel === "approval_url") {
                                    res.json(payment.links[i].href);
                                }
                            }
                            console.log(payment);
                        });
                    }
                });
        }
    }),
    razorpayVeryfyPaymrnt:((req, res) => {
        console.log("ajaxcall");
        console.log(req.body);
        userHelper
            .verifyPayment(req.body)
            .then(() => {
                userHelper.changePaymentStatus(req.body["order[receipt]"]).then(() => {
                    console.log("payment status");
                    res.json({ status: true });
                });
            })
            .catch((err) => {
                console.log(err);
                res.json({ status: "Payment failed" });
            });
    }),

    orderSuccessPaypal:(async (req, res) => {
        console.log("paypal success");
        if (req.session.loggedIn) {
            amount = req.session.paypaltotal;
    
            const payerId = req.query.PayerID;
            const paymentId = req.query.paymentId;
    
            const execute_payment_json = {
                payer_id: payerId,
                transactions: [
                    {
                        amount: {
                            currency: "USD",
                            total: amount,
                        },
                    },
                ],
            };
    
            // Obtains the transaction details from paypal
            paypal.payment.execute(
                paymentId,
                execute_payment_json,
                function (error, payment) {
                    //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
                    if (error) {
                        console.log(error.response);
                        throw error;
                    } else {
                        oId = req.session.ordergetId;
                        userHelper.changePaymentStatusPaypal(oId);
    
                        console.log(JSON.stringify(payment));
                        res.redirect("/ordersuccess");
                    }
                }
            );
        }
    }),
    cancelPaypal:((req, res) => {
        res.redirect("/payment-failed")
    }),
    paymentfailed:((req, res) => {
        orderHelper.deletePendingPayment(req.session.user._id);
        res.render("user/payment-failed");
    }),

    orderSuccess:(async (req, res) => {
        let cat = req.session.categoty;
        console.log("successpage");
        if (req.session.loggedIn) {
            const payerId = req.query.payerID;
            const paymentId = req.query.paymentId;
    
            let user = req.session.user;
            cartHelper.deleteCart(user._id);
            var getcount = await userHelpers.getCartCount(req.session.user._id);
            var getwishcount = await userHelpers.getWishlistCount(req.session.user._id);
            console.log("ajaxcall");
            res.render("user/order-success", { user, getcount, cat, getwishcount });
        }
    }),
    orders:(async (req, res) => {
        let cat = req.session.categoty;
        if (req.session.loggedIn) {
            let user = req.session.user;
            orderHelper.deletePendingPayment(req.session.user._id);
            let orders = await orderHelper.getAllOrders(req.session.user._id);
            var getcount = await userHelpers.getCartCount(req.session.user._id);
            var getwishcount = await userHelpers.getWishlistCount(req.session.user._id);
            orders.forEach((orders) => {
                if (orders.orderStatus === "Cancelled") {
                    orders.cancelStatus = true;
                }
                if (orders.orderStatus === "Delivered") {
                    orders.deliveredStatus = true;
                }
                if (orders.orderStatus === "Refund Approved") {
                    orders.refundStatus = "true";
                }
                console.log(orders);
            });
            console.log(orders);
            res.render("user/orders", { orders, user, getcount, cat, getwishcount });
        }
    }),

    cancelOrder:(async (req, res) => {
        console.log(req.params);
        orderHelper.cancelOrder(req.params.id, req.params.pid).then(() => {
            console.log();
            res.redirect("/orders");
        });
    }),
    returnOrder:(async (req, res) => {
        console.log(req.params);
        orderHelper.returnOrder(req.params.id, req.params.pid).then(() => {
            console.log();
            res.redirect("/orders");
        });
    }),
    wallet:(async (req, res) => {
        let user = req.session.user;
        var cat = await categoryHelpers.getCategory();
        var getcount = await userHelpers.getCartCount(req.session.user._id);
        var getwishcount = await userHelpers.getWishlistCount(req.session.user._id);
        let wallet = await walletHelper.getWallet(req.session.user._id);
    
        res.render("user/wallet", { wallet, user, getcount, cat, getwishcount });
    }),
    applyCoupon:( (req, res) => {
        console.log(req.body);
        couponHelper
            .findCoupon(req.body.name, req.session.user._id)
            .then((data) => {
                res.json({ status: true, data });
            })
            .catch((err) => {
                console.log(err);
                res.json({ status: false, err });
            });
    }),
    logout:((req, res) => {
        req.session.returnToUrl = null;
        req.session.user = null;
        req.session.loggedIn = false;
        res.redirect("/");
    })








}