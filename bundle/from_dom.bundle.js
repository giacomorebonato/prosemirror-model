/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var ref = __webpack_require__(4);
var findDiffStart = ref.findDiffStart;
var findDiffEnd = ref.findDiffEnd;

// ::- Fragment is the type used to represent a node's collection of
// child nodes.
//
// Fragments are persistent data structures. That means you should
// _not_ mutate them or their content, but create new instances
// whenever needed. The API tries to make this easy.
var Fragment = function(content, size) {
  var this$1 = this;

  this.content = content
  this.size = size || 0
  if (size == null) { for (var i = 0; i < content.length; i++)
    { this$1.size += content[i].nodeSize } }
};

var prototypeAccessors = { firstChild: {},lastChild: {},childCount: {} };

// :: (number, number, (node: Node, start: number, parent: Node, index: number) → ?bool)
// Invoke a callback for all descendant nodes between the given two
// positions (relative to start of this fragment). Doesn't descend
// into a node when the callback returns `false`.
Fragment.prototype.nodesBetween = function (from, to, f, nodeStart, parent) {
    var this$1 = this;
    if ( nodeStart === void 0 ) nodeStart = 0;

  for (var i = 0, pos = 0; pos < to; i++) {
    var child = this$1.content[i], end = pos + child.nodeSize
    if (end > from && f(child, nodeStart + pos, parent, i) !== false && child.content.size) {
      var start = pos + 1
      child.nodesBetween(Math.max(0, from - start),
                         Math.min(child.content.size, to - start),
                         f, nodeStart + start)
    }
    pos = end
  }
};

// :: ((node: Node, pos: number, parent: Node) → ?bool)
// Call the given callback for every descendant node. The callback
// may return `false` to prevent traversal of its child nodes.
Fragment.prototype.descendants = function (f) {
  this.nodesBetween(0, this.size, f)
};

// : (number, number, ?string, ?string) → string
Fragment.prototype.textBetween = function (from, to, blockSeparator, leafText) {
  var text = "", separated = true
  this.nodesBetween(from, to, function (node, pos) {
    if (node.isText) {
      text += node.text.slice(Math.max(from, pos) - pos, to - pos)
      separated = !blockSeparator
    } else if (node.isLeaf && leafText) {
      text += leafText
      separated = !blockSeparator
    } else if (!separated && node.isBlock) {
      text += blockSeparator
      separated = true
    }
  }, 0)
  return text
};

// :: (Fragment) → Fragment
// Create a new fragment containing the content of this fragment and
// `other`.
Fragment.prototype.append = function (other) {
  if (!other.size) { return this }
  if (!this.size) { return other }
  var last = this.lastChild, first = other.firstChild, content = this.content.slice(), i = 0
  if (last.isText && last.sameMarkup(first)) {
    content[content.length - 1] = last.withText(last.text + first.text)
    i = 1
  }
  for (; i < other.content.length; i++) { content.push(other.content[i]) }
  return new Fragment(content, this.size + other.size)
};

// :: (number, ?number) → Fragment
// Cut out the sub-fragment between the two given positions.
Fragment.prototype.cut = function (from, to) {
    var this$1 = this;

  if (to == null) { to = this.size }
  if (from == 0 && to == this.size) { return this }
  var result = [], size = 0
  if (to > from) { for (var i = 0, pos = 0; pos < to; i++) {
    var child = this$1.content[i], end = pos + child.nodeSize
    if (end > from) {
      if (pos < from || end > to) {
        if (child.isText)
          { child = child.cut(Math.max(0, from - pos), Math.min(child.text.length, to - pos)) }
        else
          { child = child.cut(Math.max(0, from - pos - 1), Math.min(child.content.size, to - pos - 1)) }
      }
      result.push(child)
      size += child.nodeSize
    }
    pos = end
  } }
  return new Fragment(result, size)
};

Fragment.prototype.cutByIndex = function (from, to) {
  if (from == to) { return Fragment.empty }
  if (from == 0 && to == this.content.length) { return this }
  return new Fragment(this.content.slice(from, to))
};

// :: (number, Node) → Fragment
// Create a new fragment in which the node at the given index is
// replaced by the given node.
Fragment.prototype.replaceChild = function (index, node) {
  var current = this.content[index]
  if (current == node) { return this }
  var copy = this.content.slice()
  var size = this.size + node.nodeSize - current.nodeSize
  copy[index] = node
  return new Fragment(copy, size)
};

// : (Node) → Fragment
// Create a new fragment by prepending the given node to this
// fragment.
Fragment.prototype.addToStart = function (node) {
  return new Fragment([node].concat(this.content), this.size + node.nodeSize)
};

// : (Node) → Fragment
// Create a new fragment by appending the given node to this
// fragment.
Fragment.prototype.addToEnd = function (node) {
  return new Fragment(this.content.concat(node), this.size + node.nodeSize)
};

// :: (Fragment) → bool
// Compare this fragment to another one.
Fragment.prototype.eq = function (other) {
    var this$1 = this;

  if (this.content.length != other.content.length) { return false }
  for (var i = 0; i < this.content.length; i++)
    { if (!this$1.content[i].eq(other.content[i])) { return false } }
  return true
};

// :: ?Node
// The first child of the fragment, or `null` if it is empty.
prototypeAccessors.firstChild.get = function () { return this.content.length ? this.content[0] : null };

// :: ?Node
// The last child of the fragment, or `null` if it is empty.
prototypeAccessors.lastChild.get = function () { return this.content.length ? this.content[this.content.length - 1] : null };

// :: number
// The number of child nodes in this fragment.
prototypeAccessors.childCount.get = function () { return this.content.length };

// :: (number) → Node
// Get the child node at the given index. Raise an error when the
// index is out of range.
Fragment.prototype.child = function (index) {
  var found = this.content[index]
  if (!found) { throw new RangeError("Index " + index + " out of range for " + this) }
  return found
};

// :: (number) → number
// Get the offset at (size of children before) the given index.
Fragment.prototype.offsetAt = function (index) {
    var this$1 = this;

  var offset = 0
  for (var i = 0; i < index; i++) { offset += this$1.content[i].nodeSize }
  return offset
};

// :: (number) → ?Node
// Get the child node at the given index, if it exists.
Fragment.prototype.maybeChild = function (index) {
  return this.content[index]
};

// :: ((node: Node, offset: number, index: number))
// Call `f` for every child node, passing the node, its offset
// into this parent node, and its index.
Fragment.prototype.forEach = function (f) {
    var this$1 = this;

  for (var i = 0, p = 0; i < this.content.length; i++) {
    var child = this$1.content[i]
    f(child, p, i)
    p += child.nodeSize
  }
};

