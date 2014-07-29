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