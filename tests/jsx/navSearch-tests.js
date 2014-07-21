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
  m("nav", {class:"navbar navbar-default navbar-fixed-top"}, [
    m("div", {class:"container-fluid"}, [
      m("div", {class:"navbar-header"}, [
        m("button", {type:"button", class:"navbar-toggle"}, [
          m("span", {class:"sr-only"}, ["Toggle navigation"]),
          m("span", {class:"icon-bar"}),
          m("span", {class:"icon-bar"}),
          m("span", {class:"icon-bar"})
        ]),
        m("a", {class:"navbar-brand", href:"/acom"}, ["Acom"])
      ]),
      m("div", {class:"collapse navbar-collapse"}, [
        m("form", {class:"navbar-form navbar-right"}, [
          m("div", {class:"form-group"}, [
            m("label", {class:"sr-only"}, ["Search"]),
            m("input", {type:"text", class:"form-control", placeholder:"Search"})
          ]),
          m("button", {type:"button", class:"btn btn-default"}, ["Submit"])
        ])
      ])
    ])
  ])

/*
mcTest.nav1 = {
  flavor: 'fixed-top',
  brandLabel: 'Foo',
  brandUrl: '/foo',
  viewComponents: function () {
    return mc.NavText.view({}, {flavor: 'nav', label: 'Signed in as', href: '#', linkLabel: 'Bar'})
  }
};

mcTest.target1Closed =
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
        <p class="navbar-text">
          <span>Signed in as</span>
          <a class="navbar-link"> Bar</a>
        </p>
      </div>
    </div>
  </nav>

mcTest.nav2 = {
  brandLabel: 'Foo',
  brandUrl: '/foo',
  viewComponents: function () {
    return mc.NavText.view({}, {flavor: 'nav', label: 'Signed in as', href: '#', linkLabel: 'Bar'})
  }
};

mcTest.target2Closed =
  <nav class="navbar navbar-default">
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
        <p class="navbar-text">
          <span>Signed in as</span>
          <a class="navbar-link"> Bar</a>
        </p>
      </div>
    </div>
  </nav>
*/

test('navSearch 01', function () {
  // test navText, also tests basic nav
  var result = true,
    searchValue = m.prop('search this'),
    source1;

  mcTest.navSearch1Ctrl = new mc.NavSearch.controller({ searchValue: searchValue });
  var navCtrl = new mc.NavResponsive.controller();

  // text, no link
  source1 = mc.NavResponsive.view(navCtrl, mcTest.nav0);
  result = result && test.compareRenders('navSearch 01, test 01', source1, mcTest.target0Closed);
  /*
  // text, with link
  source1 = mc.NavResponsive.view(navCtrl, mcTest.nav1);
  result = result && test.compareRenders('navSearch 01, test 02', source1, mcTest.target1Closed);

  // default nav flavor
  source1 = mc.NavResponsive.view(navCtrl, mcTest.nav2);
  result = result && test.compareRenders('navSearch 01, test 03', source1, mcTest.target2Closed);
  */
  return result;
});