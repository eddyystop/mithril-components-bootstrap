# mc.Dropdown 

Bootstrap dropdown control.
A dependency of: Nav, Tabs, ButtonDropdown

The component is finished. This doc is temporary.

## Sample usage

See /public/dropdown.html for usage with dropdown and various ButtonDropdown.

## Controller
```
var tabName = m.prop('');
var ctrl = new mc.Dropdown.Controller({ tabName: tabName });
```
or
```
var ctrl = new mc.Dropdown.Controller({ onclickTab: function (name) {
  var tabName = name;
}});
```

* `tabName {mprop | ''}` Contains 'name' of menu item clicked.
* `onClickTab {fcn}` Callback when a menu item is clicked.


## View
```
mc.Dropdown.view(ctrl, options);
```

* `ctrl {obj}` is the controller.
* `options {obj}` contains the following optional properties:
    * `flavor {str | dropdown}` Type of dropdown
        * dropdown - Bootstrap dropdown.
        * btn - Bootstrap dropdown button. Prefer using mc.ButtonDropdown.
        * btn-up - Bootstrap dropup button. Prefer using mc.ButtonDropdown.
    * `label {str}` Label appearing inside dropdown or button.
    * `isDisabled {boolean | false}` If component is disabled.
    * `alignRight {boolean | false}` Align dropdown to the right rather than the left.
    * `isSplit {boolean | false}` Render a split button.
    * `selectors {str | ''}` Bootstrap classes for button, e.g.
        .btn-default -primary -success -info -warning -danger -link
        .btn-lg -sm -xs
    * `dropdown {array of obj}` Menu for dropdown.
        `{type, name, label, isDisabled, alignRight, redirectTo}`
        * `type {str | item}` Type of menu item.
            * header - A heading.
            * divider - A divider.
            * item - A menu item.
        * `name {str}` 'name' to return if item is clicked.
        * `label {str | name}` Label to display for item.
        * `isDisabled {boolean}` If item is disabled.
        * `redirectTo {url}` Redirect if item is clicked.