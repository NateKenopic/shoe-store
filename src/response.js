// src/response.js

module.exports.createSuccessResponse = function (data) {
  return {
    status: "ok",
    ...data,
  };
};

module.exports.createErrorResponse = function (code, message) {
  return {
    status: "error",
    error: {
      code: code || -1,
      message: message || "invalid request, missing message ...",
    },
  };
};
