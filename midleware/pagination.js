var express=require('express')
const orderHelper = require("../helpers/orderHelper");

module.exports = {
    pagination: (req, res, next) => {
        orderHelper.deletePendingPayment(req.session.user._id).then(async() => {
            let uid = req.session.user._id;
            let pagenum = 1
            if (req.query.page) {
             pagenum =parseInt(req.query.page) 
            }
            let limit = 3;
            let firstindex = (pagenum - 1) * limit;
            let order = await  orderHelper.order(uid, firstindex, limit);
            let count= await  orderHelper.ordercount(uid)
            let length = Math.ceil(count / 3);
            let prevpage
            if (pagenum > 1) {
                prevpage = {
                    page: pagenum - 1,
                    limit:3,
                }
                
            }
            let nextpage 
            if (pagenum < length) {
                nextpage = {
                    page: pagenum + 1,
                    limit: 3,
                  };
           }
            
            let paginationNum = [];
            for (i = 1; i <= length; i++){
                paginationNum.push({page:i})
            }
        res.next=nextpage
        res.prevpage=prevpage
        req.pag = paginationNum
        req.order = order;
            next();
        })
     
  
  },
};

