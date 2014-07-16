var mc = mc || {};

// <dep> mc.Dropdown
mc.Tabs = {
  // options: <props> activeTab(), isDropdownOpen() <event> onclickTab
  controller: function (options) {
    console.log('\n.. in mc.Tabs.controller. options=', options);
    options = options || {};
    this.activeTab = mc.utils.getMpropValue(options.activeTab, '');
    this.isDropdownOpen = mc.utils.getMpropValue(options.isDropdownOpen, false);
    this.dropdownId = 0;

    this.onclickTab = function (name) {
      console.log('mc.Tabs.controller > onclickTab. name=', name);
      this.isDropdownOpen = false;
      mc._comm.lastDropdownId = -1;
      this.activeTab = name;
      options.onclickTab(this.activeTab);
    }.bind(this);

    this.onclickDropdown = function (name) {
      console.log('mc.Tabs.controller > onclickDropdown. name=', name, 'activeTab=', this.activeTab);
      this.isDropdownOpen = name === this.activeTab ? !this.isDropdownOpen : true;
      this.activeTab = name;
      mc._comm.lastDropdownId = this.dropdownId = Date.now();
    }.bind(this);
  },

  // options: <props> activeTab, isDropdownOpen <events> onclickTab, onclickDropDown
  // options.tab[]: <props> name, label, isActive, isDisabled, redirectTo, dropdown[], alignMenuRight
  view: function (ctrl, options) {
    console.log('\n.. in mc.Tabs.view. options=', options);
    var flavors = {
      tabs: '.nav.nav-tabs',
      pills: '.nav.nav-pills',
      'pills-stacked': '.nav.nav-pills.nav-stacked',
      nav: '.nav.navbar-nav',
      'nav-right': '.nav.navbar-nav.navbar-right'
    };

    return [
      m('ul' + (flavors[options.flavor] || flavors.tabs),
        (options.tabs || []).map(function (tab) {
          var tabOptions = mc.utils.extend({}, tab, ctrl, { isActive: ctrl.activeTab === tab.name });
          return !tab.dropdown ? mc.Tabs.viewTab(ctrl, tabOptions) : mc.TabsDropdown.view(ctrl, tabOptions);
        })
      )
    ];
  },

  // ctrl: <events> onclickTab
  // options: <props> name, label, isActive, isDisabled, redirectTo
  viewTab: function (ctrl, options) {
    console.log('.. in mc.TabsTab.view. options=', options);
    var href = '',
      attr = {};

    if (!options.isDisabled) {
      if (options.redirectTo) {
        href = '[href="' + options.redirectTo + '"]';
        attr = {config : m.route};
      } else {
        attr = {onclick : options.onclickTab.bind(this, options.name)};
      }
    }

    return m('li' + (options.isActive ? '.active' : '') + (options.isDisabled ? '.disabled' : ''),
      m('a' + href, attr, options.label || options.name || '')
    );
  }
};


mc.TabsDropdown = { //todo merge with Tabs?
  // ctrl: <props> isDropdownOpen, dropdownId <events> onclickTab, onclickDropdown
  // options: <props> name, label, isActive, isDisabled, redirectTo, dropdown[]
  view: function (ctrl, options) {
    console.log('.. in mc.TabsDropdown. options=', options);
    return m('li.dropdown' + (ctrl.isDropdownOpen ? '.open' : '') + (options.isActive ? '.active' : '') + (options.isDisabled ? '.disabled' : ''), [
      m('a.dropdown-toggle', {onclick: ctrl.onclickDropdown.bind(self, options.name)}, [
        m('span', (options.label || options.name || '') + ' '),
        m('span.caret')
      ]),
      ctrl.isDropdownOpen ?
        mc.Dropdown.viewMenu({ onclickTab: ctrl.onclickTab }, { dropdown: options.dropdown }) :
        null
    ]);
  }
};