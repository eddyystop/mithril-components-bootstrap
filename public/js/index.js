// nav
var app1 = {
  controller: function () {
    this.tabsCtrl = new mc.Tabs.Controller({
      activeTab: this.activeTab = m.prop('finance'),
      onclickTab: function (name) {
        if (name === 'advanced') { window.location.href = './advanced.html'; }
      }
    });
    this.navSearchCtrl = new mc.NavSearch.Controller({ searchValue: this.searchValue = m.prop('search this') });
    this.btnCtrl = new mc.ButtonDropdown.Controller({ tabName: this.btnTabName = m.prop('') });
    this.buttonCtrl = new mc.Button.Controller({ onclick: function () {
      console.log('\nbutton clicked');
    } });

    this.navCtrl = new mc.NavResponsive.Controller();
  },

  view: function (ctrl) {
    return mc.NavResponsive.view(ctrl.navCtrl, {
      flavor: 'fixed-top',
      brandLabel: 'MCB',
      brandUrl: '#',
      viewComponents: function () {
        return [
          viewTabs(),
          //viewSearch(),
          mc.NavText.view({}, {flavor: 'nav-right', label: 'Signed in as', href: '#', linkLabel: 'JohnSz'}),
          mc.Button.view(ctrl.buttonCtrl, {
              flavor: 'nav-right', label: 'Sign out',
              selectors: '.btn-warning.btn-sm'
            }
          )
        ]
      }
    });

    function viewTabs () {
      var tabOptions = {
        flavor: 'nav',
        tabs: [
          { name: 'financials', label: 'Financials' },
          { name: 'foo', label: 'Disabled', isDisabled: true },
          { name: 'personnel', label: 'Personnel' },
          { name: 'dropdown', label: 'Components', dropdown: [
            {label: 'Primary actions', type: 'header' },
            {name: 'action', label: 'Action'},
            {name: 'another action', label: 'Another action', isDisabled: true },
            {type: 'divider' },
            {name: 'advanced', label: 'Advanced components'},
            {label: 'Exit bar', redirectTo: './advanced'}
          ]},
          { name: 'exit', label: 'Exit /foo', redirectTo:  '/foo' }
        ]
      };

      return mc.Tabs.view(ctrl.tabsCtrl, tabOptions)
    }

    function viewSearch () {
      var options = {
        flavor: 'nav-right',
        label: 'Search',
        placeholder: 'Search',
        btnLabel: 'Submit'
      };

      return mc.NavSearch.view(ctrl.navSearchCtrl, options);
    }

    function viewBtn () {
      var dropdownOptions = {
        flavor: 'btn-up',
        name: 'dropdown1',
        label: 'Dropdown-1',
        selectors: '.btn-success.btn-lg',
        isSplit: true,
        dropdown: [
          {label: 'Primary actions', type: 'header' },
          {name: 'action', label: 'Action'},
          {name: 'another action', label: 'Another action', isDisabled: true },
          {type: 'divider' },
          {label: 'Secondary actions', type: 'header' },
          {name: 'separated action', label: 'Separated action' },
          {label: 'Exit bar', redirectTo: '/bar'}
        ]
      };

      return mc.ButtonDropdown.view(ctrl.btnCtrl, dropdownOptions);
    }
  }
};

// affix
var app2 = {
  controller: function () {
    this.affixCtrl = new mc.Affix.Controller({
      activeTab: this.activeTab = m.prop('#js-overview')
    });
  },

  view: function (ctrl) {
    var options = {
      list: [
        {name: '#js-overview', label: 'Overview', list: [
          {name: '#js-individual-compiled', label: 'Individual or compiled'},
          {name: '#js-data-attrs', label: 'Data attributes'}
        ]},
        {name: '#transitions', label: 'Transitions'},
        {name: '#modals', label: 'Modal', list: [
          {name: '#modals-examples', label: 'Examples'},
          {name: '#modals-sizes', label: 'Sizes'}
        ]},
        {name: 'myname', label: 'myName'}
      ]
    };

    console.log(ctrl.activeTab(), ctrl.affixCtrl._activeTab);
    return mc.Affix.view(ctrl.affixCtrl, options);
  }
};

m.module(document.getElementById('myNav'), app1);
m.module(document.getElementById('myAffix'), app2);