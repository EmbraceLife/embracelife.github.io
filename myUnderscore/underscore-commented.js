//     Underscore.js 1.9.1
//     http://underscorejs.org
//     https://github.com/jashkenas/underscore/blob/master/underscore.js
//     (c) 2009-2018 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

/* Guide for Rewriting Source 
 * go for the 'easy' part first and when you digested all 'easy' parts, then the 'hard' part will be easier natually
 * check your expectation of what the function does and write down args and returns details by reading docs and experimenting docs examples
 * debug docs examples (at 13:30-17:00 https://watchandcode.com/courses/77710/lectures/10848372)
 * when reading the source (internal functions in particular), figure out the logic structure (different scenarios) of the code (e.g., cb has 4-5 scenarios) to have a basic understanding of what the code does, (if it is general internal function, then only focus on the part you need to run at the moment, e.g., when reading _.map, we shall only focus the scenario when 'iteratee' is a function in 'cb' ) https://watchandcode.com/courses/77710/lectures/11266132
 * internal functions (refactoring) to include many scenarios could have many edge cases, but it can be confusing and unnecessary really https://watchandcode.com/courses/77710/lectures/11266421
 * bringing in all nested internal function definitions within a function or method to ease the understanding, e.g., bring shallowProperty, getLength to isArrayLike (14:00~ https://watchandcode.com/courses/77710/lectures/11250330)
 * exhaustively utilize debugger and console to understand source code and concepts rather than googling (5:00- https://watchandcode.com/courses/77710/lectures/11250330)
 * use blame & issues to figure out why code was written the way it was https://watchandcode.com/courses/77710/lectures/11266130, such as why use `switch` and `.call` in `optimizeCb`
 * remove all nested internal functions (shallowProperty, getLength) by rewriting the core logic buried under those nested functions for the particular function under investigation (e.g., isArrayLike) (at 27:00~ https://watchandcode.com/courses/77710/lectures/11265427)
 * W&C style for rewriting, always use
 *    1. === (not ==) 
 *    2. if else (not ternary)
 *    3. swift-like naming convention
 *    4. no other nested functions inside a function ??? (how to say it precisely?)
 * use docs and tests to guarantee the rewriting is correct 
 */ 



