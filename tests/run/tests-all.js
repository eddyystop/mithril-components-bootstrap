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

function compareRenders (text, source, target) {
  test.total += 1;
  var r = JSON.stringify(normalizeJsx(source)) === JSON.stringify(normalizeJsx(target));
  console.log('..' + text + (r ? '' : ' FAILED'));

  if (!r) {
    test.failures.push(text);
    stringify(text + ' source', normalizeJsx(source));
    stringify(text + ' target', normalizeJsx(target));
  }
  return r;
}

function stringify (text, obj) {
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
    Object.keys(inAttrs).map(function( key) {
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
	var selectorCache = {}
	var type = {}.toString
	var parser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g, attrParser = /\[(.+?)(?:=("|'|)(.*?)\2)?\]/

	function m() {
		var args = arguments
		var hasAttrs = type.call(args[1]) == "[object Object]" && !("tag" in args[1]) && !("subtree" in args[1])
		var attrs = hasAttrs ? args[1] : {}
		var classAttrName = "class" in attrs ? "class" : "className"
		var cell = selectorCache[args[0]]
		if (cell === undefined) {
			selectorCache[args[0]] = cell = {tag: "div", attrs: {}}
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
		}
		cell = clone(cell)
		cell.attrs = clone(cell.attrs)
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
			var nodes = [], intact = cached.length === data.length, subArrayCount = 0

			var DELETION = 1, INSERTION = 2 , MOVE = 3
			var existing = {}, shouldMaintainIdentities = false
			for (var i = 0; i < cached.length; i++) {
				if (cached[i] && cached[i].attrs && cached[i].attrs.key !== undefined) {
					shouldMaintainIdentities = true
					existing[cached[i].attrs.key] = {action: DELETION, index: i}
				}
			}
			if (shouldMaintainIdentities) {
				for (var i = 0; i < data.length; i++) {
					if (data[i] && data[i].attrs && data[i].attrs.key !== undefined) {
						var key = data[i].attrs.key
						if (!existing[key]) existing[key] = {action: INSERTION, index: i}
						else existing[key] = {action: MOVE, index: i, from: existing[key].index, element: parentElement.childNodes[existing[key].index]}
					}
				}
				var actions = Object.keys(existing).map(function(key) {return existing[key]})
				var changes = actions.sort(function(a, b) {return a.action - b.action || b.index - a.index})
				var newCached = new Array(cached.length)

				for (var i = 0, change; change = changes[i]; i++) {
					if (change.action == DELETION) {
						clear(cached[change.index].nodes, cached[change.index])
						newCached.splice(change.index, 1)
					}
					if (change.action == INSERTION) {
						var dummy = window.document.createElement("div")
						dummy.key = data[change.index].attrs.key.toString()
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
				cached = newCached
				cached.nodes = []
				for (var i = 0, child; child = parentElement.childNodes[i]; i++) cached.nodes.push(child)
			}

			for (var i = 0, cacheCount = 0; i < data.length; i++) {
				var item = build(parentElement, parentTag, cached, index, data[i], cached[cacheCount], shouldReattach, index + subArrayCount || subArrayCount, editable, namespace, configs)
				if (item === undefined) continue
				if (!item.nodes.intact) intact = false
				subArrayCount += item instanceof Array ? item.length : 1
				cached[cacheCount++] = item
			}
			if (!intact) {
				for (var i = 0; i < data.length; i++) {
					if (cached[i] !== undefined) nodes = nodes.concat(cached[i].nodes)
				}
				for (var i = nodes.length, node; node = cached.nodes[i]; i++) {
					if (node.parentNode !== null && node.parentNode.childNodes.length != nodes.length) {
						node.parentNode.removeChild(node)
						if (cached[i]) unload(cached[i])
					}
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
		nodes.length = 0
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
	function clone(object) {
		var result = {}
		for (var prop in object) result[prop] = object[prop]
		return result
	}
	function autoredraw(callback, object) {
		return function(e) {
			e = e || event
			m.startComputation()
			try {return callback.call(object, e)}
			finally {m.endComputation()}
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
			if (window.document.documentElement !== html) {
				window.document.replaceChild(html, window.document.documentElement)
			}
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

	var roots = [], modules = [], controllers = [], now = 0, lastRedraw = 0, lastRedrawId = 0, computePostRedrawHook = null
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
		now = window.performance && window.performance.now ? window.performance.now() : new window.Date().getTime()
		if (now - lastRedraw > 16) redraw()
		else {
			var cancel = window.cancelAnimationFrame || window.clearTimeout
			var defer = window.requestAnimationFrame || window.setTimeout
			cancel(lastRedrawId)
			lastRedrawId = defer(redraw, 0)
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
		lastRedraw = now
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
			currentRoute = normalizeRoute(window.location[m.route.mode])
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
				var cacheKey = getCellCacheKey(root)
				clear(root.childNodes, cellCache[cacheKey])
				cellCache[cacheKey] = undefined
				m.module(root, router[route])
				return true
			}

			var matcher = new RegExp("^" + route.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$")

			if (matcher.test(path)) {
				var cacheKey = getCellCacheKey(root)
				clear(root.childNodes, cellCache[cacheKey])
				cellCache[cacheKey] = undefined
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
    if (options.contentType) xhr.setRequestHeader('Content-type',options.contentType)
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
		xhr.send(options.data)
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

// ensure params are m.prop()
mc.utils.coerceToMprop = function (param, defaultValue) {
  return typeof param === 'function' ? param : m.prop(param === undefined ? defaultValue : param);
};

// get value from possible m.prop()
mc.utils.getMpropValue = function (param, defaultValue) {
  var value = typeof param === 'function' ? param() : param;
  return value === undefined ? defaultValue : value;
};

mc.Dropdown = {
  // options: <props> isDropdownOpen <event> onclickTab
  controller: function (options) {
    //console.log('\n.. in mc.Dropdown.controller. options=', options);
    options = options || {};
    this.isDropdownOpen = mc.utils.getMpropValue(options.isDropdownOpen, false);
    this.dropdownId = 0;

    this.onclickTab = function (name) {
      //console.log('mc.Dropdown.controller > onclickTab. name=', name);
      this.isDropdownOpen = false;
      mc._comm.lastDropdownId = -1;
      //console.log('set lastDropdownId=', -1)
      options.onclickTab(name);
    }.bind(this);

    this.onclickDropdown = function () {
      //console.log('mc.Dropdown.controller > onclickDropdown');
      this.isDropdownOpen = !this.isDropdownOpen;
      mc._comm.lastDropdownId = this.dropdownId = Date.now();
      //console.log('set lastDropdownId & dropdownId=', this.dropdownId)
    }.bind(this);

    this.closeDropdown = function () {
      this.isDropdownOpen = false;
    }.bind(this);
  },

  // ctrl: <props> isDropDownOpen, dropdownId <events> onclickTab, onClickDropdown
  // options: flavor, name, label, isDisabled, isSplit, selectors, dropdown[]
  // selectors: .btn-default -primary -success -info -warning -danger -link
  // selectors: .btn-lg -sm -xs
  // selectors: .btn-block
  // selectors: .active .disabled
  view: function (ctrl, options) {
    //console.log('\n.. in mc.Dropdown.viewsddsdsdsds. ctrl=', ctrl, 'options=', options);
    options = options || {};
    var flavors = {
      dropdown: '.dropdown',
      btn: '.btn-group',
      'btn-up': '.btn-group.dropup'
      },
      optFlavor = options.flavor,
      flavor = (flavors[optFlavor] || flavors.dropdown),
      selectors = options.selectors || '',
      label = (options.label || options.name || '') + ' ';

    if (ctrl.dropdownId !== mc._comm.lastDropdownId) { ctrl.closeDropdown(); }
    var isDropdownOpen = ctrl.dropdownId === mc._comm.lastDropdownId ? ctrl.isDropdownOpen : false;

    //console.log('open?=', isDropdownOpen, 'ctrl.isDropdownOpen=', ctrl.isDropdownOpen, 'lastDropdownId=', mc._comm.lastDropdownId, 'dropdownId=', ctrl.dropdownId)

    if (!selectors && (optFlavor === 'btn' || optFlavor === 'btn-up')) {
      selectors = '.btn-primary';
    }

    return m('div' + flavor + (isDropdownOpen ? '.open' : '') + (ctrl.isDisabled ? '.disabled' : ''),
      [
        options.isSplit ? splitButton() : button(),
        isDropdownOpen ? mc.Dropdown.viewMenu({ onclickTab: ctrl.onclickTab }, options) : null
      ]
    );

    function button () {
      return m('button[type=button].btn.btn-default.dropdown-toggle' + selectors,
        {onclick: ctrl.onclickDropdown.bind(ctrl, ctrl.name)},
        [ m('span', label),
          m('span.caret')
        ]
      );
    }

    function splitButton () {
      return [
        m('button[type=button].btn' + selectors,
          {onclick: ctrl.onclickDropdown.bind(ctrl, ctrl.name)}, label
        ),
        m('button[type=button].btn.dropdown-toggle' + selectors,
          {onclick: ctrl.onclickDropdown.bind(ctrl, ctrl.name)},
          [m('span.caret'),
            m('span.sr-only', 'Toggle dropdown')
          ]
        )
      ];
    }
  },

  // ctrl {}: <events> onclickTab
  // options.dropdown[]: name, label, type, isDisabled, alignRight, redirectTo
  viewMenu: function (ctrl, options) {
    //console.log('.. in mc.Dropdown.viewMenu. options=', options);
    return m('ul.dropdown-menu' + (options.alignRight ? '.dropdown-menu-right' : ''),
      options.dropdown.map(function (menuItem) {

        //console.log(menuItem.type);
        switch (menuItem.type) {
          case 'divider':
            return m('li.divider', {style:{margin: '6px 0px'}}, ''); // .divider=9px is not visible
          case 'header':
            return m('li.dropdown-header', {tabindex: '-1'}, menuItem.label || menuItem.name);
          default:
            var tabsTabCtrl = mc.utils.extend({}, menuItem, {
              isActive: false,
              onclickTab: ctrl.onclickTab
            });
            return mc.Dropdown.viewTab(tabsTabCtrl);
        }
      })
    );
  },

  // ctrl: <props> name, label, isActive, isDisabled, redirectTo <events> onclickTab //todo move to options
  // also called by mc.Tabs
  viewTab: function (ctrl) {
    //console.log('.. in mc.Dropdown.viewTab. ctrl=', ctrl);
    var href = '',
      attr = {};

    if (!ctrl.isDisabled) {
      if (ctrl.redirectTo) {
        href = '[href="' + ctrl.redirectTo + '"]';
        attr = {config : m.route};
      } else {
        attr = {onclick : ctrl.onclickTab.bind(this, ctrl.name)};
      }
    }

    return m('li' + (ctrl.isActive ? '.active' : '') + (ctrl.isDisabled ? '.disabled' : ''),
      m('a' + href, attr, ctrl.label || ctrl.name || '')
    );
  }
};
mc.NavResponsive = {
  controller: function (options) {
    console.log('\n.. in mc.NavResponsive.controller. options=', options);
    options = options || {};
    //this.activeTab = mc.utils.coerceToMprop(options.activeTab, '');
    this.isCollapsedOpen = false;

    this.onclickNavOpen = function () {
      this.isCollapsedOpen = !this.isCollapsedOpen;
    }.bind(this);

    this.activeTab = m.prop('finance');
    this.tabsCtrl = new mc.Tabs.controller({
      activeTab: this.activeTab
    });
  },

  // options: <props> brandLabel, brandUrl, alignRight
  view: function (ctrl, options) {
    var flavors = {
      default: '.navbar.navbar-default',
      'fixed-top': '.navbar.navbar-default.navbar-fixed-top', // needs style: body { padding-top: 70px }
      'fixed-bottom': '.navbar.navbar-default.navbar-fixed-bottom', // needs style: body { padding-bottom: 70px }
      'static-top': '.navbar.navbar-default.navbar-static-top',
      inverse: '.navbar.navbar-default.navbar-inverse',
      'fixed-top-inverse': '.navbar.navbar-default.navbar-fixed-top.navbar-inverse', // needs style: body { padding-top: 70px }
      'fixed-bottom-inverse': '.navbar.navbar-default.navbar-fixed-bottom.navbar-inverse', // needs style: body { padding-bottom: 70px }
      'static-top-inverse': '.navbar.navbar-default.navbar-static-top.navbar-inverse'
      };

    return m('nav' + (flavors[options.flavor] || flavors.default), [
      m('.container-fluid', [

        // Brand name & collapsed nav toggle
        m('.navbar-header', [
          m('button[type=button].navbar-toggle', {onclick: ctrl.onclickNavOpen}, [
            m('span.sr-only', 'Toggle navigation'),
            m('span.icon-bar', ''),
            m('span.icon-bar', ''),
            m('span.icon-bar', '')
          ]),
          m('a.navbar-brand', {href: options.brandUrl}, options.brandLabel)
        ]),

        // navbar contents
        m('.collapse.navbar-collapse' + (ctrl.isCollapsedOpen ? '.in' : ''),
          options.viewContents()
        )
      ])
    ]);
  }
};

/*global m:false */

// NavSearch ===================================================================

mc.NavSearch = {
  // options: <props> searchValue() <events> onsubmit
  controller: function (options) {
    this.searchValue = mc.utils.coerceToMprop(options.searchValue || '');
    this.onsubmit = function () {
      options.onsubmit(this.searchValue());
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
            { value: ctrl.searchValue(),
              onchange: m.withAttr('value', ctrl.searchValue),
              placeholder: options.placeholder || 'Search'
            }
          )
        ]),
        m('button[type=button].btn btn-default',
          {onclick: ctrl.onsubmit.bind(null, ctrl.searchValue())},
            options.btnLabel || 'Submit'
        )
      ]
    );
  }
};
/*global m:false */

// NavText =====================================================================

mc.NavText = {
  controller: function () {},

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
var mc = mc || {};

// <dep> mc.Dropdown
mc.Tabs = {
  // options: <props> activeTab(), isDropdownOpen() <event> onclickTab
  controller: function (options) {
    console.log('\n.. in mc.Tabs.controller. options=', options);
    options = options || {};
    this.activeTab = mc.utils.getMpropValue(options.activeTab, '');
    this.isDropdownOpen = mc.utils.getMpropValue(options.isDropdownOpen, false);
    this.dropdownId = 0;

    this.onclickTab = function (name) {
      console.log('mc.Tabs.controller > onclickTab. name=', name);
      this.isDropdownOpen = false;
      mc._comm.lastDropdownId = -1;
      this.activeTab = name;
      options.onclickTab(this.activeTab);
    }.bind(this);

    this.onclickDropdown = function (name) {
      console.log('mc.Tabs.controller > onclickDropdown. name=', name, 'activeTab=', this.activeTab);
      this.isDropdownOpen = name === this.activeTab ? !this.isDropdownOpen : true;
      this.activeTab = name;
      mc._comm.lastDropdownId = this.dropdownId = Date.now();
    }.bind(this);
  },

  // options: <props> activeTab, isDropdownOpen <events> onclickTab, onclickDropDown
  // options.tab[]: <props> name, label, isActive, isDisabled, redirectTo, dropdown[], alignMenuRight
  view: function (ctrl, options) {
    console.log('\n.. in mc.Tabs.view. options=', options);
    var flavors = {
      tabs: '.nav.nav-tabs',
      pills: '.nav.nav-pills',
      'pills-stacked': '.nav.nav-pills.nav-stacked',
      nav: '.nav.navbar-nav',
      'nav-right': '.nav.navbar-nav.navbar-right'
    };

    return [
      m('ul' + (flavors[options.flavor] || flavors.tabs),
        (options.tabs || []).map(function (tab) {
          var tabOptions = mc.utils.extend({}, tab, ctrl, { isActive: ctrl.activeTab === tab.name });
          return !tab.dropdown ? mc.Tabs.viewTab(ctrl, tabOptions) : mc.TabsDropdown.view(ctrl, tabOptions);
        })
      )
    ];
  },

  // ctrl: <events> onclickTab
  // options: <props> name, label, isActive, isDisabled, redirectTo
  viewTab: function (ctrl, options) {
    console.log('.. in mc.TabsTab.view. options=', options);
    var href = '',
      attr = {};

    if (!options.isDisabled) {
      if (options.redirectTo) {
        href = '[href="' + options.redirectTo + '"]';
        attr = {config : m.route};
      } else {
        attr = {onclick : options.onclickTab.bind(this, options.name)};
      }
    }

    return m('li' + (options.isActive ? '.active' : '') + (options.isDisabled ? '.disabled' : ''),
      m('a' + href, attr, options.label || options.name || '')
    );
  }
};


mc.TabsDropdown = { //todo merge with Tabs?
  // ctrl: <props> isDropdownOpen, dropdownId <events> onclickTab, onclickDropdown
  // options: <props> name, label, isActive, isDisabled, redirectTo, dropdown[]
  view: function (ctrl, options) {
    console.log('.. in mc.TabsDropdown. options=', options);
    return m('li.dropdown' + (ctrl.isDropdownOpen ? '.open' : '') + (options.isActive ? '.active' : '') + (options.isDisabled ? '.disabled' : ''), [
      m('a.dropdown-toggle', {onclick: ctrl.onclickDropdown.bind(self, options.name)}, [
        m('span', (options.label || options.name || '') + ' '),
        m('span.caret')
      ]),
      ctrl.isDropdownOpen ?
        mc.Dropdown.viewMenu({ onclickTab: ctrl.onclickTab }, { dropdown: options.dropdown }) :
        null
    ]);
  }
};
/*global m:false */

// Button ======================================================================

mc.Button = {
  // options: <events> onclick
  controller: function (options) {
    this.onclick = function (el) {
      if (options.onclick) { options.onclick(el); }
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

mc.ButtonDropdown = {
  // options: see mc.Dropdown
  controller: function (options) {
    this.dropdownCtrl = new mc.Dropdown.controller(options);
  },

  // options: see mc.Dropdown
  view: function (ctrl, options) {
    return mc.Dropdown.view(ctrl.dropdownCtrl, options);
  }
};
/** @jsx m */
var mcTest = mcTest || {};

mcTest.dropdown0 = {
    name: 'dropdown0',
    label: 'Dropdown-0',
    flavor: 'dropdown',
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

mcTest.targetClosed =
  m("div", {class:"dropdown"}, [
    m("button", {type:"button", class:"btn btn-default dropdown-toggle"}, [
      m("span", ["Dropdown-0 " ]),
      m("span", {class:"caret"})
    ])
  ])

mcTest.targetOpen =
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

test('dropdown 01', function () {
  // test dropdown opens and closes
  var result = true,
    source, target;

  var dropdownCtrl = new mc.Dropdown.controller({ onclickTab: function () {} });

  // render dropdown
  source = mc.Dropdown.view(dropdownCtrl, mcTest.dropdown0);
  result = result && compareRenders('dropdown 01, test 01', source, mcTest.targetClosed);

  // open it
  dropdownCtrl.onclickDropdown();
  source = mc.Dropdown.view(dropdownCtrl, mcTest.dropdown0);
  result = result && compareRenders('dropdown 01, test 02', source, mcTest.targetOpen);

  // close it
  dropdownCtrl.onclickDropdown();
  source = mc.Dropdown.view(dropdownCtrl, mcTest.dropdown0);
  result = result && compareRenders('dropdown 01, test 03', source, mcTest.targetClosed);

  return result;
});

test('dropdown 02', function () {
  // test dropdown closes when another dropdown is clicked
  var result = true,
    source1, source2;

  var dropdownCtrl1 = new mc.Dropdown.controller({ onclickTab: function () {} });
  var dropdownCtrl2 = new mc.Dropdown.controller({ onclickTab: function () {} });

  // render closed dropdowns
  source1 = mc.Dropdown.view(dropdownCtrl1, mcTest.dropdown0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown0);
  result = result && compareRenders('dropdown 02, test 01a', source1, mcTest.targetClosed);
  result = result && compareRenders('dropdown 02, test 01b', source2, mcTest.targetClosed);

  // open #1
  dropdownCtrl1.onclickDropdown();
  source1 = mc.Dropdown.view(dropdownCtrl1, mcTest.dropdown0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown0);
  result = result && compareRenders('dropdown 02, test 02a', source1, mcTest.targetOpen);
  result = result && compareRenders('dropdown 02, test 02b', source2, mcTest.targetClosed);

  // open #2
  dropdownCtrl2.onclickDropdown();
  source1 = mc.Dropdown.view(dropdownCtrl1, mcTest.dropdown0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown0);
  result = result && compareRenders('dropdown 02, test 03a', source1, mcTest.targetClosed);
  result = result && compareRenders('dropdown 02, test 03b', source2, mcTest.targetOpen);

  // open #1 again
  dropdownCtrl1.onclickDropdown();
  source1 = mc.Dropdown.view(dropdownCtrl1, mcTest.dropdown0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown0);
  result = result && compareRenders('dropdown 02, test 04a', source1, mcTest.targetOpen);
  result = result && compareRenders('dropdown 02, test 04b', source2, mcTest.targetClosed);

  // open #2 again
  dropdownCtrl2.onclickDropdown();
  source1 = mc.Dropdown.view(dropdownCtrl1, mcTest.dropdown0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown0);
  result = result && compareRenders('dropdown 02, test 05a', source1, mcTest.targetClosed);
  result = result && compareRenders('dropdown 02, test 05b', source2, mcTest.targetOpen);

  // close #2
  dropdownCtrl2.onclickDropdown();
  source1 = mc.Dropdown.view(dropdownCtrl1, mcTest.dropdown0);
  source2 = mc.Dropdown.view(dropdownCtrl2, mcTest.dropdown0);
  result = result && compareRenders('dropdown 02, test 06a', source1, mcTest.targetClosed);
  result = result && compareRenders('dropdown 02, test 06b', source2, mcTest.targetClosed);

  return result;
});
test.print(console.log);