/** @jsx m */
var mcTest = mcTest || {};

mcTest.tabs0 = {
  flavor: 'tabs',
  tabs: [
    { name: 'financials', label: 'Financials' },
    { name: 'foo', label: 'Disabled', isDisabled: true },
    { name: 'personnel', label: 'Personnel' },
    { name: 'dropdown', label: 'Dropdown', dropdown: [
      {label: 'Primary actions', type: 'header' },
      {name: 'action', label: 'Action'},
      {name: 'another action', label: 'Another action', isDisabled: true },
      {type: 'divider' },
      {label: 'Secondary actions', type: 'header' },
      {name: 'separated action', label: 'Separated action' },
      {label: 'Exit bar', redirectTo: '/bar'}
    ]},
    { name: 'exit', label: 'Exit /foo', redirectTo:  '/foo' },
    { name: 'exit2', label: 'Exit /bar', redirectTo:  '/bar', isDisabled: true }
  ]
};

mcTest.target0Closed =
  m("ul", {class:"nav nav-tabs"}, [
    m("li", {class:"active"}, [m("a", ["Financials"])]),
    m("li", {class:"disabled"}, [m("a", ["Disabled"])]),
    m("li", [m("a", ["Personnel"])]),
    m("li", {class:"dropdown"}, [m("a", {class:"dropdown-toggle"}, [m("span", ["Dropdown " ]),m("span", {class:"caret"})])]),
    m("li", [m("a", {href:"/public/tabs.html?/foo"}, ["Exit /foo"])]),
    m("li", {class:"disabled"}, [m("a", ["Exit /bar"])])
  ])

mcTest.target0Open =
  m("ul", {class:"nav nav-tabs"}, [
    m("li", {class:"active"}, [m("a", ["Financials"])]),
    m("li", {class:"disabled"}, [m("a", ["Disabled"])]),
    m("li", [m("a", ["Personnel"])]),
    m("li", {class:"dropdown open"}, [m("a", {class:"dropdown-toggle"}, [m("span", ["Dropdown " ]),m("span", {class:"caret"})]),
      m("ul", {class:"dropdown-menu"}, [
        m("li", {class:"dropdown-header", tabindex:"-1"}, ["Primary actions"]),
        m("li", [m("a", ["Action"])]),m("li", {class:"disabled"}, [m("a", ["Another action"])]),
        m("li", {class:"divider", style:"margin: 6px 0px;"}),
        m("li", {class:"dropdown-header", tabindex:"-1"}, ["Secondary actions"]),
        m("li", [m("a", ["Separated action"])]),
        m("li", [m("a", {href:"/public/tabs.html?/bar"}, ["Exit bar"])])
      ])
    ]),
    m("li", [m("a", {href:"/public/tabs.html?/foo"}, ["Exit /foo"])]),
    m("li", {class:"disabled"}, [m("a", ["Exit /bar"])])
  ])

mcTest.dropdown1 = {
  name: 'dropdown1',
  label: 'Dropdown-1',
  flavor: 'btn',
  isSplit: true,
  selectors: '.btn-primary',
  dropdown: [
    {label: 'Primary actions', type: 'header' },
    {name: 'action1', label: 'Action'},
    {name: 'another action', label: 'Another action', isDisabled: true },
    {type: 'divider' },
    {label: 'Secondary actions', type: 'header' },
    {name: 'separated action', label: 'Separated action' },
    {label: 'Exit bar', redirectTo: '/bar'}
  ]
};

mcTest.target1Closed =
  m("div", {class:"btn-group"}, [
    m("button", {type:"button", class:"btn btn-primary"}, ["Dropdown-1 " ]),
    m("button", {type:"button", class:"btn dropdown-toggle btn-primary"}, [
      m("span", {class:"caret"}),
      m("span", {class:"sr-only"}, ["Toggle dropdown"])
    ])
  ])

mcTest.target1Open =
  m("div", {class:"btn-group open"}, [
    m("button", {type:"button", class:"btn btn-primary"}, ["Dropdown-1 " ]),
    m("button", {type:"button", class:"btn dropdown-toggle btn-primary"}, [
      m("span", {class:"caret"}),
      m("span", {class:"sr-only"}, ["Toggle dropdown"])
    ]),
    m("ul", {class:"dropdown-menu"}, [
      m("li", {class:"dropdown-header", tabindex:"-1"}, ["Primary actions"]),
      m("li", [m("a", ["Action"])]),
      m("li", {class:"disabled"}, [m("a", ["Another action"])]),
      m("li", {class:"divider", style:"margin: 6px 0px;"}),
      m("li", {class:"dropdown-header", tabindex:"-1"}, ["Secondary actions"]),
      m("li", [m("a", ["Separated action"])]),
      m("li", [m("a", {href:"/public/dropdown.html?/bar"}, ["Exit bar"])])
    ])
  ])

