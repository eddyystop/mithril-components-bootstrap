/** @jsx m */
var mcTest = mcTest || {};

mcTest.affix0 = {
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

mcTest.target0Closed =
  <div class="mc-affix" style="margin-top: 0px;">
    <ul class="nav mc-affix-nav">
      <li class="active">
        <a href="#js-overview">Overview</a>
        <ul class="nav">
          <li><a href="#js-individual-compiled">Individual or compiled</a></li>
          <li><a href="#js-data-attrs">Data attributes</a></li>
        </ul>
      </li>
      <li><a href="#transitions">Transitions</a></li>
      <li>
        <a href="#modals">Modal</a>
        <ul class="nav">
          <li><a href="#modals-examples">Examples</a></li>
          <li><a href="#modals-sizes">Sizes</a></li>
        </ul>
      </li>
      <li><a href="">myName</a></li>
    </ul>
  </div>

mcTest.target0Open =
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

mcTest.affix1 = {
  name: 'affix1',
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
  <div class="btn-group">
    <button type="button" class="btn btn-primary">Dropdown-1 </button>
    <button type="button" class="btn dropdown-toggle btn-primary">
      <span class="caret"></span>
      <span class="sr-only">Toggle dropdown</span>
    </button>
  </div>

mcTest.target1Open =
  <div class="btn-group open">
    <button type="button" class="btn btn-primary">Dropdown-1 </button>
    <button type="button" class="btn dropdown-toggle btn-primary">
      <span class="caret"></span>
      <span class="sr-only">Toggle dropdown</span>
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

test('affix 01', function () {
  // test dropdown opens and closes
  var result = true,
    source1;

  var affixCtrl = new mc.Affix.Controller({
    activeTab: '#js-overview',
    //sections: 'mySections',
    onclickTab: function () {}
  });

  // render dropdown
  source1 = mc.Affix.view(affixCtrl, mcTest.affix0);
  result = result && test.compareRenders('affix 01, test 01', source1, mcTest.target0Closed);
  /*
  // open it
  affixCtrl._onclickDropdown();
  source1 = mc.Affix.view(affixCtrl, mcTest.affix0);
  result = result && test.compareRenders('affix 01, test 02', source1, mcTest.target0Open);

  // close it
  affixCtrl._onclickDropdown();
  source1 = mc.Affix.view(affixCtrl, mcTest.affix0);
  result = result && test.compareRenders('affix 01, test 03', source1, mcTest.target0Closed);
  */
  return result;
});
/*
test('affix 02', function () {
  // test dropdown closes when another dropdown is clicked
  var result = true,
    source1, source2;

  var affixCtrl1 = new mc.Affix.Controller({ onclickTab: function () {} });
  var affixCtrl2 = new mc.Affix.Controller({ onclickTab: function () {} });

  // render closed dropdowns
  source1 = mc.Affix.view(affixCtrl1, mcTest.affix0);
  source2 = mc.Affix.view(affixCtrl2, mcTest.affix0);
  result = result && test.compareRenders('affix 02, test 01a', source1, mcTest.target0Closed);
  result = result && test.compareRenders('affix 02, test 01b', source2, mcTest.target0Closed);

  // open #1
  affixCtrl1._onclickDropdown();
  source1 = mc.Affix.view(affixCtrl1, mcTest.affix0);
  source2 = mc.Affix.view(affixCtrl2, mcTest.affix0);
  result = result && test.compareRenders('affix 02, test 02a', source1, mcTest.target0Open);
  result = result && test.compareRenders('affix 02, test 02b', source2, mcTest.target0Closed);

  // open #2
  affixCtrl2._onclickDropdown();
  source1 = mc.Affix.view(affixCtrl1, mcTest.affix0);
  source2 = mc.Affix.view(affixCtrl2, mcTest.affix0);
  result = result && test.compareRenders('affix 02, test 03a', source1, mcTest.target0Closed);
  result = result && test.compareRenders('affix 02, test 03b', source2, mcTest.target0Open);

  // open #1 again
  affixCtrl1._onclickDropdown();
  source1 = mc.Affix.view(affixCtrl1, mcTest.affix0);
  source2 = mc.Affix.view(affixCtrl2, mcTest.affix0);
  result = result && test.compareRenders('affix 02, test 04a', source1, mcTest.target0Open);
  result = result && test.compareRenders('affix 02, test 04b', source2, mcTest.target0Closed);

  // open #2 again
  console.log('source1=', affixCtrl1._isDropdownOpen);
  console.log('source2=', affixCtrl2._isDropdownOpen);
  affixCtrl2._onclickDropdown();
  source1 = mc.Affix.view(affixCtrl1, mcTest.affix0);
  source2 = mc.Affix.view(affixCtrl2, mcTest.affix0);
  result = result && test.compareRenders('affix 02, test 05a', source1, mcTest.target0Closed);
  result = result && test.compareRenders('affix 02, test 05b', source2, mcTest.target0Open);

  // close #2
  affixCtrl2._onclickDropdown();
  source1 = mc.Affix.view(affixCtrl1, mcTest.affix0);
  source2 = mc.Affix.view(affixCtrl2, mcTest.affix0);
  result = result && test.compareRenders('affix 02, test 06a', source1, mcTest.target0Closed);
  result = result && test.compareRenders('affix 02, test 06b', source2, mcTest.target0Closed);

  return result;
});

test('affix 03', function () {
  // test split buttons
  var result = true,
    source1;

  var affixCtrl1 = new mc.Affix.Controller({ onclickTab: function () {} });

  // render closed dropdown
  source1 = mc.Affix.view(affixCtrl1, mcTest.affix1);
  result = result && test.compareRenders('affix 03, test 01', source1, mcTest.target1Closed);

  // open #1
  affixCtrl1._onclickDropdown();
  source1 = mc.Affix.view(affixCtrl1, mcTest.affix1);
  result = result && test.compareRenders('affix 03, test 02', source1, mcTest.target1Open);

  // close #1
  affixCtrl1._onclickDropdown();
  source1 = mc.Affix.view(affixCtrl1, mcTest.affix1);
  result = result && test.compareRenders('affix 03, test 03', source1, mcTest.target1Closed);

  return result;
});

test('affix 04', function () {
  // test item selection
  var result = true,
    tabName1,
    tabName2 = m.prop('');

  var affixCtrl1 = new mc.Affix.Controller({
    onclickTab: function (name) { tabName1 = name; }.bind(this)
  });
  var affixCtrl2 = new mc.Affix.Controller({
    tabName: tabName2
  });

  // via event, select item
  affixCtrl1._onclickTab('action1');
  result = result && test.result('affix 04, test 01', tabName1 === 'action1');

  // via event, select another item
  affixCtrl1._onclickTab('another action');
  result = result && test.result('affix 04, test 02', tabName1 === 'another action');

  // via mprop, select item
  affixCtrl2._onclickTab('action1');
  console.log(tabName2())
  result = result && test.result('affix 04, test 03', tabName2() === 'action1');

  // via mprop, select another item
  affixCtrl2._onclickTab('another action');
  result = result && test.result('affix 04, test 04', tabName2() === 'another action');

  return result;
});
*/