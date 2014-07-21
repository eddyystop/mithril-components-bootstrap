/*global m:false */

// Button ======================================================================

mc.Button = {
  // options: <events> onclick
  Controller: function (options) {
    this.onclick = function (el) {
      if (options.onclick) { options.onclick(); }
    }.bind(this);
  },

  // options: <props> flavor, selectors, label, href, inputType
  // selectors: .btn-default -primary -success -info -warning -danger -link
  // selectors: .btn-lg -sm -xs
  // selectors: .btn-block
  // selectors: .active .disabled
  view: function (ctrl, options) {
    options = options || {};
    var flavors = {
      default: '.btn.btn-default',
      nav: '.btn.navbar-btn', // not for when button is in a <form>
      'nav-right': '.btn.navbar-btn.navbar-right' // not for when button is in a <form>
      },
      flavor = flavors[options.flavor] || flavors.default;

    if (options.href) {
      return m('a' + flavor + (options.selectors || ''),
        {href: options.href, config: m.route()}, options.label || ''
      );
    } else {
      if (options.inputType) {
        return m('input[type=' + options.inputType + ']' + flavor + (options.selectors || ''),
          {onclick: ctrl.onclick, value: options.label || ''}
        );
      } else { // recommended by Bootstrap docs
        return m('button[type=button]' + flavor + (options.selectors || ''),
          {onclick: ctrl.onclick}, options.label || ''
        );
      }
    }
  }
};