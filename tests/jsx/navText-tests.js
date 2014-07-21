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
  m("nav", {class:"navbar navbar-default navbar-fixed-top"}, [
    m("div", {class:"container-fluid"}, [
      m("div", {class:"navbar-header"}, [
        m("button", {type:"button", class:"navbar-toggle"}, [
          m("span", {class:"sr-only"}, ["Toggle navigation"]),
          m("span", {class:"icon-bar"}),
          m("span", {class:"icon-bar"}),
          m("span", {class:"icon-bar"})
        ]),
        m("a", {class:"navbar-brand", href:"/foo"}, ["Foo"])
      ]),
      m("div", {class:"collapse navbar-collapse"}, [
        m("p", {class:"navbar-text"}, [m("span", ["Signed in as"])])
      ])
    ])
  ])

mcTest.nav1 = {
  flavor: 'fixed-top',
  brandLabel: 'Foo',
  brandUrl: '/foo',
  viewComponents: function () {
    return mc.NavText.view({}, {flavor: 'nav', label: 'Signed in as', href: '#', linkLabel: 'Bar'})
  }
};

mcTest.target1Closed =
  m("nav", {class:"navbar navbar-default navbar-fixed-top"}, [
    m("div", {class:"container-fluid"}, [
      m("div", {class:"navbar-header"}, [
        m("button", {type:"button", class:"navbar-toggle"}, [
          m("span", {class:"sr-only"}, ["Toggle navigation"]),
          m("span", {class:"icon-bar"}),
          m("span", {class:"icon-bar"}),
          m("span", {class:"icon-bar"})
        ]),
        m("a", {class:"navbar-brand", href:"/foo"}, ["Foo"])
      ]),
      m("div", {class:"collapse navbar-collapse"}, [
        m("p", {class:"navbar-text"}, [
          m("span", ["Signed in as"]),
          m("a", {class:"navbar-link"}, [ " Bar"])
        ])
      ])
    ])
  ])

mcTest.nav2 = {
  brandLabel: 'Foo',
  brandUrl: '/foo',
  viewComponents: function () {
    return mc.NavText.view({}, {flavor: 'nav', label: 'Signed in as', href: '#', linkLabel: 'Bar'})
  }
};

mcTest.target2Closed =
  m("nav", {class:"navbar navbar-default"}, [
    m("div", {class:"container-fluid"}, [
      m("div", {class:"navbar-header"}, [
        m("button", {type:"button", class:"navbar-toggle"}, [
          m("span", {class:"sr-only"}, ["Toggle navigation"]),
          m("span", {class:"icon-bar"}),
          m("span", {class:"icon-bar"}),
          m("span", {class:"icon-bar"})
        ]),
        m("a", {class:"navbar-brand", href:"/foo"}, ["Foo"])
      ]),
      m("div", {class:"collapse navbar-collapse"}, [
        m("p", {class:"navbar-text"}, [
          m("span", ["Signed in as"]),
          m("a", {class:"navbar-link"}, [ " Bar"])
        ])
      ])
    ])
  ])

test('nav & navTest 01', function () {
  // test navText, also tests basic nav
  var result = true,
    source1;

  var navCtrl = new mc.NavResponsive.controller();

  // text, no link
  source1 = mc.NavResponsive.view(navCtrl, mcTest.nav0);
  result = result && test.compareRenders('nav & navTest 01, test 01', source1, mcTest.target0Closed);

  // text, with link
  source1 = mc.NavResponsive.view(navCtrl, mcTest.nav1);
  result = result && test.compareRenders('nav & navTest 01, test 02', source1, mcTest.target1Closed);

  // default nav flavor
  source1 = mc.NavResponsive.view(navCtrl, mcTest.nav2);
  result = result && test.compareRenders('nav & navTest 01, test 03', source1, mcTest.target2Closed);

  return result;
});