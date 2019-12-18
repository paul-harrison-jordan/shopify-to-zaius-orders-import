// must install dotenv from npm to access environemtn variables
require('dotenv').config();
// must install axios to make api calls to Zaius and Shopify
const axios = require('axios').default;
//set Shopify access variables from .env file
const shopify_api_key=process.env.shopify_api_key;
const shopify_pw=process.env.shopify_password;
const store=process.env.shopify_website;
const api_version=process.env.shopify_version;
const zaius_api_key=process.env.zaius_api;

// set headers to make successful post requests to Zaius events endpoint
const config = {
headers: {
    'x-api-key': zaius_api_key,
    'content-type': 'application/json'
  }
}
//Set full Shopify request url (currently 1 for testing)
const shopify_url=`https://${shopify_api_key}:${shopify_pw}@${store}.myshopify.com/admin/api/${api_version}/orders.json?status=closed`;

// Fucntion to be used that converts shopify dates to Zaius required unix time format
const unix_convert = date => {
  let d = new Date(date);
  let seconds = d.getTime() / 1000;
  return seconds;
};

// construct the order object. Currently it just as the base properties shown here (https://docs.developers.zaius.com/api/rest-api/orders), but you can add properties as needed and reference the Shopify order schema (https://help.shopify.com/en/themes/liquid/objects/order) to add using the same syntax as others. 
const constructOrders = ( data ) => {
  const fulfilledOrders = data.orders.map(order => ({
    type: "order",
    action: "purchase",
    identifiers: {
      email: order.customer.email
    },
     data: {
      ts:unix_convert(order.created_at), 
      order: {
        order_id: order.number,
        total: order.total_price,
        discount: order.total_discounts,
        subtotal: order.subtotal_price,
        tax: order.tax_price,
        shipping: order.shipping_price,
        coupon_code: order.discount_applications.code,
        items: order.line_items.map(item => 
          ({
            product_id: item.sku,
            price: item.price,
            quantity: item.quantity,
            discount: item.total_discount,
            subtotal: item.subtotal
          }),
        )
      }
    },
  }))
  return fulfilledOrders
}; 

// Get Shopify Orders and store as an object with the allorders property and an array of order objects as it's value
const getShopifyOrders = url => {
  // return axios to use the response from this request
return axios
.get(url)
.then(res => {
      const { data, status } = res;
      if (status === 200) {
          return {
           allOrders: constructOrders(data)
          }
      } else {
        throw new Error("Error");
      }
    })
.catch(err => {
  throw new Error(err);
}); 
}

// Post orders to Zaius using the events endpoint, the individual order object, and our config variable and log succes or error status (https://github.com/axios/axios)
const postOrders = (order) => {
  axios.post("https://api.zaius.com/v3/events", 
  order, config)
  .then((response) => {
    if (response.status = 202) {
     console.log("success!")
    } else {
      console.log(response.status)
    }
  });
}

// Gets orders, formats them, returns in zaius compatible objects, then posts to Zaius. 
getShopifyOrders(shopify_url)
.then(res => {
  // Set object name from getShopifyOrders as shopify_orders
  const shopify_orders = res;
  shopify_orders.allOrders.map(order => {
    postOrders(order)
})
});
