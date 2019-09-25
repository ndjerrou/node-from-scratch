/*
 * Libray for storing and data
 *
 */

const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

//Container for this module

const lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// Write

lib.create = (directory, file, data, callback) => {
  //open the file for writing

  fs.open(
    lib.baseDir + directory + '/' + file + '.json',
    'wx',
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        //convert  data to string
        const stringData = JSON.stringify(data);

        //write to file and close it
        fs.writeFile(fileDescriptor, stringData, err => {
          if (!err) {
            fs.close(fileDescriptor, err => {
              if (!err) {
                callback(false);
              } else {
                callback('Error closing new file');
              }
            });
          } else {
            callback('Error writing to this file');
          }
        });
      } else {
        callback('Could not create new file, it may already exists');
      }
    }
  );
};

// read data from a file
lib.read = (dir, file, callback) => {
  fs.readFile(
    lib.baseDir + dir + '/' + file + '.json',
    'utf-8',
    (err, data) => {
      if (!err && data) {
        const parsedData = helpers.parseJsonToObject(data);
        callback(false, parsedData);
      } else {
        callback(err, data);
      }
    }
  );
};

lib.update = (dir, file, data, callback) => {
  fs.open(
    lib.baseDir + dir + '/' + file + '.json',
    'r+',
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        const stringData = JSON.stringify(data);

        //truncate the content of this file
        fs.truncate(fileDescriptor, err => {
          if (!err) {
            //Write to the file and close it
            fs.writeFile(fileDescriptor, stringData, err => {
              if (!err) {
                fs.close(fileDescriptor, err => {
                  if (!err) {
                    callback(false);
                  } else {
                    callback('Error closing the file');
                  }
                });
              } else {
                callback;
                k('Error writing to existing file');
              }
            });
          } else {
            callback(err);
          }
        });
      } else {
        callback('Could not open the file for updating, it may not exist yet');
      }
    }
  );
};

lib.delete = (dir, file, callback) => {
  //unlink the file

  console.log(lib.baseDir + dir + '/' + file + '.json');
  fs.unlink(lib.baseDir + dir + '/' + file + '.json', err => {
    if (!err) {
      callback(false);
    } else {
      console.log(err);
      callback('Error deleting file', err);
    }
  });
};

// Export the container
module.exports = lib;
