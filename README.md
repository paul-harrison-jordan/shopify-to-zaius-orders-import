# shopify-to-zaius-orders-import
This is a node.js program that will allow you to load your shopify orders into Zaius

To run this program successfully you will need to have axios and dotenv installed via npm to handle the requests and access your credentials stored in an .env file in the same location you download this to. 

The env file should contain values for the following keys:
```
shopify_api_key: 
shopify_password: 
shopify_website: 
shopify_version: 
zaius_api:
```
Once set up, running `npm shopify-to-zaius-orders-import` will run and show either success or error for each of the orders in your system
