/*global m:false */
// McbDisplay ===============================================================
mc.McbDisplay = {
  log: '',

  Controller: function (options) {
    this.activeTab = options.activeTab;
    this.html = options.html;
    this.tabsCtrl = new mc.Tabs.Controller({ activeTab: this.activeTab });

    this.setHtml = function (html) {
      this.html(html);
    }.bind(this);
  },

  view: function (ctrl, options) {
    var optionsTab = {
      flavor: 'tabs',
      tabs: [
        { name: 'features', label: 'Features'},
        { name: 'result', label: 'Live result' },
        { name: 'code', label: 'Controller & view' },
        { name: 'html', label: 'HTML'},
        { name: 'doc', label: 'Docs' }
      ]
    };

    return m('.bs-docs-section.mc-mcb-display', [
      m('.row.mc-mcb-display-header',
        m('h3', options.heading)
      ),
      m('.row', [
        m('.col-md-8', [
            m('.row.mc-mcb-display-controls', options.controls),
            m('.row.mc-mcb-display-tabs', [
              m('.mc-mcb-display-tab',
                mc.Tabs.view(ctrl.tabsCtrl, optionsTab)
              ),
              m('.row.mc-mcb-display-results' + (options.scrollResult ? '.scroll' : ''), displayTab())
            ])
          ]
        ),
        m('.col-md-4', [
          m('.row.mc-mcb-display-console', [
            m('h4', 'Console:'),
            options.console
          ]),
          m('.row.mc-mcb-display-options',
            options.options
          )
        ])
      ])
    ]);

    function displayTab () {
      if (options.returnHtml) {
        return m('', {config: function (el) { ctrl.setHtml(el.innerHTML); }}, options.tab || '');
      } else {
        return options.tab;
      }
    }
  }
};