// :: (Fragment) → ?number
// Find the first position at which this fragment and another
// fragment differ, or `null` if they are the same.
Fragment.prototype.findDiffStart = function (other, pos) {
    if ( pos === void 0 ) pos = 0;

  return findDiffStart(this, other, pos)
};

// :: (Node) → ?{a: number, b: number}
// Find the first position, searching from the end, at which this
// fragment and the given fragment differ, or `null` if they are the
// same. Since this position will not be the same in both nodes, an
// object with two separate positions is returned.
Fragment.prototype.findDiffEnd = function (other, pos, otherPos) {
    if ( pos === void 0 ) pos = this.size;
    if ( otherPos === void 0 ) otherPos = other.size;

  return findDiffEnd(this, other, pos, otherPos)
};

// : (number, ?number) → {index: number, offset: number}
// Find the index and inner offset corresponding to a given relative
// position in this fragment. The result object will be reused
// (overwritten) the next time the function is called. (Not public.)
Fragment.prototype.findIndex = function (pos, round) {
    var this$1 = this;
    if ( round === void 0 ) round = -1;

  if (pos == 0) { return retIndex(0, pos) }
  if (pos == this.size) { return retIndex(this.content.length, pos) }
  if (pos > this.size || pos < 0) { throw new RangeError(("Position " + pos + " outside of fragment (" + (this) + ")")) }
  for (var i = 0, curPos = 0;; i++) {
    var cur = this$1.child(i), end = curPos + cur.nodeSize
    if (end >= pos) {
      if (end == pos || round > 0) { return retIndex(i + 1, end) }
      return retIndex(i, curPos)
    }
    curPos = end
  }
};

// :: () → string
// Return a debugging string that describes this fragment.
Fragment.prototype.toString = function () { return "<" + this.toStringInner() + ">" };

Fragment.prototype.toStringInner = function () { return this.content.join(", ") };

// :: () → ?Object
// Create a JSON-serializeable representation of this fragment.
Fragment.prototype.toJSON = function () {
  return this.content.length ? this.content.map(function (n) { return n.toJSON(); }) : null
};

// :: (Schema, ?Object) → Fragment
// Deserialize a fragment from its JSON representation.
Fragment.fromJSON = function (schema, value) {
  return value ? new Fragment(value.map(schema.nodeFromJSON)) : Fragment.empty
};

// :: ([Node]) → Fragment
// Build a fragment from an array of nodes. Ensures that adjacent
// text nodes with the same style are joined together.
Fragment.fromArray = function (array) {
  if (!array.length) { return Fragment.empty }
  var joined, size = 0
  for (var i = 0; i < array.length; i++) {
    var node = array[i]
    size += node.nodeSize
    if (i && node.isText && array[i - 1].sameMarkup(node)) {
      if (!joined) { joined = array.slice(0, i) }
      joined[joined.length - 1] = node.withText(joined[joined.length - 1].text + node.text)
    } else if (joined) {
      joined.push(node)
    }
  }
  return new Fragment(joined || array, size)
};

// :: (?union<Fragment, Node, [Node]>) → Fragment
// Create a fragment from something that can be interpreted as a set
// of nodes. For `null`, it returns the empty fragment. For a
// fragment, the fragment itself. For a node or array of nodes, a
// fragment containing those nodes.
Fragment.from = function (nodes) {
  if (!nodes) { return Fragment.empty }
  if (nodes instanceof Fragment) { return nodes }
  if (Array.isArray(nodes)) { return this.fromArray(nodes) }
  return new Fragment([nodes], nodes.nodeSize)
};

Object.defineProperties( Fragment.prototype, prototypeAccessors );
exports.Fragment = Fragment

var found = {index: 0, offset: 0}
function retIndex(index, offset) {
  found.index = index
  found.offset = offset
  return found
}

// :: Fragment
// An empty fragment. Intended to be reused whenever a node doesn't
// contain anything (rather than allocating a new empty fragment for
// each leaf node).
Fragment.empty = new Fragment([], 0)


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var ref = __webpack_require__(3);
var compareDeep = ref.compareDeep;

// ::- A mark is a piece of information that can be attached to a node,
// such as it being emphasized, in code font, or a link. It has a type
// and optionally a set of attributes that provide further information
// (such as the target of the link). Marks are created through a
// `Schema`, which controls which types exist and which
// attributes they have.
var Mark = function(type, attrs) {
  // :: MarkType
  // The type of this mark.
  this.type = type
  // :: Object
  // The attributes associated with this mark.
  this.attrs = attrs
};

// :: ([Mark]) → [Mark]
// Given a set of marks, create a new set which contains this one as
// well, in the right position. If this mark is already in the set,
// the set itself is returned. If a mark of this type with different
// attributes is already in the set, a set in which it is replaced
// by this one is returned.
Mark.prototype.addToSet = function (set) {
    var this$1 = this;

  var copy, placed = false
  for (var i = 0; i < set.length; i++) {
    var other = set[i]
    if (this$1.eq(other)) { return set }
    if (this$1.type.excludes(other.type)) {
      if (!copy) { copy = set.slice(0, i) }
    } else if (other.type.excludes(this$1.type)) {
      return set
    } else {
      if (!placed && other.type.rank > this$1.type.rank) {
        if (!copy) { copy = set.slice(0, i) }
        copy.push(this$1)
        placed = true
      }
      if (copy) { copy.push(other) }
    }
  }
  if (!copy) { copy = set.slice() }
  if (!placed) { copy.push(this) }
  return copy
};

// :: ([Mark]) → [Mark]
// Remove this mark from the given set, returning a new set. If this
// mark is not in the set, the set itself is returned.
Mark.prototype.removeFromSet = function (set) {
    var this$1 = this;

  for (var i = 0; i < set.length; i++)
    { if (this$1.eq(set[i]))
      { return set.slice(0, i).concat(set.slice(i + 1)) } }
  return set
};

// :: ([Mark]) → bool
// Test whether this mark is in the given set of marks.
Mark.prototype.isInSet = function (set) {
    var this$1 = this;

  for (var i = 0; i < set.length; i++)
    { if (this$1.eq(set[i])) { return true } }
  return false
};

// :: (Mark) → bool
// Test whether this mark has the same type and attributes as
// another mark.
Mark.prototype.eq = function (other) {
  return this == other ||
    (this.type == other.type && compareDeep(this.attrs, other.attrs))
};

// :: () → Object
// Convert this mark to a JSON-serializeable representation.
Mark.prototype.toJSON = function () {
    var this$1 = this;

  var obj = {type: this.type.name}
  for (var _ in this$1.attrs) {
    obj.attrs = this$1.attrs
    break
  }
  return obj
};

