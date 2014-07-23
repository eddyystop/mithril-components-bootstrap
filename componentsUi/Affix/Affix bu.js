/*global m:false */
// Dropdown ====================================================================
mc.Affix = {
  // options: <props> activeTab() <event> onclickTab
  Controller: function (options) {
    options = options || {};
    this._activeTab = mc.utils.getValue(options.activeTab, '');
    this._sections = mc.utils.getValue(options.sections, null);

    this._onclickTab = function (name, el) {
      if (name.charAt(0) !== '#') {
        el.preventDefault();
        el.stopPropagation();
      }

      mc._comm.lastDropdownId = -1; // will force closed any open dropdowns
      this._activeTab = name;
      if (typeof options.activeTab === 'function') { options.activeTab(name); }
      if (options.onclickTab) { options.onclickTab(name); }
    }.bind(this);

    this._setFirstVisibleTab = function (name) {
      this._activeTab = name;
    }
  },

  view: function (ctrl, options) {
    options = options || {};
    var hrefIds = [],
      scrollHandler, affixEl;

    if (ctrl._sections && ctrl._activeTab.charAt(0) === '#') {
      setTimeout(function () { // reposition list once the DOM is (re)drawn
        repositionAffix();

        setTimeout(function () { // reposition list as window scrolls
          scrollHandler  = mc.utils.debounce(function () {
            if (!setFirstVisibleTab()) { repositionAffix(); }
          }, 250);
          if (window.addEventListener) {
            window.addEventListener('scroll', scrollHandler);
            window.addEventListener('resize', scrollHandler);
          } else {
            window.attachEvent('scroll', scrollHandler);
            window.attachEvent('resize', scrollHandler);
          }
        }, 15);
      }, 15);
    }

    return m('.mc-affix.affix-top', {
        style: {'margin-top': '0px'}, // placeholder, it gets reset in setTimeout
        config: function (el) { affixEl = el; }
      },
      m('ul.nav.mc-affix-nav',
        options.list.map(function (item) {

          if (!item.list) { return viewItem(item); }

          var isActive = item.name === ctrl._activeTab ||
            item.list.some(function (item) {
              return item.name === ctrl._activeTab;
            });
          var attrs = {
            onclick: ctrl._onclickTab.bind(ctrl, item.name),
            href: item.name.charAt(0) === '#' ? item.name : ''
          };
          if (item.name.charAt(0) === '#') { hrefIds.push(item.name.substr(1)); }

          return m('li' + (isActive ? '.active' : ''), [
            m('a', attrs, item.label || item.name),
            m('ul.nav',
              item.list.map(function (item) { return viewItem(item); })
            )
          ]);
        })
      )
    );

    function viewItem (item) {
      var attrs = {
        onclick: ctrl._onclickTab.bind(ctrl, item.name),
        href: item.name.charAt(0) === '#' ? item.name : ''
      };
      if (item.name.charAt(0) === '#') { hrefIds.push(item.name.substr(1)); }

      return m('li' + (item.name === ctrl._activeTab ? '.active' : ''),
        m('a', attrs, item.label || item.name
        )
      );
    }

    function setFirstVisibleTab () {
      for (var i = 0, len = hrefIds.length; i < len; i += 1) {
        if (isElInViewport(document.getElementById(hrefIds[i]))) {
          ctrl._setFirstVisibleTab('#' + hrefIds[i]);
          m.redraw();
          return true;
        }
      }
      return false;
    }

    function repositionAffix () {
      var sections = document.getElementById(ctrl._sections);
      if (sections) {
        affixEl.style.marginTop = Math.max(-sections.getBoundingClientRect().top, 0) + 'px'
      }
    }

    // http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
    function isElInViewport (el) {
      var rect = el.getBoundingClientRect(); // IE8+
      return rect.top >= 0 && rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth);
    }
  }
};