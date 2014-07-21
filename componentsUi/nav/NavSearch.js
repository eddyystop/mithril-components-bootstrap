/*global m:false */

// NavSearch ===================================================================

mc.NavSearch = {
  // options: <props> searchValue() <events> onsubmit
  Controller: function (options) {
    this._searchValue = m.prop(mc.utils.getValue(options.searchValue, '')); // used with m.withAttr
    this._onsubmit = function () {
      if (typeof options.searchValue === 'function') { options.searchValue(this._searchValue()); }
      if (options.onsubmit) { options.onsubmit(this._searchValue()); }
    }.bind(this);
  },

  // options: <props> label, placeholder, btnLabel, flavor
  view: function (ctrl, options) {
    var flavors = {
      nav: '.navbar-form',
      'nav-right': '.navbar-form.navbar-right'
    };

    return m('form' + (flavors[options.flavor] || flavors.nav), [
        m('.form-group', [
          options.label ? m('label.sr-only', options.label) : null,
          m('input[type=text].form-control',
            { value: ctrl._searchValue(),
              onchange: m.withAttr('value', ctrl._searchValue),
              placeholder: options.placeholder || 'Search'
            }
          )
        ]),
        m('button[type=button].btn btn-default',
          { onclick: ctrl._onsubmit }, options.btnLabel || 'Submit'
        )
      ]
    );
  }
};