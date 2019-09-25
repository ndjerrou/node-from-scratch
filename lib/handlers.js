/*
 *
 *Request handlers
 *
 */

//Dependencies
const _data = require('./data');
const helpers = require('./helpers');
//Define the handlers
var handlers = {};

handlers.ping = (data, callback) => {
  callback(200);
};

handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

//container for the users submethods
handlers._users = {};

//Users - post
// Required data : firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = (data, callback) => {
  //Check that all required fields are filled out
  const firstName =
    typeof data.payload.firstName == 'string' &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;

  const lastName =
    typeof data.payload.lastName == 'string' &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;

  const phone =
    typeof data.payload.phone == 'string' &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;
  const password =
    typeof data.payload.password == 'string' &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  const tosAgreement =
    typeof data.payload.tosAgreement == 'boolean' &&
    data.payload.tosAgreement == true
      ? true
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    //Make the user does not a already exist
    _data.read('users', phone, (err, data) => {
      if (err) {
        //hash the password
        const hashedPaswword = helpers.hash(password);

        if (hashedPaswword) {
          //Create the user object
          const userObject = {
            firstName,
            lastName,
            phone,
            hashedPaswword,
            tosAgreement
          };

          _data.create('users', phone, userObject, err => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { error: 'Could not create the new user' });
            }
          });
        } else {
          callback(500, { Error: "Could not hash the user's password" });
        }
      } else {
        //User already exists
        callback(400, {
          Error: 'A user with that phone number already exists'
        });
      }
    });
  } else {
    callback(400, { Error: 'Missing required fields' });
  }
};

//Users - get
// Required data phone
// Optionnal data: none
//@TODO: Only let an authenticated users access their object . Don't let them access anyone's infos
handlers._users.get = (data, callback) => {
  // Check that the phone number provided is valid
  const phone =
    typeof data.queryStringObject.phone == 'string' &&
    data.queryStringObject.phone.trim().length === 10
      ? data.queryStringObject.phone
      : false;

  if (phone) {
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        // Remove the hash password from the user object before returning in to the requester
        delete data.hashedPaswword;
        callback(200, data);
      } else {
        callback(404); // Not found
      }
    });
  } else {
    callback(400, { 'Error: ': 'Missing required fields' });
  }
};
//Users - update
// Required data : phone
// Optional data: firstName, lastName, password (at least one of those data  must be specified)
//@TODO : Only let an authenticated their own object. Don't let them update other infos
handlers._users.put = (data, callback) => {
  // check for the required fields
  const phone =
    typeof data.payload.phone == 'string' &&
    data.payload.phone.trim().length === 10
      ? data.payload.phone
      : false;

  //check for the optionnal fields
  const firstName =
    typeof data.payload.firstName == 'string' &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;

  const lastName =
    typeof data.payload.lastName == 'string' &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;

  const password =
    typeof data.payload.password == 'string' &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  // Error if the phone is invalid in all cases
  if (phone) {
    if (firstName || lastName || password) {
      // Lookup the user
      _data.read('users', phone, (err, userData) => {
        if (!err && userData) {
          //Update the fields necessary
          if (firstName) {
            userData.firstName = firstName;
          }
          if (lastName) {
            userData.lastName = lastName;
          }
          if (password) {
            userData.hashedPaswword = helpers.hashedPaswword(password);
          }

          //store the new updates
          _data.update('users', phone, userData, err => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { Error: 'Could not update the users' });
            }
          });
        } else {
          callback(400, { 'Error: ': 'The specified user does not exist' });
        }
      });
    } else {
      callback(400, { Error: 'Missing fields to update' });
    }
  } else {
    callback(400, { Error: 'Missing required fields' });
  }
};
//Users - delete
//Required fields - phone
//@TODO : Only let authenticated user delete their object - don't let them delete anyone else
//@TODO Cleanup(delete) any data files associated with this user
handlers._users.delete = (data, callback) => {
  // check that the phone number is valid
  const phone =
    typeof data.queryStringObject.phone == 'string' &&
    data.queryStringObject.phone.trim().length === 10
      ? data.queryStringObject.phone
      : false;

  if (phone) {
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        _data.delete('users', phone, err => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { Error: 'Could not delete the specified user' });
          }
        });
      } else {
        callback(400, { 'Error:': 'Could not found this specific user' }); // Not found
      }
    });
  } else {
    callback(400, { 'Error: ': 'Missing required fields' });
  }
};

//Not found handler
handlers.notFound = (data, callback) => {
  callback(404);
};

module.exports = handlers;
