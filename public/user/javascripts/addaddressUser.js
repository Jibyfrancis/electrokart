function addaddress() {

    $("#exam1").modal('show')
    $('#addaddress').submit((e) => {

        e.preventDefault()
        $.ajax({
            url: '/add-address',
            method: 'post',
            data: $('#addaddress').serialize(),

            success: (response) => {

                swal({
                    title: 'Updated Successfully',
                    icon: 'success',
                    button: 'OK'
                }).then(() => {

                    location.reload()

                    //$('#reload').load(window.location.href+" #reload")
                })

            }

        })
    })
}