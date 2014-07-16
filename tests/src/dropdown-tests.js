/** @jsx m */
var mcTest = mcTest || {};

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

mcTest.targetClosed =
  <div class="dropdown">
    <button type="button" class="btn btn-default dropdown-toggle">
      <span>Dropdown-0 </span>
      <span class="caret"></span>
    </button>
  </div>

mcTest.targetOpen =
  <div class="dropdown open">
    <button type="button" class="btn btn-default dropdown-toggle">
      <span>Dropdown-0 </span>
      <span class="caret"></span>
    </button>
    <ul class="dropdown-menu">
      <li class="dropdown-header" tabindex="-1">Primary actions</li>
      <li><a>Action</a></li>
      <li class="disabled"><a>Another action</a></li>
      <li class="divider" style="margin: 6px 0px;"></li>
      <li class="dropdown-header" tabindex="-1">Secondary actions</li>
      <li><a>Separated action</a></li>
      <li><a href="/public/dropdown.html?/bar">Exit bar</a></li>
    </ul>
  </div>

test('dropdown 01', function () {
  // test dropdown opens and closes
  var result = true,
    source, target;

  var dropdownCtrl = new mc.Dropdown.controller({ onclickTab: function () {} });

  // render dropdown
  source = mc.Dropdown.view(dropdownCtrl, mcTest.dropdown0);
  result = result && compareRenders('dropdown 01, test 01', source, mcTest.targetClosed);

  // open it
  dropdownCtrl.onclickDropdown();
  source = mc.Dropdown.view(dropdownCtrl, mcTest.dropdown0);
  result = result && compareRenders('dropdown 01, test 02', source, mcTest.targetOpen);

  // close it
  dropdownCtrl.onclickDropdown();
  source = mc.Dropdown.view(dropdownCtrl, mcTest.dropdown0);
  result = result && compareRenders('dropdown 01, test 03', source, mcTest.targetClosed);

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
  result = result && compareRenders('dropdown 02, test 01a', source1, mcTest.targetClosed);
  result = result && compareRenders('dropdown 02, test 01b', source2, mcTest.targetClosed);

  // open #1
  dropdownCtrl1.onclickDropdown();
  source1 = mc.Dropdown.view(dropdownCtrl1, mcTest.dropdown0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown0);
  result = result && compareRenders('dropdown 02, test 02a', source1, mcTest.targetOpen);
  result = result && compareRenders('dropdown 02, test 02b', source2, mcTest.targetClosed);

  // open #2
  dropdownCtrl2.onclickDropdown();
  source1 = mc.Dropdown.view(dropdownCtrl1, mcTest.dropdown0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown0);
  result = result && compareRenders('dropdown 02, test 03a', source1, mcTest.targetClosed);
  result = result && compareRenders('dropdown 02, test 03b', source2, mcTest.targetOpen);

  // open #1 again
  dropdownCtrl1.onclickDropdown();
  source1 = mc.Dropdown.view(dropdownCtrl1, mcTest.dropdown0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown0);
  result = result && compareRenders('dropdown 02, test 04a', source1, mcTest.targetOpen);
  result = result && compareRenders('dropdown 02, test 04b', source2, mcTest.targetClosed);

  // open #2 again
  dropdownCtrl2.onclickDropdown();
  source1 = mc.Dropdown.view(dropdownCtrl1, mcTest.dropdown0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown0);
  result = result && compareRenders('dropdown 02, test 05a', source1, mcTest.targetClosed);
  result = result && compareRenders('dropdown 02, test 05b', source2, mcTest.targetOpen);

  // close #2
  dropdownCtrl2.onclickDropdown();
  source1 = mc.Dropdown.view(dropdownCtrl1, mcTest.dropdown0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown0);
  result = result && compareRenders('dropdown 02, test 06a', source1, mcTest.targetClosed);
  result = result && compareRenders('dropdown 02, test 06b', source2, mcTest.targetClosed);

  return result;
});