// :: (Schema, Object) → Mark
Mark.fromJSON = function (schema, json) {
  var type = schema.marks[json.type]
  if (!type) { throw new RangeError(("There is no mark type " + (json.type) + " in this schema")) }
  return type.create(json.attrs)
};

// :: ([Mark], [Mark]) → bool
// Test whether two sets of marks are identical.
Mark.sameSet = function (a, b) {
  if (a == b) { return true }
  if (a.length != b.length) { return false }
  for (var i = 0; i < a.length; i++)
    { if (!a[i].eq(b[i])) { return false } }
  return true
};

// :: (?union<Mark, [Mark]>) → [Mark]
// Create a properly sorted mark set from null, a single mark, or an
// unsorted array of marks.
Mark.setFrom = function (marks) {
  if (!marks || marks.length == 0) { return Mark.none }
  if (marks instanceof Mark) { return [marks] }
  var copy = marks.slice()
  copy.sort(function (a, b) { return a.type.rank - b.type.rank; })
  return copy
};
exports.Mark = Mark

// :: [Mark] The empty set of marks.
Mark.none = []


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var ref = __webpack_require__(0);
var Fragment = ref.Fragment;

// ::- Error type raised by [`Node.replace`](#model.Node.replace) when
// given an invalid replacement.
var ReplaceError = (function (Error) {
  function ReplaceError(message) {
    Error.call(this, message)
    this.message = message
  }

  if ( Error ) ReplaceError.__proto__ = Error;
  ReplaceError.prototype = Object.create( Error && Error.prototype );
  ReplaceError.prototype.constructor = ReplaceError;

  var prototypeAccessors = { name: {} };
  prototypeAccessors.name.get = function () { return "ReplaceError" };

  Object.defineProperties( ReplaceError.prototype, prototypeAccessors );

  return ReplaceError;
}(Error));
exports.ReplaceError = ReplaceError

var warnedAboutOpen = false
function warnAboutOpen() {
  if (!warnedAboutOpen && typeof console != "undefined" && console.warn) {
    warnedAboutOpen = true
    console.warn("Slice.openLeft has been renamed to openStart, and Slice.openRight to openEnd")
  }
}

// ::- A slice represents a piece cut out of a larger document. It
// stores not only a fragment, but also the depth up to which nodes on
// both side are 'open' / cut through.
var Slice = function(content, openStart, openEnd) {
  // :: Fragment The slice's content nodes.
  this.content = content
  // :: number The open depth at the start.
  this.openStart = openStart
  // :: number The open depth at the end.
  this.openEnd = openEnd
};

var prototypeAccessors$1 = { openLeft: {},openRight: {},size: {} };

prototypeAccessors$1.openLeft.get = function () { warnAboutOpen(); return this.openStart };
prototypeAccessors$1.openRight.get = function () { warnAboutOpen(); return this.openEnd };

// :: number
// The size this slice would add when inserted into a document.
prototypeAccessors$1.size.get = function () {
  return this.content.size - this.openStart - this.openEnd
};

Slice.prototype.insertAt = function (pos, fragment) {
  var content = insertInto(this.content, pos + this.openStart, fragment, null)
  return content && new Slice(content, this.openStart, this.openEnd)
};

Slice.prototype.removeBetween = function (from, to) {
  return new Slice(removeRange(this.content, from + this.openStart, to + this.openStart), this.openStart, this.openEnd)
};

// :: (Slice) → bool
// Tests whether this slice is equal to another slice.
Slice.prototype.eq = function (other) {
  return this.content.eq(other.content) && this.openStart == other.openStart && this.openEnd == other.openEnd
};

Slice.prototype.toString = function () {
  return this.content + "(" + this.openStart + "," + this.openEnd + ")"
};

// :: () → ?Object
// Convert a slice to a JSON-serializable representation.
Slice.prototype.toJSON = function () {
  if (!this.content.size) { return null }
  var json = {content: this.content.toJSON()}
  if (this.openStart > 0) { json.openStart = this.openStart }
  if (this.openEnd > 0) { json.openEnd = this.openEnd }
  return json
};

// :: (Schema, ?Object) → Slice
// Deserialize a slice from its JSON representation.
Slice.fromJSON = function (schema, json) {
  if (!json) { return Slice.empty }
  return new Slice(Fragment.fromJSON(schema, json.content), json.openStart || 0, json.openEnd || 0)
};

// :: (Fragment) → Slice
// Create a slice from a fragment by taking the maximum possible
// open value on both side of the fragment.
Slice.maxOpen = function (fragment) {
  var openStart = 0, openEnd = 0
  for (var n = fragment.firstChild; n && !n.isLeaf; n = n.firstChild) { openStart++ }
  for (var n$1 = fragment.lastChild; n$1 && !n$1.isLeaf; n$1 = n$1.lastChild) { openEnd++ }
  return new Slice(fragment, openStart, openEnd)
};

Object.defineProperties( Slice.prototype, prototypeAccessors$1 );
exports.Slice = Slice

function removeRange(content, from, to) {
  var ref = content.findIndex(from);
  var index = ref.index;
  var offset = ref.offset;
  var child = content.maybeChild(index)
  var ref$1 = content.findIndex(to);
  var indexTo = ref$1.index;
  var offsetTo = ref$1.offset;
  if (offset == from || child.isText) {
    if (offsetTo != to && !content.child(indexTo).isText) { throw new RangeError("Removing non-flat range") }
    return content.cut(0, from).append(content.cut(to))
  }
  if (index != indexTo) { throw new RangeError("Removing non-flat range") }
  return content.replaceChild(index, child.copy(removeRange(child.content, from - offset - 1, to - offset - 1)))
}

function insertInto(content, dist, insert, parent) {
  var ref = content.findIndex(dist);
  var index = ref.index;
  var offset = ref.offset;
  var child = content.maybeChild(index)
  if (offset == dist || child.isText) {
    if (parent && !parent.canReplace(index, index, insert)) { return null }
    return content.cut(0, dist).append(insert).append(content.cut(dist))
  }
  var inner = insertInto(child.content, dist - offset - 1, insert)
  return inner && content.replaceChild(index, child.copy(inner))
}

// :: Slice
// The empty slice.
Slice.empty = new Slice(Fragment.empty, 0, 0)

function replace($from, $to, slice) {
  if (slice.openStart > $from.depth)
    { throw new ReplaceError("Inserted content deeper than insertion position") }
  if ($from.depth - slice.openStart != $to.depth - slice.openEnd)
    { throw new ReplaceError("Inconsistent open depths") }
  return replaceOuter($from, $to, slice, 0)
}
exports.replace = replace

