/*global m:false, basket:false, Markdown:false, stringifyObject:false */
basket.clear();

var data = {
  components: {
    Tabs: {key: 'Tabs', doc: 'Tabs/readme.md', heading: 'Tabs', scrollResult: true},
    NavResponsive: {key: 'NavResponsive', doc: 'Nav/readme.md', heading: 'NavResponsive', scrollResult: true},
    Affix: {key: 'Affix', doc: 'Affix/readme.md', heading: 'Affix', scrollResult: false}
  },
  currComponent: m.prop('Tabs'),

  log: '',

  tabs: m.prop(true),
  searchBox: m.prop(false),
  textLink: m.prop(false),
  button: m.prop(true)
};

// nav
var navPart = {
  controller: function () {
    this.tabsCtrl = new mc.Tabs.Controller({
      activeTab: this.activeTab = m.prop('finance')
    });
    this.navSearchCtrl = new mc.NavSearch.Controller({ searchValue: this.searchValue = m.prop('search this') });
    this.btnCtrl = new mc.ButtonDropdown.Controller({ tabName: this.btnTabName = m.prop('') });
    this.buttonCtrl = new mc.Button.Controller({ onclick: function () {
      console.log('\nbutton clicked');
    } });

    this.navCtrl = new mc.NavResponsive.Controller();
  },

  view: function (ctrl) {
    return mc.NavResponsive.view(ctrl.navCtrl, {
      flavor: 'fixed-top',
      brandLabel: 'MCB',
      brandUrl: '#',
      viewComponents: function () {
        return [
          viewTabs(),
          mc.NavText.view({}, {flavor: 'nav-right', label: 'Signed in as', href: '#', linkLabel: 'JohnSz'}),
          mc.Button.view(ctrl.buttonCtrl, {
              flavor: 'nav-right', label: 'Sign out',
              selectors: '.btn-warning.btn-sm'
            }
          )
        ]
      }
    });

    function viewTabs () {
      var tabOptions = {
        flavor: 'nav',
        tabs: [
          { name: 'financials', label: 'Financials' },
          { name: 'foo', label: 'Disabled', isDisabled: true },
          { name: 'personnel', label: 'Personnel' },
          { name: 'dropdown', label: 'Components', dropdown: [
            {label: 'Primary actions', type: 'header' },
            {name: 'action', label: 'Action'},
            {name: 'another action', label: 'Another action', isDisabled: true },
            {type: 'divider' },
            {name: 'advanced', label: 'Advanced components'},
            {label: 'Exit bar', redirectTo: './advanced'}
          ]},
          { name: 'exit', label: 'Exit /foo', redirectTo:  '/foo' }
        ]
      };

      return mc.Tabs.view(ctrl.tabsCtrl, tabOptions)
    }
  }
};

// affix
var affixPart = {
  controller: function () {
    this.affixCtrl = new mc.Affix.Controller({
      activeTab: data.currComponent
    });
  },

  view: function (ctrl) {
    var options = {
      list: [
        {name: 'Tabs', list: [
          {name: 'Dropdown'},
          {name: 'ButtonDropdown'}
        ]},
        {name: 'NavResponsive'},
        {name: 'Affix', list: [
          {name: '#modals-examples', label: 'Examples'},
          {name: '#modals-sizes', label: 'Sizes'}
        ]},
        {name: 'myname', label: 'myName'}
      ]
    };

    return mc.Affix.view(ctrl.affixCtrl, options);
  }
};

// Example containers
var exControls = {};