test('tabs 01', function () {
  // test tabs dropdown opens and closes
  var result = true,
    source1;

  var tabsCtrl1 = new mc.Tabs.controller({ activeTab: 'financials', onclickTab: function () {} });

  // render tabs
  source1 = mc.Tabs.view(tabsCtrl1, mcTest.tabs0);
  result = result && test.compareRenders('tabs 01, test 01', source1, mcTest.target0Closed);

  // open tab dropdown
  tabsCtrl1._getDropdownCtrl(0).onclickDropdown();
  source1 = mc.Tabs.view(tabsCtrl1, mcTest.tabs0);
  result = result && test.compareRenders('tabs 01, test 02', source1, mcTest.target0Open);

  // close tag dropdown
  tabsCtrl1._getDropdownCtrl(0).onclickDropdown();
  source1 = mc.Tabs.view(tabsCtrl1, mcTest.tabs0);
  result = result && test.compareRenders('tabs 01, test 03', source1, mcTest.target0Closed);

  return result;
});

test('tabs 02', function () {
  // test tab dropdown closes when another dropdown is clicked
  var result = true,
    source1, source2;

  var tabsCtrl1 = new mc.Tabs.controller({ activeTab: 'financials', onclickTab: function () {} });
  var dropdownCtrl2 = new mc.Dropdown.controller({ onclickTab: function () {} });

  // render closed dropdowns
  source1 = mc.Tabs.view(tabsCtrl1, mcTest.tabs0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown1);
  result = result && test.compareRenders('tabs 02, test 01a', source1, mcTest.target0Closed);
  result = result && test.compareRenders('tabs 02, test 01b', source2, mcTest.target1Closed);

  // open tab dropdown
  tabsCtrl1._getDropdownCtrl(0).onclickDropdown();
  source1 = mc.Tabs.view(tabsCtrl1, mcTest.tabs0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown1);
  result = result && test.compareRenders('tabs 02, test 02a', source1, mcTest.target0Open);
  result = result && test.compareRenders('tabs 02, test 02b', source2, mcTest.target1Closed);

  // open dropdown
  dropdownCtrl2.onclickDropdown();
  source1 = mc.Tabs.view(tabsCtrl1, mcTest.tabs0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown1);
  result = result && test.compareRenders('tabs 02, test 03a', source1, mcTest.target0Closed);
  result = result && test.compareRenders('tabs 02, test 03b', source2, mcTest.target1Open);

  // open tab dropdown
  tabsCtrl1._getDropdownCtrl(0).onclickDropdown();
  source1 = mc.Tabs.view(tabsCtrl1, mcTest.tabs0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown1);
  result = result && test.compareRenders('tabs 02, test 04a', source1, mcTest.target0Open);
  result = result && test.compareRenders('tabs 02, test 04b', source2, mcTest.target1Closed);

  // open dropdown
  dropdownCtrl2.onclickDropdown();
  source1 = mc.Tabs.view(tabsCtrl1, mcTest.tabs0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown1);
  result = result && test.compareRenders('tabs 02, test 05a', source1, mcTest.target0Closed);
  result = result && test.compareRenders('tabs 02, test 05b', source2, mcTest.target1Open);

  // close dropdown
  dropdownCtrl2.onclickDropdown();
  source1 = mc.Tabs.view(tabsCtrl1, mcTest.tabs0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown1);
  result = result && test.compareRenders('tabs 02, test 06a', source1, mcTest.target0Closed);
  result = result && test.compareRenders('tabs 02, test 06b', source2, mcTest.target1Closed);

  return result;
});

test('tabs 03', function () {
  // test tab/item selection
  var result = true,
    tabName1,
    tabName2 = m.prop('financials');;

  var tabsCtrl1 = new mc.Tabs.controller({
    activeTab: 'financials',
    onclickTab: function (name) { tabName1 = name; }.bind(this)
  });
  var tabsCtrl2 = new mc.Tabs.controller({
    activeTab: tabName2
  });

  // via event, select tab
  tabsCtrl1.onclickTab('personnel');
  result = result && test.result('tabs 03, test 01', tabName1 === 'personnel');

  // via event, select another tab
  tabsCtrl1.onclickTab('financials');
  result = result && test.result('tabs 03, test 02', tabName1 === 'financials');

  // via event, select item from dropdown
  tabsCtrl1._getDropdownCtrl(0).onclickTab('action');
  result = result && test.result('tabs 03, test 03', tabName1 === 'action');

  // via mprop, select tab
  tabsCtrl2.onclickTab('personnel');
  result = result && test.result('tabs 03, test 04', tabName2() === 'personnel');

  // via mprop, select another tab
  tabsCtrl2.onclickTab('financials');
  result = result && test.result('tabs 03, test 05', tabName2() === 'financials');

  // via mprop, select item from dropdown
  tabsCtrl2._getDropdownCtrl(0).onclickTab('action');
  result = result && test.result('tabs 03, test 06', tabName2() === 'action');

  return result;
});