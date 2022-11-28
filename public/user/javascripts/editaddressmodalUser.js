function showmodal(addressId) {
        
    $.ajax({
        url: '/display-address',
        method: 'get',
        data: {
            addressId: addressId,
        },

        success: (response) => {
           
            document.getElementById('name').value = response.address.name;
            document.getElementById('mobile').value = response.address.mobile;
            document.getElementById('email').value = response.address.email;
            document.getElementById('address').value = response.address.address;
            document.getElementById('city').value = response.address.city;
            document.getElementById('country').value = response.address.country;
            document.getElementById('pin').value = response.address.pin;
            document.getElementById('addressid').value = response.address._id;


            $("#exampleModalCenter").modal('show')
        }
    })
}