/**
 * Standardize the result of (nested) m() calls in Mithril.js.
 * These can be either hand-written or converted from HTML using msx
 * @param {object} jsx is the m() result
 * @param {boolean} ifKeepFcns if attrs with fcn values are retained
 * @returns {object} normalized m()
 */

function normalizeJsx (jsx, ifKeepFcns) {
  //console.log('normalizeJsx tag=', jsx)
  if (typeof jsx === 'object' && jsx !== null) { // if really an object
    var outJsx = {};

    if ('tag' in jsx) {
      if (typeof jsx.tag !== 'string') console.log('----- UNEXPECTED tag is=', typeof jsx.tag, jsx.tag);
      outJsx.tag = tag(jsx.tag);
    } else {
      console.log('----- UNEXPECTED tag is missing');
    }

    if ('attrs' in jsx) {
      if (typeof jsx.attrs !== 'object' || jsx.attrs === null) console.log('----- UNEXPECTED attrs is=', typeof jsx.attrs, jsx.attrs);
      outJsx.attrs = attrs(jsx.attrs);
    } else {
      outJsx.attrs = {};
    }

    if ('children' in jsx) {
      if (!(typeof jsx.children === 'string'
        || Array.isArray(jsx.children)
        || (typeof jsx.children === 'object' && jsx.children !== null)
        || jsx.children === undefined
        )) console.log('----- UNEXPECTED children is=', typeof jsx.children, jsx.children);
      if (Array.isArray(jsx.children)) {
        outJsx.children = children(jsx.children);
      } else {
        outJsx.children = children([jsx.children]);
      }
    } else if (Array.isArray(jsx)) {
      return children(jsx);
    } else {
      outJsx.children = [];
    }

    return outJsx;
  } else {
    return jsx; //todo what if jsx is an array?
  }

  function tag (inTag) {
    return inTag;
  }

  function attrs (inAttrs) {
    var outAttrs = {};
    Object.keys(inAttrs).sort().map(function( key) {
      if (typeof inAttrs[key] !== 'function' || ifKeepFcns) {

        switch (key) {
          case 'class':
            outAttrs.className = inAttrs.class.trim();
            break;
          case 'style':
            outAttrs[key] = typeof inAttrs[key] === 'string' ? parseStyle(inAttrs[key]) : inAttrs[key];
            break;
          case 'href':
            var i = inAttrs[key].indexOf('?');
            outAttrs[key] = inAttrs[key].substr(i + 1);
            break;
          default:
            outAttrs[key] = inAttrs[key];
        }
      }
    });

    return outAttrs;
  }

  function parseStyle (str) {
    var re = /\s*(\S+?)\s*\:\s*(.+?)\s*;/g,
      obj = {},
      match;
    while (match = re.exec(str)) { obj[match[1]] = match[2]; }
    return obj;
  }

  function children (inChildren) {
    var outChildren = [];
    for (var i = 0, len = inChildren.length; i < len; i += 1) {
      var child = inChildren[i];
      if (child === undefined) { child = ''; }
      if (child !== null) { outChildren.push(normalizeJsx(child, ifKeepFcns)); }
    }

    return outChildren;
  }
}