function replaceOuter($from, $to, slice, depth) {
  var index = $from.index(depth), node = $from.node(depth)
  if (index == $to.index(depth) && depth < $from.depth - slice.openStart) {
    var inner = replaceOuter($from, $to, slice, depth + 1)
    return node.copy(node.content.replaceChild(index, inner))
  } else if (!slice.content.size) {
    return close(node, replaceTwoWay($from, $to, depth))
  } else if (!slice.openStart && !slice.openEnd && $from.depth == depth && $to.depth == depth) { // Simple, flat case
    var parent = $from.parent, content = parent.content
    return close(parent, content.cut(0, $from.parentOffset).append(slice.content).append(content.cut($to.parentOffset)))
  } else {
    var ref = prepareSliceForReplace(slice, $from);
    var start = ref.start;
    var end = ref.end;
    return close(node, replaceThreeWay($from, start, end, $to, depth))
  }
}

function checkJoin(main, sub) {
  if (!sub.type.compatibleContent(main.type))
    { throw new ReplaceError("Cannot join " + sub.type.name + " onto " + main.type.name) }
}

function joinable($before, $after, depth) {
  var node = $before.node(depth)
  checkJoin(node, $after.node(depth))
  return node
}

function addNode(child, target) {
  var last = target.length - 1
  if (last >= 0 && child.isText && child.sameMarkup(target[last]))
    { target[last] = child.withText(target[last].text + child.text) }
  else
    { target.push(child) }
}

function addRange($start, $end, depth, target) {
  var node = ($end || $start).node(depth)
  var startIndex = 0, endIndex = $end ? $end.index(depth) : node.childCount
  if ($start) {
    startIndex = $start.index(depth)
    if ($start.depth > depth) {
      startIndex++
    } else if ($start.textOffset) {
      addNode($start.nodeAfter, target)
      startIndex++
    }
  }
  for (var i = startIndex; i < endIndex; i++) { addNode(node.child(i), target) }
  if ($end && $end.depth == depth && $end.textOffset)
    { addNode($end.nodeBefore, target) }
}

function close(node, content) {
  if (!node.type.validContent(content, node.attrs))
    { throw new ReplaceError("Invalid content for node " + node.type.name) }
  return node.copy(content)
}

function replaceThreeWay($from, $start, $end, $to, depth) {
  var openStart = $from.depth > depth && joinable($from, $start, depth + 1)
  var openEnd = $to.depth > depth && joinable($end, $to, depth + 1)

  var content = []
  addRange(null, $from, depth, content)
  if (openStart && openEnd && $start.index(depth) == $end.index(depth)) {
    checkJoin(openStart, openEnd)
    addNode(close(openStart, replaceThreeWay($from, $start, $end, $to, depth + 1)), content)
  } else {
    if (openStart)
      { addNode(close(openStart, replaceTwoWay($from, $start, depth + 1)), content) }
    addRange($start, $end, depth, content)
    if (openEnd)
      { addNode(close(openEnd, replaceTwoWay($end, $to, depth + 1)), content) }
  }
  addRange($to, null, depth, content)
  return new Fragment(content)
}

function replaceTwoWay($from, $to, depth) {
  var content = []
  addRange(null, $from, depth, content)
  if ($from.depth > depth) {
    var type = joinable($from, $to, depth + 1)
    addNode(close(type, replaceTwoWay($from, $to, depth + 1)), content)
  }
  addRange($to, null, depth, content)
  return new Fragment(content)
}

function prepareSliceForReplace(slice, $along) {
  var extra = $along.depth - slice.openStart, parent = $along.node(extra)
  var node = parent.copy(slice.content)
  for (var i = extra - 1; i >= 0; i--)
    { node = $along.node(i).copy(Fragment.from(node)) }
  return {start: node.resolveNoCache(slice.openStart + extra),
          end: node.resolveNoCache(node.content.size - slice.openEnd - extra)}
}


