/** @jsx m */
var stringifyObject = require('stringify-object');

function test(text, condition) {
  console.log(text);
	try {
    if (!condition()) throw new Error}
	catch (e) {
    console.error(e);
    test.failures.push('..' + text)
  }
}
test.total = 0;
test.failures = [];

test.print = function(print) {
  print('===== test summary =====');
	for (var i = 0; i < test.failures.length; i += 1) {
		print(test.failures[i].toString())
	}
	print("tests: " + test.total + "\nfailures: " + test.failures.length + '\n=== tests ' + (test.failures.length ? 'FAILED' : 'successful') + ' ===');

	if (test.failures.length > 0) {
		throw new Error(test.failures.length + " tests did not pass")
	}
};

test.result = function (text, r) {
  test.total += 1;
  console.log('..' + text + (r ? '' : ' FAILED'));
  return r;
};

test.compareRenders = function (text, source, target) {
  test.total += 1;
  var r = JSON.stringify(normalizeJsx(source)) === JSON.stringify(normalizeJsx(target));
  console.log('..' + text + (r ? '' : ' FAILED'));

  if (!r) {
    test.failures.push(text);
    test.stringify(text + ' source', normalizeJsx(source));
    test.stringify(text + ' target', normalizeJsx(target));
  }
  return r;
};

