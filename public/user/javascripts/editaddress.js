$('#editaddress').submit((e) => {

    e.preventDefault()
    $.ajax({
        url: '/edit-address',
        method: 'post',
        data: $('#editaddress').serialize(),

        success: (response) => {

            swal({
                title: 'Updated Successfully',
                icon: 'success',
                button: 'OK'
            }).then(() => {

                location.reload()

            })

        }

    })
})