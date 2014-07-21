/** @jsx m */
var mcTest = mcTest || {};

// ButtonDropdown components always have a Dropdown sub-component.
// We test various ButtonDropdown features here.

mcTest.dropdown0 = {
    name: 'dropdown0',
    label: 'Dropdown-0',
    flavor: 'dropdown',
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

mcTest.target0Closed =
  m("div", {class:"dropdown"}, [
    m("button", {type:"button", class:"btn btn-default dropdown-toggle"}, [
      m("span", ["Dropdown-0 " ]),
      m("span", {class:"caret"})
    ])
  ])

mcTest.target0Open =
  m("div", {class:"dropdown open"}, [
    m("button", {type:"button", class:"btn btn-default dropdown-toggle"}, [
      m("span", ["Dropdown-0 " ]),
      m("span", {class:"caret"})
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

test('dropdown 01', function () {
  // test dropdown opens and closes
  var result = true,
    source1;

  var dropdownCtrl = new mc.Dropdown.controller({ onclickTab: function () {} });

  // render dropdown
  source1 = mc.Dropdown.view(dropdownCtrl, mcTest.dropdown0);
  result = result && test.compareRenders('dropdown 01, test 01', source1, mcTest.target0Closed);

  // open it
  dropdownCtrl.onclickDropdown();
  source1 = mc.Dropdown.view(dropdownCtrl, mcTest.dropdown0);
  result = result && test.compareRenders('dropdown 01, test 02', source1, mcTest.target0Open);

  // close it
  dropdownCtrl.onclickDropdown();
  source1 = mc.Dropdown.view(dropdownCtrl, mcTest.dropdown0);
  result = result && test.compareRenders('dropdown 01, test 03', source1, mcTest.target0Closed);

  return result;
});

test('dropdown 02', function () {
  // test dropdown closes when another dropdown is clicked
  var result = true,
    source1, source2;

  var dropdownCtrl1 = new mc.Dropdown.controller({ onclickTab: function () {} });
  var dropdownCtrl2 = new mc.Dropdown.controller({ onclickTab: function () {} });

  // render closed dropdowns
  source1 = mc.Dropdown.view(dropdownCtrl1, mcTest.dropdown0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown0);
  result = result && test.compareRenders('dropdown 02, test 01a', source1, mcTest.target0Closed);
  result = result && test.compareRenders('dropdown 02, test 01b', source2, mcTest.target0Closed);

  // open #1
  dropdownCtrl1.onclickDropdown();
  source1 = mc.Dropdown.view(dropdownCtrl1, mcTest.dropdown0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown0);
  result = result && test.compareRenders('dropdown 02, test 02a', source1, mcTest.target0Open);
  result = result && test.compareRenders('dropdown 02, test 02b', source2, mcTest.target0Closed);

  // open #2
  dropdownCtrl2.onclickDropdown();
  source1 = mc.Dropdown.view(dropdownCtrl1, mcTest.dropdown0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown0);
  result = result && test.compareRenders('dropdown 02, test 03a', source1, mcTest.target0Closed);
  result = result && test.compareRenders('dropdown 02, test 03b', source2, mcTest.target0Open);

  // open #1 again
  dropdownCtrl1.onclickDropdown();
  source1 = mc.Dropdown.view(dropdownCtrl1, mcTest.dropdown0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown0);
  result = result && test.compareRenders('dropdown 02, test 04a', source1, mcTest.target0Open);
  result = result && test.compareRenders('dropdown 02, test 04b', source2, mcTest.target0Closed);

  // open #2 again
  dropdownCtrl2.onclickDropdown();
  source1 = mc.Dropdown.view(dropdownCtrl1, mcTest.dropdown0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown0);
  result = result && test.compareRenders('dropdown 02, test 05a', source1, mcTest.target0Closed);
  result = result && test.compareRenders('dropdown 02, test 05b', source2, mcTest.target0Open);

  // close #2
  dropdownCtrl2.onclickDropdown();
  source1 = mc.Dropdown.view(dropdownCtrl1, mcTest.dropdown0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown0);
  result = result && test.compareRenders('dropdown 02, test 06a', source1, mcTest.target0Closed);
  result = result && test.compareRenders('dropdown 02, test 06b', source2, mcTest.target0Closed);

  return result;
});

test('dropdown 03', function () {
  // test split buttons
  var result = true,
    source1;

  var dropdownCtrl1 = new mc.Dropdown.controller({ onclickTab: function () {} });

  // render closed dropdown
  source1 = mc.Dropdown.view(dropdownCtrl1, mcTest.dropdown1);
  result = result && test.compareRenders('dropdown 03, test 01', source1, mcTest.target1Closed);

  // open #1
  dropdownCtrl1.onclickDropdown();
  source1 = mc.Dropdown.view(dropdownCtrl1, mcTest.dropdown1);
  result = result && test.compareRenders('dropdown 03, test 02', source1, mcTest.target1Open);

  // close #1
  dropdownCtrl1.onclickDropdown();
  source1 = mc.Dropdown.view(dropdownCtrl1, mcTest.dropdown1);
  result = result && test.compareRenders('dropdown 03, test 03', source1, mcTest.target1Closed);

  return result;
});

test('dropdown 04', function () {
  // test item selection
  var result = true,
    tabName1,
    tabName2 = m.prop('');

  var dropdownCtrl1 = new mc.Dropdown.controller({
    onclickTab: function (name) { tabName1 = name; }.bind(this)
  });
  var dropdownCtrl2 = new mc.Dropdown.controller({
    tabName: tabName2
  });

  // via event, select item
  dropdownCtrl1.onclickTab('action1');
  result = result && test.result('dropdown 04, test 01', tabName1 === 'action1');

  // via event, select another item
  dropdownCtrl1.onclickTab('another action');
  result = result && test.result('dropdown 04, test 02', tabName1 === 'another action');

  // via mprop, select item
  dropdownCtrl2.onclickTab('action1');
  result = result && test.result('dropdown 04, test 03', tabName2() === 'action1');

  // via mprop, select another item
  dropdownCtrl2.onclickTab('another action');
  result = result && test.result('dropdown 04, test 04', tabName2() === 'another action');

  return result;
});