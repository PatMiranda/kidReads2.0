// Import the ORM to create functions that will interact with the database.
var orm = require("../config/orm.js");

var kidreads = {
  all: function(cb) {
    orm.all("LibraryBooks", function(res) {
      cb(res);
    });
  },
  // The variables cols and vals are arrays.
  create: function(cols, vals, cb) {
    orm.create("LibraryBooks", cols, vals, function(res) {
      cb(res);
    });
  },
  update: function(objColVals, condition, cb) {
    orm.update("LibraryBooks", objColVals, condition, function(res) {
      cb(res);
    });
  }
};

// Export the database functions for the controller (burger_controller.js).
module.exports = kidreads;