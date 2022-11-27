

function wishlistItem(productId) {
  $.ajax({
    url: "/addToWishlist",
    method: "post",
    data: {
      productId: productId,
    },
    success: (response) => {
      if(response){
        swal("Item added to wishlist", {
          icon: "success",
      });
      wishlistBadge();
      $("#reloadpage").load(window.location.href + " #reloadpage");
      } else {
        location.href = "/login"
      }
    },
  });
}

function removeFromWishlist(proId){
	swal({
  title: "Are you sure?",
  icon: "warning",
  buttons: true,
  dangerMode: true,
})
.then((willDelete) => {
  if (willDelete) {
	$.ajax({
		url:'/removeProductFromWishlist',
		data:{
			productId  :proId
		},
		method:'post',
		success:(response) => {
			if(response.removeProduct){
				 swal("Poof! Product Removed from Wishlist!", {
                    icon: "success",
                });
        wishlistBadge();
        $("#reloadpage").load(window.location.href + " #reloadpage");
				$("#wishlistItems").load(window.location.href + " #wishlistItems");
			} 
		} 
	})
	 } else {
    swal("Hurray !! Your Order is active");
  			}
		});
	}

function wishlistBadge() {
  $.ajax({
   url: "/getWishlistCount",
   method: "get",
   success: (response) => {
     if(response){
       $(".wishlistBadge").attr("data-notify", response);
     } else {
       $(".wishlistBadge").attr("data-notify", "0");
     }
   }
 })
}

function addToCart(proId,price){
  $.ajax({
    url: "/addToCart",
    method: "post",
    data: {
      productId: proId,
      price:price,
    },
    success: (response) => {
      if(response){
        swal("Item added to Cart", {
          icon: "success",
      });
      cartBadge();
      $("#reloadpage").load(window.location.href + " #reloadpage");
      }  else {
        location.href = "/login"
      }
    },
  });
}

function deleteProduct(cartId,proId,quantity){
	swal({
  title: "Are you sure?",
  icon: "warning",
  buttons: true,
  dangerMode: true,
})
.then((willDelete) => {
  if (willDelete) {
	
	$.ajax({
		url:'/deletCartProduct',
		data:{
			cart:cartId,
			product:proId,
			cartQuantity: quantity
		},
		method:'post',
		success:(response) => {
			if(response.removeProduct){
				 swal("Poof! Product Removed from Cart!", {
                    icon: "success",
                });
              cartBadge();
               $("#cartReload").load(window.location.href + " #cartReload");
			} 
		} 
	})
	 } else {
    swal("Hurray !! Your Product is active");
  			}
		});
	}


function cartBadge() {
			 $.ajax({
				url: "/getCartCount",
				method: "get",
				success: (response) => {
					if(response){
						$("#cartBadge").attr("data-notify", response);
					} else {
						$("#cartBadge").attr("data-notify", "0");
					}	
				}
			})
		}

    function changeQuantity(cartId,proId,user,count){
      document.getElementById('distotal').innerHTML = 0
      document.getElementById("couponInput").value = null
      let quantity = parseInt(document.getElementById(proId).innerHTML)
      count = parseInt(count)
      console.log(user)
        $.ajax({
        url:'/changeCartProductQuantity',
        data:{
          user:user,
          cart:cartId,
          product:proId,
          count:count,
          quantity:quantity
    
        },
        method:'post',
        success:(response) => {
          if(response.outOfStock){
            let proId = response.productId
            $("#plusButton"+proId).hide();
          }else {
          document.getElementById(proId).innerHTML = quantity+count
          document.getElementById('total').innerHTML = response.totalAmount
          $("#cartReload").load(window.location.href + " #cartReload");
          let minValue = quantity+count;  
          }
        } 
      })
      
    }

 

function applyCoupon() {
  let couponCode = document.getElementById("couponInput").value;
  $.ajax({
    url: "/applyCoupon",
    method: "post",
    data: {
      couponCode: couponCode,
    },
    success: (response) => {
      if (response == "used") {
        swal("Coupon already used", {
          icon: "warning",
        });
      }
      if (typeof response == "number") {
        $("#applyButton").hide();
        document.getElementById("distotal").innerHTML = response;
      } else if (response == "invalid") {
        swal("Invalid Coupon", {
          icon: "warning",
        });
      } else {
        swal(response.Error, {
          icon: "warning",
        });
      }
    },
  });
};


//address and payment page , function for adding address
$("#address-form").submit((e) => {
  e.preventDefault();
  $.ajax({
    url: "/addAddress",
    method: "post",
    data: $("#address-form").serialize(),
    success: (response) => {
      if (response.status) {
        location.reload();
      }
    },
  });
});



function razorpayPayment(order) {
  console.log("order in yju6fki876ytjyu", order.id);
  var options = {
    key: "rzp_test_j2LjuC8y9DqQoH", // Enter the Key ID generated from the Dashboard
    amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    currency: "INR",
    name: "Coza Store",
    description: "Test Transaction",
    image: "https://example.com/your_logo",
    order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    handler: function (response) {
      verifyPayment(response, order);
    },
    prefill: {
      name: "Gaurav Kumar",
      email: "gaurav.kumar@example.com",
      contact: "9999999999",
    },
    notes: {
      address: "Razorpay Corporate Office",
    },
    theme: {
      color: "#3399cc",
    },
  };
  var rzp1 = new Razorpay(options);
  rzp1.on('payment.failed' , function(response){
    location.href="/orderFailed"
  });
  rzp1.open();

}

function verifyPayment(payment, order) {
  $.ajax({
    url: "/verifyPayment",
    data: {
      payment,
      order,
    },
    method: "post",
    success: (response) => {
      if (response.status) {
        location.href = "/orderSuccess";
      } else {
        alert("Payment Failed");
      }
    },
  });
}

function paypalPayment(payment) {
  for (let i = 0; i < payment.links.length; i++) {
    if (payment.links[i].rel === "approval_url") {
      location.href = payment.links[i].href;
    }
  }
}
