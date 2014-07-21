/*global m:false */
// ButtonDropdown ==============================================================
// <dep> mc.Dropdown
mc.ButtonDropdown = {
  // options: see mc.Dropdown
  Controller: function (options) {
    this._dropdownCtrl = new mc.Dropdown.Controller(options);
  },

  // options: see mc.Dropdown
  view: function (ctrl, options) {
    return mc.Dropdown.view(ctrl._dropdownCtrl, options);
  }
};