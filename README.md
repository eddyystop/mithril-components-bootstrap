# mithril-components-bootstrap

Components targeted toward Bootstrap's CSS. 
Neither jQuery nor bootstrap.js are required.

There seem to be 2 design approaches to writing Bootstrap components.
One focuses on writing Bootstrap HTML by hand (as it has always been done) 
and then wrapping Mithril around that HTML.
 
The other approach, the one this repo uses, is to write components which 
implement common Bootstrap structures. The components themselves produce the
Bootstrap HTML via Mithril.

The components here are finalized but this doc is temporary.

### Sub-components all the way down 

A Nav bar component is implemented. It may contain (multiple instances of) Tabs, Dropdowns,
Buttons, Dropdown Buttons, Search forms, and Text sub-components.

The Tabs component may contain (multiple instances of) Dropdown sub-components. 
The ButtonDropdown component also contains Dropdown as a sub-component.

The design used is based on discussions at 
- https://groups.google.com/forum/#!topic/mithriljs/EWJAfMyWFJ8
- https://groups.google.com/forum/#!topic/mithriljs/ViSFyWUnaMk

Such a sub-component design allows anyone to leverage existing components into more complex entities.

### Roadmap

I'm working on components required for a high-end web site for this repo.

Please feel free to contribute your components.

### Tests

There are fairly extensive tests for each component.
Node.js must be installed. Then run
```
gulp test
```

p.s. There presently seem to be caching or async issues with the gulp features being used. 
Run the tests several times to flush lingering false negatives.