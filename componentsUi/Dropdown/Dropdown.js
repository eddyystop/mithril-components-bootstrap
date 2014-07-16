mc.Dropdown = {
  // options: <props> isDropdownOpen <event> onclickTab
  controller: function (options) {
    //console.log('\n.. in mc.Dropdown.controller. options=', options);
    options = options || {};
    this.isDropdownOpen = mc.utils.getMpropValue(options.isDropdownOpen, false);
    this.dropdownId = 0;

    this.onclickTab = function (name) {
      //console.log('mc.Dropdown.controller > onclickTab. name=', name);
      this.isDropdownOpen = false;
      mc._comm.lastDropdownId = -1;
      //console.log('set lastDropdownId=', -1)
      options.onclickTab(name);
    }.bind(this);

    this.onclickDropdown = function () {
      //console.log('mc.Dropdown.controller > onclickDropdown');
      this.isDropdownOpen = !this.isDropdownOpen;
      mc._comm.lastDropdownId = this.dropdownId = Date.now();
      //console.log('set lastDropdownId & dropdownId=', this.dropdownId)
    }.bind(this);

    this.closeDropdown = function () {
      this.isDropdownOpen = false;
    }.bind(this);
  },

  // ctrl: <props> isDropDownOpen, dropdownId <events> onclickTab, onClickDropdown
  // options: flavor, name, label, isDisabled, isSplit, selectors, dropdown[]
  // selectors: .btn-default -primary -success -info -warning -danger -link
  // selectors: .btn-lg -sm -xs
  // selectors: .btn-block
  // selectors: .active .disabled
  view: function (ctrl, options) {
    //console.log('\n.. in mc.Dropdown.viewsddsdsdsds. ctrl=', ctrl, 'options=', options);
    options = options || {};
    var flavors = {
      dropdown: '.dropdown',
      btn: '.btn-group',
      'btn-up': '.btn-group.dropup'
      },
      optFlavor = options.flavor,
      flavor = (flavors[optFlavor] || flavors.dropdown),
      selectors = options.selectors || '',
      label = (options.label || options.name || '') + ' ';

    if (ctrl.dropdownId !== mc._comm.lastDropdownId) { ctrl.closeDropdown(); }
    var isDropdownOpen = ctrl.dropdownId === mc._comm.lastDropdownId ? ctrl.isDropdownOpen : false;

    //console.log('open?=', isDropdownOpen, 'ctrl.isDropdownOpen=', ctrl.isDropdownOpen, 'lastDropdownId=', mc._comm.lastDropdownId, 'dropdownId=', ctrl.dropdownId)

    if (!selectors && (optFlavor === 'btn' || optFlavor === 'btn-up')) {
      selectors = '.btn-primary';
    }

    return m('div' + flavor + (isDropdownOpen ? '.open' : '') + (ctrl.isDisabled ? '.disabled' : ''),
      [
        options.isSplit ? splitButton() : button(),
        isDropdownOpen ? mc.Dropdown.viewMenu({ onclickTab: ctrl.onclickTab }, options) : null
      ]
    );

    function button () {
      return m('button[type=button].btn.btn-default.dropdown-toggle' + selectors,
        {onclick: ctrl.onclickDropdown.bind(ctrl, ctrl.name)},
        [ m('span', label),
          m('span.caret')
        ]
      );
    }

    function splitButton () {
      return [
        m('button[type=button].btn' + selectors,
          {onclick: ctrl.onclickDropdown.bind(ctrl, ctrl.name)}, label
        ),
        m('button[type=button].btn.dropdown-toggle' + selectors,
          {onclick: ctrl.onclickDropdown.bind(ctrl, ctrl.name)},
          [m('span.caret'),
            m('span.sr-only', 'Toggle dropdown')
          ]
        )
      ];
    }
  },

  // ctrl {}: <events> onclickTab
  // options.dropdown[]: name, label, type, isDisabled, alignRight, redirectTo
  viewMenu: function (ctrl, options) {
    //console.log('.. in mc.Dropdown.viewMenu. options=', options);
    return m('ul.dropdown-menu' + (options.alignRight ? '.dropdown-menu-right' : ''),
      options.dropdown.map(function (menuItem) {

        //console.log(menuItem.type);
        switch (menuItem.type) {
          case 'divider':
            return m('li.divider', {style:{margin: '6px 0px'}}, ''); // .divider=9px is not visible
          case 'header':
            return m('li.dropdown-header', {tabindex: '-1'}, menuItem.label || menuItem.name);
          default:
            var tabsTabCtrl = mc.utils.extend({}, menuItem, {
              isActive: false,
              onclickTab: ctrl.onclickTab
            });
            return mc.Dropdown.viewTab(tabsTabCtrl);
        }
      })
    );
  },

  // ctrl: <props> name, label, isActive, isDisabled, redirectTo <events> onclickTab //todo move to options
  // also called by mc.Tabs
  viewTab: function (ctrl) {
    //console.log('.. in mc.Dropdown.viewTab. ctrl=', ctrl);
    var href = '',
      attr = {};

    if (!ctrl.isDisabled) {
      if (ctrl.redirectTo) {
        href = '[href="' + ctrl.redirectTo + '"]';
        attr = {config : m.route};
      } else {
        attr = {onclick : ctrl.onclickTab.bind(this, ctrl.name)};
      }
    }

    return m('li' + (ctrl.isActive ? '.active' : '') + (ctrl.isDisabled ? '.disabled' : ''),
      m('a' + href, attr, ctrl.label || ctrl.name || '')
    );
  }
};