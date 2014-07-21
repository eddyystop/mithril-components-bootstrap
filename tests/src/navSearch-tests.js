/** @jsx m */
var mcTest = mcTest || {};

// Test NavSearch

mcTest.nav0 = {
  flavor: 'fixed-top',
  brandLabel: 'Foo',
  brandUrl: '/foo',
  viewComponents: function () {
    return mc.NavSearch.view(mcTest.navSearch1Ctrl, {
      flavor: 'nav-right',
      label: 'Search',
      placeholder: 'Search',
      btnLabel: 'Submit'
    });
  }
};

mcTest.target0Closed =
  <nav class="navbar navbar-default navbar-fixed-top">
    <div class="container-fluid">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="/foo">Foo</a>
      </div>
      <div class="collapse navbar-collapse">
        <form class="navbar-form navbar-right">
          <div class="form-group">
            <label class="sr-only">Search</label>
            <input type="text" class="form-control" placeholder="Search" value="search this"/>
          </div>
          <button type="button" class="btn btn-default">Submit</button>
        </form>
      </div>
    </div>
  </nav>

mcTest.target0Closed2 =
  <nav class="navbar navbar-default navbar-fixed-top">
    <div class="container-fluid">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="/foo">Foo</a>
      </div>
      <div class="collapse navbar-collapse">
        <form class="navbar-form navbar-right">
          <div class="form-group">
            <label class="sr-only">Search</label>
            <input type="text" class="form-control" placeholder="Search" value="typed in"/>
          </div>
          <button type="button" class="btn btn-default">Submit</button>
        </form>
      </div>
    </div>
  </nav>

test('navSearch 01', function () {
  // test navText, also tests basic nav
  var result = true,
    searchValue1 = 'search this',
    searchValue2 = m.prop('search this'),
    source1;

  mcTest.navSearch1Ctrl = new mc.NavSearch.Controller({
    searchValue: searchValue1,
    onsubmit: function (value) {
      searchValue1 = value;
    }
  });
  var navCtrl1 = new mc.NavResponsive.Controller();

  mcTest.navSearch2Ctrl = new mc.NavSearch.Controller({
    searchValue: searchValue2
  });
  var navCtrl2 = new mc.NavResponsive.Controller();

  // initial render
  source1 = mc.NavResponsive.view(navCtrl1, mcTest.nav0);
  result = result && test.compareRenders('navSearch 01, test 01', source1, mcTest.target0Closed);

  // check search value changed
  mcTest.navSearch1Ctrl._searchValue('typed in');
  source1 = mc.NavResponsive.view(navCtrl1, mcTest.nav0);
  result = result && test.compareRenders('navSearch 01, test 02', source1, mcTest.target0Closed2);

  // via event, get search value
  mcTest.navSearch1Ctrl._onsubmit();
  result = result && test.result('navSearch 01, test 03', searchValue1 === 'typed in');

  // via mprop, get search value
  mcTest.navSearch2Ctrl._searchValue('typed in');
  source1 = mc.NavResponsive.view(navCtrl2, mcTest.nav0);
  result = result && test.compareRenders('navSearch 01, test 04', source1, mcTest.target0Closed2);
  mcTest.navSearch2Ctrl._onsubmit();
  result = result && test.result('navSearch 01, test 05', searchValue2() === 'typed in');

  return result;
});