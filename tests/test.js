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