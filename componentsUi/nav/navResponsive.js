/*global m:false */
// NavResponsive ===============================================================
mc.NavResponsive = {
  Controller: function () {
    this._isCollapsedOpen = false;
    this._onclickNavOpen = function () {
      this._isCollapsedOpen = !this._isCollapsedOpen;
    }.bind(this);
  },

  // options: <props> brandLabel, brandUrl, flavor, viewComponents:fcn
  view: function (ctrl, options) {
    var flavors = {
      'default': '.navbar.navbar-default',
      'fixed-top': '.navbar.navbar-default.navbar-fixed-top', // needs style: body { padding-top: 70px }
      'fixed-bottom': '.navbar.navbar-default.navbar-fixed-bottom', // needs style: body { padding-bottom: 70px }
      'static-top': '.navbar.navbar-default.navbar-static-top',
      'inverse': '.navbar.navbar-default.navbar-inverse',
      'fixed-top-inverse': '.navbar.navbar-default.navbar-fixed-top.navbar-inverse', // needs style: body { padding-top: 70px }
      'fixed-bottom-inverse': '.navbar.navbar-default.navbar-fixed-bottom.navbar-inverse', // needs style: body { padding-bottom: 70px }
      'static-top-inverse': '.navbar.navbar-default.navbar-static-top.navbar-inverse'
      };

    return m('nav' + (flavors[options.flavor] || flavors.default), [
      m('.container-fluid', [

        // Brand name & collapsed nav toggle
        m('.navbar-header', [
          m('button[type=button].navbar-toggle', {onclick: ctrl._onclickNavOpen}, [
            m('span.sr-only', 'Toggle navigation'),
            m('span.icon-bar', ''),
            m('span.icon-bar', ''),
            m('span.icon-bar', '')
          ]),
          m('a.navbar-brand', {href: options.brandUrl}, options.brandLabel)
        ]),

        // navbar contents
        m('.collapse.navbar-collapse' + (ctrl._isCollapsedOpen ? '.in' : ''),
          options.viewComponents()
        )
      ])
    ]);
  }
};
