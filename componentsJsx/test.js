/** @jsx m */
// run 'gulp jsx' to expand this module into JS
var msx = msx || {};

msx.test = {
  controller: function () {},

  view: function (ctrl) {
    return [ // include _test1.html here -----
      INCLUDE('test1')
    ]; // -----
  }
};