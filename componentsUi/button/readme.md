# mc.ButtonDropdown

Bootstrap dropdown button control.
Its dependencies are: mc.Dropdown.
A dependency of: Nav.

The component is finished. This doc is temporary.

## Sample usage

See /public/dropdown.html for usage.

## Controller
```
var tabName = m.prop('');
var ctrl = new mc.ButtonDropdown.Controller({ tabName: tabName });
```
or
```
var ctrl = new mc.ButtonDropdown.Controller({ onclickTab: function (name) {
  var tabName = name;
}});
```

* `tabName {mprop | ''}` Contains 'name' of menu item clicked.
* `onClickTab {fcn}` Callback when a menu item is clicked.


## View
```
mc.ButtonDropdown.view(ctrl, options);
```

`options` are the same as for mc.Dropdown.view.