(function ($) {
  "use strict";

  // Spinner
  var spinner = function () {
    setTimeout(function () {
      if ($("#spinner").length > 0) {
        $("#spinner").removeClass("show");
      }
    }, 1);
  };
  spinner();

  // Back to top button
  $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
      $(".back-to-top").fadeIn("slow");
    } else {
      $(".back-to-top").fadeOut("slow");
    }
  });
  $(".back-to-top").click(function () {
    $("html, body").animate({ scrollTop: 0 }, 1500, "easeInOutExpo");
    return false;
  });

  // Sidebar Toggler
  $(".sidebar-toggler").click(function () {
    $(".sidebar, .content").toggleClass("open");
    return false;
  });

  // Progress Bar
  $(".pg-bar").waypoint(
    function () {
      $(".progress .progress-bar").each(function () {
        $(this).css("width", $(this).attr("aria-valuenow") + "%");
      });
    },
    { offset: "80%" }
  );

  // Calender
  $("#calender").datetimepicker({
    inline: true,
    format: "L",
  });

  // Testimonials carousel
  $(".testimonial-carousel").owlCarousel({
    autoplay: true,
    smartSpeed: 1000,
    items: 1,
    dots: true,
    loop: true,
    nav: false,
  });

  // Chart Global Color
  Chart.defaults.color = "#6C7293";
  Chart.defaults.borderColor = "#white";

  // Worldwide Sales Chart
  if ($("#one").length) {
    $.ajax({
      url: "graphdata",
      success: (res) => {
        // alert(res);
        // console.log(res);

        var ctx1 = $("#one").get(0).getContext("2d");
        var myChart1 = new Chart(ctx1, {
          type: "bar",
          data: {
            labels: res.value,
            datasets: [
              {
                label: "India",
                data: res.no,
                backgroundColor: "rgba(0, 235, 0, .6)",
              },
              // {
              //     label: "UK",
              //     data: [8, 35, 40, 60],
              //     backgroundColor: 'green'
              // },
              // {
              //     label: "AU",
              //     data: [12, 25, 45, 55],
              //     backgroundColor: 'blue'
              // }
            ],
          },
          options: {
            responsive: true,
          },
        });
      },
    });
    $.ajax({
      url: "graphdata2",
      success: (res) => {
        // Single Line Chart
        var ctx3 = $("#two").get(0).getContext("2d");
        var myChart3 = new Chart(ctx3, {
          type: "line",
          data: {
            labels: res.value,
            datasets: [
              {
                label: "Salse",
                fill: false,
                backgroundColor: "rgba(235, 22, 22, .7)",
                data:res.no,
              },
            ],
          },
          options: {
            responsive: true,
          },
        });
      },
    });

    $.ajax({
        url:'graphdata3',
        success:(res)=>{

            var ctx3 = $("#three").get(0).getContext("2d");
            var myChart3 = new Chart(ctx3, {
              type: "pie",
              data: {
                labels: res.value,
                datasets: [
                  {
                    backgroundColor: [
                      "rgba(235, 22, 22, .7)",
                      "rgba(0, 235, 0, .6)",
                      "rgba(0, 0, 235, .5)",
                      "rgba(0, 22, 235, .4)",
                      // "rgba(235, 22, 22, .3)"
                    ],
                    data: res.no,
                  },
                ],
              },
              options: {
                responsive: true,
              },
            });
        }

    })
  }


  // Salse & Revenue Chart

  // var ctx2 = $("#two").get(0).getContext("2d");
  // var myChart2 = new Chart(ctx2, {
  //     type: "line",
  //     data: {
  //         labels: 'sales',
  //         datasets: [{
  //             label:res.no,
  //             data: res.no,
  //             backgroundColor: "rgba(235, 22, 22, .7)",
  //             fill: true
  //         },
  //         {
  //             label: "Revenue",
  //             data: res.value,
  //             backgroundColor: "rgba(235, 22, 22, .5)",
  //             fill: true
  //         }
  //         ]
  //     },
  //     options: {
  //         responsive: true
  //     }
  // });

  // Single Bar Chart
  // var ctx4 = $("#tree").get(0).getContext("2d");
  // var myChart4 = new Chart(ctx4, {
  //     type: "bar",
  //     data: {
  //         labels: ["Italy", "France", "Spain", "USA", "Argentina"],
  //         datasets: [{
  //             backgroundColor: [
  //                 "rgba(235, 22, 22, .7)",
  //                 "rgba(235, 22, 22, .6)",
  //                 "rgba(235, 22, 22, .5)",
  //                 "rgba(235, 22, 22, .4)",
  //                 "rgba(235, 22, 22, .3)"
  //             ],
  //             data: [55, 49, 44, 24, 15]
  //         }]
  //     },
  //     options: {
  //         responsive: true
  //     }
  // });

  // Pie Chart
  // var ctx5 = $("#tree").get(0).getContext("2d");
  // var myChart5 = new Chart(ctx5, {
  //     type: "pie",
  //     data: {
  //         labels: ["Italy", "France", "Spain", "USA", "Argentina"],
  //         datasets: [{
  //             backgroundColor: [
  //                 "rgba(235, 22, 22, .7)",
  //                 "rgba(235, 22, 22, .6)",
  //                 "rgba(235, 22, 22, .5)",
  //                 "rgba(235, 22, 22, .4)",
  //                 "rgba(235, 22, 22, .3)"
  //             ],
  //             data: [55, 49, 44, 24, 15]
  //         }]
  //     },
  //     options: {
  //         responsive: true
  //     }
  // });

  // Doughnut Chart
  // var ctx6 = $("#doughnut-chart").get(0).getContext("2d");
  // var myChart6 = new Chart(ctx6, {
  //     type: "doughnut",
  //     data: {
  //         labels: ["Italy", "France", "Spain", "USA", "Argentina"],
  //         datasets: [{
  //             backgroundColor: [
  //                 "rgba(235, 22, 22, .7)",
  //                 "rgba(235, 22, 22, .6)",
  //                 "rgba(235, 22, 22, .5)",
  //                 "rgba(235, 22, 22, .4)",
  //                 "rgba(235, 22, 22, .3)"
  //             ],
  //             data: [55, 49, 44, 24, 15]
  //         }]
  //     },
  //     options: {
  //         responsive: true
  //     }
  // });
})(jQuery);
