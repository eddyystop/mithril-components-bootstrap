# mc.Nav

Bootstrap Nav control.
Can contain: mc.Tabs, mc.Button, mc.ButtonsDropdown, mc.NavSearch, mc.NavText
A dependency of: Nav.

The component is finished. This doc is temporary.

## Sample usage

See /public/nav.html for usage.

## Controller
```
controller: function () {

  this.tabsCtrl = new mc.Tabs.Controller({ activeTab: this.activeTab = m.prop('finance') });
  this.navSearchCtrl = new mc.NavSearch.Controller({ searchValue: this.searchValue = m.prop('search this') });
  this.btnCtrl = new mc.ButtonDropdown.Controller({ tabName: this.btnTabName = m.prop('') });
  this.buttonCtrl = new mc.Button.Controller({ onclick: function () {
    console.log('\nbutton clicked');
  } });

  this.navCtrl = new mc.NavResponsive.Controller();
},
```

Create controllers for the sub-components the Nav will contain.


## View
```
view: function (ctrl) {
  return [
    mc.NavResponsive.view(ctrl.navCtrl, {
      flavor: 'fixed-top',
      brandLabel: 'Foo',
      brandUrl: '/afoo',
      viewComponents: function () {
        return [
          viewTabs(),
          viewSearch(),
          mc.NavText.view({}, {flavor: 'nav', label: 'Signed in as', href: '#', linkLabel: 'JohnSz'}),
          mc.Button.view(ctrl.buttonCtrl, {
              flavor: 'nav-right', label: 'Sign in',
              selectors: '.btn-warning.btn-sm'
            }
          )
        ]
      }
  })];
```

* `ctrl {obj}` is the controller.
* `options {obj}` contains the following optional properties:
    * `flavor {str | default}` Type of Nav
        * default - See Bootstrap navbar-default.
        * fixed-top - See Bootstrap navbar-fixed-top.
        * fixed-bottom - See Bootstrap navbar-fixed-bottom'.
        * static-top' - See Bootstrap navbar-static-top'.
        * inverse - See Bootstrap navbar-inverse'.
        * fixed-top-inverse - fixed-top and inverse.
        * fixed-bottom-inverse - fixed-bottom & inverse.
        * static-top-inverse - static-top & inverse.    
    * `brandLabel {str}` The company/brand label at the left of a Bootstrap Nav.
    * `brandUrl {url}` The URL to redirect to for the brandLabel.
    * `viewComponents {fcn}` Render sub-components.
            
You specify the type of Nav you want and then call a fcn to render its sub-components.