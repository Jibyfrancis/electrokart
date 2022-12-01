var express = require('express')
var router = express.Router
require('dotenv').config()
const adminHelpers = require("../helpers/adminHelper");
const productHelpers = require("../helpers/productHelper");
const categoryHelpers = require("../helpers/categoryHelper");
const cartHelper = require("../helpers/cartHelper");
const orderHelper = require("../helpers/orderHelper");
const dashboardHelper = require("../helpers/dashboardHelper");
const upload = require("../midleware/multer");
const couponHelper = require("../helpers/couponHelper");

module.exports = {
  home: (async function (req, res, next) {
    if (req.session.adminLoggedIn) {
      let order = await cartHelper.getOrders();
      order.forEach((element) => {
        let date = element.orderDate;
        var d = new Date(date);
        element.orderDate = d.toLocaleDateString('en-GB'); // dd/mm/yyyy
  
      });


      let totalsaleAmount = await dashboardHelper.totalsaleAmount();
      let totalProduct = await dashboardHelper.totalProductByDate();
      let allprod = await dashboardHelper.allSaledProduct();
      let dailysale = await dashboardHelper.dailysale();
      let dailysaleProduct = await dashboardHelper.dailysalePtoduct();

      console.log(totalsaleAmount);
      console.log(totalProduct);
      console.log(allprod);
      console.log(dailysale);
      console.log(dailysaleProduct);

      res.render("admin/dashboard", {
        order,
        totalsaleAmount,
        totalProduct,
        allprod,
        dailysale,
        dailysaleProduct,
      });
    } else {
      res.redirect("/admin/admlogin");
    }
  }),

  graphdata1: ((req, res) => {
    dashboardHelper.paymentCount().then((response) => {
      console.log(response);
      value = response.map((value, index, array) => {
        return value._id;
      });
      let no = response.map((value, index, array) => {
        return value.sum;
      });
      // console.log(value);
      // console.log(no);
      res.json({ value: value, no: no });
    });
  }),

  graphdata2: ((req, res) => {
    dashboardHelper.totalProductByDate().then((response) => {
      console.log(response);
      value = response.map((value, index, array) => {
        return value._id;
      });
      let no = response.map((value, index, array) => {
        return value.sum;
      });
      console.log(value);
      console.log(no);
      res.json({ value: value, no: no });
    });
  }),
  graphdata3: ((req, res) => {
    dashboardHelper.amountGeneratedThroughEachMethod().then((response) => {
      console.log(response);
      value = response.map((value, index, array) => {
        return value._id;
      });
      let no = response.map((value, index, array) => {
        return value.sum;
      });
      console.log(value);
      console.log(no);
      res.json({ value: value, no: no });
    });
  }),

  login: ((req, res) => {
    if (req.session.adminLoggedIn) {
      res.redirect("/admin/");
    } else res.render("admin/adminlogin", { loginErr: req.session.loginErr });
    req.session.loginErr = false;
  }),

  postLogin: ((req, res) => {
    username = process.env.ADMIN_USERNAME;
    password = process.env.ADMIN_PASSWORD;


    if (req.body.email === username && req.body.password === password) {
      req.session.adminLoggedIn = true;
      res.redirect("/admin/");
    } else {
      req.session.loginErr = true;
      res.redirect("/admin/admlogin");
    }
  }),

  user: ((req, res) => {
    if (req.session.adminLoggedIn) {
      adminHelpers.getAllUsers().then((users) => {
        res.render("admin/user", { users });
      });
    }
  }),

  blockUser: ((req, res) => {
    if (req.session.adminLoggedIn) {
      adminHelpers.blockUser(req.params.id).then((response) => {
        if (response) {
          res.redirect("/admin/users");
        }
      });
    }
  }),

  unblockUser: ((req, res) => {
    adminHelpers.unblockUser(req.params.id).then((response) => {
      if (response) {
        res.redirect("/admin/users");
      }
    });
  }),

  product: ((req, res) => {
    if (req.session.adminLoggedIn) {
      productHelpers.getProduct().then((product) => {
        // console.log(product);

        res.render("admin/product", { product });
      });
    }
    // console.log("product");
  }),

  addProduct: ((req, res) => {
    if (req.session.adminLoggedIn) {
      categoryHelpers.getCategory().then((category) => {
        res.render("admin/add_product", { category });
      });
    }
  }),

  addproductPost: (async (req, res, next) => {
    let productData = req.body;
    productData.price = parseInt(productData.price);
    let category = await categoryHelpers.getCategory();
    category.forEach((element) => {
      if (element.category == productData.category) {
        element.category_offer = parseInt(element.category_offer);
        console.log(element);
        productData.offerPrice =
          productData.price - (productData.price * element.category_offer) / 100;
      }
    });

    // productData.offerPrice = parseInt(productData.offerPrice);
    console.log(productData);

    productData.added_on = new Date();

    let imageFileNames = req.files.map((file) => {
      console.log(file.filename);
      return file.filename;
    });
    productData.images = imageFileNames;
    productHelpers.addProduct(productData);
    res.redirect("/admin/product");
  }),

  editProduct: (async (req, res) => {
    console.log("editprioduct");

    // res.render('admin/edit_product')
    if (req.session.adminLoggedIn) {
      let product = await productHelpers.editProduct(req.params.id);
      console.log(product);
      categoryHelpers.getCategory().then((category) => {
        res.render("admin/edit_product", { product, category });
      });
    }
  }),

  updateProduct: (async (req, res) => {

    if (req.files[0]) {
      var imageName = req.files.map((file) => {
        return file.filename;
      });
      var productData = req.body;
      let category = await categoryHelpers.getCategory();
      category.forEach((element) => {
        if (element.category == productData.category) {
          element.category_offer = parseInt(element.category_offer);
          console.log(element);
          productData.offerPrice =
            productData.price -
            (productData.price * element.category_offer) / 100;
        }
      });

      productData.imageFileNames = imageName;
    } else {
      var productData = req.body;
      let category = await categoryHelpers.getCategory();
      category.forEach((element) => {
        if (element.category == productData.category) {
          element.category_offer = parseInt(element.category_offer);
          console.log(element);
          productData.offerPrice =
            productData.price -
            (productData.price * element.category_offer) / 100;
        }
      });
      productHelpers.editProduct(req.params.id).then((file) => {
        productData.imageFileNames = file.imageFileNames;
      });
      console.log(productData);
    }
    productHelpers
      .updateProduct(req.params.id, productData)
      .then((response) => {
        res.redirect("/admin/product");
      });
  }
  ),

  deleteProduct: ((req, res) => {
    if (req.session.adminLoggedIn) {
      let pId = req.params.id;
      productHelpers.deleteProduct(pId).then(() => {
        res.redirect("/admin/product");
      });
    }
  }),

  category: ((req, res) => {
    if (req.session.adminLoggedIn) {
      categoryHelpers.getCategory().then((category) => {
        res.render("admin/category", { category });
      });
    }
  }),

  addcategory: ((req, res) => {
    if (req.session.adminLoggedIn) {
      res.render("admin/add_category", { errorMessage: req.session.category });
      req.session.category = false;
    }
  }),

  addcategoryPost: (async (req, res, next) => {
    if (req.session.adminLoggedIn) {
      let categoryData = req.body;
      categoryData.added_on = new Date();
      //   console.log(req.files);
      let imageFileNames = req.files.map((file) => {
        console.log(file.filename);
        return file.filename;
      });
      categoryData.images = imageFileNames;
      console.log("addcategory");
      categoryHelpers.addCategory(categoryData).then((data) => {
        if (data.status) {
          console.log(data.status);
          req.session.category = data.status;
          res.redirect("/admin/addCategory");
        } else {
          res.redirect("/admin/category");
        }
      });
    }
  }
  ),

  editCategory: (async (req, res) => {
    if (req.session.adminLoggedIn) {
      console.log(req.params);
      let category = await categoryHelpers.editCategory(req.params.id);
      res.render("admin/edit_category", { category });
    }
  }),

  updateCategory: ((req, res) => {
    if (req.session.adminLoggedIn) {
      if (req.files[0]) {
        var imageName = req.files.map((file) => {
          return file.filename;
        });
        var categorytData = req.body;
        categorytData.imageFileNames = imageName;
      } else {
        var categoryData = req.body;
        categoryHelpers.editCategory(req.params.id).then((file) => {
          categoryData.imageFileNames = file.imageFileNames;
        });
        console.log(categoryData);
      }

      categoryHelpers.updateCategory(req.params.id, req.body).then(() => {
        res.redirect("/admin/category");
      });
    }
  }),

  deleteCategory: ((req, res) => {
    let cId = req.params.id;
    categoryHelpers.deleteCategory(cId).then(() => {
      res.redirect("/admin/category");
    });
  }),

  orders: ((req, res) => {
    cartHelper.getOrders().then((orders) => {
      orders.forEach((element) => {
        let date = element.orderDate;
        var d = new Date(date);
        element.orderDate = d.toLocaleDateString('en-GB'); // dd/mm/yyyy
  
      });
      res.render("admin/order", { orders });
    });
  }),

  viewOreders: (async (req, res) => {

    let orders = await orderHelper.getOrders(req.params.id);
    orders.forEach((orders) => {
      if (orders.orderStatus === "Cancelled") {
        orders.cancelStatus = true;
      }
      if (orders.orderStatus === "Delivered") {
        orders.deliveredStatus = true;
      }
      if (orders.orderStatus === "Returned") {
      }

      // console.log(orders);
    });

    res.render("admin/view-order", { orders });
    // res.redirect("/admin/view-order");
  }),

  orderStatus: ((req, res) => {
    console.log(req.body);
    orderHelper.changeStatus(req.body).then(() => {
      res.json({ status: true });
    });
  }),

  salesReport: ((req, res) => {
    report = req.session.view;
    res.render("admin/sales_report", { report });
  }),

  selectByDate: ((req, res) => {
    adminHelpers.selectByDate(req.query).then((report) => {
      report.fdata = req.query.fdate;
      report.todata = req.query.todate;

      res.render("admin/sales_report", { report });
    });
  }),

  selectByMonth: ((req, res) => {
    adminHelpers.selectByMonth(req.query).then((data) => {
      console.log(data);

      res.render("admin/sales_report", { data });
    });
  }),

  selectByYear: ((req, res) => {
    adminHelpers.selectByYear(req.query).then((data) => {
      res.render("admin/sales_report", { data });
    });
  }),

  coupon: (async (req, res) => {
    console.log("coupon");
    let coupon = await couponHelper.getCoupon();
    res.render("admin/coupon", { coupon });
  }),

  addCoupon: ((req, res) => {
    res.render("admin/add_coupon");
  }),

  addCouponPost: ((req, res) => {
    couponHelper.addcoupon(req.body).then(() => {
      res.redirect("/admin/coupon");
    });
  }),

  deleteCoupon: ((req, res) => {
    console.log(req.params);
    let cId = req.params.id;
    couponHelper.deleteCoupon(cId).then(() => {
      res.redirect("/admin/coupon");
    });
  }),

  logout: ((req, res) => {
    req.session.adminLoggedIn = false;
    res.redirect("/admin/admlogin");
  })














}