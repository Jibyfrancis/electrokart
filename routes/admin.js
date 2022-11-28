var express = require("express");
var router = express.Router()
const admincontroller=require('../controller/admincontroller')
const upload = require("../midleware/multer");
const { home,
    graphdata1,
    graphdata2,
    graphdata3,
    login,
    postLogin,
    user,
    blockUser,
    unblockUser,
    product,
    addProduct,
    addproductPost,
    editProduct,
    updateProduct,
    deleteProduct,
    category,
    addcategory,
    addcategoryPost,
    updateCategory,
    deleteCategory,
    orders,
    viewOreders,
    orderStatus,
    salesReport,
    selectByMonth,
    selectByDate,
    selectByYear,
    coupon,
    addCoupon,
    addCouponPost,
    deleteCoupon,
    logout, 
    editCategory} = require("../controller/admincontroller");
router.route('/').get(home)

router.route("/graphdata").get(graphdata1)

router.route("/graphdata2").get(graphdata2)

router.route("/graphdata3").get(graphdata3)

router.route("/admlogin").get(login)
    .post(postLogin)
router.route("/users").get(user)

router.route("/blockUser/:id").get(blockUser)

router.route("/unblockUser/:id").get(unblockUser)

router.route("/product").get(product)

router.route("/addProduct").get(addProduct)
    .post(upload.array("image", 4), addproductPost)

router.route("/editProduct/:id").get(editProduct)

router.route("/updateProduct/:id").post( upload.array("image", 4), updateProduct)

router.route("/deleteProduct/:id").get(deleteProduct)

router.route("/category").get(category)

router.route("/addCategory").get(addcategory)
    .post(upload.array("image", 1),addcategoryPost)

router.route("/editCatogory/:id").get(editCategory)

router.route("/updateCategory/:id").post(upload.array("image", 1), updateCategory)

router.route("/deleteCategory/:id").get(deleteCategory)

router.route("/orders").get(orders)

router.route("/vieworder/:id").get(viewOreders)

router.route("/orderstatus").post(orderStatus)

router.route("/salereport").get(salesReport)

router.route("/select-by-date").get(selectByDate)

router.route("/select-by-month").get(selectByMonth)

router.route("/select-by-year").get(selectByYear)

router.route("/coupon").get(coupon)

router.route("/addcoupon").get(addCoupon)
    .post(addCouponPost)

router.route("/deleteCoupon/:id").get(deleteCoupon)

router.route('/logout').get(logout)




module.exports = router