exControls.Tabs = {
  controller: function () {
    this.flavor = m.prop('tabs');
    this.financials = m.prop(false);
    this.personnel = m.prop(true);
    this.inventory = m.prop(false);
    this.dropdown = m.prop(false);
    this.action = m.prop(false);
    this.anotherAction = m.prop(true);
    this.separatedAction = m.prop(false);

    this.formCtrl = new mc.Form.Controller();
  },

  view: function (ctrl) {
    var viewOptions = ex[data.components[data.currComponent()].key].viewOptions;
    viewOptions.flavor = ctrl.flavor();
    setProp(viewOptions.tabs[0], 'isDisabled', ctrl.financials());
    setProp(viewOptions.tabs[1], 'isDisabled', ctrl.personnel());
    setProp(viewOptions.tabs[2], 'isDisabled', ctrl.inventory());
    setProp(viewOptions.tabs[3], 'isDisabled', ctrl.dropdown());
    setProp(viewOptions.tabs[3].dropdown[1], 'isDisabled', ctrl.action());
    setProp(viewOptions.tabs[3].dropdown[2], 'isDisabled', ctrl.anotherAction());
    setProp(viewOptions.tabs[3].dropdown[5], 'isDisabled', ctrl.separatedAction());

    var options = {
      labelCols: '.col-sm-2',
      controlCols: '.col-sm-10',
      heightSize: '.input-sm',
      horizontalSize: '.form-group-sm',
      controls: [
        {tag: 'select', label: 'Flavor', mprop: ctrl.flavor, autofocus: true, cols: '.col-md-3', options: [
          {value: 'tabs'},
          {value: 'pills'},
          {value: 'pills-stacked'},
          {value: 'nav'},
          {value: 'nav-right'}
        ]},
        {tag: 'checkbox', label: 'Disable', set: [
          {label: 'Financials', mprop: ctrl.financials},
          {label: 'Personnel', mprop: ctrl.personnel},
          {label: 'Inventory', mprop: ctrl.inventory},
          {label: 'Dropdown', mprop: ctrl.dropdown}
        ]},
        {tag: 'checkbox', label: 'Disable', set: [
          {label: 'Action', mprop: ctrl.action},
          {label: 'Another action', mprop: ctrl.anotherAction},
          {label: 'Separated action', mprop: ctrl.separatedAction}
        ]}
      ]
    };

    return mc.Form.view(this.formCtrl, options);

    function setProp (obj, prop, state) {
      delete obj[prop];
      if (state) { obj[prop] = state; }
    }
  }
};

exControls.NavResponsive = {
  controller: function () {
    this.flavor = m.prop('tabs');
    this.formCtrl = new mc.Form.Controller();
  },

  view: function (ctrl) {
    var viewOptions = ex[data.components[data.currComponent()].key].viewOptions;
    viewOptions.flavor = ctrl.flavor();

    var flavorComments = {
      'fixed-top': 'The navbar appears at top of page.',
      'fixed-bottom': 'The navbar appears at bottom of page.',
      'fixed-top-inverse': 'The navbar appears at top of page.',
      'fixed-bottom-inverse': 'The navbar appears at bottom of page.'
    };

    var options = {
      labelCols: '.col-sm-2',
      controlCols: '.col-sm-10',
      heightSize: '.input-sm',
      horizontalSize: '.form-group-sm',
      controls: [
        {tag: 'heading', text: 'The navbar layout adapts as the viewport width changes. ',
          small: 'Reduce the width to under 650px to see a significantly different look, ' +
          'with a dropdown button.', labelCols: '.col-sm-12', size: 'h3'
        },
        {tag: 'select', label: 'Flavor', mprop: ctrl.flavor, autofocus: true, controlCols: '.col-md-5', options: [
          {value: 'default'},
          {value: 'fixed-top'},
          {value: 'fixed-bottom'},
          {value: 'static-top'},
          {value: 'inverse'},
          {value: 'fixed-top-inverse'},
          {value: 'fixed-bottom-inverse'},
          {value: 'static-top-inverse'}
        ]},
        flavorComments[viewOptions.flavor] ? {tag: 'static', text: flavorComments[viewOptions.flavor]} : null,
        {tag: 'checkbox', label: 'Include', set: [
          {label: 'Tabs', mprop: data.tabs},
          {label: 'Search box', mprop: data.searchBox},
          {label: 'Text link', mprop: data.textLink},
          {label: 'Button', mprop: data.button}
        ]}
      ]
    };

    return mc.Form.view(this.formCtrl, options);

    function setProp (obj, prop, state) {
      delete obj[prop];
      if (state) { obj[prop] = state; }
    }
  }
};

