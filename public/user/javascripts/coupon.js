function coupon(){
    let coupon=document.getElementById('code').value
    let error1=document.getElementById('error')
    $.ajax({
        url:'/apply-coupon',
        data:{
            name:coupon,
        },
        method:'post',
            success:(response)=>{
                
                if(response.status){
                    error1.innerHTML=""
                    document.getElementById('apply').disabled=true
                    let total=document.getElementById('total').innerHTML
                   
                    let maxDiscount=total-Math.round((total*response.data.percentage)/100) 
                    let limitamount=Math.round(total*response.data.percentage)/100

                    if(total>response.data.minAmount){//CHANGE MAXDISCOUNT IT IS REDENTENT
                        if(maxDiscount>response.data.maxAmount&&limitamount>response.data.maxAmount){
                             document.getElementById('total').innerHTML=total-response.data.maxAmount
                             let single=document.querySelectorAll('.intotal')
                           let singledic=response.data.maxAmount/(single.length/2)
                             for(i=0;i<single.length;i++){
                            let stotal=single[i].innerHTML
                            single[i].innerHTML=stotal-singledic
                            document.getElementById("dis").href=`/proceed?id=${response.data._id}`
                            
                        }
                        }else{

                        document.getElementById('apply').disabled=true
                        document.getElementById('total').innerHTML=total-Math.round((total*response.data.percentage)/100)
                        let single=document.querySelectorAll('.intotal')
                        for(i=0;i<single.length;i++){
                            let stotal=single[i].innerHTML
                            single[i].innerHTML=stotal-Math.round((stotal*response.data.percentage)/100)
                            document.getElementById("dis").href=`/proceed?id=${response.data._id}`
                            
                        }
                        }
                    
                    }  else{
                        
                    }                 
                }
                else{
                    error1.innerHTML=response.err
                }
        }
    })
    
}