function deleteAddress(id) {
    swal("Are you sure?", {
        dangerMode: true,
        buttons: true,
    }).then((value) => {
        if (value) {
            $.ajax({
                url: "/delete-address/" + id,
                method: 'get',
                success: (response) => {

                    $('#reload').load(window.location.href + " #reload")

                }

            })

        }
    });

}