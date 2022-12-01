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

const loginCheck=(req,res,next)=>{
    if(req.session.adminLoggedIn){
        next()
    }else{
        res.redirect("/admin/admlogin")
    }
}
const verify =(req,res,next)=>{
    if(req.session.adminLoggedIn){
        res.redirect('/admin')
    }else{
        next()
    }

}



router.route('/').get(loginCheck,home)

router.route("/graphdata").get(loginCheck,graphdata1)

router.route("/graphdata2").get(loginCheck,graphdata2)

router.route("/graphdata3").get(loginCheck,graphdata3)

router.route("/admlogin").get(verify,login)
    .post(postLogin)
router.route("/users").get(loginCheck,user)

router.route("/blockUser/:id").get(loginCheck,blockUser)

router.route("/unblockUser/:id").get(loginCheck,unblockUser)

router.route("/product").get(loginCheck,product)

router.route("/addProduct").get(loginCheck,addProduct)
    .post(upload.array("image", 4), addproductPost)

router.route("/editProduct/:id").get(loginCheck,editProduct)

router.route("/updateProduct/:id").post( upload.array("image", 4), updateProduct)

router.route("/deleteProduct/:id").get(loginCheck,deleteProduct)

router.route("/category").get(loginCheck,category)

router.route("/addCategory").get(loginCheck,addcategory)
    .post(upload.array("image", 1),addcategoryPost)

router.route("/editCatogory/:id").get(loginCheck,editCategory)

router.route("/updateCategory/:id").post(upload.array("image", 1), updateCategory)

router.route("/deleteCategory/:id").get(loginCheck,deleteCategory)

router.route("/orders").get(loginCheck,orders)

router.route("/vieworder/:id").get(loginCheck,viewOreders)

router.route("/orderstatus").post(loginCheck,orderStatus)

router.route("/salereport").get(loginCheck,salesReport)

router.route("/select-by-date").get(loginCheck,selectByDate)

router.route("/select-by-month").get(loginCheck,selectByMonth)

router.route("/select-by-year").get(loginCheck,selectByYear)

router.route("/coupon").get(loginCheck,coupon)

router.route("/addcoupon").get(loginCheck,addCoupon)
    .post(addCouponPost)

router.route("/deleteCoupon/:id").get(loginCheck,deleteCoupon)

router.route('/logout').get(logout)




module.exports = router