exControls.Affix = {
  controller: function () {
    this.formCtrl = new mc.Form.Controller();
  },

  view: function (ctrl) {
    var options = {
      labelCols: '.col-sm-2',
      controlCols: '.col-sm-10',
      heightSize: '.input-sm',
      horizontalSize: '.form-group-sm',
      controls: [
        {tag: 'heading', text: 'The Affix sidebar maintains it position as the page is scrolled,',
          small: 'while indicating which section is currently displayed. ' +
          'It can also be clicked to jump to a particular section. '
          , labelCols: '.col-sm-12', size: 'h4'
        }
      ]
    };

    return mc.Form.view(this.formCtrl, options);
  }
};

// Examples
var ex = {};

ex.Tabs = {
  ctrlOptions: undefined,
  viewOptions: {
    flavor: 'tabs',
    tabs: [
      { name: 'financials', label: 'Financials' },
      { name: 'personnel', label: 'Personnel', isDisabled: true},
      { name: 'inventory', label: 'Inventory'},
      { name: 'dropdown', label: 'Dropdown', dropdown: [
        {label: 'Primary actions', type: 'header' },
        {name: 'action', label: 'Action'},
        {name: 'another action', label: 'Another action', isDisabled: true },
        {type: 'divider' },
        {label: 'Secondary actions', type: 'header' },
        {name: 'separated action', label: 'Separated action' }
      ]}
    ]
  },

  controller: function () {
    this.activeTab = m.prop('financials');
    this.tabsCtrl = new mc.Tabs.Controller({ activeTab: this.activeTab });
  },

  view: function (ctrl) {
    mc.McbDisplay.log = 'activeTab=' + ctrl.activeTab();
    return mc.Tabs.view(ctrl.tabsCtrl, ex.Tabs.viewOptions);
  }
};

ex.NavResponsive = {
  viewOptions: {
    flavor : 'default',
    brandLabel : 'Foo',
    brandUrl : '/afoo'
  },

  controller: function () {
    this.tabsCtrl = new mc.Tabs.Controller({
      activeTab: this.activeTab = m.prop('finance')
    });
    this.navSearchCtrl = new mc.NavSearch.Controller({
      searchValue: this.searchValue = m.prop('')
    });
    this.buttonCtrl = new mc.Button.Controller({
      onclick: function () { mc.McbDisplay.log += 'button clicked'; }
    });

    this.navCtrl = new mc.NavResponsive.Controller();
  },

  view: function (ctrl) {
    mc.McbDisplay.log = 'activeTab=' + ctrl.activeTab() +
      ', searchValue=' + ctrl.searchValue();

    return mc.NavResponsive.view(ctrl.navCtrl,
      mc.utils.extend(
        ex.NavResponsive.viewOptions,
        { viewComponents: function () {
            return [
              data.tabs() ? viewTabs() : null,
              data.searchBox() ? viewSearch() : null,
              data.textLink() ? mc.NavText.view({}, {
                flavor: 'nav', label: 'Signed in as',
                href: '#', linkLabel: 'eddyystop'
              }) : null,
              data.button() ? mc.Button.view(ctrl.buttonCtrl, {
                  flavor: 'nav-right', label: 'Sign in',
                  selectors: '.btn-warning.btn-sm'
                }
              ) : null
            ]
          }
        }
      )
    );

    function viewTabs () {
      var tabOptions = {
        flavor: 'nav',
        tabs: [
          { name: 'financials', label: 'Financials' },
          { name: 'personnel', label: 'Personnel' },
          { name: 'dropdown', label: 'Dropdown', dropdown: [
            {label: 'Primary actions', type: 'header' },
            {name: 'action', label: 'Action'},
            {name: 'another action', label: 'Another action', isDisabled: true },
            {type: 'divider' },
            {label: 'Secondary actions', type: 'header' },
            {name: 'separated action', label: 'Separated action' }
          ]}
        ]
      };

      return mc.Tabs.view(ctrl.tabsCtrl, tabOptions)
    }

    function viewSearch () {
      var options = {
        flavor: 'nav-right',
        label: 'Search',
        placeholder: 'Search',
        btnLabel: 'Submit'
      };

      return mc.NavSearch.view(ctrl.navSearchCtrl, options);
    }
  }
};

