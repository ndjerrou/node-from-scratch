/*
 * Primary file for the API
 *
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const varConfig = require('./config');
const { httpPort, envName, httpsPort } = varConfig;
const fs = require('fs');

// we are instantiating the http server
const httpServer = http.createServer((req, res) => {
  unifiedSever(req, res);
});

//Start the server, and have it listen on port 3000
httpServer.listen(httpPort, () => {
  console.log(
    `The server is listenning on port ${httpPort}, and we are in ${envName} mode`
  );
});

// Instantiate the https server
const httpsServerOptions = {
  //key for encryption server
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedSever(req, res);
});

//Start the server, and have it listen on port 3000
httpsServer.listen(httpsPort, () => {
  console.log(
    `The server is listenning on port ${httpsPort}, and we are in ${envName} mode`
  );
});

//All the server logic for both http and https server
const unifiedSever = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  //get the path
  const path = parsedUrl.pathname;

  const trimedPath = path.replace(/^\/+|\/+$/g, '');

  //get the query strings as an object
  const queryStringObject = parsedUrl.query;

  //Getting the HTTP method
  const method = req.method.toLowerCase();

  // Get the headers as an object
  const headers = req.headers;

  //Get the payload, if any === STREAMS
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', data => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    //choose the handler for this request. If one is not found, choose the notfound handler

    const chooseHandler =
      typeof router[trimedPath] !== 'undefined'
        ? router[trimedPath]
        : handlers.notFound;

    //Construct the data object to send to the handler
    const data = {
      trimedPath,
      queryStringObject,
      method,
      headers,
      payload: buffer
    };

    //route the request to the handler specified in the router
    chooseHandler(data, (statusCode, payload) => {
      //Use the status code called back by the handler or default to 200
      statusCode = typeof statusCode == 'number' ? statusCode : 200;

      //use the payload called back by the handler, or default to object
      payload = typeof payload == 'object' ? payload : {};

      // Convert the payload to a string
      const payloadString = JSON.stringify(payload);

      //Return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      console.log('Returning this response :', statusCode, payloadString);
    });
  });
};

//Define the handlers
var handlers = {};

handlers.ping = (data, callback) => {
  callback(200);
};

//Not found handler
handlers.notFound = (data, callback) => {
  callback(404);
};

//Define a request router
var router = {
  ping: handlers.ping
};
