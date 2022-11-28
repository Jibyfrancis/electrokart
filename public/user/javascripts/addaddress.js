$('#address').submit((e) => {
    e.preventDefault()
    $.ajax({
        url: '/newAddress',
        data: $('#address').serialize(),
        success: (response) => {
            if (response.status) {
                location.href='/checkout';
            }
        }


    })
})