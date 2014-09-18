'use strict';

function sendResponse(data) {
  /*jshint validthis:true*/
  var res = this
    , page
    ;

  if (!res) {
    throw new Error('You called `send()`, detatched send from the response object');
  }

  if (Array.isArray(data)) {
    page = true;
  }

  if (data) {
    res.setHeader('Content-Type', 'application/json');
    data = JSON.stringify(data, null, '  ');
  } else {
    data = undefined;
  }

  if (page) {
    res.end('{ "result_page": ' + data + ' }');
  } else {
    res.end('{ "response": ' + data + ' }');
  }
}

module.exports = function (req, res, next) {
  if (!res.send) {
    res.send = sendResponse;
  } else {
    res.__st_send = res.send;
    res.send = function (data) {
      if (Array.isArray(data)) {
        res.__st_send({ resultPage: data });
      } else {
        res.__st_send({ response: data });
      }
    };
  }

  next();
};
