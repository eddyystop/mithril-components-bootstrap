/** @jsx m */
var mcTest = mcTest || {};

// Dropdown buttons are dropdown controls with special styling.
// These tests therefore just check that styling.

mcTest.button0 = {
    name: 'button0',
    label: 'Button-0',
    flavor: 'btn',
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

mcTest.button1 = mc.utils.extend({}, mcTest.button0, {name: 'button1', label: 'Button-1', flavor: 'btn-up', selectors: '.btn-danger.btn-lg'});
mcTest.button2 = mc.utils.extend({}, mcTest.button0, {name: 'button2', label: 'Button-2', flavor: 'btn',    isSplit: true });
mcTest.button3 = mc.utils.extend({}, mcTest.button0, {name: 'button3', label: 'Button-3', flavor: 'btn-up', isSplit: true });

mcTest.target0Closed =
  m("div", {class:"btn-group"}, [
    m("button", {type:"button", class:"btn btn-default dropdown-toggle btn-primary"}, [
      m("span", ["Button-0 " ]),
      m("span", {class:"caret"})
    ])
  ])

mcTest.target1Closed =
  m("div", {class:"btn-group dropup"}, [
    m("button", {type:"button", class:"btn btn-default dropdown-toggle btn-danger btn-lg"}, [
      m("span", ["Button-1 " ]),
      m("span", {class:"caret"})
    ])
  ])

mcTest.target2Closed =
  m("div", {class:"btn-group"}, [
    m("button", {type:"button", class:"btn btn-primary"}, ["Button-2 " ]),
    m("button", {type:"button", class:"btn dropdown-toggle btn-primary"}, [
      m("span", {class:"caret"}),
      m("span", {class:"sr-only"}, ["Toggle dropdown"])
    ])
  ])

mcTest.target3Closed =
  m("div", {class:"btn-group dropup"}, [
    m("button", {type:"button", class:"btn btn-primary"}, ["Button-3 " ]),
    m("button", {type:"button", class:"btn dropdown-toggle btn-primary"}, [
      m("span", {class:"caret"}),
      m("span", {class:"sr-only"}, ["Toggle dropdown"])
    ])
  ])


test('buttonDropdown 01', function () {
  // test dropdown opens and closes
  var result = true,
    source1;

  var buttonCtrl = new mc.Dropdown.controller({ onclickTab: function () {} });

  // dropdown, not split
  source1 = mc.Dropdown.view(buttonCtrl, mcTest.button0);
  result = result && test.compareRenders('buttonDropdown 01, test 01', source1, mcTest.target0Closed);

  // dropup, not split
  source1 = mc.Dropdown.view(buttonCtrl, mcTest.button1);
  result = result && test.compareRenders('buttonDropdown 01, test 02', source1, mcTest.target1Closed);

  // dropdown, split
  source1 = mc.Dropdown.view(buttonCtrl, mcTest.button2);
  result = result && test.compareRenders('buttonDropdown 01, test 03', source1, mcTest.target2Closed);

  // dropup, split
  source1 = mc.Dropdown.view(buttonCtrl, mcTest.button3);
  result = result && test.compareRenders('buttonDropdown 01, test 04', source1, mcTest.target3Closed);

  return result;
});
