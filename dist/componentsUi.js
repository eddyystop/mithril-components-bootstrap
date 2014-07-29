/*global m:false */
var mc = mc || {};
mc._comm = {
  lastDropdownId: -1 // id of last dropdown clicked
};
mc.utils = mc.utils || {};

// extend an object with others
mc.utils.extend = function (to /* arguments */) {
  Array.prototype.slice.call(arguments, 1).forEach(function (obj) {
    if (typeof obj === 'object') {
      Object.keys(obj).forEach(function (key) { to[key] = obj[key]; });
    }
  });
  return to;
};

// get value from possible m.prop()
mc.utils.getValue = function (param, defaultValue) {
  var value = typeof param === 'function' ? param() : param;
  return value === undefined ? defaultValue : value;
};

// http://davidwalsh.name/javascript-debounce-function
mc.utils.debounce = function (func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
    if (immediate && !timeout) func.apply(context, args);
  };
};
/*global m:false */
// Dropdown ====================================================================
mc.Affix = {
  // options: <props> activeTab(), pinnedMarginTop <event> onclickTab
  Controller: function (options) {
    'use strict';
    options = options || {};
    this._activeTab = mc.utils.getValue(options.activeTab, '');
    this._pinnedMarginTop = mc.utils.getValue(options.pinnedMarginTop, 50); // 50 is height of navbar

    // directly updated by .view(). not idiomatic but clean.
    this._initialRender = true;
    this._affixEl = null;
    this._affixPinnedPast = null;
    this._affixClass = null;

    this.id = new Date().getTime();

    this._onclickTab = function (name, el) {
      if (name.charAt(0) !== '#') {
        el.preventDefault();
        el.stopPropagation();
      }

      mc._comm.lastDropdownId = -1; // will force closed any open dropdowns
      this._activeTab = name;
      if (typeof options.activeTab === 'function') { options.activeTab(name); }
      if (options.onclickTab) { options.onclickTab(name); }

      if (name.charAt(0) === '#') {
        document.getElementById(name.substr(1)).scrollIntoView(true);
        var body = document.getElementsByTagName('body')[0];
        body.scrollTop = body.scrollTop - this._pinnedMarginTop;
      }
    }.bind(this);

    this.setFirstVisibleTab = function (name) {
      this._activeTab = name;
    }
  },

  // options: <props> id, list[]
  // options.list[]: name, label, list[]
  view: function (ctrl, options) {
    'use strict';
    options = options || {};
    var hrefIds = [];

    if (ctrl._initialRender) {
      ctrl._initialRender = false;

      setTimeout(function () { // configure affix once the DOM is drawn
        ctrl._affixPinnedPast = ctrl._affixEl.getBoundingClientRect().top - ctrl._pinnedMarginTop;
        configureAffix();

        var scrollHandler  = mc.utils.debounce(function () {
          if (setFirstVisibleTab()) { m.redraw(); }
          configureAffix();
        }, 100);
        if (window.addEventListener) {
          window.addEventListener('scroll', scrollHandler);
          window.addEventListener('resize', scrollHandler);
        } else {
          window.attachEvent('scroll', scrollHandler);
          window.attachEvent('resize', scrollHandler);
        }
      }, 45);
    }

    ctrl._affixClass = ctrl._affixClass || 'mc-affix affix-top';
    return m((options.id ? '#' + options.id : ''), {
        className: ctrl._affixClass, // classes are updated in configureAffix
        config: function (el) { ctrl._affixEl = el; }
      },
      m('ul.nav.mc-affix-nav',
        options.list.map(function (item) {

          if (!item.list) { return viewItem(item); }

          var isActive = item.name === ctrl._activeTab ||
            item.list.some(function (item) {
              return item.name === ctrl._activeTab;
            });
          if (item.name.charAt(0) === '#') { hrefIds.push(item.name.substr(1)); }

          return m('li' + (isActive ? '.active' : ''), [
            m('a', {onclick: ctrl._onclickTab.bind(ctrl, item.name)}, item.label || item.name),
            m('ul.nav',
              item.list.map(function (item) { return viewItem(item); })
            )
          ]);
        })
      )
    );

    function viewItem (item) {
      if (item.name.charAt(0) === '#') { hrefIds.push(item.name.substr(1)); }

      return m('li' + (item.name === ctrl._activeTab ? '.active' : ''),
        m('a', {onclick: ctrl._onclickTab.bind(ctrl, item.name)}, item.label || item.name
        )
      );
    }

    function configureAffix () {
      var affixClass = window.scrollY <= ctrl._affixPinnedPast ? 'mc-affix affix-top' : 'mc-affix affix';
      if (ctrl._affixClass !== affixClass) {
        ctrl._affixClass = affixClass;
        ctrl._affixEl.setAttribute('class', affixClass);
      }
    }

    function setFirstVisibleTab () {
      for (var i = 0, len = hrefIds.length; i < len; i += 1) {
        var hrefIdEl = document.getElementById(hrefIds[i]);
        if (hrefIdEl && isElInViewport(hrefIdEl)) {
          if ('#' + hrefIds[i] === ctrl._activeTab) {
            return false;
          } else {
            ctrl.setFirstVisibleTab('#' + hrefIds[i]);
            return true;
          }
        }
      }
      return false;

      // http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
      function isElInViewport (el) {
        var rect = el.getBoundingClientRect(); // IE8+
        return rect.top >= 0 && rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth);
      }
    }
  }
};
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
/*global m:false */
// Dropdown ====================================================================
mc.Dropdown = {
  // options: <props> tabName() <event> onclickTab
  Controller: function (options) {
    options = options || {};
    this._isDropdownOpen = false;
    this._dropdownId = 0;

    this._onclickTab = function (name) {
      this._isDropdownOpen = false;
      mc._comm.lastDropdownId = -1; // will force closed any open dropdowns
      if (typeof options.tabName === 'function') { options.tabName(name); }
      if (options.onclickTab) { options.onclickTab(name); }
    }.bind(this);

    this._onclickDropdown = function () {
      this._isDropdownOpen = !this._isDropdownOpen;
      mc._comm.lastDropdownId = this._dropdownId = Date.now();
    }.bind(this);

    this.closeDropdown = function () {
      this._isDropdownOpen = false;
    }.bind(this);
  },

  // ctrl: <props> _isDropdownOpen, _dropdownId <events> _onclickTab, onClickDropdown
  // options: flavor, label, isDisabled, isActive, isSplit, alignRight, selectors, dropdown[]
  // selectors: .btn-default -primary -success -info -warning -danger -link
  // selectors: .btn-lg -sm -xs
  // selectors: .btn-block
  // selectors: .active .disabled
  view: function (ctrl, options) {
    options = options || {};
    var flavors = {
        _tabs: '.dropdown',
        dropdown: '.dropdown',
        btn: '.btn-group',
        'btn-up': '.btn-group.dropup'
      },
      optFlavor = options.flavor,
      flavor = (flavors[optFlavor] || flavors.dropdown),
      selectors = options.selectors || '',
      label = (options.label || options.name || '') + ' ';

    if (ctrl._dropdownId !== mc._comm.lastDropdownId) { ctrl.closeDropdown(); }
    if (!selectors && (optFlavor === 'btn' || optFlavor === 'btn-up')) { selectors = '.btn-primary'; }

    return optFlavor === '_tabs' ? tabs() : (options.isSplit ? splitButton() : button());

    function tabs () {
      return m('li'  + flavor + (ctrl._isDropdownOpen ? '.open' : '') + (options.isDisabled ? '.disabled' : '') + (options.isActive ? '.active' : ''), [
        m('a.dropdown-toggle' + selectors,
          { onclick: ctrl._onclickDropdown }, [
            m('span', label),
            m('span.caret')
          ]),
        ctrl._isDropdownOpen ? mc.Dropdown.viewMenu({ _onclickTab: ctrl._onclickTab }, { dropdown: options.dropdown }) : null
      ]);
    }

    function button () {
      return m('div' + flavor + (ctrl._isDropdownOpen ? '.open' : '') + (options.isDisabled ? '.disabled' : ''), [
        m('button[type=button].btn.btn-default.dropdown-toggle' + selectors,
          { onclick: ctrl._onclickDropdown }, [
            m('span', label),
            m('span.caret')
          ]),
        ctrl._isDropdownOpen ? mc.Dropdown.viewMenu({ _onclickTab: ctrl._onclickTab }, options) : null
      ]);
    }

    function splitButton () {
      return m('div' + flavor + (ctrl._isDropdownOpen ? '.open' : '') + (options.isDisabled ? '.disabled' : ''), [
        m('button[type=button].btn' + selectors,
          { onclick: ctrl._onclickDropdown }, label
        ),
        m('button[type=button].btn.dropdown-toggle' + selectors,
          { onclick: ctrl._onclickDropdown }, [
            m('span.caret'),
            m('span.sr-only', 'Toggle dropdown')
          ]),
        ctrl._isDropdownOpen ? mc.Dropdown.viewMenu({ _onclickTab: ctrl._onclickTab }, options) : null
      ]);
    }
  },

  // ctrl {}: <events> _onclickTab
  // options.dropdown[]: type, name, label, isDisabled, redirectTo
  viewMenu: function (ctrl, options) {
    return m('ul.dropdown-menu' + (options.alignRight ? '.dropdown-menu-right' : ''),
      options.dropdown.map(function (menuItem) {

        switch (menuItem.type) {
          case 'divider':
            return m('li.divider', {style:{margin: '6px 0px'}}, ''); // .divider's 9px is not visible; px in 0px req'd for tests
          case 'header':
            return m('li.dropdown-header', {tabindex: '-1'}, menuItem.label || menuItem.name);
          default:
            return mc.Dropdown.viewTab(
              mc.utils.extend({}, menuItem, { isActive: false, _onclickTab: ctrl._onclickTab })
            );
        }
      })
    );
  },

  // ctrl: <props> label, isActive, isDisabled, redirectTo <events> _onclickTab //todo move to options
  // also called by mc.Tabs
  viewTab: function (ctrl) {
    var href = '',
      attr = {};

    if (!ctrl.isDisabled) {
      if (ctrl.redirectTo) {
        href = '[href="' + ctrl.redirectTo + '"]';
        attr = {config : m.route};
      } else {
        attr = {onclick : ctrl._onclickTab.bind(this, ctrl.name)};
      }
    }

    return m('li' + (ctrl.isActive ? '.active' : '') + (ctrl.isDisabled ? '.disabled' : ''),
      m('a' + href, attr, ctrl.label || ctrl.name || '')
    );
  }
};
/*global m:false */
// Form ========================================================================
mc.Form = {
  Controller: function () { },

  // options: <props> labelCols, controlCols, heightSize, horizontalSize, controls[]
  view: function (ctrl, options) {
    return m('form.form-horizontal[role=form]',
      (options.controls || []).map(function (control) {
        /*
        if (control.mprop) { console.log(control.tag, control.mprop()) }
        if (control.set) {
          control.set.map(function (set) {
            if (set.mprop) { console.log(control.tag, set.mprop()) }
          })
        }
        */
        if (!control) { return null; }
        return m('.form-group' + (control.horizontalSize || options.horizontalSize || '.form-group-sm'),
          renderControl(control,
              control.labelCols || options.labelCols || '.col-sm-2',
              control.controlCols || options.controlCols || '.col-sm-6',
              control.heightSize || options.heightSize || '.input-sm')
        )
      })
    );

    // options.tab[]: <props> name, label, isActive, labelCols, controlCols, heightSize
    function renderControl (control, labelCols, controlCols, heightSize) {
      switch (control.tag) {

        // options: <props> tag, type, label, mprop, placeholder, value, autofocus, readonly, disabled, cols
        case 'input':
          return [
            m('label.control-label' + labelCols, control.label),
            m(controlCols,
              m('input.form-control' +  heightSize,
                mc.utils.extend(control.readonly ? { readonly: true } : {}, {
                  type: control.type || 'text',
                  placeholder: control.placeholder || '',
                  value: control.mprop() || '',
                  autofocus: control.autofocus || false,
                  disabled: control.disabled || false,
                  onchange: m.withAttr('value', control.mprop)
                })
              )
            )
          ];
          break;

        // options: <props> tag, label, set[{ label, mprop, autofocus, disabled }]
        case 'checkbox':
          return [
            m('label.control-label' + labelCols, control.label),
            m(controlCols,
              m('.checkbox',
                (control.set || []).map(function (set) {

                  return m('label.checkbox-inline', [
                    m('input[type=checkbox]', {
                      checked: set.mprop(),
                      autofocus: control.autofocus || false,
                      disabled: set.disabled || false,
                      onchange: m.withAttr('checked', set.mprop)
                    }),
                    m('span', ' ' + set.label)
                  ])
                })
              )
            )
          ];
          break;

        // options: <props> tag, label, mprop, name, set[{ label, value, autofocus, disabled }]
        case 'radio':
          return [
            m('label.control-label' + labelCols, control.label),
            m(controlCols,
              m('.radio',
                (control.set || []).map(function (set) {

                  return m('label.radio-inline', [
                    m('input[type=radio]', {
                      name: control.name || 'radio-set',
                      value: set.value,
                      checked: control.mprop() === set.value,
                      autofocus: set.autofocus || false,
                      disabled: set.disabled || false,
                      onchange: function (mprop, e) { mprop(set.value); }.bind({}, control.mprop)
                    }),
                    m('span', ' ' + set.label || set.value)
                  ])
                })
              )
            )
          ];
          break;

        // options: <props> tag, label, mprop, name, cols, set[{ label, value, autofocus, disabled }]
        case 'textarea':
          return [
            m('label.control-label' + labelCols, control.label),
            m(controlCols,
              m('textarea.form-control' +  heightSize, {
                rows: control.rows || 1,
                autofocus: control.autofocus || false,
                disabled: control.disabled || false
              }, control.text || '')
            )
          ];
          break;

        // options: <props> tag, label, mprop, autofocus, cols, options[{ label, value, selected, disabled }]
        case 'select': // not multiple
          return [
            m('label.control-label' + labelCols, control.label),
            m(controlCols,
              m('select.form-control' +  heightSize, {
                  autofocus: control.autofocus || false,
                  onchange: function(mprop, e) { mprop(e.target.options[e.target.selectedIndex].value); }.bind({}, control.mprop)
                },
                (control.options || []).map(function (option) {

                  return m('option', {
                    value: option.value,
                    selected: control.mprop() === option.value,
                    disabled: option.disabled || false
                  }, option.label || option.value)
                })
              )
            )
          ];
          break;

        // options: <props> tag, label, text }]
        case 'static':
          return [
            m('label.control-label' + labelCols, control.label),
            m(controlCols,
              m('p.form-control-static' + heightSize, control.text)
            )
          ];
          break;

        // options: <props> tag, size, text, small }]
        case 'heading':
          return [
            m((control.size || 'h1') + labelCols, [
              control.text,
              control.small ? m('small', ' ' + control.small) : ''
            ])
          ];
          break;
      }
    }
  }
};
/*global m:false */
// McbDisplay ===============================================================
mc.McbDisplay = {
  log: '',

  Controller: function (options) {
    this.activeTab = options.activeTab;
    this.html = options.html;
    this.tabsCtrl = new mc.Tabs.Controller({ activeTab: this.activeTab });

    this.setHtml = function (html) {
      this.html(html);
    }.bind(this);
  },

  view: function (ctrl, options) {
    var optionsTab = {
      flavor: 'tabs',
      tabs: [
        { name: 'features', label: 'Features'},
        { name: 'result', label: 'Live result' },
        { name: 'code', label: 'Controller & view' },
        { name: 'html', label: 'HTML'},
        { name: 'doc', label: 'Docs' }
      ]
    };

    return m('.bs-docs-section.mc-mcb-display', [
      m('.row.mc-mcb-display-header',
        m('h3', options.heading)
      ),
      m('.row', [
        m('.col-md-8', [
            m('.row.mc-mcb-display-controls', options.controls),
            m('.row.mc-mcb-display-tabs', [
              m('.mc-mcb-display-tab',
                mc.Tabs.view(ctrl.tabsCtrl, optionsTab)
              ),
              m('.row.mc-mcb-display-results' + (options.scrollResult ? '.scroll' : ''), displayTab())
            ])
          ]
        ),
        m('.col-md-4', [
          m('.row.mc-mcb-display-console', [
            m('h4', 'Console:'),
            options.console
          ]),
          m('.row.mc-mcb-display-options',
            options.options
          )
        ])
      ])
    ]);

    function displayTab () {
      if (options.returnHtml) {
        return m('', {config: function (el) { ctrl.setHtml(el.innerHTML); }}, options.tab || '');
      } else {
        return options.tab;
      }
    }
  }
};
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

    return m('nav.mc-nav' + (flavors[options.flavor] || flavors.default), [
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
/*global m:false */

// NavText =====================================================================

mc.NavText = {
  Controller: function () {},

  // options: <props> label, href, linkLabel
  view: function (ctrl, options) {
    var flavors = {
      nav: '.navbar-text',
      'nav-right': '.navbar-text.navbar-right'
    };

    return m('p' + (flavors[options.flavor] || flavors.nav), [
        m('span', options.label || ''),
        options.href ? m('a.navbar-link', ' ' + (options.linkLabel || '')) : null
      ]
    );
  }
};
/*global m:false */
// Tabs ========================================================================
// <dep> mc.Dropdown
mc.Tabs = {
  // options: <props> activeTab() <event> onclickTab
  Controller: function (options) {
    //console.log('\n.. in mc.Tabs.Controller. options=', options, options.activeTab() || options.activeTab);
    options = options || {};
    this._activeTab = mc.utils.getValue(options.activeTab, '');

    this._onclickTab = function (name) {
      mc._comm.lastDropdownId = -1; // will force closed any open dropdowns
      this._activeTab = name;
      if (typeof options.activeTab === 'function') { options.activeTab(name); }
      if (options.onclickTab) { options.onclickTab(name); }
    }.bind(this);

    this._dropdownCtrls = [];
    this._getDropdownCtrl = function (i) {
      if (!this._dropdownCtrls[i]) {
        this._dropdownCtrls[i] = new mc.Dropdown.Controller({ onclickTab: this._onclickTab });
      }
      return this._dropdownCtrls[i];
    }.bind(this);
  },

  // ctrl: <props> _activeTab <events> _onclickTab
  // options.tab[]: <props> name, label, isActive, isDisabled, redirectTo, dropdown[], alignMenuRight
  // The option.tab[] may change dramatically between calls for a Controller.
  // However correct dropdown open/close display assumes the dropdowns appear in the same relative order.
  view: function (ctrl, options) {
    //console.log('\n.. in mc.Tabs.view. options=', options);
    var flavors = {
        tabs: '.nav.nav-tabs',
        pills: '.nav.nav-pills',
        'pills-stacked': '.nav.nav-pills.nav-stacked',
        nav: '.nav.navbar-nav',
        'nav-right': '.nav.navbar-nav.navbar-right'
      },
      dropdownCounter = -1;

    return m('ul' + (flavors[options.flavor] || flavors.tabs),
      (options.tabs || []).map(function (tab) {

        var tabOptions = mc.utils.extend({}, tab, { flavor: '_tabs', isActive: ctrl._activeTab === tab.name });
        if (!tab.dropdown || tab.isDisabled) { return mc.Tabs.viewTab(ctrl, tabOptions); }

        dropdownCounter += 1;
        return mc.Dropdown.view(ctrl._getDropdownCtrl(dropdownCounter), tabOptions);
      })
    );
  },

  // ctrl: <events> _onclickTab
  // options: <props> name, label, isActive, isDisabled, redirectTo
  viewTab: function (ctrl, options) {
    //console.log('.. in mc.TabsTab.view. options=', options);
    var href = '',
      attr = {};

    if (!options.isDisabled) {
      if (options.redirectTo) {
        href = '[href="' + options.redirectTo + '"]';
        attr = {config : m.route};
      } else {
        attr = {onclick : ctrl._onclickTab.bind(this, options.name)};
      }
    }

    return m('li' + (options.isActive ? '.active' : '') + (options.isDisabled ? '.disabled' : ''),
      m('a' + href, attr, options.label || options.name || '')
    );
  }
};