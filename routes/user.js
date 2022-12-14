var express = require("express");
const { home,
    login,
    userLogin,
    signup,
    userSignup,
    otpLogin,
    otpSignUp,
    verifyOtp,
    userProfile,
    editUserData,
    product,
    category,
    addtocart,
    cart,
    changeQuantity,
    removeProduct,
    addtoWishlist,
    viewWishlist,
    deletewishlist,
    removeWishlist,
    proceed,
    defaultAddress,
    newAddress,
    editAddress,
    manageAddress,
    displyAdderss,
    deleteAddress,
    addAddress,
    checkout,
    postCheckout,
    razorpayVeryfyPaymrnt,
    orderSuccessPaypal,
    cancelPaypal,
    orderSuccess,
    paymentfailed,
    orders,
    cancelOrder,
    returnOrder,
    wallet,
    applyCoupon,
    logout } = require("../controller/usercontroller");
var router = express.Router();

const userAuth = require("../midleware/authentication");
const pagination=require('../midleware/pagination')




router.route('/').get(home)

router.route('/login').get(login)

router.route("/userlogin").post(userLogin)

router.route("/signup").get(signup)
    .post(userSignup)

router.route("/otp-login").get(otpLogin)
    .post(otpSignUp)
router.route("/verify-otp").post(verifyOtp)

router.route("/userProfile").get(userAuth, userProfile)

router.route("/updateUserData").post(userAuth, editUserData)

router.route("/product/:id").get(product)

router.route("/products/:category").get(category)

router.route("/addToCart/:id").get(addtocart)

router.route("/cart").get(userAuth, cart)

router.route("/change-product-qty").post(changeQuantity)

router.route("/remove/:id").get(userAuth, removeProduct)

router.route("/addto-wishlist/:id").get(userAuth, addtoWishlist)

router.route("/view-wishlist").get(userAuth, viewWishlist)

router.route("/delete-wishlist/:id").get(userAuth,deletewishlist)

router.route("/removewishlist/:id").get(userAuth, removeWishlist)

router.route("/proceed").get(userAuth, proceed)

router.route("/defaultAddress").post(defaultAddress)

router.route("/newAddress").post(newAddress)

router.route("/edit-address").post(editAddress)

router.route("/manage-address").get(userAuth,manageAddress)

router.route("/display-address").get(userAuth,displyAdderss)

router.route("/delete-address/:id").get(userAuth,deleteAddress)

router.route("/add-address").post(addAddress)

router.route("/checkout").get(userAuth, checkout)
    .post(postCheckout)

// payment

router.route("/verifypayment").post(razorpayVeryfyPaymrnt)

router.route("/ordersuccess-paypal").get(userAuth,orderSuccessPaypal)

router.route("/cancel-paypal").get(userAuth,cancelPaypal)

router.route("/payment-failed").get(userAuth,paymentfailed)

//orders

router.route("/ordersuccess").get(userAuth, orderSuccess)

router.route("/orders").get(userAuth,pagination.pagination,orders )

router.route("/cancelOrder/:id/:pid/:amount").get(userAuth, cancelOrder)

router.route("/returnOrder/:id/:pid").get(userAuth, returnOrder)

router.route("/wallet").get(userAuth, wallet)

router.route("/apply-coupon").post(applyCoupon)

router.route("/logout").get(userAuth, logout)









module.exports = router;