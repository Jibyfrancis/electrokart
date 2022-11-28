$('#update').submit((e) => {

    e.preventDefault()
    $.ajax({
        url: '/updateUserData',
        method: 'post',
        data: $('#update').serialize(),

        success: (response) => {
            if (response.err) {

                console.log(response.err)
                alert(response)
                swal({
                    title: response.err,
                    icon: 'error',
                    button: 'OK'

                })
            }else{
                swal({
                    title: 'Updated Successfully',
                    icon: 'success',
                    button: 'OK'
                }).then(()=>{
                    
                    document.getElementById('apply').disabled=true
                    location.reload()

                 //$('#exampleModalCenter').load(window.location.href+" #exampleModalCenter")
                 //$('#reload').load(window.location.href+" #reload")
                })

            }


        }

    })
})