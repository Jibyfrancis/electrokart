function addToCart(prodId){
    $.ajax({
        url:'/addToCart/'+prodId,
        method:'get',
        success:(response)=>{
            if(response.status){
                swal({
            title:'Added to cart',
            icon:'success',
            button:'OK'

        }).then(()=>{
            let count=$('#cart-count').html()
                count=parseInt(count)+1
                $('#cart-count').html(count)

            $('#reload').load(window.location.href+" #reload")
        })

            }else{
                location.href="/login"
            }		
        }

    })  
}