test.stringify = function (text, obj) {
  console.log('\n' + text + ' ==================================================\n' +
    stringifyObject(obj, { indent: '  ', singleQuotes: false }));
}
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
Mithril = m = new function app(window) {
	var type = {}.toString
	var parser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g, attrParser = /\[(.+?)(?:=("|'|)(.*?)\2)?\]/
	
	function m() {
		var args = arguments
		var hasAttrs = type.call(args[1]) == "[object Object]" && !("tag" in args[1]) && !("subtree" in args[1])
		var attrs = hasAttrs ? args[1] : {}
		var classAttrName = "class" in attrs ? "class" : "className"
		var cell = {tag: "div", attrs: {}}
		var match, classes = []
		while (match = parser.exec(args[0])) {
			if (match[1] == "") cell.tag = match[2]
			else if (match[1] == "#") cell.attrs.id = match[2]
			else if (match[1] == ".") classes.push(match[2])
			else if (match[3][0] == "[") {
				var pair = attrParser.exec(match[3])
				cell.attrs[pair[1]] = pair[3] || (pair[2] ? "" :true)
			}
		}
		if (classes.length > 0) cell.attrs[classAttrName] = classes.join(" ")
		
		cell.children = hasAttrs ? args[2] : args[1]
		
		for (var attrName in attrs) {
			if (attrName == classAttrName) cell.attrs[attrName] = (cell.attrs[attrName] || "") + " " + attrs[attrName]
			else cell.attrs[attrName] = attrs[attrName]
		}
		return cell
	}
	function build(parentElement, parentTag, parentCache, parentIndex, data, cached, shouldReattach, index, editable, namespace, configs) {
		if (data === null || data === undefined) data = ""
		if (data.subtree === "retain") return cached

		var cachedType = type.call(cached), dataType = type.call(data)
		if (cachedType != dataType) {
			if (cached !== null && cached !== undefined) {
				if (parentCache && parentCache.nodes) {
					var offset = index - parentIndex
					var end = offset + (dataType == "[object Array]" ? data : cached.nodes).length
					clear(parentCache.nodes.slice(offset, end), parentCache.slice(offset, end))
				}
				else clear(cached.nodes, cached)
			}
			cached = new data.constructor
			cached.nodes = []
		}

		if (dataType == "[object Array]") {
			data = flatten(data)
			var nodes = [], intact = cached.length === data.length, subArrayCount = 0
			
			var DELETION = 1, INSERTION = 2 , MOVE = 3
			var existing = {}, unkeyed = [], shouldMaintainIdentities = false
			for (var i = 0; i < cached.length; i++) {
				if (cached[i] && cached[i].attrs && cached[i].attrs.key !== undefined) {
					shouldMaintainIdentities = true
					existing[cached[i].attrs.key] = {action: DELETION, index: i}
				}
			}
			if (shouldMaintainIdentities) {
				for (var i = 0; i < data.length; i++) {
					if (data[i] && data[i].attrs) {
						if (data[i].attrs.key !== undefined) {
							var key = data[i].attrs.key
							if (!existing[key]) existing[key] = {action: INSERTION, index: i}
							else existing[key] = {action: MOVE, index: i, from: existing[key].index, element: parentElement.childNodes[existing[key].index]}
						}
						else unkeyed.push({index: i, element: parentElement.childNodes[i]})
					}
				}
				var actions = Object.keys(existing).map(function(key) {return existing[key]})
				var changes = actions.sort(function(a, b) {return a.action - b.action || a.index - b.index})
				var newCached = cached.slice()
				
				for (var i = 0, change; change = changes[i]; i++) {
					if (change.action == DELETION) {
						clear(cached[change.index].nodes, cached[change.index])
						newCached.splice(change.index, 1)
					}
					if (change.action == INSERTION) {
						var dummy = window.document.createElement("div")
						dummy.key = data[change.index].attrs.key
						parentElement.insertBefore(dummy, parentElement.childNodes[change.index])
						newCached.splice(change.index, 0, {attrs: {key: data[change.index].attrs.key}, nodes: [dummy]})
					}
					
					if (change.action == MOVE) {
						if (parentElement.childNodes[change.index] !== change.element) {
							parentElement.insertBefore(change.element, parentElement.childNodes[change.index])
						}
						newCached[change.index] = cached[change.from]
					}
				}
				for (var i = 0; i < unkeyed.length; i++) {
					var change = unkeyed[i]
					parentElement.insertBefore(change.element, parentElement.childNodes[change.index])
					newCached[change.index] = cached[change.index]
				}
				cached = newCached
				cached.nodes = []
				for (var i = 0, child; child = parentElement.childNodes[i]; i++) cached.nodes.push(child)
			}
			
			for (var i = 0, cacheCount = 0; i < data.length; i++) {
				var item = build(parentElement, parentTag, cached, index, data[i], cached[cacheCount], shouldReattach, index + subArrayCount || subArrayCount, editable, namespace, configs)
				if (item === undefined) continue
				if (!item.nodes.intact) intact = false
				var isArray = item instanceof Array
				subArrayCount += isArray ? item.length : 1
				cached[cacheCount++] = item
			}
			if (!intact) {
				for (var i = 0; i < data.length; i++) {
					if (cached[i] !== undefined) nodes = nodes.concat(cached[i].nodes)
				}
				for (var i = 0, node; node = cached.nodes[i]; i++) {
					if (node.parentNode !== null && nodes.indexOf(node) < 0) node.parentNode.removeChild(node)
				}
				for (var i = cached.nodes.length, node; node = nodes[i]; i++) {
					if (node.parentNode === null) parentElement.appendChild(node)
				}
				if (data.length < cached.length) cached.length = data.length
				cached.nodes = nodes
			}
			
		}
		else if (dataType == "[object Object]") {
			if (data.tag != cached.tag || Object.keys(data.attrs).join() != Object.keys(cached.attrs).join() || data.attrs.id != cached.attrs.id) {
				clear(cached.nodes)
				if (cached.configContext && typeof cached.configContext.onunload == "function") cached.configContext.onunload()
			}
			if (typeof data.tag != "string") return

			var node, isNew = cached.nodes.length === 0
			if (data.attrs.xmlns) namespace = data.attrs.xmlns
			else if (data.tag === "svg") namespace = "http://www.w3.org/2000/svg"
			if (isNew) {
				node = namespace === undefined ? window.document.createElement(data.tag) : window.document.createElementNS(namespace, data.tag)
				cached = {
					tag: data.tag,
					//process children before attrs so that select.value works correctly
					children: data.children !== undefined ? build(node, data.tag, undefined, undefined, data.children, cached.children, true, 0, data.attrs.contenteditable ? node : editable, namespace, configs) : undefined,
					attrs: setAttributes(node, data.tag, data.attrs, {}, namespace),
					nodes: [node]
				}
				parentElement.insertBefore(node, parentElement.childNodes[index] || null)
			}
			else {
				node = cached.nodes[0]
				setAttributes(node, data.tag, data.attrs, cached.attrs, namespace)
				cached.children = build(node, data.tag, undefined, undefined, data.children, cached.children, false, 0, data.attrs.contenteditable ? node : editable, namespace, configs)
				cached.nodes.intact = true
				if (shouldReattach === true) parentElement.insertBefore(node, parentElement.childNodes[index] || null)
			}
			if (type.call(data.attrs["config"]) == "[object Function]") {
				configs.push(data.attrs["config"].bind(window, node, !isNew, cached.configContext = cached.configContext || {}, cached))
			}
		}
		else {
			var nodes
			if (cached.nodes.length === 0) {
				if (data.$trusted) {
					nodes = injectHTML(parentElement, index, data)
				}
				else {
					nodes = [window.document.createTextNode(data)]
					parentElement.insertBefore(nodes[0], parentElement.childNodes[index] || null)
				}
				cached = "string number boolean".indexOf(typeof data) > -1 ? new data.constructor(data) : data
				cached.nodes = nodes
			}
			else if (cached.valueOf() !== data.valueOf() || shouldReattach === true) {
				nodes = cached.nodes
				if (!editable || editable !== window.document.activeElement) {
					if (data.$trusted) {
						clear(nodes, cached)
						nodes = injectHTML(parentElement, index, data)
					}
					else {
						if (parentTag === "textarea") parentElement.value = data
						else if (editable) editable.innerHTML = data
						else {
							if (nodes[0].nodeType == 1 || nodes.length > 1) { //was a trusted string
								clear(cached.nodes, cached)
								nodes = [window.document.createTextNode(data)]
							}
							parentElement.insertBefore(nodes[0], parentElement.childNodes[index] || null)
							nodes[0].nodeValue = data
						}
					}
				}
				cached = new data.constructor(data)
				cached.nodes = nodes
			}
			else cached.nodes.intact = true
		}

		return cached
	}
	function setAttributes(node, tag, dataAttrs, cachedAttrs, namespace) {
		var groups = {}
		for (var attrName in dataAttrs) {
			var dataAttr = dataAttrs[attrName]
			var cachedAttr = cachedAttrs[attrName]
			if (!(attrName in cachedAttrs) || (cachedAttr !== dataAttr) || node === window.document.activeElement) {
				cachedAttrs[attrName] = dataAttr
				if (attrName === "config") continue
				else if (typeof dataAttr == "function" && attrName.indexOf("on") == 0) {
					node[attrName] = autoredraw(dataAttr, node)
				}
				else if (attrName === "style" && typeof dataAttr == "object") {
					for (var rule in dataAttr) {
						if (cachedAttr === undefined || cachedAttr[rule] !== dataAttr[rule]) node.style[rule] = dataAttr[rule]
					}
					for (var rule in cachedAttr) {
						if (!(rule in dataAttr)) node.style[rule] = ""
					}
				}
				else if (namespace !== undefined) {
					if (attrName === "href") node.setAttributeNS("http://www.w3.org/1999/xlink", "href", dataAttr)
					else if (attrName === "className") node.setAttribute("class", dataAttr)
					else node.setAttribute(attrName, dataAttr)
				}
				else if (attrName === "value" && tag === "input") {
					if (node.value !== dataAttr) node.value = dataAttr
				}
				else if (attrName in node && !(attrName == "list" || attrName == "style")) {
					node[attrName] = dataAttr
				}
				else node.setAttribute(attrName, dataAttr)
			}
		}
		return cachedAttrs
	}
	function clear(nodes, cached) {
		for (var i = nodes.length - 1; i > -1; i--) {
			if (nodes[i] && nodes[i].parentNode) {
				nodes[i].parentNode.removeChild(nodes[i])
				cached = [].concat(cached)
				if (cached[i]) unload(cached[i])
			}
		}
		if (nodes.length != 0) nodes.length = 0
	}
	function unload(cached) {
		if (cached.configContext && typeof cached.configContext.onunload == "function") cached.configContext.onunload()
		if (cached.children) {
			if (cached.children instanceof Array) for (var i = 0; i < cached.children.length; i++) unload(cached.children[i])
			else if (cached.children.tag) unload(cached.children)
		}
	}
	function injectHTML(parentElement, index, data) {
		var nextSibling = parentElement.childNodes[index]
		if (nextSibling) {
			var isElement = nextSibling.nodeType != 1
			var placeholder = window.document.createElement("span")
			if (isElement) {
				parentElement.insertBefore(placeholder, nextSibling)
				placeholder.insertAdjacentHTML("beforebegin", data)
				parentElement.removeChild(placeholder)
			}
			else nextSibling.insertAdjacentHTML("beforebegin", data)
		}
		else parentElement.insertAdjacentHTML("beforeend", data)
		var nodes = []
		while (parentElement.childNodes[index] !== nextSibling) {
			nodes.push(parentElement.childNodes[index])
			index++
		}
		return nodes
	}
	function flatten(data) {
		var flattened = []
		for (var i = 0; i < data.length; i++) {
			var item = data[i]
			if (item instanceof Array) flattened.push.apply(flattened, flatten(item))
			else flattened.push(item)
		}
		return flattened
	}
	function autoredraw(callback, object, group) {
		return function(e) {
			e = e || event
			m.startComputation()
			try {return callback.call(object, e)}
			finally {
				if (!lastRedrawId) lastRedrawId = -1;
				m.endComputation()
			}
		}
	}

	var html
	var documentNode = {
		insertAdjacentHTML: function(_, data) {
			window.document.write(data)
			window.document.close()
		},
		appendChild: function(node) {
			if (html === undefined) html = window.document.createElement("html")
			if (node.nodeName == "HTML") html = node
			else html.appendChild(node)
			if (window.document.documentElement && window.document.documentElement !== html) {
				window.document.replaceChild(html, window.document.documentElement)
			}
			else window.document.appendChild(html)
		},
		insertBefore: function(node) {
			this.appendChild(node)
		},
		childNodes: []
	}
	var nodeCache = [], cellCache = {}
	m.render = function(root, cell) {
		var configs = []
		if (!root) throw new Error("Please ensure the DOM element exists before rendering a template into it.")
		var id = getCellCacheKey(root)
		var node = root == window.document || root == window.document.documentElement ? documentNode : root
		if (cellCache[id] === undefined) clear(node.childNodes)
		cellCache[id] = build(node, null, undefined, undefined, cell, cellCache[id], false, 0, null, undefined, configs)
		for (var i = 0; i < configs.length; i++) configs[i]()
	}
	function getCellCacheKey(element) {
		var index = nodeCache.indexOf(element)
		return index < 0 ? nodeCache.push(element) - 1 : index
	}

	m.trust = function(value) {
		value = new String(value)
		value.$trusted = true
		return value
	}

	var roots = [], modules = [], controllers = [], lastRedrawId = 0, computePostRedrawHook = null
	m.module = function(root, module) {
		var index = roots.indexOf(root)
		if (index < 0) index = roots.length
		var isPrevented = false
		if (controllers[index] && typeof controllers[index].onunload == "function") {
			var event = {
				preventDefault: function() {isPrevented = true}
			}
			controllers[index].onunload(event)
		}
		if (!isPrevented) {
			m.startComputation()
			roots[index] = root
			modules[index] = module
			controllers[index] = new module.controller
			m.endComputation()
		}
	}
	m.redraw = function() {
		var cancel = window.cancelAnimationFrame || window.clearTimeout
		var defer = window.requestAnimationFrame || window.setTimeout
		if (lastRedrawId) {
			cancel(lastRedrawId)
			lastRedrawId = defer(redraw, 0)
		}
		else {
			redraw()
			lastRedrawId = defer(function() {lastRedrawId = null}, 0)
		}
	}
	function redraw() {
		for (var i = 0; i < roots.length; i++) {
			if (controllers[i]) m.render(roots[i], modules[i].view(controllers[i]))
		}
		if (computePostRedrawHook) {
			computePostRedrawHook()
			computePostRedrawHook = null
		}
		lastRedrawId = null
	}

	var pendingRequests = 0
	m.startComputation = function() {pendingRequests++}
	m.endComputation = function() {
		pendingRequests = Math.max(pendingRequests - 1, 0)
		if (pendingRequests == 0) m.redraw()
	}

	m.withAttr = function(prop, withAttrCallback) {
		return function(e) {
			e = e || event
			withAttrCallback(prop in e.currentTarget ? e.currentTarget[prop] : e.currentTarget.getAttribute(prop))
		}
	}

	//routing
	var modes = {pathname: "", hash: "#", search: "?"}
	var redirect = function() {}, routeParams = {}, currentRoute
	m.route = function() {
		if (arguments.length === 0) return currentRoute
		else if (arguments.length === 3 && typeof arguments[1] == "string") {
			var root = arguments[0], defaultRoute = arguments[1], router = arguments[2]
			redirect = function(source) {
				var path = currentRoute = normalizeRoute(source)
				if (!routeByValue(root, router, path)) {
					m.route(defaultRoute, true)
				}
			}
			var listener = m.route.mode == "hash" ? "onhashchange" : "onpopstate"
			window[listener] = function() {
				if (currentRoute != normalizeRoute(window.location[m.route.mode])) {
					redirect(window.location[m.route.mode])
				}
			}
			computePostRedrawHook = setScroll
			window[listener]()
		}
		else if (arguments[0].addEventListener) {
			var element = arguments[0]
			var isInitialized = arguments[1]
			if (element.href.indexOf(modes[m.route.mode]) < 0) {
				element.href = window.location.pathname + modes[m.route.mode] + element.pathname
			}
			if (!isInitialized) {
				element.removeEventListener("click", routeUnobtrusive)
				element.addEventListener("click", routeUnobtrusive)
			}
		}
		else if (typeof arguments[0] == "string") {
			currentRoute = arguments[0]
			var querystring = typeof arguments[1] == "object" ? buildQueryString(arguments[1]) : null
			if (querystring) currentRoute += (currentRoute.indexOf("?") === -1 ? "?" : "&") + querystring

			var shouldReplaceHistoryEntry = (arguments.length == 3 ? arguments[2] : arguments[1]) === true
			
			if (window.history.pushState) {
				computePostRedrawHook = function() {
					window.history[shouldReplaceHistoryEntry ? "replaceState" : "pushState"](null, window.document.title, modes[m.route.mode] + currentRoute)
					setScroll()
				}
				redirect(modes[m.route.mode] + currentRoute)
			}
			else window.location[m.route.mode] = currentRoute
		}
	}
	m.route.param = function(key) {return routeParams[key]}
	m.route.mode = "search"
	function normalizeRoute(route) {return route.slice(modes[m.route.mode].length)}
	function routeByValue(root, router, path) {
		routeParams = {}

		var queryStart = path.indexOf("?")
		if (queryStart !== -1) {
			routeParams = parseQueryString(path.substr(queryStart + 1, path.length))
			path = path.substr(0, queryStart)
		}

		for (var route in router) {
			if (route == path) {
				reset(root)
				m.module(root, router[route])
				return true
			}

			var matcher = new RegExp("^" + route.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$")

			if (matcher.test(path)) {
				reset(root)
				path.replace(matcher, function() {
					var keys = route.match(/:[^\/]+/g) || []
					var values = [].slice.call(arguments, 1, -2)
					for (var i = 0; i < keys.length; i++) routeParams[keys[i].replace(/:|\./g, "")] = decodeSpace(values[i])
					m.module(root, router[route])
				})
				return true
			}
		}
	}
	function reset(root) {
		var cacheKey = getCellCacheKey(root)
		clear(root.childNodes, cellCache[cacheKey])
		cellCache[cacheKey] = undefined
	}
	function routeUnobtrusive(e) {
		e = e || event
		if (e.ctrlKey || e.metaKey || e.which == 2) return
		e.preventDefault()
		m.route(e.currentTarget[m.route.mode].slice(modes[m.route.mode].length))
	}
	function setScroll() {
		if (m.route.mode != "hash" && window.location.hash) window.location.hash = window.location.hash
		else window.scrollTo(0, 0)
	}
	function buildQueryString(object, prefix) {
		var str = []
		for(var prop in object) {
			var key = prefix ? prefix + "[" + prop + "]" : prop, value = object[prop]
			str.push(typeof value == "object" ? buildQueryString(value, key) : encodeURIComponent(key) + "=" + encodeURIComponent(value))
		}
		return str.join("&")
	}
	function parseQueryString(str) {
		var pairs = str.split("&"), params = {}
		for (var i = 0; i < pairs.length; i++) {
			var pair = pairs[i].split("=")
			params[decodeSpace(pair[0])] = pair[1] ? decodeSpace(pair[1]) : (pair.length === 1 ? true : "")
		}
		return params
	}
	function decodeSpace(string) {
		return decodeURIComponent(string.replace(/\+/g, " "))
	}

	//model
	m.prop = function(store) {
		var prop = function() {
			if (arguments.length) store = arguments[0]
			return store
		}
		prop.toJSON = function() {
			return store
		}
		return prop
	}

	var none = {}
	m.deferred = function() {
		var resolvers = [], rejecters = [], resolved = none, rejected = none, promise = m.prop()
		var object = {
			resolve: function(value) {
				if (resolved === none) promise(resolved = value)
				for (var i = 0; i < resolvers.length; i++) resolvers[i](value)
				resolvers.length = rejecters.length = 0
			},
			reject: function(value) {
				if (rejected === none) rejected = value
				for (var i = 0; i < rejecters.length; i++) rejecters[i](value)
				resolvers.length = rejecters.length = 0
			},
			promise: promise
		}
		object.promise.resolvers = resolvers
		object.promise.then = function(success, error) {
			var next = m.deferred()
			if (!success) success = identity
			if (!error) error = identity
			function callback(method, callback) {
				return function(value) {
					try {
						var result = callback(value)
						if (result && typeof result.then == "function") result.then(next[method], error)
						else next[method](result !== undefined ? result : value)
					}
					catch (e) {
						if (e instanceof Error && e.constructor !== Error) throw e
						else next.reject(e)
					}
				}
			}
			if (resolved !== none) callback("resolve", success)(resolved)
			else if (rejected !== none) callback("reject", error)(rejected)
			else {
				resolvers.push(callback("resolve", success))
				rejecters.push(callback("reject", error))
			}
			return next.promise
		}
		return object
	}
	m.sync = function(args) {
		var method = "resolve"
		function synchronizer(pos, resolved) {
			return function(value) {
				results[pos] = value
				if (!resolved) method = "reject"
				if (--outstanding == 0) {
					deferred.promise(results)
					deferred[method](results)
				}
				return value
			}
		}

		var deferred = m.deferred()
		var outstanding = args.length
		var results = new Array(outstanding)
		for (var i = 0; i < args.length; i++) {
			args[i].then(synchronizer(i, true), synchronizer(i, false))
		}
		return deferred.promise
	}
	function identity(value) {return value}

	function ajax(options) {
		var xhr = new window.XMLHttpRequest
		xhr.open(options.method, options.url, true, options.user, options.password)
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhr.status >= 200 && xhr.status < 300) options.onload({type: "load", target: xhr})
				else options.onerror({type: "error", target: xhr})
			}
		}
		if (options.serialize == JSON.stringify && options.method != "GET") {
			xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
		}
		if (typeof options.config == "function") {
			var maybeXhr = options.config(xhr, options)
			if (maybeXhr !== undefined) xhr = maybeXhr
		}
		xhr.send(options.method == "GET" ? "" : options.data)
		return xhr
	}
	function bindData(xhrOptions, data, serialize) {
		if (data && Object.keys(data).length > 0) {
			if (xhrOptions.method == "GET") {
				xhrOptions.url = xhrOptions.url + (xhrOptions.url.indexOf("?") < 0 ? "?" : "&") + buildQueryString(data)
			}
			else xhrOptions.data = serialize(data)
		}
		return xhrOptions
	}
	function parameterizeUrl(url, data) {
		var tokens = url.match(/:[a-z]\w+/gi)
		if (tokens && data) {
			for (var i = 0; i < tokens.length; i++) {
				var key = tokens[i].slice(1)
				url = url.replace(tokens[i], data[key])
				delete data[key]
			}
		}
		return url
	}

	m.request = function(xhrOptions) {
		if (xhrOptions.background !== true) m.startComputation()
		var deferred = m.deferred()
		var serialize = xhrOptions.serialize = xhrOptions.serialize || JSON.stringify
		var deserialize = xhrOptions.deserialize = xhrOptions.deserialize || JSON.parse
		var extract = xhrOptions.extract || function(xhr) {
			return xhr.responseText.length === 0 && deserialize === JSON.parse ? null : xhr.responseText
		}
		xhrOptions.url = parameterizeUrl(xhrOptions.url, xhrOptions.data)
		xhrOptions = bindData(xhrOptions, xhrOptions.data, serialize)
		xhrOptions.onload = xhrOptions.onerror = function(e) {
			try {
				e = e || event
				var unwrap = (e.type == "load" ? xhrOptions.unwrapSuccess : xhrOptions.unwrapError) || identity
				var response = unwrap(deserialize(extract(e.target, xhrOptions)))
				if (e.type == "load") {
					if (response instanceof Array && xhrOptions.type) {
						for (var i = 0; i < response.length; i++) response[i] = new xhrOptions.type(response[i])
					}
					else if (xhrOptions.type) response = new xhrOptions.type(response)
				}
				deferred[e.type == "load" ? "resolve" : "reject"](response)
			}
			catch (e) {
				if (e instanceof SyntaxError) throw new SyntaxError("Could not parse HTTP response. See http://lhorie.github.io/mithril/mithril.request.html#using-variable-data-formats")
				else if (e instanceof Error && e.constructor !== Error) throw e
				else deferred.reject(e)
			}
			if (xhrOptions.background !== true) m.endComputation()
		}
		ajax(xhrOptions)
		return deferred.promise
	}

	//testing API
	m.deps = function(mock) {return window = mock}
	//for internal testing only, do not use `m.deps.factory`
	m.deps.factory = app

	return m
}(typeof window != "undefined" ? window : {})

if (typeof module != "undefined" && module !== null) module.exports = m
if (typeof define == "function" && define.amd) define(function() {return m})

;;;

/*global m:false */
var mc = mc || {};
mc._comm = {
  lastDropdownId: -1 // id of last dropdown clicked
};
mc.utils = mc.utils || {};

// extend an object with others
mc.utils.extend = function (to /* arguments */) {
  Array.prototype.slice.call(arguments, 1).forEach(function (obj) {
    if (typeof obj === 'object') {
      Object.keys(obj).forEach(function (key) { to[key] = obj[key]; });
    }
  });
  return to;
};

// get value from possible m.prop()
mc.utils.getValue = function (param, defaultValue) {
  var value = typeof param === 'function' ? param() : param;
  return value === undefined ? defaultValue : value;
};

// http://davidwalsh.name/javascript-debounce-function
mc.utils.debounce = function (func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
    if (immediate && !timeout) func.apply(context, args);
  };
};
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

    return m('.mc-affix', {
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
/*global m:false */

// Button ======================================================================

mc.Button = {
  // options: <events> onclick
  Controller: function (options) {
    this.onclick = function (el) {
      if (options.onclick) { options.onclick(); }
    }.bind(this);
  },

  // options: <props> flavor, selectors, label, href, inputType
  // selectors: .btn-default -primary -success -info -warning -danger -link
  // selectors: .btn-lg -sm -xs
  // selectors: .btn-block
  // selectors: .active .disabled
  view: function (ctrl, options) {
    options = options || {};
    var flavors = {
      default: '.btn.btn-default',
      nav: '.btn.navbar-btn', // not for when button is in a <form>
      'nav-right': '.btn.navbar-btn.navbar-right' // not for when button is in a <form>
      },
      flavor = flavors[options.flavor] || flavors.default;

    if (options.href) {
      return m('a' + flavor + (options.selectors || ''),
        {href: options.href, config: m.route()}, options.label || ''
      );
    } else {
      if (options.inputType) {
        return m('input[type=' + options.inputType + ']' + flavor + (options.selectors || ''),
          {onclick: ctrl.onclick, value: options.label || ''}
        );
      } else { // recommended by Bootstrap docs
        return m('button[type=button]' + flavor + (options.selectors || ''),
          {onclick: ctrl.onclick}, options.label || ''
        );
      }
    }
  }
};
/*global m:false */
// ButtonDropdown ==============================================================
// <dep> mc.Dropdown
mc.ButtonDropdown = {
  // options: see mc.Dropdown
  Controller: function (options) {
    this._dropdownCtrl = new mc.Dropdown.Controller(options);
  },

  // options: see mc.Dropdown
  view: function (ctrl, options) {
    return mc.Dropdown.view(ctrl._dropdownCtrl, options);
  }
};
/*global m:false */
// Dropdown ====================================================================
mc.Dropdown = {
  // options: <props> tabName() <event> onclickTab
  Controller: function (options) {
    options = options || {};
    this._isDropdownOpen = false;
    this._dropdownId = 0;

    this._onclickTab = function (name) {
      this._isDropdownOpen = false;
      mc._comm.lastDropdownId = -1; // will force closed any open dropdowns
      if (typeof options.tabName === 'function') { options.tabName(name); }
      if (options.onclickTab) { options.onclickTab(name); }
    }.bind(this);

    this._onclickDropdown = function () {
      this._isDropdownOpen = !this._isDropdownOpen;
      mc._comm.lastDropdownId = this._dropdownId = Date.now();
    }.bind(this);

    this.closeDropdown = function () {
      this._isDropdownOpen = false;
    }.bind(this);
  },

  // ctrl: <props> _isDropdownOpen, _dropdownId <events> _onclickTab, onClickDropdown
  // options: flavor, label, isDisabled, isActive, isSplit, alignRight, selectors, dropdown[]
  // selectors: .btn-default -primary -success -info -warning -danger -link
  // selectors: .btn-lg -sm -xs
  // selectors: .btn-block
  // selectors: .active .disabled
  view: function (ctrl, options) {
    options = options || {};
    var flavors = {
        _tabs: '.dropdown',
        dropdown: '.dropdown',
        btn: '.btn-group',
        'btn-up': '.btn-group.dropup'
      },
      optFlavor = options.flavor,
      flavor = (flavors[optFlavor] || flavors.dropdown),
      selectors = options.selectors || '',
      label = (options.label || options.name || '') + ' ';

    if (ctrl._dropdownId !== mc._comm.lastDropdownId) { ctrl.closeDropdown(); }
    if (!selectors && (optFlavor === 'btn' || optFlavor === 'btn-up')) { selectors = '.btn-primary'; }

    return optFlavor === '_tabs' ? tabs() : (options.isSplit ? splitButton() : button());

    function tabs () {
      return m('li'  + flavor + (ctrl._isDropdownOpen ? '.open' : '') + (options.isDisabled ? '.disabled' : '') + (options.isActive ? '.active' : ''), [
        m('a.dropdown-toggle' + selectors,
          { onclick: ctrl._onclickDropdown }, [
            m('span', label),
            m('span.caret')
          ]),
        ctrl._isDropdownOpen ? mc.Dropdown.viewMenu({ _onclickTab: ctrl._onclickTab }, { dropdown: options.dropdown }) : null
      ]);
    }

    function button () {
      return m('div' + flavor + (ctrl._isDropdownOpen ? '.open' : '') + (options.isDisabled ? '.disabled' : ''), [
        m('button[type=button].btn.btn-default.dropdown-toggle' + selectors,
          { onclick: ctrl._onclickDropdown }, [
            m('span', label),
            m('span.caret')
          ]),
        ctrl._isDropdownOpen ? mc.Dropdown.viewMenu({ _onclickTab: ctrl._onclickTab }, options) : null
      ]);
    }

    function splitButton () {
      return m('div' + flavor + (ctrl._isDropdownOpen ? '.open' : '') + (options.isDisabled ? '.disabled' : ''), [
        m('button[type=button].btn' + selectors,
          { onclick: ctrl._onclickDropdown }, label
        ),
        m('button[type=button].btn.dropdown-toggle' + selectors,
          { onclick: ctrl._onclickDropdown }, [
            m('span.caret'),
            m('span.sr-only', 'Toggle dropdown')
          ]),
        ctrl._isDropdownOpen ? mc.Dropdown.viewMenu({ _onclickTab: ctrl._onclickTab }, options) : null
      ]);
    }
  },

  // ctrl {}: <events> _onclickTab
  // options.dropdown[]: type, name, label, isDisabled, redirectTo
  viewMenu: function (ctrl, options) {
    return m('ul.dropdown-menu' + (options.alignRight ? '.dropdown-menu-right' : ''),
      options.dropdown.map(function (menuItem) {

        switch (menuItem.type) {
          case 'divider':
            return m('li.divider', {style:{margin: '6px 0px'}}, ''); // .divider's 9px is not visible; px in 0px req'd for tests
          case 'header':
            return m('li.dropdown-header', {tabindex: '-1'}, menuItem.label || menuItem.name);
          default:
            return mc.Dropdown.viewTab(
              mc.utils.extend({}, menuItem, { isActive: false, _onclickTab: ctrl._onclickTab })
            );
        }
      })
    );
  },

  // ctrl: <props> label, isActive, isDisabled, redirectTo <events> _onclickTab //todo move to options
  // also called by mc.Tabs
  viewTab: function (ctrl) {
    var href = '',
      attr = {};

    if (!ctrl.isDisabled) {
      if (ctrl.redirectTo) {
        href = '[href="' + ctrl.redirectTo + '"]';
        attr = {config : m.route};
      } else {
        attr = {onclick : ctrl._onclickTab.bind(this, ctrl.name)};
      }
    }

    return m('li' + (ctrl.isActive ? '.active' : '') + (ctrl.isDisabled ? '.disabled' : ''),
      m('a' + href, attr, ctrl.label || ctrl.name || '')
    );
  }
};
/*global m:false */
// NavResponsive ===============================================================
mc.NavResponsive = {
  Controller: function () {
    this._isCollapsedOpen = false;
    this._onclickNavOpen = function () {
      this._isCollapsedOpen = !this._isCollapsedOpen;
    }.bind(this);
  },

  // options: <props> brandLabel, brandUrl, flavor, viewComponents:fcn
  view: function (ctrl, options) {
    var flavors = {
      'default': '.navbar.navbar-default',
      'fixed-top': '.navbar.navbar-default.navbar-fixed-top', // needs style: body { padding-top: 70px }
      'fixed-bottom': '.navbar.navbar-default.navbar-fixed-bottom', // needs style: body { padding-bottom: 70px }
      'static-top': '.navbar.navbar-default.navbar-static-top',
      'inverse': '.navbar.navbar-default.navbar-inverse',
      'fixed-top-inverse': '.navbar.navbar-default.navbar-fixed-top.navbar-inverse', // needs style: body { padding-top: 70px }
      'fixed-bottom-inverse': '.navbar.navbar-default.navbar-fixed-bottom.navbar-inverse', // needs style: body { padding-bottom: 70px }
      'static-top-inverse': '.navbar.navbar-default.navbar-static-top.navbar-inverse'
      };

    return m('nav' + (flavors[options.flavor] || flavors.default), [
      m('.container-fluid', [

        // Brand name & collapsed nav toggle
        m('.navbar-header', [
          m('button[type=button].navbar-toggle', {onclick: ctrl._onclickNavOpen}, [
            m('span.sr-only', 'Toggle navigation'),
            m('span.icon-bar', ''),
            m('span.icon-bar', ''),
            m('span.icon-bar', '')
          ]),
          m('a.navbar-brand', {href: options.brandUrl}, options.brandLabel)
        ]),

        // navbar contents
        m('.collapse.navbar-collapse' + (ctrl._isCollapsedOpen ? '.in' : ''),
          options.viewComponents()
        )
      ])
    ]);
  }
};

/*global m:false */

// NavSearch ===================================================================

mc.NavSearch = {
  // options: <props> searchValue() <events> onsubmit
  Controller: function (options) {
    this._searchValue = m.prop(mc.utils.getValue(options.searchValue, '')); // used with m.withAttr
    this._onsubmit = function () {
      if (typeof options.searchValue === 'function') { options.searchValue(this._searchValue()); }
      if (options.onsubmit) { options.onsubmit(this._searchValue()); }
    }.bind(this);
  },

  // options: <props> label, placeholder, btnLabel, flavor
  view: function (ctrl, options) {
    var flavors = {
      nav: '.navbar-form',
      'nav-right': '.navbar-form.navbar-right'
    };

    return m('form' + (flavors[options.flavor] || flavors.nav), [
        m('.form-group', [
          options.label ? m('label.sr-only', options.label) : null,
          m('input[type=text].form-control',
            { value: ctrl._searchValue(),
              onchange: m.withAttr('value', ctrl._searchValue),
              placeholder: options.placeholder || 'Search'
            }
          )
        ]),
        m('button[type=button].btn btn-default',
          { onclick: ctrl._onsubmit }, options.btnLabel || 'Submit'
        )
      ]
    );
  }
};
/*global m:false */

// NavText =====================================================================

mc.NavText = {
  Controller: function () {},

  // options: <props> label, href, linkLabel
  view: function (ctrl, options) {
    var flavors = {
      nav: '.navbar-text',
      'nav-right': '.navbar-text.navbar-right'
    };

    return m('p' + (flavors[options.flavor] || flavors.nav), [
        m('span', options.label || ''),
        options.href ? m('a.navbar-link', ' ' + (options.linkLabel || '')) : null
      ]
    );
  }
};
/*global m:false */
// Tabs ========================================================================
// <dep> mc.Dropdown
mc.Tabs = {
  // options: <props> activeTab() <event> onclickTab
  Controller: function (options) {
    //console.log('\n.. in mc.Tabs.Controller. options=', options);
    options = options || {};
    this._activeTab = mc.utils.getValue(options.activeTab, '');

    this._onclickTab = function (name) {
      //console.log('mc.Tabs.Controller > _onclickTab. name=', name);
      mc._comm.lastDropdownId = -1; // will force closed any open dropdowns
      this._activeTab = name;
      if (typeof options.activeTab === 'function') { options.activeTab(name); }
      if (options.onclickTab) { options.onclickTab(name); }
    }.bind(this);

    this._dropdownCtrls = [];
    this._getDropdownCtrl = function (i) {
      if (!this._dropdownCtrls[i]) {
        this._dropdownCtrls[i] = new mc.Dropdown.Controller({ onclickTab: this._onclickTab });
      }
      return this._dropdownCtrls[i];
    }.bind(this);
  },

  // ctrl: <props> _activeTab <events> _onclickTab
  // options.tab[]: <props> name, label, isActive, isDisabled, redirectTo, dropdown[], alignMenuRight
  // The option.tab[] may change dramatically between calls for a Controller.
  // However correct dropdown open/close display assumes the dropdowns appear in the same relative order.
  view: function (ctrl, options) {
    //console.log('\n.. in mc.Tabs.view. options=', options);
    var flavors = {
        tabs: '.nav.nav-tabs',
        pills: '.nav.nav-pills',
        'pills-stacked': '.nav.nav-pills.nav-stacked',
        nav: '.nav.navbar-nav',
        'nav-right': '.nav.navbar-nav.navbar-right'
      },
      dropdownCounter = -1;

    return m('ul' + (flavors[options.flavor] || flavors.tabs),
      (options.tabs || []).map(function (tab) {

        var tabOptions = mc.utils.extend({}, tab, { flavor: '_tabs', isActive: ctrl._activeTab === tab.name });
        if (!tab.dropdown) { return mc.Tabs.viewTab(ctrl, tabOptions); }

        dropdownCounter += 1;
        return mc.Dropdown.view(ctrl._getDropdownCtrl(dropdownCounter), tabOptions);
      })
    );
  },

  // ctrl: <events> _onclickTab
  // options: <props> name, label, isActive, isDisabled, redirectTo
  viewTab: function (ctrl, options) {
    //console.log('.. in mc.TabsTab.view. options=', options);
    var href = '',
      attr = {};

    if (!options.isDisabled) {
      if (options.redirectTo) {
        href = '[href="' + options.redirectTo + '"]';
        attr = {config : m.route};
      } else {
        attr = {onclick : ctrl._onclickTab.bind(this, options.name)};
      }
    }

    return m('li' + (options.isActive ? '.active' : '') + (options.isDisabled ? '.disabled' : ''),
      m('a' + href, attr, options.label || options.name || '')
    );
  }
};
/** @jsx m */
var mcTest = mcTest || {};

mcTest.affix0 = {
  list: [
    {name: '#js-overview', label: 'Overview', list: [
      {name: '#js-individual-compiled', label: 'Individual or compiled'},
      {name: '#js-data-attrs', label: 'Data attributes'}
    ]},
    {name: '#transitions', label: 'Transitions'},
    {name: '#modals', label: 'Modal', list: [
      {name: '#modals-examples', label: 'Examples'},
      {name: '#modals-sizes', label: 'Sizes'}
    ]},
    {name: 'myname', label: 'myName'}
  ]
};

mcTest.target0Closed =
  m("div", {class:"mc-affix", style:"margin-top: 0px;"}, [
    m("ul", {class:"nav mc-affix-nav"}, [
      m("li", {class:"active"}, [
        m("a", {href:"#js-overview"}, ["Overview"]),
        m("ul", {class:"nav"}, [
          m("li", [m("a", {href:"#js-individual-compiled"}, ["Individual or compiled"])]),
          m("li", [m("a", {href:"#js-data-attrs"}, ["Data attributes"])])
        ])
      ]),
      m("li", [m("a", {href:"#transitions"}, ["Transitions"])]),
      m("li", [
        m("a", {href:"#modals"}, ["Modal"]),
        m("ul", {class:"nav"}, [
          m("li", [m("a", {href:"#modals-examples"}, ["Examples"])]),
          m("li", [m("a", {href:"#modals-sizes"}, ["Sizes"])])
        ])
      ]),
      m("li", [m("a", {href:""}, ["myName"])])
    ])
  ])

mcTest.target0Open =
  m("div", {class:"dropdown open"}, [
    m("button", {type:"button", class:"btn btn-default dropdown-toggle"}, [
      m("span", ["Dropdown-0 " ]),
      m("span", {class:"caret"})
    ]),
    m("ul", {class:"dropdown-menu"}, [
      m("li", {class:"dropdown-header", tabindex:"-1"}, ["Primary actions"]),
      m("li", [m("a", ["Action"])]),
      m("li", {class:"disabled"}, [m("a", ["Another action"])]),
      m("li", {class:"divider", style:"margin: 6px 0px;"}),
      m("li", {class:"dropdown-header", tabindex:"-1"}, ["Secondary actions"]),
      m("li", [m("a", ["Separated action"])]),
      m("li", [m("a", {href:"/public/dropdown.html?/bar"}, ["Exit bar"])])
    ])
  ])

mcTest.affix1 = {
  name: 'affix1',
  label: 'Dropdown-1',
  flavor: 'btn',
  isSplit: true,
  selectors: '.btn-primary',
  dropdown: [
    {label: 'Primary actions', type: 'header' },
    {name: 'action1', label: 'Action'},
    {name: 'another action', label: 'Another action', isDisabled: true },
    {type: 'divider' },
    {label: 'Secondary actions', type: 'header' },
    {name: 'separated action', label: 'Separated action' },
    {label: 'Exit bar', redirectTo: '/bar'}
  ]
};

mcTest.target1Closed =
  m("div", {class:"btn-group"}, [
    m("button", {type:"button", class:"btn btn-primary"}, ["Dropdown-1 " ]),
    m("button", {type:"button", class:"btn dropdown-toggle btn-primary"}, [
      m("span", {class:"caret"}),
      m("span", {class:"sr-only"}, ["Toggle dropdown"])
    ])
  ])

mcTest.target1Open =
  m("div", {class:"btn-group open"}, [
    m("button", {type:"button", class:"btn btn-primary"}, ["Dropdown-1 " ]),
    m("button", {type:"button", class:"btn dropdown-toggle btn-primary"}, [
      m("span", {class:"caret"}),
      m("span", {class:"sr-only"}, ["Toggle dropdown"])
    ]),
    m("ul", {class:"dropdown-menu"}, [
      m("li", {class:"dropdown-header", tabindex:"-1"}, ["Primary actions"]),
      m("li", [m("a", ["Action"])]),
      m("li", {class:"disabled"}, [m("a", ["Another action"])]),
      m("li", {class:"divider", style:"margin: 6px 0px;"}),
      m("li", {class:"dropdown-header", tabindex:"-1"}, ["Secondary actions"]),
      m("li", [m("a", ["Separated action"])]),
      m("li", [m("a", {href:"/public/dropdown.html?/bar"}, ["Exit bar"])])
    ])
  ])

test('affix 01', function () {
  // test dropdown opens and closes
  var result = true,
    source1;

  var affixCtrl = new mc.Affix.Controller({
    activeTab: '#js-overview',
    //sections: 'mySections',
    onclickTab: function () {}
  });

  // render dropdown
  source1 = mc.Affix.view(affixCtrl, mcTest.affix0);
  result = result && test.compareRenders('affix 01, test 01', source1, mcTest.target0Closed);
  /*
  // open it
  affixCtrl._onclickDropdown();
  source1 = mc.Affix.view(affixCtrl, mcTest.affix0);
  result = result && test.compareRenders('affix 01, test 02', source1, mcTest.target0Open);

  // close it
  affixCtrl._onclickDropdown();
  source1 = mc.Affix.view(affixCtrl, mcTest.affix0);
  result = result && test.compareRenders('affix 01, test 03', source1, mcTest.target0Closed);
  */
  return result;
});
/*
test('affix 02', function () {
  // test dropdown closes when another dropdown is clicked
  var result = true,
    source1, source2;

  var affixCtrl1 = new mc.Affix.Controller({ onclickTab: function () {} });
  var affixCtrl2 = new mc.Affix.Controller({ onclickTab: function () {} });

  // render closed dropdowns
  source1 = mc.Affix.view(affixCtrl1, mcTest.affix0);
  source2 = mc.Affix.view(affixCtrl2, mcTest.affix0);
  result = result && test.compareRenders('affix 02, test 01a', source1, mcTest.target0Closed);
  result = result && test.compareRenders('affix 02, test 01b', source2, mcTest.target0Closed);

  // open #1
  affixCtrl1._onclickDropdown();
  source1 = mc.Affix.view(affixCtrl1, mcTest.affix0);
  source2 = mc.Affix.view(affixCtrl2, mcTest.affix0);
  result = result && test.compareRenders('affix 02, test 02a', source1, mcTest.target0Open);
  result = result && test.compareRenders('affix 02, test 02b', source2, mcTest.target0Closed);

  // open #2
  affixCtrl2._onclickDropdown();
  source1 = mc.Affix.view(affixCtrl1, mcTest.affix0);
  source2 = mc.Affix.view(affixCtrl2, mcTest.affix0);
  result = result && test.compareRenders('affix 02, test 03a', source1, mcTest.target0Closed);
  result = result && test.compareRenders('affix 02, test 03b', source2, mcTest.target0Open);

  // open #1 again
  affixCtrl1._onclickDropdown();
  source1 = mc.Affix.view(affixCtrl1, mcTest.affix0);
  source2 = mc.Affix.view(affixCtrl2, mcTest.affix0);
  result = result && test.compareRenders('affix 02, test 04a', source1, mcTest.target0Open);
  result = result && test.compareRenders('affix 02, test 04b', source2, mcTest.target0Closed);

  // open #2 again
  console.log('source1=', affixCtrl1._isDropdownOpen);
  console.log('source2=', affixCtrl2._isDropdownOpen);
  affixCtrl2._onclickDropdown();
  source1 = mc.Affix.view(affixCtrl1, mcTest.affix0);
  source2 = mc.Affix.view(affixCtrl2, mcTest.affix0);
  result = result && test.compareRenders('affix 02, test 05a', source1, mcTest.target0Closed);
  result = result && test.compareRenders('affix 02, test 05b', source2, mcTest.target0Open);

  // close #2
  affixCtrl2._onclickDropdown();
  source1 = mc.Affix.view(affixCtrl1, mcTest.affix0);
  source2 = mc.Affix.view(affixCtrl2, mcTest.affix0);
  result = result && test.compareRenders('affix 02, test 06a', source1, mcTest.target0Closed);
  result = result && test.compareRenders('affix 02, test 06b', source2, mcTest.target0Closed);

  return result;
});

test('affix 03', function () {
  // test split buttons
  var result = true,
    source1;

  var affixCtrl1 = new mc.Affix.Controller({ onclickTab: function () {} });

  // render closed dropdown
  source1 = mc.Affix.view(affixCtrl1, mcTest.affix1);
  result = result && test.compareRenders('affix 03, test 01', source1, mcTest.target1Closed);

  // open #1
  affixCtrl1._onclickDropdown();
  source1 = mc.Affix.view(affixCtrl1, mcTest.affix1);
  result = result && test.compareRenders('affix 03, test 02', source1, mcTest.target1Open);

  // close #1
  affixCtrl1._onclickDropdown();
  source1 = mc.Affix.view(affixCtrl1, mcTest.affix1);
  result = result && test.compareRenders('affix 03, test 03', source1, mcTest.target1Closed);

  return result;
});

test('affix 04', function () {
  // test item selection
  var result = true,
    tabName1,
    tabName2 = m.prop('');

  var affixCtrl1 = new mc.Affix.Controller({
    onclickTab: function (name) { tabName1 = name; }.bind(this)
  });
  var affixCtrl2 = new mc.Affix.Controller({
    tabName: tabName2
  });

  // via event, select item
  affixCtrl1._onclickTab('action1');
  result = result && test.result('affix 04, test 01', tabName1 === 'action1');

  // via event, select another item
  affixCtrl1._onclickTab('another action');
  result = result && test.result('affix 04, test 02', tabName1 === 'another action');

  // via mprop, select item
  affixCtrl2._onclickTab('action1');
  console.log(tabName2())
  result = result && test.result('affix 04, test 03', tabName2() === 'action1');

  // via mprop, select another item
  affixCtrl2._onclickTab('another action');
  result = result && test.result('affix 04, test 04', tabName2() === 'another action');

  return result;
});
*/
test.print(console.log);