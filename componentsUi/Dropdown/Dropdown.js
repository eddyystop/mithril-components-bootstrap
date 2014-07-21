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