/***/ }),
/* 3 */
/***/ (function(module, exports) {

function compareDeep(a, b) {
  if (a === b) { return true }
  if (!(a && typeof a == "object") ||
      !(b && typeof b == "object")) { return false }
  var array = Array.isArray(a)
  if (Array.isArray(b) != array) { return false }
  if (array) {
    if (a.length != b.length) { return false }
    for (var i = 0; i < a.length; i++) { if (!compareDeep(a[i], b[i])) { return false } }
  } else {
    for (var p in a) { if (!(p in b) || !compareDeep(a[p], b[p])) { return false } }
    for (var p$1 in b) { if (!(p$1 in a)) { return false } }
  }
  return true
}
exports.compareDeep = compareDeep


/***/ }),
/* 4 */
/***/ (function(module, exports) {

function findDiffStart(a, b, pos) {
  for (var i = 0;; i++) {
    if (i == a.childCount || i == b.childCount)
      { return a.childCount == b.childCount ? null : pos }

    var childA = a.child(i), childB = b.child(i)
    if (childA == childB) { pos += childA.nodeSize; continue }

    if (!childA.sameMarkup(childB)) { return pos }

    if (childA.isText && childA.text != childB.text) {
      for (var j = 0; childA.text[j] == childB.text[j]; j++)
        { pos++ }
      return pos
    }
    if (childA.content.size || childB.content.size) {
      var inner = findDiffStart(childA.content, childB.content, pos + 1)
      if (inner != null) { return inner }
    }
    pos += childA.nodeSize
  }
}
exports.findDiffStart = findDiffStart

function findDiffEnd(a, b, posA, posB) {
  for (var iA = a.childCount, iB = b.childCount;;) {
    if (iA == 0 || iB == 0)
      { return iA == iB ? null : {a: posA, b: posB} }

    var childA = a.child(--iA), childB = b.child(--iB), size = childA.nodeSize
    if (childA == childB) {
      posA -= size; posB -= size
      continue
    }

    if (!childA.sameMarkup(childB)) { return {a: posA, b: posB} }

    if (childA.isText && childA.text != childB.text) {
      var same = 0, minSize = Math.min(childA.text.length, childB.text.length)
      while (same < minSize && childA.text[childA.text.length - same - 1] == childB.text[childB.text.length - same - 1]) {
        same++; posA--; posB--
      }
      return {a: posA, b: posB}
    }
    if (childA.content.size || childB.content.size) {
      var inner = findDiffEnd(childA.content, childB.content, posA - 1, posB - 1)
      if (inner) { return inner }
    }
    posA -= size; posB -= size
  }
}
exports.findDiffEnd = findDiffEnd


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var ref = __webpack_require__(0);
var Fragment = ref.Fragment;
var ref$1 = __webpack_require__(2);
var Slice = ref$1.Slice;
var ref$2 = __webpack_require__(1);
var Mark = ref$2.Mark;

// ParseOptions:: interface
// Set of options for parsing a DOM node.
//
//   preserveWhitespace:: ?union<bool, "full">
//   By default, whitespace is collapsed as per HTML's rules. Pass
//   `true` to preserve whitespace, but normalize newlines to
//   spaces, and `"full"` to preserve whitespace entirely.
//
//   findPositions:: ?[{node: dom.Node, offset: number}]
//   When given, the parser will, beside parsing the content,
//   record the document positions of the given DOM positions. It
//   will do so by writing to the objects, adding a `pos` property
//   that holds the document position. DOM positions that are not
//   in the parsed content will not be written to.
//
//   from:: ?number
//   The child node index to start parsing from.
//
//   to:: ?number
//   The child node index to stop parsing at.
//
//   topNode:: ?Node
//   By default, the content is parsed into the schema's default
//   [top node type](#model.Schema.topNodeType). You can pass this
//   option to use the type and attributes from a different node
//   as the top container.
//
//   topStart:: ?number
//   Can be used to influence the content match at the start of
//   the topnode. When given, should be a valid index into
//   `topNode`.
//
//   context:: ?ResolvedPos
//   A set of additional node names to count as
//   [context](#model.ParseRule.context) when parsing, above the
//   given [top node](#model.DOMParser.parse^options.topNode).

// ParseRule:: interface
// A value that describes how to parse a given DOM node or inline
// style as a ProseMirror node or mark.
//
//   tag:: ?string
//   A CSS selector describing the kind of DOM elements to match. A
//   single rule should have _either_ a `tag` or a `style` property.
//
//   namespace:: ?string
//   The namespace to match. This should be used with `tag`.
//   Nodes are only matched when the namespace matches or this property
//   is null.
//
//   style:: ?string
//   A CSS property name to match. When given, this rule matches
//   inline styles that list that property.
//
//   context:: ?string
//   When given, restricts this rule to only match when the current
//   context—the parent nodes into which the content is being
//   parsed—matches this expression. Should contain one or more node
//   names or node group names followed by single or double slashes.
//   For example `"paragraph/"` means the rule only matches when the
//   parent node is a paragraph, `"blockquote/paragraph/"` restricts
//   it to be in a paragraph that is inside a blockquote, and
//   `"section//"` matches any position inside a section—a double
//   slash matches any sequence of ancestor nodes.
//
//   node:: ?string
//   The name of the node type to create when this rule matches. Only
//   valid for rules with a `tag` property, not for style rules. Each
//   rule should have one of a `node`, `mark`, or `ignore` property
//   (except when it appears in a [node](#model.NodeSpec.parseDOM) or
//   [mark spec](#model.MarkSpec.parseDOM), in which case the `node`
//   or `mark` property will be derived from its position).
//
//   mark:: ?string
//   The name of the mark type to wrap the matched content in.
//
//   priority:: ?number
//   Can be used to change the order in which the parse rules in a
//   schema are tried. Those with higher priority come first. Rules
//   without a priority are counted as having priority 50. This
//   property is only meaningful in a schema—when directly
//   constructing a parser, the order of the rule array is used.
//
//   ignore:: ?bool
//   When true, ignore content that matches this rule.
//
//   skip:: ?bool
//   When true, ignore the node that matches this rule, but do parse
//   its content.
//
//   attrs:: ?Object
//   Attributes for the node or mark created by this rule. When
//   `getAttrs` is provided, it takes precedence.
//
//   getAttrs:: ?(union<dom.Node, string>) → ?union<bool, Object>
//   A function used to compute the attributes for the node or mark
//   created by this rule. Can also be used to describe further
//   conditions the DOM element or style must match. When it returns
//   `false`, the rule won't match. When it returns null or undefined,
//   that is interpreted as an empty/default set of attributes.
//
//   Called with a DOM Element for `tag` rules, and with a string (the
//   style's value) for `style` rules.
//
//   contentElement:: ?string
//   For `tag` rules that produce non-leaf nodes or marks, by default
//   the content of the DOM element is parsed as content of the mark
//   or node. If the child nodes are in a descendent node, this may be
//   a CSS selector string that the parser must use to find the actual
//   content element.
//
//   getContent:: ?(dom.Node) → Fragment
//   Can be used to override the content of a matched node. Will be
//   called, and its result used, instead of parsing the node's child
//   nodes.
//
//   preserveWhitespace:: ?union<bool, "full">
//   Controls whether whitespace should be preserved when parsing the
//   content inside the matched element. `false` means whitespace may
//   be collapsed, `true` means that whitespace should be preserved
//   but newlines normalized to spaces, and `"full"` means that
//   newlines should also be preserved.

// ::- A DOM parser represents a strategy for parsing DOM content into
// a ProseMirror document conforming to a given schema. Its behavior
// is defined by an array of [rules](#model.ParseRule).
var DOMParser = function(schema, rules) {
  var this$1 = this;

  // :: Schema
  this.schema = schema
  // :: [ParseRule]
  this.rules = rules
  this.tags = []
  this.styles = []

  rules.forEach(function (rule) {
    if (rule.tag) { this$1.tags.push(rule) }
    else if (rule.style) { this$1.styles.push(rule) }
  })
};

// :: (dom.Node, ?ParseOptions) → Node
// Parse a document from the content of a DOM node.
DOMParser.prototype.parse = function (dom, options) {
    if ( options === void 0 ) options = {};

  var context = new ParseContext(this, options, false)
  context.addAll(dom, null, options.from, options.to)
  return context.finish()
};

// :: (dom.Node, ?ParseOptions) → Slice
// Parses the content of the given DOM node, like
// [`parse`](#model.DOMParser.parse), and takes the same set of
// options. But unlike that method, which produces a whole node,
// this one returns a slice that is open at the sides, meaning that
// the schema constraints aren't applied to the start of nodes to
// the left of the input and the end of nodes at the end.
DOMParser.prototype.parseSlice = function (dom, options) {
    if ( options === void 0 ) options = {};

  var context = new ParseContext(this, options, true)
  context.addAll(dom, null, options.from, options.to)
  return Slice.maxOpen(context.finish())
};

DOMParser.prototype.matchTag = function (dom, context) {
    var this$1 = this;

  for (var i = 0; i < this.tags.length; i++) {
    var rule = this$1.tags[i]
    if (matches(dom, rule.tag) &&
        (!rule.namespace || dom.namespaceURI == rule.namespace) &&
        (!rule.context || context.matchesContext(rule.context))) {
      if (rule.getAttrs) {
        var result = rule.getAttrs(dom)
        if (result === false) { continue }
        rule.attrs = result
      }
      return rule
    }
  }
};

DOMParser.prototype.matchStyle = function (prop, value, context) {
    var this$1 = this;

  for (var i = 0; i < this.styles.length; i++) {
    var rule = this$1.styles[i]
    if (rule.style == prop && (!rule.context || context.matchesContext(rule.context))) {
      if (rule.getAttrs) {
        var result = rule.getAttrs(value)
        if (result === false) { continue }
        rule.attrs = result
      }
      return rule
    }
  }
};

// :: (Schema) → [ParseRule]
// Extract the parse rules listed in a schema's [node
// specs](#model.NodeSpec.parseDOM).
DOMParser.schemaRules = function (schema) {
  var result = []
  function insert(rule) {
    var priority = rule.priority == null ? 50 : rule.priority, i = 0
    for (; i < result.length; i++) {
      var next = result[i], nextPriority = next.priority == null ? 50 : next.priority
      if (nextPriority < priority) { break }
    }
    result.splice(i, 0, rule)
  }

  var loop = function ( name ) {
    var rules = schema.marks[name].spec.parseDOM
    if (rules) { rules.forEach(function (rule) {
      insert(rule = copy(rule))
      rule.mark = name
    }) }
  };

    for (var name in schema.marks) loop( name );
  var loop$1 = function ( name ) {
    var rules$1 = schema.nodes[name$1].spec.parseDOM
    if (rules$1) { rules$1.forEach(function (rule) {
      insert(rule = copy(rule))
      rule.node = name$1
    }) }
  };

    for (var name$1 in schema.nodes) loop$1( name );
  return result
};

// :: (Schema) → DOMParser
// Construct a DOM parser using the parsing rules listed in a
// schema's [node specs](#model.NodeSpec.parseDOM).
DOMParser.fromSchema = function (schema) {
  return schema.cached.domParser ||
    (schema.cached.domParser = new DOMParser(schema, DOMParser.schemaRules(schema)))
};
exports.DOMParser = DOMParser

// : Object<bool> The block-level tags in HTML5
var blockTags = {
  address: true, article: true, aside: true, blockquote: true, canvas: true,
  dd: true, div: true, dl: true, fieldset: true, figcaption: true, figure: true,
  footer: true, form: true, h1: true, h2: true, h3: true, h4: true, h5: true,
  h6: true, header: true, hgroup: true, hr: true, li: true, noscript: true, ol: true,
  output: true, p: true, pre: true, section: true, table: true, tfoot: true, ul: true
}

// : Object<bool> The tags that we normally ignore.
var ignoreTags = {
  head: true, noscript: true, object: true, script: true, style: true, title: true
}

// : Object<bool> List tags.
var listTags = {ol: true, ul: true}

// Using a bitfield for node context options
var OPT_PRESERVE_WS = 1, OPT_PRESERVE_WS_FULL = 2, OPT_OPEN_LEFT = 4

function wsOptionsFor(preserveWhitespace) {
  return (preserveWhitespace ? OPT_PRESERVE_WS : 0) | (preserveWhitespace === "full" ? OPT_PRESERVE_WS_FULL : 0)
}

var NodeContext = function(type, attrs, solid, match, options) {
  this.type = type
  this.attrs = attrs
  this.solid = solid
  this.match = match || (options & OPT_OPEN_LEFT ? null : type.contentExpr.start(attrs))
  this.options = options
  this.content = []
};

NodeContext.prototype.findWrapping = function (type, attrs) {
  if (!this.match) {
    if (!this.type) { return [] }
    var found = this.type.contentExpr.atType(this.attrs, type, attrs)
    if (!found) {
      var start = this.type.contentExpr.start(this.attrs), wrap
      if (wrap = start.findWrapping(type, attrs)) {
        this.match = start
        return wrap
      }
    }
    if (found) { this.match = found }
    else { return null }
  }
  return this.match.findWrapping(type, attrs)
};

NodeContext.prototype.finish = function (openEnd) {
  if (!(this.options & OPT_PRESERVE_WS)) { // Strip trailing whitespace
    var last = this.content[this.content.length - 1], m
    if (last && last.isText && (m = /\s+$/.exec(last.text))) {
      if (last.text.length == m[0].length) { this.content.pop() }
      else { this.content[this.content.length - 1] = last.withText(last.text.slice(0, last.text.length - m[0].length)) }
    }
  }
  var content = Fragment.from(this.content)
  if (!openEnd && this.match)
    { content = content.append(this.match.fillBefore(Fragment.empty, true)) }
  return this.type ? this.type.create(this.attrs, content) : content
};

var ParseContext = function(parser, options, open) {
  // : DOMParser The parser we are using.
  this.parser = parser
  // : Object The options passed to this parse.
  this.options = options
  this.isOpen = open
  var topNode = options.topNode, topContext
  var topOptions = wsOptionsFor(options.preserveWhitespace) | (open ? OPT_OPEN_LEFT : 0)
  if (topNode)
    { topContext = new NodeContext(topNode.type, topNode.attrs, true,
                                 topNode.contentMatchAt(options.topStart || 0), topOptions) }
  else if (open)
    { topContext = new NodeContext(null, null, true, null, topOptions) }
  else
    { topContext = new NodeContext(parser.schema.topNodeType, null, true, null, topOptions) }
  this.nodes = [topContext]
  // : [Mark] The current set of marks
  this.marks = Mark.none
  this.open = 0
  this.find = options.findPositions
  this.needsBlock = false
};

var prototypeAccessors = { top: {},currentPos: {} };

prototypeAccessors.top.get = function () {
  return this.nodes[this.open]
};

// : (Mark) → [Mark]
// Add a mark to the current set of marks, return the old set.
ParseContext.prototype.addMark = function (mark) {
  var old = this.marks
  this.marks = mark.addToSet(this.marks)
  return old
};

// : (dom.Node)
// Add a DOM node to the content. Text is inserted as text node,
// otherwise, the node is passed to `addElement` or, if it has a
// `style` attribute, `addElementWithStyles`.
ParseContext.prototype.addDOM = function (dom) {
  if (dom.nodeType == 3) {
    this.addTextNode(dom)
  } else if (dom.nodeType == 1) {
    var style = dom.getAttribute("style")
    if (style) { this.addElementWithStyles(parseStyles(style), dom) }
    else { this.addElement(dom) }
  }
};

ParseContext.prototype.addTextNode = function (dom) {
  var value = dom.nodeValue
  var top = this.top
  if ((top.type && top.type.inlineContent) || /\S/.test(value)) {
    if (!(top.options & OPT_PRESERVE_WS)) {
      value = value.replace(/\s+/g, " ")
      // If this starts with whitespace, and there is either no node
      // before it or a node that ends with whitespace, strip the
      // leading space.
      if (/^\s/.test(value) && this.open == this.nodes.length - 1) {
        var nodeBefore = top.content[top.content.length - 1]
        if (!nodeBefore || nodeBefore.isText && /\s$/.test(nodeBefore.text))
          { value = value.slice(1) }
      }
    } else if (!(top.options & OPT_PRESERVE_WS_FULL)) {
      value = value.replace(/\r?\n|\r/g, " ")
    }
    if (value) { this.insertNode(this.parser.schema.text(value, this.marks)) }
    this.findInText(dom)
  } else {
    this.findInside(dom)
  }
};

// : (dom.Element)
// Try to find a handler for the given tag and use that to parse. If
// none is found, the element's content nodes are added directly.
ParseContext.prototype.addElement = function (dom) {
  var name = dom.nodeName.toLowerCase()
  if (listTags.hasOwnProperty(name)) { normalizeList(dom) }
  var rule = (this.options.ruleFromNode && this.options.ruleFromNode(dom)) || this.parser.matchTag(dom, this)
  if (rule ? rule.ignore : ignoreTags.hasOwnProperty(name)) {
    this.findInside(dom)
  } else if (!rule || rule.skip) {
    if (rule && rule.skip.nodeType) { dom = rule.skip }
    var sync, oldNeedsBlock = this.needsBlock
    if (blockTags.hasOwnProperty(name)) {
      sync = this.top
      if (!sync.type) { this.needsBlock = true }
    }
    this.addAll(dom)
    if (sync) { this.sync(sync) }
    this.needsBlock = oldNeedsBlock
  } else {
    this.addElementByRule(dom, rule)
  }
};

// Run any style parser associated with the node's styles. After
// that, if no style parser suppressed the node's content, pass it
// through to `addElement`.
ParseContext.prototype.addElementWithStyles = function (styles, dom) {
    var this$1 = this;

  var oldMarks = this.marks, ignore = false
  for (var i = 0; i < styles.length; i += 2) {
    var rule = this$1.parser.matchStyle(styles[i], styles[i + 1], this$1)
    if (!rule) { continue }
    if (rule.ignore) { ignore = true; break }
    this$1.addMark(this$1.parser.schema.marks[rule.mark].create(rule.attrs))
  }
  if (!ignore) { this.addElement(dom) }
  this.marks = oldMarks
};

// : (dom.Element, ParseRule) → bool
// Look up a handler for the given node. If none are found, return
// false. Otherwise, apply it, use its return value to drive the way
// the node's content is wrapped, and return true.
ParseContext.prototype.addElementByRule = function (dom, rule) {
    var this$1 = this;

  var sync, before, nodeType, markType, mark
  if (rule.node) {
    nodeType = this.parser.schema.nodes[rule.node]
    if (nodeType.isLeaf) { this.insertNode(nodeType.create(rule.attrs, null, this.marks)) }
    else { sync = this.enter(nodeType, rule.attrs, rule.preserveWhitespace) && this.top }
  } else {
    markType = this.parser.schema.marks[rule.mark]
    before = this.addMark(mark = markType.create(rule.attrs))
  }

  if (nodeType && nodeType.isLeaf) {
    this.findInside(dom)
  } else if (rule.getContent) {
    this.findInside(dom)
    rule.getContent(dom).forEach(function (node) { return this$1.insertNode(mark ? node.mark(mark.addToSet(node.marks)) : node); })
  } else {
    var contentDOM = rule.contentElement
    if (typeof contentDOM == "string") { contentDOM = dom.querySelector(contentDOM) }
    if (!contentDOM) { contentDOM = dom }
    this.findAround(dom, contentDOM, true)
    this.addAll(contentDOM, sync)
  }
  if (sync) { this.sync(sync); this.open-- }
  else if (before) { this.marks = before }
  return true
};

// : (dom.Node, ?NodeBuilder, ?number, ?number)
// Add all child nodes between `startIndex` and `endIndex` (or the
// whole node, if not given). If `sync` is passed, use it to
// synchronize after every block element.
ParseContext.prototype.addAll = function (parent, sync, startIndex, endIndex) {
    var this$1 = this;

  var index = startIndex || 0
  for (var dom = startIndex ? parent.childNodes[startIndex] : parent.firstChild,
           end = endIndex == null ? null : parent.childNodes[endIndex];
       dom != end; dom = dom.nextSibling, ++index) {
    this$1.findAtPoint(parent, index)
    this$1.addDOM(dom)
    if (sync && blockTags.hasOwnProperty(dom.nodeName.toLowerCase()))
      { this$1.sync(sync) }
  }
  this.findAtPoint(parent, index)
};

// Try to find a way to fit the given node type into the current
// context. May add intermediate wrappers and/or leave non-solid
// nodes that we're in.
ParseContext.prototype.findPlace = function (type, attrs) {
    var this$1 = this;

  var route, sync
  for (var depth = this.open; depth >= 0; depth--) {
    var node = this$1.nodes[depth]
    var found = node.findWrapping(type, attrs)
    if (found && (!route || route.length > found.length)) {
      route = found
      sync = node
      if (!found.length) { break }
    }
    if (node.solid) { break }
  }
  if (!route) { return false }
  this.sync(sync)
  for (var i = 0; i < route.length; i++)
    { this$1.enterInner(route[i].type, route[i].attrs, false) }
  return true
};

// : (Node) → ?Node
// Try to insert the given node, adjusting the context when needed.
ParseContext.prototype.insertNode = function (node) {
  if (node.isInline && this.needsBlock && !this.top.type) {
    var block = this.textblockFromContext()
    if (block) { this.enter(block) }
  }
  if (this.findPlace(node.type, node.attrs)) {
    this.closeExtra()
    var top = this.top
    if (top.match) {
      var match = top.match.matchNode(node)
      if (!match) {
        node = node.mark(node.marks.filter(function (mark) { return top.match.allowsMark(mark.type); }))
        match = top.match.matchNode(node)
      }
      top.match = match
    }
    top.content.push(node)
  }
};

// : (NodeType, ?Object) → bool
// Try to start a node of the given type, adjusting the context when
// necessary.
ParseContext.prototype.enter = function (type, attrs, preserveWS) {
  var ok = this.findPlace(type, attrs)
  if (ok) { this.enterInner(type, attrs, true, preserveWS) }
  return ok
};

// Open a node of the given type
ParseContext.prototype.enterInner = function (type, attrs, solid, preserveWS) {
  this.closeExtra()
  var top = this.top
  top.match = top.match && top.match.matchType(type, attrs)
  var options = preserveWS == null ? top.options & ~OPT_OPEN_LEFT : wsOptionsFor(preserveWS)
  if ((top.options & OPT_OPEN_LEFT) && top.content.length == 0) { options |= OPT_OPEN_LEFT }
  this.nodes.push(new NodeContext(type, attrs, solid, null, options))
  this.open++
};

// Make sure all nodes above this.open are finished and added to
// their parents
ParseContext.prototype.closeExtra = function (openEnd) {
    var this$1 = this;

  var i = this.nodes.length - 1
  if (i > this.open) {
    this.marks = Mark.none
    for (; i > this.open; i--) { this$1.nodes[i - 1].content.push(this$1.nodes[i].finish(openEnd)) }
    this.nodes.length = this.open + 1
  }
};

ParseContext.prototype.finish = function () {
  this.open = 0
  this.closeExtra(this.isOpen)
  return this.nodes[0].finish(this.isOpen || this.options.topOpen)
};

ParseContext.prototype.sync = function (to) {
    var this$1 = this;

  for (var i = this.open; i >= 0; i--) { if (this$1.nodes[i] == to) {
    this$1.open = i
    return
  } }
};

prototypeAccessors.currentPos.get = function () {
    var this$1 = this;

  this.closeExtra()
  var pos = 0
  for (var i = this.open; i >= 0; i--) {
    var content = this$1.nodes[i].content
    for (var j = content.length - 1; j >= 0; j--)
      { pos += content[j].nodeSize }
    if (i) { pos++ }
  }
  return pos
};

ParseContext.prototype.findAtPoint = function (parent, offset) {
    var this$1 = this;

  if (this.find) { for (var i = 0; i < this.find.length; i++) {
    if (this$1.find[i].node == parent && this$1.find[i].offset == offset)
      { this$1.find[i].pos = this$1.currentPos }
  } }
};

ParseContext.prototype.findInside = function (parent) {
    var this$1 = this;

  if (this.find) { for (var i = 0; i < this.find.length; i++) {
    if (this$1.find[i].pos == null && parent.nodeType == 1 && parent.contains(this$1.find[i].node))
      { this$1.find[i].pos = this$1.currentPos }
  } }
};

ParseContext.prototype.findAround = function (parent, content, before) {
    var this$1 = this;

  if (parent != content && this.find) { for (var i = 0; i < this.find.length; i++) {
    if (this$1.find[i].pos == null && parent.nodeType == 1 && parent.contains(this$1.find[i].node)) {
      var pos = content.compareDocumentPosition(this$1.find[i].node)
      if (pos & (before ? 2 : 4))
        { this$1.find[i].pos = this$1.currentPos }
    }
  } }
};

ParseContext.prototype.findInText = function (textNode) {
    var this$1 = this;

  if (this.find) { for (var i = 0; i < this.find.length; i++) {
    if (this$1.find[i].node == textNode)
      { this$1.find[i].pos = this$1.currentPos - (textNode.nodeValue.length - this$1.find[i].offset) }
  } }
};

// : (string) → bool
// Determines whether the given [context
// string](#ParseRule.context) matches this context.
ParseContext.prototype.matchesContext = function (context) {
    var this$1 = this;

  var parts = context.split("/")
  var option = this.options.context
  var useRoot = !this.isOpen && (!option || option.parent.type == this.nodes[0].type)
  var minDepth = -(option ? option.depth + 1 : 0) + (useRoot ? 0 : 1)
  var match = function (i, depth) {
    for (; i >= 0; i--) {
      var part = parts[i]
      if (part == "") {
        if (i == parts.length - 1 || i == 0) { continue }
        for (; depth >= minDepth; depth--)
          { if (match(i - 1, depth)) { return true } }
        return false
      } else {
        var next = depth > 0 || (depth == 0 && useRoot) ? this$1.nodes[depth].type
            : option && depth >= minDepth ? option.node(depth - minDepth).type
            : null
        if (!next || (next.name != part && next.groups.indexOf(part) == -1))
          { return false }
        depth--
      }
    }
    return true
  }
  return match(parts.length - 1, this.open)
};

ParseContext.prototype.textblockFromContext = function () {
    var this$1 = this;

  var $context = this.options.context
  if ($context) { for (var d = $context.depth; d >= 0; d--) {
    var deflt = $context.node(d).defaultContentType($context.indexAfter(d))
    if (deflt && deflt.isTextblock && deflt.defaultAttrs) { return deflt }
  } }
  for (var name in this$1.parser.schema.nodes) {
    var type = this$1.parser.schema.nodes[name]
    if (type.isTextblock && type.defaultAttrs) { return type }
  }
};

Object.defineProperties( ParseContext.prototype, prototypeAccessors );

// Kludge to work around directly nested list nodes produced by some
// tools and allowed by browsers to mean that the nested list is
// actually part of the list item above it.
function normalizeList(dom) {
  for (var child = dom.firstChild, prevItem = null; child; child = child.nextSibling) {
    var name = child.nodeType == 1 ? child.nodeName.toLowerCase() : null
    if (name && listTags.hasOwnProperty(name) && prevItem) {
      prevItem.appendChild(child)
      child = prevItem
    } else if (name == "li") {
      prevItem = child
    } else if (name) {
      prevItem = null
    }
  }
}

// Apply a CSS selector.
function matches(dom, selector) {
  return (dom.matches || dom.msMatchesSelector || dom.webkitMatchesSelector || dom.mozMatchesSelector).call(dom, selector)
}

// : (string) → [string]
// Tokenize a style attribute into property/value pairs.
function parseStyles(style) {
  var re = /\s*([\w-]+)\s*:\s*([^;]+)/g, m, result = []
  while (m = re.exec(style)) { result.push(m[1], m[2].trim()) }
  return result
}

function copy(obj) {
  var copy = {}
  for (var prop in obj) { copy[prop] = obj[prop] }
  return copy
}

window.DOMParser = DOMParser

/***/ })
/******/ ]);





var hack = function(html) {
  const schema = new Schema({
    nodes: {
      doc: {content: "block+"},
      paragraph: {group: "block", content: "text*"},
      blockquote: {group: "block", content: "block+"},
      text: {inline: true}
    }
  })

  var parser = DOMParser.fromSchema(schema)
  var json = parser.parse(html)

  return json

}
