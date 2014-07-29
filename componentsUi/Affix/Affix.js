/*global m:false */
// Dropdown ====================================================================
mc.Affix = {
  // options: <props> activeTab(), pinnedMarginTop <event> onclickTab
  Controller: function (options) {
    'use strict';
    options = options || {};
    this._activeTab = mc.utils.getValue(options.activeTab, '');
    this._pinnedMarginTop = mc.utils.getValue(options.pinnedMarginTop, 50); // 50 is height of navbar

    // directly updated by .view(). not idiomatic but clean.
    this._initialRender = true;
    this._affixEl = null;
    this._affixPinnedPast = null;
    this._affixClass = null;

    this.id = new Date().getTime();

    this._onclickTab = function (name, el) {
      if (name.charAt(0) !== '#') {
        el.preventDefault();
        el.stopPropagation();
      }

      mc._comm.lastDropdownId = -1; // will force closed any open dropdowns
      this._activeTab = name;
      if (typeof options.activeTab === 'function') { options.activeTab(name); }
      if (options.onclickTab) { options.onclickTab(name); }

      if (name.charAt(0) === '#') {
        document.getElementById(name.substr(1)).scrollIntoView(true);
        var body = document.getElementsByTagName('body')[0];
        body.scrollTop = body.scrollTop - this._pinnedMarginTop;
      }
    }.bind(this);

    this.setFirstVisibleTab = function (name) {
      this._activeTab = name;
    }
  },

  // options: <props> id, list[]
  // options.list[]: name, label, list[]
  view: function (ctrl, options) {
    'use strict';
    options = options || {};
    var hrefIds = [];

    if (ctrl._initialRender) {
      ctrl._initialRender = false;

      setTimeout(function () { // configure affix once the DOM is drawn
        ctrl._affixPinnedPast = ctrl._affixEl.getBoundingClientRect().top - ctrl._pinnedMarginTop;
        configureAffix();

        var scrollHandler  = mc.utils.debounce(function () {
          if (setFirstVisibleTab()) { m.redraw(); }
          configureAffix();
        }, 100);
        if (window.addEventListener) {
          window.addEventListener('scroll', scrollHandler);
          window.addEventListener('resize', scrollHandler);
        } else {
          window.attachEvent('scroll', scrollHandler);
          window.attachEvent('resize', scrollHandler);
        }
      }, 45);
    }

    ctrl._affixClass = ctrl._affixClass || 'mc-affix affix-top';
    return m((options.id ? '#' + options.id : ''), {
        className: ctrl._affixClass, // classes are updated in configureAffix
        config: function (el) { ctrl._affixEl = el; }
      },
      m('ul.nav.mc-affix-nav',
        options.list.map(function (item) {

          if (!item.list) { return viewItem(item); }

          var isActive = item.name === ctrl._activeTab ||
            item.list.some(function (item) {
              return item.name === ctrl._activeTab;
            });
          if (item.name.charAt(0) === '#') { hrefIds.push(item.name.substr(1)); }

          return m('li' + (isActive ? '.active' : ''), [
            m('a', {onclick: ctrl._onclickTab.bind(ctrl, item.name)}, item.label || item.name),
            m('ul.nav',
              item.list.map(function (item) { return viewItem(item); })
            )
          ]);
        })
      )
    );

    function viewItem (item) {
      if (item.name.charAt(0) === '#') { hrefIds.push(item.name.substr(1)); }

      return m('li' + (item.name === ctrl._activeTab ? '.active' : ''),
        m('a', {onclick: ctrl._onclickTab.bind(ctrl, item.name)}, item.label || item.name
        )
      );
    }

    function configureAffix () {
      var affixClass = window.scrollY <= ctrl._affixPinnedPast ? 'mc-affix affix-top' : 'mc-affix affix';
      if (ctrl._affixClass !== affixClass) {
        ctrl._affixClass = affixClass;
        ctrl._affixEl.setAttribute('class', affixClass);
      }
    }

    function setFirstVisibleTab () {
      for (var i = 0, len = hrefIds.length; i < len; i += 1) {
        var hrefIdEl = document.getElementById(hrefIds[i]);
        if (hrefIdEl && isElInViewport(hrefIdEl)) {
          if ('#' + hrefIds[i] === ctrl._activeTab) {
            return false;
          } else {
            ctrl.setFirstVisibleTab('#' + hrefIds[i]);
            return true;
          }
        }
      }
      return false;

      // http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
      function isElInViewport (el) {
        var rect = el.getBoundingClientRect(); // IE8+
        return rect.top >= 0 && rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth);
      }
    }
  }
};