(function() {
  
  
  /* properly commented methods
    
    unnecessary internal functions
      cb
      optimizeCb

    internal variables
      root
      previousUnderscore
      ArrayProto
      ObjProto
      SymbolProto
      
      
    internal function
      _(obj)
      push (ArrayProto.push)
      slice (ArrayProto.slice)
      toString (ObjProto.toString)
      hasOwnProperty (ObjProto.hasOwnProperty)
      nativeIsArray (Array.isArray)
      nativeKeys (Object.keys)
      nativeCreate (Object.create)

    internal functions made public by me
      _.has
      _.shallowProperty
      _.deepGet 
      _.restArguments
      _.isArrayLike
      _.createPredicateIndexFinder

    official underscore methods
      _.property
      _.each
      _.keys
      _.map
      _.reduce (createReduce, _.reduceRight)
      _.find, _.findIndex, _.findLastIndex, createPredicateIndexFinder
      

    todo: tests for internal functions made public are needed
     
  */ 



    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    

  /**
   * **Wrapper** to organize all internal variables and functions inside
   */
  var internalReference = {};

  var root;
  /** 
   * **Alias** to `window`, `self`, `global`, `this`, or `{}`
   */ 
  internalReference.root = root = typeof self == 'object' && self.self === self && self ||
            typeof global == 'object' && global.global === global && global ||
            this ||
            {};
  
  var previousUnderscore
  /**
   * **Store** previousUnderscore = root._;
   */    
  internalReference.previousUnderscore = previousUnderscore = root._;

  /**
   * **Wrapper** for prototypes and methods underscoreJS depends on
   */
  var internalDependencies = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto, ObjProto, SymbolProto;

  /**
   * ArrayProto = Array.prototype;
   */
  internalDependencies.ArrayProto = ArrayProto = Array.prototype;
  /**
   * ObjProto = Object.prototype;
   */
  internalDependencies.ObjProto = ObjProto = Object.prototype;
  /**
   * SymbolProto = Symbol.prototype or null;
   */
  internalDependencies.SymbolProto = SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

  // Create quick reference variables for speed access to core prototypes.
  var push, slice, toString, hasOwnProperty;

  /**
   * push = ArrayProto.push;
   */
  internalDependencies.push = push = ArrayProto.push;
  /**
   * slice = ArrayProto.slice;
   */
  internalDependencies.slice = slice = ArrayProto.slice;
  /**
   * toString = ObjProto.toString;
   */
  internalDependencies.toString = toString = ObjProto.toString; /* must be assigned first, then use e.g., .call([])  */

  /**
   * hasOwnProperty = ObjProto.hasOwnProperty;
   */
  internalDependencies.hasOwnProperty = hasOwnProperty = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var nativeIsArray = Array.isArray;
  var nativeKeys = Object.keys;
  var nativeCreate = Object.create;

  
  // OFFICIAL: Naked function reference for surrogate-prototype-swapping.
  /**
   * **Wrapper** to include all internal functions for creating underscore public API
   */
  var internalFunctions = {}

  var Ctor;
  /** 
   * Empty function for **surrogate-prototype-swapping**
   */ 
  internalFunctions.Ctor = Ctor = function(){};

  /** 
   * create an instance of object `_` and store `obj` as a property `_wrapped: obj`
   * @param obj
   * @return obj _ {_wrapped: obj}
   */ 
  internalFunctions._ = function(obj) {
    if (obj instanceof internalFunctions._) return obj;
    if (!(this instanceof internalFunctions._)) return new internalFunctions._(obj); 
    // `new` will keep _ as the object name
    this._wrapped = obj;
  };

  var _ = internalFunctions._;
  


  

    // OFFICIAL
    // Export the Underscore object for Node.js, with
    // backwards-compatibility for their old module API. If we're in
    // the browser, add `_` as a global object.
    // (`nodeType` is checked to ensure that `module`
    // and `exports` are not HTML elements.)

  /*
   * @private 
   *  export `_` to environments like old node, current node, or just browser
   * debugger;
  */
  if (typeof exports != 'undefined' && !exports.nodeType) {
    if (typeof module != 'undefined' && !module.nodeType && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.9.1';

  //  OFFICIAL
  //  Internal function that returns an efficient (for current engines) version
  //  of the passed-in callback, to be repeatedly applied in other Underscore
  //  functions. 
  
  
  /** 
   * **Increase performance** of callback execution by **prioritizing** `.call` over `.apply`
   * @param {function} func callback func
   * @param {object} context thisArg, usually an object
   * @param {number} argCount a number that count args for callback function
   * @returns a function
   */
  internalFunctions.optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    // void 0 === undefined => true https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void#Description
    switch (argCount == null ? 3 : argCount) {
      // null == null => true; undefined == null => true
      case 1: return function(value) {
        return func.call(context, value);
      };
      // The 2-argument case is omitted because we’re not using it.
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    // when argCount is > 4, return this function below
    return function() {
      return func.apply(context, arguments);
    };
  };

  var optimizeCb = internalFunctions.optimizeCb;
  
  var builtinIteratee;

  //OFFICIAL
  // An internal function to generate callbacks that can be applied to each
  // element in a collection, returning the desired result — either `identity`,
  // an arbitrary callback, a property matcher, or a property accessor.
    
  
  /** 
   * **CallbackTransformer** : Because we want a method/callback to apply to any type, array, arrayLike, object and even nested version of them, the callback has to adjust itself accordingly.
   * @param {dynamics} value the value's typeof determines which callback to return
   * @param {object} context the object this inside the callback will refer to
   * @param {number} argCount number of args the callback has
   * @returns a callback or a callback execution
   */
  internalFunctions.cb = function(value, context, argCount) {
    /* when current _.iteratee is not equal to builtinIteratee, it means current _.iteratee is a user tailored function which is a different callback from the above ones. */
    if (_.iteratee !== builtinIteratee) return _.iteratee(value, context);
    /* when iteratee is not provided, callbackTransformer switch to _.identity (like doing nothing) */
    if (value == null) return _.identity;
    /* when iteratee is a function type, callbackTransformer switch to _.optimizeCb(value, context, argCount) (basically bind context to iteratee/function itself) */
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    /* when iteratee is an object but not an array, callbackTransformer switch to _.matcher(value) ( to see whether value inside element of obj) */
    if (_.isObject(value) && !_.isArray(value)) return _.matcher(value);
    /* in other cases (number, string, array), callbackTransformer switch to _.property(value) (to get property under key 'value' or keys value) */
    return _.property(value);
  };

  var cb = internalFunctions.cb;
  
  /**
   * **External wrapper** for our callback generator `cb`. Users may customize
   * `_.iteratee` if they want additional predicate/iteratee shorthand styles.
   * This abstraction hides the internal-only argCount argument.
   */
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  builtinIteratee = _.iteratee;

  
  //   OFFICAL
  //  Some functions take a variable number of arguments, or a few expected
  //   arguments at the beginning and then a variable number of values to operate
  //   on. This helper accumulates all remaining arguments past the function’s
  //   argument length (or an explicit `startIndex`), into an array that becomes
  //   the last argument. Similar to ES6’s "rest parameter".
    
  /** 
   * func(args) => restArguments(func, startIndex)(arg1, arg2, ...) => no array format is needed
   * func([el1, el2, el3, ... ]) => restArguments(func, 0)(el1, el2, el3, ...) 
   * func(arg1, [el1, el2, ...]) => restArguments(func, 1)(arg1, el1, el2, ...) 
   * func(arg1, arg2, [el1, el2, ...]) => restArguments(func, 2)(arg1, arg2, el1, el2, ...)
    _.union(arrays) => restArgument(_.union, 0)([1,2], [3,4], ...)
    _.without(array, otherArrays) => restArgument(_.without, 1)([1,2,3,4], 2,4,...)
    var log = _.bind(console.log, console);
    _.delay(func, wait, args) => restArgument(_.delay, 2)(log, 1000, 'logged later', 'and more', 'and less')
    */ 
  var restArguments = _.restArguments = function(func, startIndex) {
    startIndex = startIndex == null ? func.length - 1 : +startIndex;
    // use of + here: convert string to number
    // https://javascript.info/operators#numeric-conversion-unary
    // func.length === num of args of func
    return function() { // user input args are given into the () in this function, see tests below
      var length = Math.max(arguments.length - startIndex, 0),
          rest = Array(length),
          index = 0;
      for (; index < length; index++) {
        rest[index] = arguments[index + startIndex];
      }
      switch (startIndex) {
        case 0: return func.call(this, rest);
        case 1: return func.call(this, arguments[0], rest);
        case 2: return func.call(this, arguments[0], arguments[1], rest);
      }
      // once func.length > 3, we take all args of func into a single array args, so we will use apply instead of call
      var args = Array(startIndex + 1);
      for (index = 0; index < startIndex; index++) {
        args[index] = arguments[index];
      }
      args[startIndex] = rest;
      return func.apply(this, args);
    };
  };


  // OFFICIAL: An internal function for creating a new object that inherits from another.
  /** baseCreate({num: 1}) => {}; whose {}.__proto__ === {num:1}
   * @param prototype an object
   * @return an object with prototype to be its __proto__
   */ 
  /* tests
   _.baseCreate(Array.prototype) => Array {} with __proto__ === Array.protoytpe
   _.baseCreate(Object.prototype) => {} with __proto__ === Object.prototype
   _.baseCreate(String.prototype) =>  String {} with __proto__ === String.prototype
   _.baseCreate(3) => {}
  */
  var baseCreate = _.baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;  /* `new` enables `Ctor` to returns an object */
    Ctor.prototype = null;  /* put `Ctor` back to its original state */
    return result; /* result is a new empty object with an inherited prototype */
  };
  
  /** shallowProperty(key)(obj) => obj[key] or undefined
   * @param key key of an object or key of an array
   * @param obj an object or an array
   * @returns a value or undefined
   */ 
  /* any benefit of using shallowProperty(key)(obj) over obj[key]?
    1. we can throw both key and obj to shallowProperty(key)(obj)
    2. with obj[key], we can throw key but have to manually write obj for using obj[key]
  */
  var shallowProperty = _.shallowProperty = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  /** has(obj, path) ===> obj.hasOwnProperty(path) considering undefined and null too
   * @param obj any object (array, arrayLike, other object)
   * @param path key to the obj above
   * @returns a bool
   */ 
  /* benefit of using has(obj, path) over obj.hasOwnProperty(path):
    1. both obj and path can be thrown to has as variables
    2. but obj.hasOwnProperty(key) has to write obj manually
    3. hasOwnProperty.call(obj, path) will throw errors if obj is undefined or null
    4. it is nicer to wrap `obj != null && hasOwnProperty.call(obj, path);` under `has(obj, path)` */
  var has = _.has = function(obj, path) {
    return obj != null && hasOwnProperty.call(obj, path);
  }

  /** deepGet(obj, path) => a value at many level deep of a nested array, or arrayLike or other object
   * @param obj array, arrayLike or ohter object
   * @param path an array of keys 
   * @returns single value or undefined
   */ 
  /* why make it a method?
    1. it is a single purpose action require many lines of code
    2. no need to rewrite it for a second time
  */
  /* tests 
    _.deepGet([[[5]]], [0,0,0]) => 5
  */
  var deepGet = _.deepGet = function(obj, path) {
    var length = path.length;
    for (var i = 0; i < length; i++) {
      /* if obj is undefined or null, return undefined */
      if (obj == null) return void 0;
      obj = obj[path[i]]; 
    }
    /* if path is empty array or undefined, return undefined  */
    return length ? obj : void 0;
  };

  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = shallowProperty('length');

  /** OFFICIAL
   // Helper for collection methods to determine whether a collection
    // should be iterated as an array or as an object.
    // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
    // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
    */ 
  /** isArrayLike(collection): check array, or arguments, or NodeList
   * @param collection an array, arguments, or NodeList 
   * @return a bool
   */
    
  /* tests
   * try Array.isArray for difference
   * isArrayLike([1,2,3]) => true
   * isArrayLike({length:1}) => true but misleading
   * Array.isArray((function(){return arguments})(1,2,3)) => false
   * _.isArrayLike((function(){return arguments})(1,2,3)) => true on arguments
   * _.isArrayLike(document.getElementsByTagName('div')) => true on NodeList
   */ 
  var isArrayLike = _.isArrayLike = function(collection) {
    // var length = getLength(collection); /* official line, I think my line below is easier to understand */
    var length = shallowProperty('length')(collection); /* also take care of cases when collection is undefined or null */
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };
  
  

  
  
  // Collection Functions
  // --------------------

  /** OFFICIAL: https://underscorejs.org/#each
   // The cornerstone, an `each` implementation, aka `forEach`.
    // Handles raw objects in addition to array-likes. Treats all
    // sparse array-likes as if they were dense.
  */ 
  
  /* _.each = _.forEach = each(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) { 
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  }; */


  /** run callback on each element of an array, arrayLike, or object, return `obj`
   * @param obj array, array-like object, object in general
   * @param iteratee callback function
   * @param context thisArg
   * @returns obj
   */
  /* length and for loop made sure Array.prototype.forEach 
    can only work on array and arrayLike
    but not only objects */
  /* tests
    _.each([1, 2, 3], function(num, i) {
      root.eq(num, i + 1);
    });

    var answers = [];
    _.each([1, 2, 3], function(num){ answers.push(num * this.multiplier); }, {multiplier: 5});
    root.arrayEq(answers, [5, 10, 15]);

    answers = [];
    _.each([1, 2, 3], function(num){ answers.push(num); });
    arrayEq(answers, [1, 2, 3]);

    answers = [];
    var obj = {one: 1, two: 2, three: 3};
    obj.constructor.prototype.four = 4; (eq to obj.__proto__.four = 4)
    _.each(obj, function(value, key){ answers.push(key); });
    arrayEq(answers, ['one', 'two', 'three']);
    delete obj.constructor.prototype.four;

    // ensure the each function is JITed
    _(1000).times(function() { _.each([], function(){}); }); (???)

    var count = 0;
    obj = {1: 'foo', 2: 'bar', 3: 'baz'};
    _.each(obj, function(){ count++; });
    root.eq(count, 3);

    var answer = null;
    _.each([1, 2, 3], function(num, index, arr){ if (_.include(arr, num)) answer = true; });
    
    answers = 0;
    _.each(null, function(){ ++answers; });
    root.eq(answers, 0);

    _.each(false, function(){});  
  */
  _.each = _.forEach = function(obj, iteratee, context) {
    // Given equal readability, I prefer ternary over if-else due to performance  http://jsben.ch/OmGCb
    // void 0 is for the user who assign different values to `undefined` 
    iteratee = (context === void 0) ? iteratee : iteratee.bind(context);

    var i, length;
    if (isArrayLike(obj)) { 

      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }

    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };
  

  /** OFFICIAL: https://underscorejs.org/#map
    *  Return the results of applying the iteratee to each element.
    */ 

  /* _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  }; */
  
  /** run callback on each element of array, arrayLike or other object, return an array with each result in it
   * @param obj array, arrayLike or other object
   * @param iteratee callback function
   * @param context thisArg, usually an object
   * @returns `obj`
   */
  /* tests
    _.map([1, 2, 3], function(num){ return num * 2; }) => [2,4,6]

    _.map([1, 2, 3], function(num){ return num * this.multiplier; }, {multiplier: 3}) => [3,6,9]

    _.map({length: 2, 0: {id: '1'}, 1: {id: '2'}}, function(n){
      return n.id; }); => ['1','2']

    _.map(null, _.noop) => []

    _.map([1], function() { return this.length;}, [5]) => [1]

    var people = [{name: 'moe', age: 30}, {name: 'curly', age: 50}];
    _.map(people, 'name') => ['moe', 'curly']
    _.map(people, function(value){ return _.property('name')(value)}) => ['moe', 'curly']
  */
  
  _.map = _.collect = function(obj, iteratee, context) {
    // iteratee = cb(iteratee, context);
    iteratee = (context === void 0) ? iteratee : iteratee.bind(context);

    /* special usage: _.map(obj, "keyName") to return an array of values with the keyName */
    if (typeof iteratee !== 'function') iteratee = _.property(iteratee);

    /* keys: general object's keys, not for array or arrayLike */
    var keys = !isArrayLike(obj) && _.keys(obj);
    /* length: length for either general object or array|arrayLike */
    var length = (keys || obj).length;
    var results = Array(length);

    /* handle object or arrayLike or array the same way below  */
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  
  /* // Create a reducing function iterating left or right.
  var createReduce = function(dir) {
    // Wrap code that reassigns argument variables in a separate function than
    // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
    var reducer = function(obj, iteratee, memo, initial) {
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      if (!initial) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    };

    return function(obj, iteratee, memo, context) {
      var initial = arguments.length >= 3;
      return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
    };
  }; */

  /** createReduce(dir)(obj, iteratee, memo, context)
   * @param {*} dir 1 or -1, for starting left or right
   * @param obj array, arrayLike, or other object
   * @param iteratee a function, callback(memo, value, idx, obj)
   * @param memo a number, variable to accumulate values
   * @param context an object, thisArg
   * @return a value, memo
   */
  /* tests
    _.reduce([1, 2, 3], function(memo, num){ return memo + num; }, 0); => 6
    
    var context = {multiplier: 3};
    sum = _.reduce([1, 2, 3], function(memo, num){ return memo + num * this.multiplier; }, 0, context); => 18

    _([1, 2, 3]).reduce(function(memo, num){ return memo + num; }, 0); => 6

    _.reduce([1, 2, 3], function(memo, num){ return memo + num; }); => 6

    _.reduce([1, 2, 3, 4], function(memo, num){ return memo * num; }); => 24

    _.reduce(null, _.noop, 138) => 138

    _.reduce([], _.noop, void 0) => undefined

    _.reduce([_], _.noop) => _

    _.reduce([], _.noop) => undefined
  */
  var createReduce = _.reduceLeftRight = function(dir) {
    // Wrap code that reassigns argument variables in a separate function than
    // the one that accesses `arguments.length` to avoid a perf hit. (#1991)

    /*  reducer(...) does the actual reduction work */
    /** reducer(obj, iteratee, memo, initial) => memo
     * @param obj array, or arrayLike, or object 
     * @param iteratee a function, callback(accumulator, value, idx, obj)
     * @param memo a number, accumulator or initial value
     * @param initial a bool, whether the initial memo is provided by the user
     */ 
    var reducer = function(obj, iteratee, memo, initial) {

      /* why need keys?
        to access values of obj
        0. we need indexes for arrayLike 
        1. we need keys for objects
        2. _.keys(obj) handles keys (not on prototype) for objects, undefined and null 
      */
      var keys = !isArrayLike(obj) && _.keys(obj);

      /* why need length?
        to loop obj, usually length is very handy

        0. for arrayLike, arrayLike.length is handy
        1. for object, keys.length does the same
      */
      var length = (keys || obj).length;

      /* why index?
        index can capture whether reducer(...) works from left or right

        0. dir: 1 left, -1 right
        1. if dir > 0, start from left, set index 0
        2. if dir < 0, start from right, set index length-1
      */
      var index = dir > 0 ? 0 : length - 1;

      /* why need initial?
        to decide which value should memo be initially

        0. if user provided initial value, memo should use it for initial value
        1. if not provided, memo should use the starting value of obj
        2. if initial value is not given, both memo and index should be updated for the later loop
      */
      if (!initial) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }

      /* why loop here?
        use loop + iteratee + memo to reduce all values into a single value

        0. use updated index, dir to start looping at the right position in the right direction
        1. loop through each value through index or key, according to obj (arrayLike or object)
        2. invoke iteratee to update memo with current memo and current element value
        3. keep iterating
      */
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }

      /* why return memo
        all values in obj are reduced into the final state of memo
      */
      return memo;
    };

    /* why return function(obj, iteratee, memo, context)?

      - instead of running reducer(...) directly, we use this func to prepare its inputs;
      - this function internally prepares initial and callback
      - as users, we just simply provide (obj, iteratee, memo, context)
      */
     return function(obj, iteratee, memo, context) {
      
      /* why hide initial internally?
        
        0. if memo is provided, then initial must be true
        1. adding initial as an arg is repetitive
      */ 
      var initial = arguments.length >= 3;

      
      /* why process iteratee?
        
        0. if `this` occurred in iteratee, context is required to be binded to iteratee
        1. we can choose to use call, instead of apply or bind for better performance
      */
      var callback = (context === undefined) ? iteratee : function(accumulator, value, index, collection) {
        return iteratee.call(context, accumulator, value, index, collection);
      };

      
      // var callback = (context === undefined) ? iteratee : iteratee.bind(context);
      /* for simplicity */
      
      /* after the preparation, reducer get to run */
      return reducer(obj, callback, memo, initial);
    };
  };
  
  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.

  /** what's behind _.reduce = createReduce(1)?

    0. createReduce(1)
        1. created reducer function to do real reduction work
        2. passed 1 to set `reducer` to work from left to right
        3. returned a wrapper function of reducer
    1. this wrapper function 
        1. ask users for 4 arguments (obj, iteratee, memo, context)
        2. further prepares initial or memo, and iteratee for running reducer internally
   */
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.

  
  /** _.find(obj, predicate, context) => the first element that matches predicate
   * @param obj arrayLike or object
   * @param predicate a callback or an element of obj
   * @param context an object, thisArg 
   * @return an element of obj
   */
  /* tests: _.find(list, predicate, [context]) 
    var array = [1, 2, 3, 4];

    _.find(array, function(num){ return num % 2 == 0; }); => 2

    _.find(array, function(n) { return n > 2; }); => 3

    _.find(array, function() { return false; }); => void 0

    _.find(array, function(x) { return x === 55; }) => void 0

    var list = [{a: 1, b: 2}, {a: 2, b: 2}, {a: 1, b: 3}, {a: 1, b: 4}, {a: 2, b: 4}];
    _.find(list, {a: 1}) => {a: 1, b: 2}

    _.find(list, {b: 4}); => {a: 1, b: 4}

    _.find(list, {c: 1}) => undefined

    _.find([], {c: 1}) => undefined (undefined when searching empty list)

    _.find([1, 2, 3], function(num){ return num * 2 === 4; }); => 2 (found the first "2" and broke the loop)

    var obj = {
      a: {x: 1, z: 3},
      b: {x: 2, z: 2},
      c: {x: 3, z: 4},
      d: {x: 4, z: 1}
    };

    _.find(obj, {x: 2, z: 1}) => void 0

    _.find(obj, function(x) { return x.x === 4; }) => {x: 4, z: 1});
  */
  _.find = _.detect = function(obj, predicate, context) {
    /* why need keyFinder? 
      1. to find the element, we need to find the key first 
      2. to find the key that matches the predicate, we need a keyFinder
      3. for arrayLike, we use _.findIndex
      4. for object, we use _.findKey
    */
    var keyFinder = isArrayLike(obj) ? _.findIndex : _.findKey;

    /* find the key using the predicate with keyFinder */
    var key = keyFinder(obj, predicate, context);

    /* get value from key if key is not undefined or -1 */
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = restArguments(function(obj, path, args) {
    var contextPath, func;
    if (_.isFunction(path)) {
      func = path;
    } else if (_.isArray(path)) {
      contextPath = path.slice(0, -1);
      path = path[path.length - 1];
    }
    return _.map(obj, function(context) {
      var method = func;
      if (!method) {
        if (contextPath && contextPath.length) {
          context = deepGet(context, contextPath);
        }
        if (context == null) return void 0;
        method = context[path];
      }
      return method == null ? method : method.apply(context, args);
    });
  });

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value != null && value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(v, index, list) {
        computed = iteratee(v, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value != null && value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(v, index, list) {
        computed = iteratee(v, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection.
  _.shuffle = function(obj) {
    return _.sample(obj, Infinity);
  };

  // Sample **n** random values from a collection using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    var sample = isArrayLike(obj) ? _.clone(obj) : _.values(obj);
    var length = getLength(sample);
    n = Math.max(Math.min(n, length), 0);
    var last = length - 1;
    for (var index = 0; index < n; index++) {
      var rand = _.random(index, last);
      var temp = sample[index];
      sample[index] = sample[rand];
      sample[rand] = temp;
    }
    return sample.slice(0, n);
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    var index = 0;
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, key, list) {
      return {
        value: value,
        index: index++,
        criteria: iteratee(value, key, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  /** group(behavior, partition) => [[...],[...]] or {...}
   * 1. create the returned container [[ ],[ ]], or { }, `result`
   * 2. callbackTransformer based on value of `iteratee`
   * 3. invoke callback on each element and get result `key`
   * 4. run `behavior` which sets rules for how `result` use `key` to store `value`
   * 5. return `result`
   * @param {function} behavior a func
   * @param {collection} partition act as a bool
   * @param obj arrayLike or object
   * @param iteratee value which triggers callbackTransformer in `cb`
   * @param context thisArg
   * @param key result of element invocation on callback
   */
  var group = function(behavior, partition) {
    return function(obj, iteratee, context) {
      var result = partition ? [[], []] : {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.

  /**  
   * _.groupBy(obj,iteratee,context): `behavior` for `_.groupBy` is the following
   *    1. if `result` does not have `key`, result[ key ] = [ value ];
   *    2. if it does, result[ key ].push(value)
   * @name _.groupBy(obj,iteratee,context)
   * @param {arrayLikeOrObject} obj 
   * @param {dynamicValue} iteratee value which triggers callbackTransformer in `cb`
   * @param {object} context thisArg
   * @example 
   * // use1: _.groupBy(array, callback) group elements by callback(el,idx,array) result
   * _.groupBy([1, 2, 3, 4, 5, 6], function(num){ return num % 2; }) 
   * // => {"0": [2, 4, 6], "1": [1, 3, 5]}
   * @example 
   * // use2: _.groupBy(array, 'length') => group elements by _.property('length')(...) result
   * var list = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
   * var grouped = _.groupBy(list, 'length');
   * arrayEq(grouped['3'], ['one', 'two', 'six', 'ten']);
   * arrayEq(grouped['4'], ['four', 'five', 'nine']);
   * arrayEq(grouped['5'], ['three', 'seven', 'eight']);
   * @example
   * // use3 _.groupBy(array) => group elements by _.identity(el) result
   * var array = [1, 2, 1, 2, 3];
   * var grouped = _.groupBy(array);
   * eq(grouped['1'].length, 2);
   * eq(grouped['3'].length, 1);
   * 
   * @example
   * // use4 _.groupBy(arrayOfArrays, number) => group element(a sub-array) by _.property(number)(el-subarray)
   * var matrix = [
   *   [1, 2],
   *   [1, 3],
   *   [2, 3]
   * ];
   * _.isEqual(_.groupBy(matrix, 0), {1: [[1, 2], [1, 3]], 2: [[2, 3]]});
   * _.isEqual(_.groupBy(matrix, 1), {2: [[1, 2]], 3: [[1, 3], [2, 3]]});
   * @example
   * // use5 _.groupBy(arrayOfObjects, arrayOfKeys) => group element(an object) by _.property(arrayOfKeys)(el-object)
   * var liz = {name: 'Liz', stats: {power: 10}};
   * var chelsea = {name: 'Chelsea', stats: {power: 10}};
   * var jordan = {name: 'Jordan', stats: {power: 6}};
   * var collection = [liz, chelsea, jordan];
   * var expected = {
   *   10: [liz, chelsea],
   *   6: [jordan]
   * };
   * _.isEqual(_.groupBy(collection, ['stats', 'power']), expected);
   * 
   * @example
   * // use6 _.groupBy(arrayOfObjects, key) => group element(an object) by _.property(key)(el-object)
   * var foos = [{foo: [1, 2]}, {foo: [1, 2]}]
   * _.isEqual(_.groupBy(foos, 'foo'), {"1,2": foos});
   */
  _.groupBy = group(function(result, value, key) {
    if (has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (has(result, key)) result[key]++; else result[key] = 1;
  });

  var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (_.isString(obj)) {
      // Keep surrogate pair characters together
      return obj.match(reStrSymbol);
    }
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = group(function(result, value, pass) {
    result[pass ? 0 : 1].push(value);
  }, true);

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, Boolean);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    output = output || [];
    var idx = output.length;
    for (var i = 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        // Flatten current level of array or arguments object.
        if (shallow) {
          var j = 0, len = value.length;
          while (j < len) output[idx++] = value[j++];
        } else {
          flatten(value, shallow, strict, output);
          idx = output.length;
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = restArguments(function(array, otherArrays) {
    return _.difference(array, otherArrays);
  });
  // debugger;
  // _.without([1,2,3,4], 2,4);

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // The faster algorithm will not work with an iteratee if the iteratee
  // is not a one-to-one function, so providing an iteratee will disable
  // the faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted && !iteratee) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = restArguments(function(arrays) {
    return _.uniq(flatten(arrays, true, true));
  });

  /** tests
      // debugger;
    // _.union([1,2],[3,4]);
    */ 
  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      var j;
      for (j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = restArguments(function(array, rest) {
    rest = flatten(rest, true, true);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  });

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices.
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = restArguments(_.unzip);

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values. Passing by pairs is the reverse of _.pairs.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions.
  /** createPredicateIndexFinder(1)(array, predicate, context) => _.findIndex(...)
   * @param dir 1: get first matched index, -1: get last matched index
   * @param array array of numbers or even objects
   * @param predicate a callback or an object
   * @param context an object, thisArg
   * @return index or -1
   * @use1 _.findIndex(arrayOfValues, callbackTestElement) => indexOfFirstElementPassed
   * @use2 _.findIndex(arrayOfObjects, callbackTestElement) => indexOfFirstElementPassed
   * @use3 _.findIndex(arrayOfObjects, object) => indexOfFirstElementMatchTheObject
   * @use4 _.findIndex(arrayOfObjects, aString) => indexOfFirstElementHasValueWithTheKey
   * @use5 _.findIndex(arrayOfObjects, arrayOfStrings) => indexOfFirstElementHasValueWithTheKeys
   * @use6 _.findIndex(arrayOfValues) => indexOfFirstElementNot0UndefinedNullNaNFalse
   * @use7 _.findIndex(arrayOfObjects) => always 0
   * @use8 _.findIndex(non-array, _.noop) => always -1
   */
  
  var createPredicateIndexFinder = _.createPredicateIndexFinder = function(dir) {
    /* what is createPredicateIndexFinder?
      1. it is a wrapper function for actual indexFinder function 
      2. the wrapper function handles direction: first or last
    */

    return function(array, predicate, context) {

      /* why process predicate?
        1. cb or callbackTransformer created 5 use cases above with different predicate values
        2. use1 + use2 = when predicate is a func, then use optimizeCb
        3. use3 = when predicate is object, use _.matcher
        4. use4 + use5 = when predicate is a single string or array of strings, use _.property
        5. use6 = when predicate is not given, use _.identity
      */
      predicate = cb(predicate, context); /* now I consider cb is better to use */
      

      /* why getting length?
        length is a must for looping
        1. var length = shallowProperty('length')(array); (is actually functional)
        2. var length = array.length; (is more straightforward, but can't cover undefined and null cases)
      */
      // var length = getLength(array); // official
      var length = shallowProperty('length')(array);

      /* why getting index?
        1. createPredicateIndexFinder consider search direction
        2. searching direction polorizes starting index 
      */
      var index = dir > 0 ? 0 : length - 1;

      /* loop + callback
        1. loop each element and invoke the callback
        2. if callbackTest let the element pass, we take the index as result
      */
      for (; index >= 0 && index < length; index += dir) {

        /* when value is NaN, undefined, null, false, 0, the index is ignored
        */
        if (predicate(array[index], index, array)) return index;
        
      }
      /* if no element pass callbackTest, return -1 as nothing found */
      return -1;
    };
  };

  // Returns the first index on an array-like that passes a predicate test.
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions.
  var createIndexFinder = function(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
          i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    if (!step) {
      step = stop < start ? -1 : 1;
    }

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Chunk a single array into multiple arrays, each containing `count` or fewer
  // items.
  _.chunk = function(array, count) {
    if (count == null || count < 1) return [];
    var result = [];
    var i = 0, length = array.length;
    while (i < length) {
      result.push(slice.call(array, i, i += count));
    }
    return result;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments.
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = restArguments(function(func, context, args) {
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var bound = restArguments(function(callArgs) {
      return executeBound(func, bound, context, this, args.concat(callArgs));
    });
    return bound;
  });

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder by default, allowing any combination of arguments to be
  // pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
  _.partial = restArguments(function(func, boundArgs) {
    var placeholder = _.partial.placeholder;
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  });

  _.partial.placeholder = _;

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = restArguments(function(obj, keys) {
    keys = flatten(keys, false, false);
    var index = keys.length;
    if (index < 1) throw new Error('bindAll must be passed function names');
    while (index--) {
      var key = keys[index];
      obj[key] = _.bind(obj[key], obj);
    }
  });

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = restArguments(function(func, wait, args) {
    return setTimeout(function() {
      return func.apply(null, args);
    }, wait);
  });

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var timeout, context, args, result;
    var previous = 0;
    if (!options) options = {};

    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    var throttled = function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };

    throttled.cancel = function() {
      clearTimeout(timeout);
      previous = 0;
      timeout = context = args = null;
    };

    return throttled;
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;

    var later = function(context, args) {
      timeout = null;
      if (args) result = func.apply(context, args);
    };

    var debounced = restArguments(function(args) {
      if (timeout) clearTimeout(timeout);
      if (immediate) {
        var callNow = !timeout;
        timeout = setTimeout(later, wait);
        if (callNow) result = func.apply(this, args);
      } else {
        timeout = _.delay(later, wait, this, args);
      }

      return result;
    });

    debounced.cancel = function() {
      clearTimeout(timeout);
      timeout = null;
    };

    return debounced;
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  _.restArguments = restArguments;

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
    'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  var collectNonEnumProps = function(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  };

  /** OFFICIAL
    Retrieve the names of an object's own properties.
    Delegates to **ECMAScript 5**'s native `Object.keys`.
  */
  /** _.keys(obj) => [] or [key1, key2, ...] of direct properties not properties on prototype
    * @param obj arrayLike or objects
    */ 
  /* tests
   var a = [1,2,3];
   Array.prototype.four = 4;
   for (k in a) { console.log(k);}
   a.hasOwnProperty('four')
   _.has(a, 'four') */
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    // get keys for objects
    if (nativeKeys) return nativeKeys(obj);
    // when nativeKeys or Object.keys are not available
    var keys = [];
    for (var key in obj) if (has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object.
  // In contrast to _.map it returns an object.
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = _.keys(obj),
        length = keys.length,
        results = {};
    for (var index = 0; index < length; index++) {
      var currentKey = keys[index];
      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  // The opposite of _.object.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`.
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, defaults) {
    return function(obj) {
      var length = arguments.length;
      if (defaults) obj = Object(obj);
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!defaults || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s).
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test.
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Internal pick helper function to determine if `obj` has key `key`.
  var keyInObj = function(value, key, obj) {
    return key in obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = restArguments(function(obj, keys) {
    var result = {}, iteratee = keys[0];
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
      keys = _.allKeys(obj);
    } else {
      iteratee = keyInObj;
      keys = flatten(keys, false, false);
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  });

  // Return a copy of the object without the blacklisted properties.
  _.omit = restArguments(function(obj, keys) {
    var iteratee = keys[0], context;
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
      if (keys.length > 1) context = keys[1];
    } else {
      keys = _.map(flatten(keys, false, false), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  });

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq, deepEq;
  eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // `null` or `undefined` only equal to itself (strict comparison).
    if (a == null || b == null) return false;
    // `NaN`s are equivalent, but non-reflexive.
    if (a !== a) return b !== b;
    // Exhaust primitive checks
    var type = typeof a;
    if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
    return deepEq(a, b, aStack, bStack);
  };

  // Internal recursive comparison function for `isEqual`.
  deepEq = function(a, b, aStack, bStack) {
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN.
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
      case '[object Symbol]':
        return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                              _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  /** _.isArray(obj): check whether an array or not
    * use Array.isArray or toString.call(obj)
    */ 
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // OFFICIAL: Is a given variable an object?
  /** _.isObject(obj): check whether an obj is of type 'function' or 'object'
    * obj: must not be undefined, null, NaN
    */ 
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
  var nodelist = root.document && root.document.childNodes;
  if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return !_.isSymbol(obj) && isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    return _.isNumber(obj) && isNaN(obj);
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, path) {
    if (!_.isArray(path)) {
      return has(obj, path);
    }
    var length = path.length;
    for (var i = 0; i < length; i++) {
      var key = path[i];
      if (obj == null || !hasOwnProperty.call(obj, key)) {
        return false;
      }
      obj = obj[key];
    }
    return !!length;
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  // Creates a function that, when passed an object, will traverse that object’s
  // properties down the given `path`, specified as an array of keys or indexes.

  /** _.property(path)(obj) => get a value from shallow object or nested object
   * @param path a key or an array of keys
   * @param obj an array, arrayLike, other object or their nested version
   * @returns a single value or undefined
   */
  _.property = function(path) {
    if (!_.isArray(path)) {
      return shallowProperty(path);
    }
    return function(obj) {
      return deepGet(obj, path);
    };
  };

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    if (obj == null) {
      return function(){};
    }
    return function(path) {
      return !_.isArray(path) ? obj[path] : deepGet(obj, path);
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };
  /** tests
    // debugger;
    * _.matcher({num: 1})({num:1}) => true
    */ 

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

  // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped.
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // Traverses the children of `obj` along `path`. If a child is a function, it
  // is invoked with its parent as context. Returns the value of the final
  // child, or `fallback` if any child is undefined.
  _.result = function(obj, path, fallback) {
    if (!_.isArray(path)) path = [path];
    var length = path.length;
    if (!length) {
      return _.isFunction(fallback) ? fallback.call(obj) : fallback;
    }
    for (var i = 0; i < length; i++) {
      var prop = obj == null ? void 0 : obj[path[i]];
      if (prop === void 0) {
        prop = fallback;
        i = length; // Ensure we don't continue iterating.
      }
      obj = _.isFunction(prop) ? prop.call(obj) : prop;
    }
    return obj;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offset.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    var render;
    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var chainResult = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return chainResult(this, func.apply(_, args));
      };
    });
    return _;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return chainResult(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return chainResult(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return String(this._wrapped);
  };

  // Places for debugging
  // debugger;
  
  

  
  
  
  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define == 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}());
