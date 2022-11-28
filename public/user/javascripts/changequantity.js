function changeQnty(cartId, prodId, count) {
    let qty = parseInt(document.getElementById(prodId).innerHTML)

    count = parseInt(count)
    $.ajax({
        url: '/change-product-qty',
        data: {
            cart: cartId,
            product: prodId,
            count: count,
            qty: qty
        },
        method: 'post',
        success: (response) => {
            if (response.removeProduct) {
                swal({
                    title: 'Product Removed',
                    icon: 'success',
                    button: 'OK'

                }).then(() => {
                    $('#reload').load(window.location.href+" #reload")
                })
            } else {
                $('#reload').load(window.location.href+" #reload")
            }
        }
    })


}