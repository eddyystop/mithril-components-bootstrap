/** @jsx m */
var mcTest = mcTest || {};

// Test Nav using NavText, its simplest sub-component.

mcTest.nav0 = {
  flavor: 'fixed-top',
  brandLabel: 'Foo',
  brandUrl: '/foo',
  viewComponents: function () {
    return mc.NavText.view({}, {flavor: 'nav', label: 'Signed in as'});
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
        <p class="navbar-text"><span>Signed in as</span></p>
      </div>
    </div>
  </nav>

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

mcTest.target2Open =
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
      <div class="collapse navbar-collapse in">
        <p class="navbar-text">
          <span>Signed in as</span>
          <a class="navbar-link"> Bar</a>
        </p>
      </div>
    </div>
  </nav>

test('nav & navTest 01', function () {
  // test navText, also tests basic nav
  var result = true,
    source1;

  var navCtrl = new mc.NavResponsive.Controller();

  // text, no link
  source1 = mc.NavResponsive.view(navCtrl, mcTest.nav0);
  result = result && test.compareRenders('nav & navTest 01, test 01', source1, mcTest.target0Closed);

  // text, with link
  source1 = mc.NavResponsive.view(navCtrl, mcTest.nav1);
  result = result && test.compareRenders('nav & navTest 01, test 02', source1, mcTest.target1Closed);

  // default nav flavor
  source1 = mc.NavResponsive.view(navCtrl, mcTest.nav2);
  result = result && test.compareRenders('nav & navTest 01, test 03', source1, mcTest.target2Closed);

  // open nav
  navCtrl._onclickNavOpen();
  source1 = mc.NavResponsive.view(navCtrl, mcTest.nav2);
  result = result && test.compareRenders('nav & navTest 01, test 04', source1, mcTest.target2Open);

  return result;
});