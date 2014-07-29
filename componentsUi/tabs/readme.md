# mc.Tabs

Bootstrap tabs control.
Its dependencies are: mc.Dropdown.
A dependency of: Nav.

The component is finished. This doc is temporary.

## Sample usage

See /public/tabs.html for usage.

## Controller


    var tabName = m.prop('');
    var ctrl = new mc.Tabs.Controller({ tabName: tabName });


or

    var ctrl = new mc.Tabs.Controller({ onclickTab: function (name) {
      var tabName = name;
    }});


* `tabName {mprop | ''}` Contains 'name' of the tab or menu item clicked.
* `onClickTab {fcn}` Callback when a tab or menu item is clicked.


## View
```
mc.Tabs.view(ctrl, options);
```

* `ctrl {obj}` is the controller.
* `options {obj}` contains the following optional properties:
    * `flavor {str | dropdown}` Type of dropdown
        * tabs - Bootstrap tabs component.
        * pills - Bootstrap pills component, horizontal.
        * pills-stacked - Bootstrap pills component, vertical.
        * nav - Sub-component to mc.Nav, aligned left.
        * nav-right - Sub-component to mc.Nav, aligned right.
    * `tabs {array of obj}` The tabs.      
        `{name:, lavel:, isDisabled:, alignRight:, dropdown:[]}`
        The tab is a dropdown tab if `dropdown` is present.
        * `name {str}` 'name' to return if tab is clicked and its not a dropdown.
        * `label {str | name}` Label appearing inside dropdown or button.
        * `isDisabled {boolean | false}` If component is disabled.
        * `alignRight {boolean | false}` Align dropdown to the right rather than the left.
        * `dropdown {array of obj}` Menu for dropdown.
            `{type:, name:, label:, isDisabled:, redirectTo:}`
            * `type {str | item}` Type of menu item.
                * header - A heading.
                * divider - A divider.
                * item - A menu item.
            * `name {str}` 'name' to return if item is clicked.
            * `label {str | name}` Label to display for item.
            * `isDisabled {boolean}` If item is disabled.
            * `redirectTo {url}` Redirect if item is clicked.
            
The option.tab[] may change dramatically between calls.
However correct dropdown open/close display assumes the dropdowns appear in the same relative order.
