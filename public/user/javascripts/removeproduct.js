function removebtn(id) {
    swal("Are you sure?", {
        dangerMode: true,
        buttons: true,
    }).then((value) => {
        if(value){
            location.href="/remove/"+id
        }
    });

}