ex.Affix = {
  ctrlOptions: undefined,
  viewOptions: {
    id: 'affix1',
    list: [
      {name: '#js-overview', label: 'Overview', list: [
        {name: '#js-individual-compiled', label: 'Individual or compiled'},
        {name: '#js-data-attrs', label: 'Data attributes'}
      ]},
      {name: '#transitions', label: 'Transitions'},
      {name: '#modals', label: 'Modal', list: [
        {name: '#modals-examples', label: 'Examples'},
        {name: '#modals-sizes', label: 'Sizes'}
      ]}
    ]
  },

  controller: function () {
    this.affixCtrl = new mc.Affix.Controller({
      activeTab: this.activeTab = m.prop('#js-overview')
    });
  },

  view: function (ctrl) {
    return [
      m('.col-md-6', m.trust(getFile('affixText', './affixText.html'))),
      m('.col-md-3', mc.Affix.view(ctrl.affixCtrl, ex.Affix.viewOptions))
    ];
  }
};

// mcbDisplay
var componentPart = {
  controller: function () {
    this.exCtrls = {};
    this.exControlsCtrls = {};

    this.getExControlsCtrl = function (part) {
      if (!this.exControlsCtrls[part]) { this.exControlsCtrls[part] = new exControls[part].controller(); }
      return this.exControlsCtrls[part];
    }.bind(this);

    this.getExCtrl = function (part) {
      if (!this.exCtrls[part]) { this.exCtrls[part] = new ex[part].controller(ex[part].ctrlOptions || {}); }
      return this.exCtrls[part];
    }.bind(this);

    this.activeTab = m.prop('code');
    this.html = m.prop('');

    this.mcbDisplayCtrl = new mc.McbDisplay.Controller({
      activeTab: this.activeTab,
      html: this.html
    });
  },

  view: function (ctrl) {
    var options = {};
    var dataComponent = data.components[data.currComponent()];
    options.ex = dataComponent.key;
    options.doc = dataComponent.doc;
    options.heading = dataComponent.heading;
    options.scrollResult = dataComponent.scrollResult;


    var mcbDisplayOptions = {
      returnHtml: false,
      scrollResult: options.scrollResult,
      heading: options.heading,
      controls: exControls[options.ex].view(ctrl.getExControlsCtrl(options.ex)),
      options: m.trust(
        '<pre><code class="language-javascript">' +
        getOptions(options.ex || {}) +
        '</code></pre>'
      )
    };

    switch (ctrl.activeTab()) {
      case 'result':
        mcbDisplayOptions.scrollResults = false;
        mcbDisplayOptions.returnHtml = true;
        mcbDisplayOptions.tab =ex[options.ex].view(ctrl.getExCtrl(options.ex), ex[options.ex].viewOptions || {});
        mcbDisplayOptions.console = mc.McbDisplay.log;

        if (options.ex === 'Affix') {
          setTimeout(function () {
            ctrl.html(document.getElementById('affix1').parentNode.innerHTML);
          }, 45);
        }
        break;
      case 'code':
        mcbDisplayOptions.tab = m.trust(
          '<pre><code class="language-javascript">' +
          'var app = {' +
          '\n  controller: ' + ex[options.ex].controller.toString() + ',' +
          '\n\n  view: ' + ex[options.ex].view.toString() +
          '\n}' +
          '</code></pre>'
        );
        break;
      case 'html':
        mcbDisplayOptions.tab = m.trust(
          '<pre><code class="language-markup">' +
          'Viewing the live results tab updates this HTML.\n' +
          reformatHtml(ctrl.html()).replace(/</g, '&lt;') +
          '</code></pre>')
        ;
        break;
      case 'features':
        var str = getFile (options.ex, '../dist/componentsUi.js');
        console.log('..............getFile', typeof str);
        //var str = getFile (options.ex, '../componentsUi/' + options.doc);
        var i = str.indexOf('## Controller');
        if (i !== -1) { str = str.substr(0, i - 1); }
        mcbDisplayOptions.tab = m.trust((new Markdown.Converter()).makeHtml(str));
        break;
      case 'doc':
        str = getFile (options.ex, 'https://raw.githubusercontent.com/eddyystop/mithril-components-bootstrap/master/componentsUi/tabs/readme.md'  + options.doc);
        //str = getFile (options.ex, '../componentsUi/' + options.doc);
        i = str.indexOf('## Controller');
        if (i !== -1) { str = str.substr(i); }
        mcbDisplayOptions.tab = m.trust((new Markdown.Converter()).makeHtml(str));
        break;
      default:
        mcbDisplayOptions.tab = m('', ctrl.activeTab());
    }

    setTimeout(function () {
      Prism.highlightAll();
    }, 45);

    return mc.McbDisplay.view(ctrl.mcbDisplayCtrl, mcbDisplayOptions);

    function getOptions (example) {
      var r = '';
      if (ex[example].ctrlOptions !== undefined) {
        r += 'ex.' + example + '.ctrlOptions = ' +
          stringifyObject(ex[example].ctrlOptions, { indent: ' ', singleQuotes: false })
      }
      if (ex[example].viewOptions !== undefined) {
        r += (r ? ',\n' : '') + 'ex.' + example + '.viewOptions = ' +
          stringifyObject(ex[example].viewOptions, { indent: ' ', singleQuotes: false });
          //JSON.stringify(ex[example].viewOptions, undefined,2)
      }
      return r;
    }

    // low-tech reformatting of perfect HTML
    function reformatHtml (html) {
      if(!html) return html;

      // break up HTML into tags and text
      var hh = [],
        h = html;
      while (h) {
        var i = h.indexOf('<');
        if (i === -1) {
          hh.push(h);
          break;
        } else if (i > 0) {
          hh.push(h.substring(0, i));
          h = h.substring(i);
        } else {
          var j = h.indexOf('>');
          hh.push(h.substring(0, j + 1));
          h = h.substring(j + 1);
        }
      }

      // combine common elements together
      var hhh = [],
        k = 0,
        len = hh.length;
      while (k < len) {
        hhk = hh[k];

        // text
        if (hhk.charAt(0) !== '<' || hhk.substr(0, 2) === '</') {
          hhh.push(hhk);
          k += 1;
          continue;
        }

        // <li ...><a ...>text</a></li>
        if (k < len - 5 && hh[k].substr(0, 3) === '<li' &&
          hh[k+1].substr(0, 2) === '<a' && hh[k+2].charAt(0) !== '<' &&
          hh[k+3] === '</a>' && hh[k+4] === '</li>') {
          hhh.push('~' + hhk + hh[k+1] + hh[k+2] + hh[k+3] + hh[k+4]);
          k += 5;
          continue;
        }

        i = hhk.indexOf(' ');
        j = hhk.indexOf('>');
        var tag = hhk.substr(0, Math.min(i !== -1 ? i : 9999, j !== -1 ? j : 9999)),
          endTag = '</' + tag.substr(1) + '>';

        // <tag ...>text</tag>
        if (k < len - 3 && hh[k+1].charAt(0) !== '<' && hh[k+2] === endTag) {
          hhh.push('~' + hhk + hh[k+1] + hh[k+2]);
          k += 3;
          continue;
        }

        // <tag ...></tag>
        if (k < len - 2  && hh[k+1] === endTag) {
          hhh.push('~' + hhk + hh[k+1]);
          k += 2;
          continue;
        }

        hhh.push(hhk);
        k += 1;

      }

      // reassemble HTML
      var lead = 0,
        str = '';
      for (k = 0, len = hhh.length; k < len; k += 1) {
        var hhk = hhh[k];
        if (hhk.charAt(0) === '~') {
          str += '\n' + indent(lead + 1) + hhk.substr(1);
        } else if (hhk.charAt(0) !== '<') {
          str += '\n' + indent(lead) + hhk;
        }  else if (hhk.substr(0, 2) === '</') {
          str += '\n' + indent(lead) + hhk;
          lead -= 1;
        } else {
          lead += 1;
          str += '\n' + indent(lead) + hhk;
        }
      }

      return str;

      function indent (lead) { return new Array(lead * 3 - 2).join(' '); }
    }
  }
};

function getFile (key, path) {
  var file = basket.get(key);
  if (!file) {
    m.startComputation();
    basket.require({
      url: path,
      key: key,
      execute: false
    })
      .then(
      function () {
        m.endComputation();
      },
      function (err) { console.log('...getfile. err=', err); }
    );
    return 'Loading...';
  } else {
    return file.data;
  }
}

m.module(document.getElementById('myNav'), navPart);
m.module(document.getElementById('myAffix'), affixPart);
m.module(document.getElementById('myComponent'), componentPart);