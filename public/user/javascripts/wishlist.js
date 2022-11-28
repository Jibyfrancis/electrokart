function wishlist(prodId) {
  $.ajax({
    url: "/addto-wishlist/" + prodId,
    method: "get",
    success: (response) => {
      if (response.status) {
        // location.reload()
        swal({
          title: "Added to your Wishlist",
          icon: "success",
          button: "OK",
        }).then(() => {
          let wishcount = $("#wish-count").html();
          wishcount = parseInt(wishcount) + 1;
          $("#wish-count").html(wishcount);

          $("#reload").load(window.location.href + " #reload");
        });
      }
    },
  });
}
function removeWishlist(prodId) {
  $.ajax({
    url: "/removewishlist/" + prodId,
    method: "get",
    success: (response) => {
      if (response.status) {
        swal({
          title: "Removed from Your Wishlist",
          icon: "success",
          button: "OK",
        }).then(() => {
          let wishcount = $("#wish-count").html();
          wishcount = parseInt(wishcount) - 1;
          $("#wish-count").html(wishcount);

          $("#reload").load(window.location.href + " #reload");
        });
      } else {
      }
    },
  });
}
