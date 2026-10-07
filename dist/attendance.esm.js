var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i7 = decorators.length - 1, decorator; i7 >= 0; i7--)
    if (decorator = decorators[i7])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// @lit-labs/ssr-dom-shim/lib/element-internals.js
var ElementInternalsShim = class ElementInternals {
  get shadowRoot() {
    return this.__host.__shadowRoot;
  }
  constructor(_host) {
    this.ariaActiveDescendantElement = null;
    this.ariaAtomic = "";
    this.ariaAutoComplete = "";
    this.ariaBrailleLabel = "";
    this.ariaBrailleRoleDescription = "";
    this.ariaBusy = "";
    this.ariaChecked = "";
    this.ariaColCount = "";
    this.ariaColIndex = "";
    this.ariaColIndexText = "";
    this.ariaColSpan = "";
    this.ariaControlsElements = null;
    this.ariaCurrent = "";
    this.ariaDescribedByElements = null;
    this.ariaDescription = "";
    this.ariaDetailsElements = null;
    this.ariaDisabled = "";
    this.ariaErrorMessageElements = null;
    this.ariaExpanded = "";
    this.ariaFlowToElements = null;
    this.ariaHasPopup = "";
    this.ariaHidden = "";
    this.ariaInvalid = "";
    this.ariaKeyShortcuts = "";
    this.ariaLabel = "";
    this.ariaLabelledByElements = null;
    this.ariaLevel = "";
    this.ariaLive = "";
    this.ariaModal = "";
    this.ariaMultiLine = "";
    this.ariaMultiSelectable = "";
    this.ariaOrientation = "";
    this.ariaOwnsElements = null;
    this.ariaPlaceholder = "";
    this.ariaPosInSet = "";
    this.ariaPressed = "";
    this.ariaReadOnly = "";
    this.ariaRelevant = "";
    this.ariaRequired = "";
    this.ariaRoleDescription = "";
    this.ariaRowCount = "";
    this.ariaRowIndex = "";
    this.ariaRowIndexText = "";
    this.ariaRowSpan = "";
    this.ariaSelected = "";
    this.ariaSetSize = "";
    this.ariaSort = "";
    this.ariaValueMax = "";
    this.ariaValueMin = "";
    this.ariaValueNow = "";
    this.ariaValueText = "";
    this.role = "";
    this.form = null;
    this.labels = [];
    this.states = /* @__PURE__ */ new Set();
    this.validationMessage = "";
    this.validity = {};
    this.willValidate = true;
    this.__host = _host;
  }
  checkValidity() {
    console.warn("`ElementInternals.checkValidity()` was called on the server.This method always returns true.");
    return true;
  }
  reportValidity() {
    return true;
  }
  setFormValue() {
  }
  setValidity() {
  }
};

// @lit-labs/ssr-dom-shim/lib/events.js
var __classPrivateFieldSet = function(receiver, state, value, kind, f3) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f3) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f3 : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f3.call(receiver, value) : f3 ? f3.value = value : state.set(receiver, value), value;
};
var __classPrivateFieldGet = function(receiver, state, kind, f3) {
  if (kind === "a" && !f3) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f3 : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f3 : kind === "a" ? f3.call(receiver) : f3 ? f3.value : state.get(receiver);
};
var _Event_cancelable;
var _Event_bubbles;
var _Event_composed;
var _Event_defaultPrevented;
var _Event_timestamp;
var _Event_propagationStopped;
var _Event_type;
var _Event_target;
var _Event_isBeingDispatched;
var _a;
var _CustomEvent_detail;
var _b;
var NONE = 0;
var CAPTURING_PHASE = 1;
var AT_TARGET = 2;
var BUBBLING_PHASE = 3;
var enumerableProperty = { __proto__: null };
enumerableProperty.enumerable = true;
Object.freeze(enumerableProperty);
var EventShim = (_a = class Event {
  constructor(type, options = {}) {
    _Event_cancelable.set(this, false);
    _Event_bubbles.set(this, false);
    _Event_composed.set(this, false);
    _Event_defaultPrevented.set(this, false);
    _Event_timestamp.set(this, Date.now());
    _Event_propagationStopped.set(this, false);
    _Event_type.set(this, void 0);
    _Event_target.set(this, void 0);
    _Event_isBeingDispatched.set(this, void 0);
    this.NONE = NONE;
    this.CAPTURING_PHASE = CAPTURING_PHASE;
    this.AT_TARGET = AT_TARGET;
    this.BUBBLING_PHASE = BUBBLING_PHASE;
    if (arguments.length === 0)
      throw new Error(`The type argument must be specified`);
    if (typeof options !== "object" || !options) {
      throw new Error(`The "options" argument must be an object`);
    }
    const { bubbles, cancelable, composed } = options;
    __classPrivateFieldSet(this, _Event_cancelable, !!cancelable, "f");
    __classPrivateFieldSet(this, _Event_bubbles, !!bubbles, "f");
    __classPrivateFieldSet(this, _Event_composed, !!composed, "f");
    __classPrivateFieldSet(this, _Event_type, `${type}`, "f");
    __classPrivateFieldSet(this, _Event_target, null, "f");
    __classPrivateFieldSet(this, _Event_isBeingDispatched, false, "f");
  }
  initEvent(_type, _bubbles, _cancelable) {
    throw new Error("Method not implemented.");
  }
  stopImmediatePropagation() {
    this.stopPropagation();
  }
  preventDefault() {
    __classPrivateFieldSet(this, _Event_defaultPrevented, true, "f");
  }
  get target() {
    return __classPrivateFieldGet(this, _Event_target, "f");
  }
  get currentTarget() {
    return __classPrivateFieldGet(this, _Event_target, "f");
  }
  get srcElement() {
    return __classPrivateFieldGet(this, _Event_target, "f");
  }
  get type() {
    return __classPrivateFieldGet(this, _Event_type, "f");
  }
  get cancelable() {
    return __classPrivateFieldGet(this, _Event_cancelable, "f");
  }
  get defaultPrevented() {
    return __classPrivateFieldGet(this, _Event_cancelable, "f") && __classPrivateFieldGet(this, _Event_defaultPrevented, "f");
  }
  get timeStamp() {
    return __classPrivateFieldGet(this, _Event_timestamp, "f");
  }
  composedPath() {
    return __classPrivateFieldGet(this, _Event_isBeingDispatched, "f") ? [__classPrivateFieldGet(this, _Event_target, "f")] : [];
  }
  get returnValue() {
    return !__classPrivateFieldGet(this, _Event_cancelable, "f") || !__classPrivateFieldGet(this, _Event_defaultPrevented, "f");
  }
  get bubbles() {
    return __classPrivateFieldGet(this, _Event_bubbles, "f");
  }
  get composed() {
    return __classPrivateFieldGet(this, _Event_composed, "f");
  }
  get eventPhase() {
    return __classPrivateFieldGet(this, _Event_isBeingDispatched, "f") ? _a.AT_TARGET : _a.NONE;
  }
  get cancelBubble() {
    return __classPrivateFieldGet(this, _Event_propagationStopped, "f");
  }
  set cancelBubble(value) {
    if (value) {
      __classPrivateFieldSet(this, _Event_propagationStopped, true, "f");
    }
  }
  stopPropagation() {
    __classPrivateFieldSet(this, _Event_propagationStopped, true, "f");
  }
  get isTrusted() {
    return false;
  }
}, _Event_cancelable = /* @__PURE__ */ new WeakMap(), _Event_bubbles = /* @__PURE__ */ new WeakMap(), _Event_composed = /* @__PURE__ */ new WeakMap(), _Event_defaultPrevented = /* @__PURE__ */ new WeakMap(), _Event_timestamp = /* @__PURE__ */ new WeakMap(), _Event_propagationStopped = /* @__PURE__ */ new WeakMap(), _Event_type = /* @__PURE__ */ new WeakMap(), _Event_target = /* @__PURE__ */ new WeakMap(), _Event_isBeingDispatched = /* @__PURE__ */ new WeakMap(), _a.NONE = NONE, _a.CAPTURING_PHASE = CAPTURING_PHASE, _a.AT_TARGET = AT_TARGET, _a.BUBBLING_PHASE = BUBBLING_PHASE, _a);
Object.defineProperties(EventShim.prototype, {
  initEvent: enumerableProperty,
  stopImmediatePropagation: enumerableProperty,
  preventDefault: enumerableProperty,
  target: enumerableProperty,
  currentTarget: enumerableProperty,
  srcElement: enumerableProperty,
  type: enumerableProperty,
  cancelable: enumerableProperty,
  defaultPrevented: enumerableProperty,
  timeStamp: enumerableProperty,
  composedPath: enumerableProperty,
  returnValue: enumerableProperty,
  bubbles: enumerableProperty,
  composed: enumerableProperty,
  eventPhase: enumerableProperty,
  cancelBubble: enumerableProperty,
  stopPropagation: enumerableProperty,
  isTrusted: enumerableProperty
});
var CustomEventShim = (_b = class CustomEvent2 extends EventShim {
  constructor(type, options = {}) {
    super(type, options);
    _CustomEvent_detail.set(this, void 0);
    __classPrivateFieldSet(this, _CustomEvent_detail, options?.detail ?? null, "f");
  }
  initCustomEvent(_type, _bubbles, _cancelable, _detail) {
    throw new Error("Method not implemented.");
  }
  get detail() {
    return __classPrivateFieldGet(this, _CustomEvent_detail, "f");
  }
}, _CustomEvent_detail = /* @__PURE__ */ new WeakMap(), _b);
Object.defineProperties(CustomEventShim.prototype, {
  detail: enumerableProperty
});
var EventShimWithRealType = EventShim;
var CustomEventShimWithRealType = CustomEventShim;

// @lit-labs/ssr-dom-shim/lib/css.js
var _a2;
var CSSRuleShim = (_a2 = class CSSRule {
  constructor() {
    this.STYLE_RULE = 1;
    this.CHARSET_RULE = 2;
    this.IMPORT_RULE = 3;
    this.MEDIA_RULE = 4;
    this.FONT_FACE_RULE = 5;
    this.PAGE_RULE = 6;
    this.NAMESPACE_RULE = 10;
    this.KEYFRAMES_RULE = 7;
    this.KEYFRAME_RULE = 8;
    this.SUPPORTS_RULE = 12;
    this.COUNTER_STYLE_RULE = 11;
    this.FONT_FEATURE_VALUES_RULE = 14;
    this.MARGIN_RULE = 9;
    this.__parentStyleSheet = null;
    this.cssText = "";
  }
  get parentRule() {
    return null;
  }
  get parentStyleSheet() {
    return this.__parentStyleSheet;
  }
  get type() {
    return 0;
  }
}, _a2.STYLE_RULE = 1, _a2.CHARSET_RULE = 2, _a2.IMPORT_RULE = 3, _a2.MEDIA_RULE = 4, _a2.FONT_FACE_RULE = 5, _a2.PAGE_RULE = 6, _a2.NAMESPACE_RULE = 10, _a2.KEYFRAMES_RULE = 7, _a2.KEYFRAME_RULE = 8, _a2.SUPPORTS_RULE = 12, _a2.COUNTER_STYLE_RULE = 11, _a2.FONT_FEATURE_VALUES_RULE = 14, _a2.MARGIN_RULE = 9, _a2);

// @lit-labs/ssr-dom-shim/index.js
globalThis.Event ??= EventShimWithRealType;
globalThis.CustomEvent ??= CustomEventShimWithRealType;
var constructionToken = Symbol();
var isCaptureEventListener = (options) => typeof options === "boolean" ? options : options?.capture ?? false;
var enumerableProperty2 = { __proto__: null };
enumerableProperty2.enumerable = true;
Object.freeze(enumerableProperty2);
var EventTarget = class {
  constructor() {
    this.__eventListeners = /* @__PURE__ */ new Map();
    this.__captureEventListeners = /* @__PURE__ */ new Map();
  }
  addEventListener(type, callback, options) {
    if (callback === void 0 || callback === null) {
      return;
    }
    const eventListenersMap = isCaptureEventListener(options) ? this.__captureEventListeners : this.__eventListeners;
    let eventListeners = eventListenersMap.get(type);
    if (eventListeners === void 0) {
      eventListeners = /* @__PURE__ */ new Map();
      eventListenersMap.set(type, eventListeners);
    } else if (eventListeners.has(callback)) {
      return;
    }
    const normalizedOptions = typeof options === "object" && options ? options : {};
    normalizedOptions.signal?.addEventListener("abort", () => this.removeEventListener(type, callback, options));
    eventListeners.set(callback, normalizedOptions ?? {});
  }
  removeEventListener(type, callback, options) {
    if (callback === void 0 || callback === null) {
      return;
    }
    const eventListenersMap = isCaptureEventListener(options) ? this.__captureEventListeners : this.__eventListeners;
    const eventListeners = eventListenersMap.get(type);
    if (eventListeners !== void 0) {
      eventListeners.delete(callback);
      if (!eventListeners.size) {
        eventListenersMap.delete(type);
      }
    }
  }
  dispatchEvent(event) {
    let composedPath = this.__resolveFullEventPath();
    if (!event.composed && this.__host) {
      composedPath = composedPath.slice(0, composedPath.indexOf(this.__host));
    }
    let stopPropagation = false;
    let stopImmediatePropagation = false;
    let eventPhase = EventShimWithRealType.NONE;
    let target = null;
    let tmpTarget = null;
    let currentTarget = null;
    const originalStopPropagation = event.stopPropagation;
    const originalStopImmediatePropagation = event.stopImmediatePropagation;
    Object.defineProperties(event, {
      target: {
        get() {
          return target ?? tmpTarget;
        },
        ...enumerableProperty2
      },
      srcElement: {
        get() {
          return event.target;
        },
        ...enumerableProperty2
      },
      currentTarget: {
        get() {
          return currentTarget;
        },
        ...enumerableProperty2
      },
      eventPhase: {
        get() {
          return eventPhase;
        },
        ...enumerableProperty2
      },
      composedPath: {
        value: () => composedPath,
        ...enumerableProperty2
      },
      stopPropagation: {
        value: () => {
          stopPropagation = true;
          originalStopPropagation.call(event);
        },
        ...enumerableProperty2
      },
      stopImmediatePropagation: {
        value: () => {
          stopImmediatePropagation = true;
          originalStopImmediatePropagation.call(event);
        },
        ...enumerableProperty2
      }
    });
    const invokeEventListener = (listener, options, eventListenerMap) => {
      if (typeof listener === "function") {
        listener(event);
      } else if (typeof listener?.handleEvent === "function") {
        listener.handleEvent(event);
      }
      if (options.once) {
        eventListenerMap.delete(listener);
      }
    };
    const finishDispatch = () => {
      currentTarget = null;
      eventPhase = EventShimWithRealType.NONE;
      return !event.defaultPrevented;
    };
    const captureEventPath = composedPath.slice().reverse();
    target = !this.__host || !event.composed ? this : null;
    const retarget = (eventTargets) => {
      tmpTarget = this;
      while (tmpTarget.__host && eventTargets.includes(tmpTarget.__host)) {
        tmpTarget = tmpTarget.__host;
      }
    };
    for (const eventTarget of captureEventPath) {
      if (!target && (!tmpTarget || tmpTarget === eventTarget.__host)) {
        retarget(captureEventPath.slice(captureEventPath.indexOf(eventTarget)));
      }
      currentTarget = eventTarget;
      eventPhase = eventTarget === event.target ? EventShimWithRealType.AT_TARGET : EventShimWithRealType.CAPTURING_PHASE;
      const captureEventListeners = eventTarget.__captureEventListeners.get(event.type);
      if (captureEventListeners) {
        for (const [listener, options] of captureEventListeners) {
          invokeEventListener(listener, options, captureEventListeners);
          if (stopImmediatePropagation) {
            return finishDispatch();
          }
        }
      }
      if (stopPropagation) {
        return finishDispatch();
      }
    }
    const bubbleEventPath = event.bubbles ? composedPath : [this];
    tmpTarget = null;
    for (const eventTarget of bubbleEventPath) {
      if (!target && (!tmpTarget || eventTarget === tmpTarget.__host)) {
        retarget(bubbleEventPath.slice(0, bubbleEventPath.indexOf(eventTarget) + 1));
      }
      currentTarget = eventTarget;
      eventPhase = eventTarget === event.target ? EventShimWithRealType.AT_TARGET : EventShimWithRealType.BUBBLING_PHASE;
      const eventListeners = eventTarget.__eventListeners.get(event.type);
      if (eventListeners) {
        for (const [listener, options] of eventListeners) {
          invokeEventListener(listener, options, eventListeners);
          if (stopImmediatePropagation) {
            return finishDispatch();
          }
        }
      }
      if (stopPropagation) {
        return finishDispatch();
      }
    }
    return finishDispatch();
  }
  __resolveFullEventPath() {
    if (this.__eventPathCache) {
      return this.__eventPathCache;
    } else if (!this.__eventTargetParent) {
      return this.__eventPathCache = [this, documentShim, windowShim];
    } else {
      return this.__eventPathCache = [
        this,
        ...this.__eventTargetParent.__resolveFullEventPath()
      ];
    }
  }
};
var attributes = /* @__PURE__ */ new WeakMap();
var attributesForElement = (element) => {
  let attrs = attributes.get(element);
  if (attrs === void 0) {
    attributes.set(element, attrs = /* @__PURE__ */ new Map());
  }
  return attrs;
};
var NodeShim = class Node2 extends EventTarget {
  getRootNode(options) {
    if (options?.composed) {
      return document2;
    }
    const host = this.__host;
    return host?.__shadowRoot ?? document2;
  }
};
var DocumentShim = class Document2 extends NodeShim {
  get adoptedStyleSheets() {
    return [];
  }
  createTreeWalker() {
    return {};
  }
  createTextNode() {
    return {};
  }
  createElement() {
    return {};
  }
};
var documentShim = new DocumentShim();
var document2 = documentShim;
var WindowShim = class Window extends NodeShim {
  constructor(token) {
    super();
    if (token !== constructionToken) {
      throw new TypeError("Illegal constructor");
    }
    Object.assign(this, globalThis, {
      CustomElementRegistry,
      customElements: customElements2,
      document: document2,
      Document: DocumentShim,
      Element: ElementShim,
      EventTarget,
      HTMLElement: HTMLElementShim,
      Node: NodeShim,
      ShadowRoot: ShadowRootShim,
      window: this,
      Window: WindowShim
    });
  }
};
var ElementShim = class Element extends NodeShim {
  constructor() {
    super(...arguments);
    this.__shadowRootMode = null;
    this.__shadowRoot = null;
    this.__internals = null;
  }
  get attributes() {
    return Array.from(attributesForElement(this)).map(([name, value]) => ({
      name,
      value
    }));
  }
  get shadowRoot() {
    if (this.__shadowRootMode === "closed") {
      return null;
    }
    return this.__shadowRoot;
  }
  get localName() {
    return this.constructor.__localName;
  }
  get tagName() {
    return this.localName?.toUpperCase();
  }
  setAttribute(name, value) {
    attributesForElement(this).set(name, String(value));
  }
  removeAttribute(name) {
    attributesForElement(this).delete(name);
  }
  toggleAttribute(name, force) {
    if (this.hasAttribute(name)) {
      if (force === void 0 || !force) {
        this.removeAttribute(name);
        return false;
      }
    } else {
      if (force === void 0 || force) {
        this.setAttribute(name, "");
        return true;
      } else {
        return false;
      }
    }
    return true;
  }
  hasAttribute(name) {
    return attributesForElement(this).has(name);
  }
  attachShadow(init) {
    this.__shadowRootMode = init.mode;
    const shadowRoot = new ShadowRootShim(constructionToken, init);
    shadowRoot.__eventTargetParent = this;
    shadowRoot.__host = this;
    return this.__shadowRoot = shadowRoot;
  }
  attachInternals() {
    if (this.__internals !== null) {
      throw new Error(`Failed to execute 'attachInternals' on 'HTMLElement': ElementInternals for the specified element was already attached.`);
    }
    const internals = new ElementInternalsShim(this);
    this.__internals = internals;
    return internals;
  }
  getAttribute(name) {
    const value = attributesForElement(this).get(name);
    return value ?? null;
  }
};
var HTMLElementShim = class HTMLElement extends ElementShim {
};
var HTMLElementShimWithRealType = HTMLElementShim;
var ShadowRootShim = class ShadowRoot extends NodeShim {
  get host() {
    return this.__host;
  }
  constructor(constructionToken2, init) {
    super();
    if (constructionToken2 !== constructionToken2) {
      throw new TypeError("Illegal constructor");
    }
    this.mode = init.mode;
  }
};
globalThis.litServerRoot ??= Object.defineProperty(new HTMLElementShimWithRealType(), "localName", {
  // Patch localName (and tagName) to return a unique name.
  get() {
    return "lit-server-root";
  }
});
function promiseWithResolvers() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
var CustomElementRegistry = class {
  constructor() {
    this.__definitions = /* @__PURE__ */ new Map();
    this.__reverseDefinitions = /* @__PURE__ */ new Map();
    this.__pendingWhenDefineds = /* @__PURE__ */ new Map();
  }
  define(name, ctor) {
    if (this.__definitions.has(name)) {
      if (true) {
        console.warn(`'CustomElementRegistry' already has "${name}" defined. This may have been caused by live reload or hot module replacement in which case it can be safely ignored.
Make sure to test your application with a production build as repeat registrations will throw in production.`);
      } else {
        throw new Error(`Failed to execute 'define' on 'CustomElementRegistry': the name "${name}" has already been used with this registry`);
      }
    }
    if (this.__reverseDefinitions.has(ctor)) {
      throw new Error(`Failed to execute 'define' on 'CustomElementRegistry': the constructor has already been used with this registry for the tag name ${this.__reverseDefinitions.get(ctor)}`);
    }
    ctor.__localName = name;
    this.__definitions.set(name, {
      ctor,
      // Note it's important we read `observedAttributes` in case it is a getter
      // with side-effects, as is the case in Lit, where it triggers class
      // finalization.
      //
      // TODO(aomarks) To be spec compliant, we should also capture the
      // registration-time lifecycle methods like `connectedCallback`. For them
      // to be actually accessible to e.g. the Lit SSR element renderer, though,
      // we'd need to introduce a new API for accessing them (since `get` only
      // returns the constructor).
      observedAttributes: ctor.observedAttributes ?? []
    });
    this.__reverseDefinitions.set(ctor, name);
    this.__pendingWhenDefineds.get(name)?.resolve(ctor);
    this.__pendingWhenDefineds.delete(name);
  }
  get(name) {
    const definition = this.__definitions.get(name);
    return definition?.ctor;
  }
  getName(ctor) {
    return this.__reverseDefinitions.get(ctor) ?? null;
  }
  initialize(_root) {
    throw new Error(`customElements.initialize is not currently supported in SSR. Please file a bug if you need it.`);
  }
  upgrade(_element) {
    throw new Error(`customElements.upgrade is not currently supported in SSR. Please file a bug if you need it.`);
  }
  async whenDefined(name) {
    const definition = this.__definitions.get(name);
    if (definition) {
      return definition.ctor;
    }
    let withResolvers = this.__pendingWhenDefineds.get(name);
    if (!withResolvers) {
      withResolvers = promiseWithResolvers();
      this.__pendingWhenDefineds.set(name, withResolvers);
    }
    return withResolvers.promise;
  }
};
var CustomElementRegistryShimWithRealType = CustomElementRegistry;
var customElements2 = new CustomElementRegistryShimWithRealType();
var windowShim = new WindowShim(constructionToken);

// @lit/reactive-element/node/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t5, e6, o7) {
    if (this._$cssResult$ = true, o7 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t5, this.t = e6;
  }
  get styleSheet() {
    let t5 = this.o;
    const s5 = this.t;
    if (e && void 0 === t5) {
      const e6 = void 0 !== s5 && 1 === s5.length;
      e6 && (t5 = o.get(s5)), void 0 === t5 && ((this.o = t5 = new CSSStyleSheet()).replaceSync(this.cssText), e6 && o.set(s5, t5));
    }
    return t5;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t5) => new n("string" == typeof t5 ? t5 : t5 + "", void 0, s);
var i = (t5, ...e6) => {
  const o7 = 1 === t5.length ? t5[0] : e6.reduce((e7, s5, o8) => e7 + ((t6) => {
    if (true === t6._$cssResult$) return t6.cssText;
    if ("number" == typeof t6) return t6;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t6 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s5) + t5[o8 + 1], t5[0]);
  return new n(o7, t5, s);
};
var S = (s5, o7) => {
  if (e) s5.adoptedStyleSheets = o7.map((t5) => t5 instanceof CSSStyleSheet ? t5 : t5.styleSheet);
  else for (const e6 of o7) {
    const o8 = document.createElement("style"), n6 = t.litNonce;
    void 0 !== n6 && o8.setAttribute("nonce", n6), o8.textContent = e6.cssText, s5.appendChild(o8);
  }
};
var c = e || void 0 === t.CSSStyleSheet ? (t5) => t5 : (t5) => t5 instanceof CSSStyleSheet ? ((t6) => {
  let e6 = "";
  for (const s5 of t6.cssRules) e6 += s5.cssText;
  return r(e6);
})(t5) : t5;

// @lit/reactive-element/node/reactive-element.js
var { is: h, defineProperty: r2, getOwnPropertyDescriptor: o2, getOwnPropertyNames: n2, getOwnPropertySymbols: a, getPrototypeOf: c2 } = Object;
var l = globalThis;
l.customElements ??= customElements2;
var p = l.trustedTypes;
var d = p ? p.emptyScript : "";
var u = l.reactiveElementPolyfillSupport;
var f = (t5, s5) => t5;
var b = { toAttribute(t5, s5) {
  switch (s5) {
    case Boolean:
      t5 = t5 ? d : null;
      break;
    case Object:
    case Array:
      t5 = null == t5 ? t5 : JSON.stringify(t5);
  }
  return t5;
}, fromAttribute(t5, s5) {
  let i7 = t5;
  switch (s5) {
    case Boolean:
      i7 = null !== t5;
      break;
    case Number:
      i7 = null === t5 ? null : Number(t5);
      break;
    case Object:
    case Array:
      try {
        i7 = JSON.parse(t5);
      } catch (t6) {
        i7 = null;
      }
  }
  return i7;
} };
var m = (t5, s5) => !h(t5, s5);
var y = { attribute: true, type: String, converter: b, reflect: false, useDefault: false, hasChanged: m };
Symbol.metadata ??= Symbol("metadata"), l.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var g = class extends (globalThis.HTMLElement ?? HTMLElementShimWithRealType) {
  static addInitializer(t5) {
    this._$Ei(), (this.l ??= []).push(t5);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t5, s5 = y) {
    if (s5.state && (s5.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t5) && ((s5 = Object.create(s5)).wrapped = true), this.elementProperties.set(t5, s5), !s5.noAccessor) {
      const i7 = Symbol(), e6 = this.getPropertyDescriptor(t5, i7, s5);
      void 0 !== e6 && r2(this.prototype, t5, e6);
    }
  }
  static getPropertyDescriptor(t5, s5, i7) {
    const { get: e6, set: h4 } = o2(this.prototype, t5) ?? { get() {
      return this[s5];
    }, set(t6) {
      this[s5] = t6;
    } };
    return { get: e6, set(s6) {
      const r6 = e6?.call(this);
      h4?.call(this, s6), this.requestUpdate(t5, r6, i7);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t5) {
    return this.elementProperties.get(t5) ?? y;
  }
  static _$Ei() {
    if (this.hasOwnProperty(f("elementProperties"))) return;
    const t5 = c2(this);
    t5.finalize(), void 0 !== t5.l && (this.l = [...t5.l]), this.elementProperties = new Map(t5.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(f("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(f("properties"))) {
      const t6 = this.properties, s5 = [...n2(t6), ...a(t6)];
      for (const i7 of s5) this.createProperty(i7, t6[i7]);
    }
    const t5 = this[Symbol.metadata];
    if (null !== t5) {
      const s5 = litPropertyMetadata.get(t5);
      if (void 0 !== s5) for (const [t6, i7] of s5) this.elementProperties.set(t6, i7);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t6, s5] of this.elementProperties) {
      const i7 = this._$Eu(t6, s5);
      void 0 !== i7 && this._$Eh.set(i7, t6);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t5) {
    const s5 = [];
    if (Array.isArray(t5)) {
      const e6 = new Set(t5.flat(1 / 0).reverse());
      for (const t6 of e6) s5.unshift(c(t6));
    } else void 0 !== t5 && s5.push(c(t5));
    return s5;
  }
  static _$Eu(t5, s5) {
    const i7 = s5.attribute;
    return false === i7 ? void 0 : "string" == typeof i7 ? i7 : "string" == typeof t5 ? t5.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t5) => this.enableUpdating = t5), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t5) => t5(this));
  }
  addController(t5) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t5), void 0 !== this.renderRoot && this.isConnected && t5.hostConnected?.();
  }
  removeController(t5) {
    this._$EO?.delete(t5);
  }
  _$E_() {
    const t5 = /* @__PURE__ */ new Map(), s5 = this.constructor.elementProperties;
    for (const i7 of s5.keys()) this.hasOwnProperty(i7) && (t5.set(i7, this[i7]), delete this[i7]);
    t5.size > 0 && (this._$Ep = t5);
  }
  createRenderRoot() {
    const t5 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t5, this.constructor.elementStyles), t5;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach((t5) => t5.hostConnected?.());
  }
  enableUpdating(t5) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t5) => t5.hostDisconnected?.());
  }
  attributeChangedCallback(t5, s5, i7) {
    this._$AK(t5, i7);
  }
  _$ET(t5, s5) {
    const i7 = this.constructor.elementProperties.get(t5), e6 = this.constructor._$Eu(t5, i7);
    if (void 0 !== e6 && true === i7.reflect) {
      const h4 = (void 0 !== i7.converter?.toAttribute ? i7.converter : b).toAttribute(s5, i7.type);
      this._$Em = t5, null == h4 ? this.removeAttribute(e6) : this.setAttribute(e6, h4), this._$Em = null;
    }
  }
  _$AK(t5, s5) {
    const i7 = this.constructor, e6 = i7._$Eh.get(t5);
    if (void 0 !== e6 && this._$Em !== e6) {
      const t6 = i7.getPropertyOptions(e6), h4 = "function" == typeof t6.converter ? { fromAttribute: t6.converter } : void 0 !== t6.converter?.fromAttribute ? t6.converter : b;
      this._$Em = e6;
      const r6 = h4.fromAttribute(s5, t6.type);
      this[e6] = r6 ?? this._$Ej?.get(e6) ?? r6, this._$Em = null;
    }
  }
  requestUpdate(t5, s5, i7, e6 = false, h4) {
    if (void 0 !== t5) {
      const r6 = this.constructor;
      if (false === e6 && (h4 = this[t5]), i7 ??= r6.getPropertyOptions(t5), !((i7.hasChanged ?? m)(h4, s5) || i7.useDefault && i7.reflect && h4 === this._$Ej?.get(t5) && !this.hasAttribute(r6._$Eu(t5, i7)))) return;
      this.C(t5, s5, i7);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t5, s5, { useDefault: i7, reflect: e6, wrapped: h4 }, r6) {
    i7 && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t5) && (this._$Ej.set(t5, r6 ?? s5 ?? this[t5]), true !== h4 || void 0 !== r6) || (this._$AL.has(t5) || (this.hasUpdated || i7 || (s5 = void 0), this._$AL.set(t5, s5)), true === e6 && this._$Em !== t5 && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t5));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t6) {
      Promise.reject(t6);
    }
    const t5 = this.scheduleUpdate();
    return null != t5 && await t5, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t7, s6] of this._$Ep) this[t7] = s6;
        this._$Ep = void 0;
      }
      const t6 = this.constructor.elementProperties;
      if (t6.size > 0) for (const [s6, i7] of t6) {
        const { wrapped: t7 } = i7, e6 = this[s6];
        true !== t7 || this._$AL.has(s6) || void 0 === e6 || this.C(s6, void 0, i7, e6);
      }
    }
    let t5 = false;
    const s5 = this._$AL;
    try {
      t5 = this.shouldUpdate(s5), t5 ? (this.willUpdate(s5), this._$EO?.forEach((t6) => t6.hostUpdate?.()), this.update(s5)) : this._$EM();
    } catch (s6) {
      throw t5 = false, this._$EM(), s6;
    }
    t5 && this._$AE(s5);
  }
  willUpdate(t5) {
  }
  _$AE(t5) {
    this._$EO?.forEach((t6) => t6.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t5)), this.updated(t5);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t5) {
    return true;
  }
  update(t5) {
    this._$Eq &&= this._$Eq.forEach((t6) => this._$ET(t6, this[t6])), this._$EM();
  }
  updated(t5) {
  }
  firstUpdated(t5) {
  }
};
g.elementStyles = [], g.shadowRootOptions = { mode: "open" }, g[f("elementProperties")] = /* @__PURE__ */ new Map(), g[f("finalized")] = /* @__PURE__ */ new Map(), u?.({ ReactiveElement: g }), (l.reactiveElementVersions ??= []).push("2.1.2");

// lit-html/lit-html.js
var t2 = globalThis;
var i2 = (t5) => t5;
var s2 = t2.trustedTypes;
var e2 = s2 ? s2.createPolicy("lit-html", { createHTML: (t5) => t5 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t5) => null === t5 || "object" != typeof t5 && "function" != typeof t5;
var u2 = Array.isArray;
var d2 = (t5) => u2(t5) || "function" == typeof t5?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m2 = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g2 = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t5) => (i7, ...s5) => ({ _$litType$: t5, strings: i7, values: s5 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = Symbol.for("lit-noChange");
var A = Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t5, i7) {
  if (!u2(t5) || !t5.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e2 ? e2.createHTML(i7) : i7;
}
var N = (t5, i7) => {
  const s5 = t5.length - 1, e6 = [];
  let n6, l3 = 2 === i7 ? "<svg>" : 3 === i7 ? "<math>" : "", c5 = v;
  for (let i8 = 0; i8 < s5; i8++) {
    const s6 = t5[i8];
    let a3, u5, d3 = -1, f3 = 0;
    for (; f3 < s6.length && (c5.lastIndex = f3, u5 = c5.exec(s6), null !== u5); ) f3 = c5.lastIndex, c5 === v ? "!--" === u5[1] ? c5 = _ : void 0 !== u5[1] ? c5 = m2 : void 0 !== u5[2] ? (y2.test(u5[2]) && (n6 = RegExp("</" + u5[2], "g")), c5 = p2) : void 0 !== u5[3] && (c5 = p2) : c5 === p2 ? ">" === u5[0] ? (c5 = n6 ?? v, d3 = -1) : void 0 === u5[1] ? d3 = -2 : (d3 = c5.lastIndex - u5[2].length, a3 = u5[1], c5 = void 0 === u5[3] ? p2 : '"' === u5[3] ? $ : g2) : c5 === $ || c5 === g2 ? c5 = p2 : c5 === _ || c5 === m2 ? c5 = v : (c5 = p2, n6 = void 0);
    const x2 = c5 === p2 && t5[i8 + 1].startsWith("/>") ? " " : "";
    l3 += c5 === v ? s6 + r3 : d3 >= 0 ? (e6.push(a3), s6.slice(0, d3) + h2 + s6.slice(d3) + o3 + x2) : s6 + o3 + (-2 === d3 ? i8 : x2);
  }
  return [V(t5, l3 + (t5[s5] || "<?>") + (2 === i7 ? "</svg>" : 3 === i7 ? "</math>" : "")), e6];
};
var S2 = class _S {
  constructor({ strings: t5, _$litType$: i7 }, e6) {
    let r6;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u5 = t5.length - 1, d3 = this.parts, [f3, v3] = N(t5, i7);
    if (this.el = _S.createElement(f3, e6), P.currentNode = this.el.content, 2 === i7 || 3 === i7) {
      const t6 = this.el.content.firstChild;
      t6.replaceWith(...t6.childNodes);
    }
    for (; null !== (r6 = P.nextNode()) && d3.length < u5; ) {
      if (1 === r6.nodeType) {
        if (r6.hasAttributes()) for (const t6 of r6.getAttributeNames()) if (t6.endsWith(h2)) {
          const i8 = v3[a3++], s5 = r6.getAttribute(t6).split(o3), e7 = /([.?@])?(.*)/.exec(i8);
          d3.push({ type: 1, index: l3, name: e7[2], strings: s5, ctor: "." === e7[1] ? I : "?" === e7[1] ? L : "@" === e7[1] ? z : H }), r6.removeAttribute(t6);
        } else t6.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r6.removeAttribute(t6));
        if (y2.test(r6.tagName)) {
          const t6 = r6.textContent.split(o3), i8 = t6.length - 1;
          if (i8 > 0) {
            r6.textContent = s2 ? s2.emptyScript : "";
            for (let s5 = 0; s5 < i8; s5++) r6.append(t6[s5], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r6.append(t6[i8], c3());
          }
        }
      } else if (8 === r6.nodeType) if (r6.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t6 = -1;
        for (; -1 !== (t6 = r6.data.indexOf(o3, t6 + 1)); ) d3.push({ type: 7, index: l3 }), t6 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t5, i7) {
    const s5 = l2.createElement("template");
    return s5.innerHTML = t5, s5;
  }
};
function M(t5, i7, s5 = t5, e6) {
  if (i7 === E) return i7;
  let h4 = void 0 !== e6 ? s5._$Co?.[e6] : s5._$Cl;
  const o7 = a2(i7) ? void 0 : i7._$litDirective$;
  return h4?.constructor !== o7 && (h4?._$AO?.(false), void 0 === o7 ? h4 = void 0 : (h4 = new o7(t5), h4._$AT(t5, s5, e6)), void 0 !== e6 ? (s5._$Co ??= [])[e6] = h4 : s5._$Cl = h4), void 0 !== h4 && (i7 = M(t5, h4._$AS(t5, i7.values), h4, e6)), i7;
}
var R = class {
  constructor(t5, i7) {
    this._$AV = [], this._$AN = void 0, this._$AD = t5, this._$AM = i7;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t5) {
    const { el: { content: i7 }, parts: s5 } = this._$AD, e6 = (t5?.creationScope ?? l2).importNode(i7, true);
    P.currentNode = e6;
    let h4 = P.nextNode(), o7 = 0, n6 = 0, r6 = s5[0];
    for (; void 0 !== r6; ) {
      if (o7 === r6.index) {
        let i8;
        2 === r6.type ? i8 = new k(h4, h4.nextSibling, this, t5) : 1 === r6.type ? i8 = new r6.ctor(h4, r6.name, r6.strings, this, t5) : 6 === r6.type && (i8 = new Z(h4, this, t5)), this._$AV.push(i8), r6 = s5[++n6];
      }
      o7 !== r6?.index && (h4 = P.nextNode(), o7++);
    }
    return P.currentNode = l2, e6;
  }
  p(t5) {
    let i7 = 0;
    for (const s5 of this._$AV) void 0 !== s5 && (void 0 !== s5.strings ? (s5._$AI(t5, s5, i7), i7 += s5.strings.length - 2) : s5._$AI(t5[i7])), i7++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t5, i7, s5, e6) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t5, this._$AB = i7, this._$AM = s5, this.options = e6, this._$Cv = e6?.isConnected ?? true;
  }
  get parentNode() {
    let t5 = this._$AA.parentNode;
    const i7 = this._$AM;
    return void 0 !== i7 && 11 === t5?.nodeType && (t5 = i7.parentNode), t5;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t5, i7 = this) {
    t5 = M(this, t5, i7), a2(t5) ? t5 === A || null == t5 || "" === t5 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t5 !== this._$AH && t5 !== E && this._(t5) : void 0 !== t5._$litType$ ? this.$(t5) : void 0 !== t5.nodeType ? this.T(t5) : d2(t5) ? this.k(t5) : this._(t5);
  }
  O(t5) {
    return this._$AA.parentNode.insertBefore(t5, this._$AB);
  }
  T(t5) {
    this._$AH !== t5 && (this._$AR(), this._$AH = this.O(t5));
  }
  _(t5) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t5 : this.T(l2.createTextNode(t5)), this._$AH = t5;
  }
  $(t5) {
    const { values: i7, _$litType$: s5 } = t5, e6 = "number" == typeof s5 ? this._$AC(t5) : (void 0 === s5.el && (s5.el = S2.createElement(V(s5.h, s5.h[0]), this.options)), s5);
    if (this._$AH?._$AD === e6) this._$AH.p(i7);
    else {
      const t6 = new R(e6, this), s6 = t6.u(this.options);
      t6.p(i7), this.T(s6), this._$AH = t6;
    }
  }
  _$AC(t5) {
    let i7 = C.get(t5.strings);
    return void 0 === i7 && C.set(t5.strings, i7 = new S2(t5)), i7;
  }
  k(t5) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i7 = this._$AH;
    let s5, e6 = 0;
    for (const h4 of t5) e6 === i7.length ? i7.push(s5 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s5 = i7[e6], s5._$AI(h4), e6++;
    e6 < i7.length && (this._$AR(s5 && s5._$AB.nextSibling, e6), i7.length = e6);
  }
  _$AR(t5 = this._$AA.nextSibling, s5) {
    for (this._$AP?.(false, true, s5); t5 !== this._$AB; ) {
      const s6 = i2(t5).nextSibling;
      i2(t5).remove(), t5 = s6;
    }
  }
  setConnected(t5) {
    void 0 === this._$AM && (this._$Cv = t5, this._$AP?.(t5));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t5, i7, s5, e6, h4) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t5, this.name = i7, this._$AM = e6, this.options = h4, s5.length > 2 || "" !== s5[0] || "" !== s5[1] ? (this._$AH = Array(s5.length - 1).fill(new String()), this.strings = s5) : this._$AH = A;
  }
  _$AI(t5, i7 = this, s5, e6) {
    const h4 = this.strings;
    let o7 = false;
    if (void 0 === h4) t5 = M(this, t5, i7, 0), o7 = !a2(t5) || t5 !== this._$AH && t5 !== E, o7 && (this._$AH = t5);
    else {
      const e7 = t5;
      let n6, r6;
      for (t5 = h4[0], n6 = 0; n6 < h4.length - 1; n6++) r6 = M(this, e7[s5 + n6], i7, n6), r6 === E && (r6 = this._$AH[n6]), o7 ||= !a2(r6) || r6 !== this._$AH[n6], r6 === A ? t5 = A : t5 !== A && (t5 += (r6 ?? "") + h4[n6 + 1]), this._$AH[n6] = r6;
    }
    o7 && !e6 && this.j(t5);
  }
  j(t5) {
    t5 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t5 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t5) {
    this.element[this.name] = t5 === A ? void 0 : t5;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t5) {
    this.element.toggleAttribute(this.name, !!t5 && t5 !== A);
  }
};
var z = class extends H {
  constructor(t5, i7, s5, e6, h4) {
    super(t5, i7, s5, e6, h4), this.type = 5;
  }
  _$AI(t5, i7 = this) {
    if ((t5 = M(this, t5, i7, 0) ?? A) === E) return;
    const s5 = this._$AH, e6 = t5 === A && s5 !== A || t5.capture !== s5.capture || t5.once !== s5.once || t5.passive !== s5.passive, h4 = t5 !== A && (s5 === A || e6);
    e6 && this.element.removeEventListener(this.name, this, s5), h4 && this.element.addEventListener(this.name, this, t5), this._$AH = t5;
  }
  handleEvent(t5) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t5) : this._$AH.handleEvent(t5);
  }
};
var Z = class {
  constructor(t5, i7, s5) {
    this.element = t5, this.type = 6, this._$AN = void 0, this._$AM = i7, this.options = s5;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t5) {
    M(this, t5);
  }
};
var j = { M: h2, P: o3, A: n3, C: 1, L: N, R, D: d2, V: M, I: k, H, N: L, U: z, B: I, F: Z };
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ??= []).push("3.3.3");
var D = (t5, i7, s5) => {
  const e6 = s5?.renderBefore ?? i7;
  let h4 = e6._$litPart$;
  if (void 0 === h4) {
    const t6 = s5?.renderBefore ?? null;
    e6._$litPart$ = h4 = new k(i7.insertBefore(c3(), t6), t6, void 0, s5 ?? {});
  }
  return h4._$AI(t5), h4;
};

// lit-element/lit-element.js
var s3 = globalThis;
var i3 = class extends g {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t5 = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t5.firstChild, t5;
  }
  update(t5) {
    const r6 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t5), this._$Do = D(r6, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i3._$litElement$ = true, i3["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i3 });
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i3 });
(s3.litElementVersions ??= []).push("4.2.2");

// @lit/reactive-element/node/decorators/property.js
var o5 = { attribute: true, type: String, converter: b, reflect: false, hasChanged: m };
var r4 = (t5 = o5, e6, r6) => {
  const { kind: n6, metadata: i7 } = r6;
  let s5 = globalThis.litPropertyMetadata.get(i7);
  if (void 0 === s5 && globalThis.litPropertyMetadata.set(i7, s5 = /* @__PURE__ */ new Map()), "setter" === n6 && ((t5 = Object.create(t5)).wrapped = true), s5.set(r6.name, t5), "accessor" === n6) {
    const { name: o7 } = r6;
    return { set(r7) {
      const n7 = e6.get.call(this);
      e6.set.call(this, r7), this.requestUpdate(o7, n7, t5, true, r7);
    }, init(e7) {
      return void 0 !== e7 && this.C(o7, void 0, t5, e7), e7;
    } };
  }
  if ("setter" === n6) {
    const { name: o7 } = r6;
    return function(r7) {
      const n7 = this[o7];
      e6.call(this, r7), this.requestUpdate(o7, n7, t5, true, r7);
    };
  }
  throw Error("Unsupported decorator location: " + n6);
};
function n4(t5) {
  return (e6, o7) => "object" == typeof o7 ? r4(t5, e6, o7) : ((t6, e7, o8) => {
    const r6 = e7.hasOwnProperty(o8);
    return e7.constructor.createProperty(o8, t6), r6 ? Object.getOwnPropertyDescriptor(e7, o8) : void 0;
  })(t5, e6, o7);
}

// @lit/reactive-element/node/decorators/state.js
function r5(r6) {
  return n4({ ...r6, state: true, attribute: false });
}

// lit-html/directive.js
var t3 = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 };
var e4 = (t5) => (...e6) => ({ _$litDirective$: t5, values: e6 });
var i4 = class {
  constructor(t5) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t5, e6, i7) {
    this._$Ct = t5, this._$AM = e6, this._$Ci = i7;
  }
  _$AS(t5, e6) {
    return this.update(t5, e6);
  }
  update(t5, e6) {
    return this.render(...e6);
  }
};

// lit-html/directives/class-map.js
var e5 = e4(class extends i4 {
  constructor(t5) {
    if (super(t5), t5.type !== t3.ATTRIBUTE || "class" !== t5.name || t5.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(t5) {
    return " " + Object.keys(t5).filter((s5) => t5[s5]).join(" ") + " ";
  }
  update(s5, [i7]) {
    if (void 0 === this.st) {
      this.st = /* @__PURE__ */ new Set(), void 0 !== s5.strings && (this.nt = new Set(s5.strings.join(" ").split(/\s/).filter((t5) => "" !== t5)));
      for (const t5 in i7) i7[t5] && !this.nt?.has(t5) && this.st.add(t5);
      return this.render(i7);
    }
    const r6 = s5.element.classList;
    for (const t5 of this.st) t5 in i7 || (r6.remove(t5), this.st.delete(t5));
    for (const t5 in i7) {
      const s6 = !!i7[t5];
      s6 === this.st.has(t5) || this.nt?.has(t5) || (s6 ? (r6.add(t5), this.st.add(t5)) : (r6.remove(t5), this.st.delete(t5)));
    }
    return E;
  }
});

// @erplora/outfitkit/dist/define.js
function define(tag, ctor) {
  if (typeof customElements !== "undefined" && !customElements.get(tag)) {
    customElements.define(tag, ctor);
  }
}

// locales/es.json
var es_default = {
  name: "Control horario",
  description: "Registro de jornada para empleados: fichar la entrada y la salida con un toque, pausas, un registro legal de la jornada (art. 34.9 ET) con rastro de correcciones y un radio opcional del lugar de trabajo para los dispositivos personales.",
  navigation: {
    clock: {
      label: "Fichar"
    },
    records: {
      label: "Registros"
    }
  },
  settings: {
    title: "Control horario",
    fields: {
      require_location: {
        label: "Pedir la ubicaci\xF3n al fichar desde un dispositivo personal",
        description: "Al TPV del mostrador (dispositivo compartido) nunca se le pide la ubicaci\xF3n."
      },
      geofence_radius_m: {
        label: "Radio permitido (metros)",
        description: "A qu\xE9 distancia del lugar de trabajo puede fichar un dispositivo personal."
      },
      workplace_lat: {
        label: "Latitud del lugar de trabajo",
        description: "D\xE9jala vac\xEDa hasta fijar la ubicaci\xF3n del lugar de trabajo."
      },
      workplace_lng: {
        label: "Longitud del lugar de trabajo",
        description: "D\xE9jala vac\xEDa hasta fijar la ubicaci\xF3n del lugar de trabajo."
      },
      auto_close_after_hours: {
        label: "Marcar para revisar las jornadas abiertas tras (horas)",
        description: "Una jornada que sigue abierta pasadas estas horas se marca para revisar."
      }
    }
  },
  widgets: {
    "attendance.clocked_in_now": {
      title: "Fichados ahora",
      label: "Fichados ahora"
    }
  },
  errors: {
    "attendance.clock_in_rejected": "No se ha podido fichar la entrada: ya tienes una jornada abierta o este dispositivo est\xE1 fuera del radio permitido.",
    "attendance.no_open_record": "No hay ninguna jornada abierta de la que fichar la salida.",
    "attendance.break_rejected": "No se ha podido empezar la pausa: no hay jornada abierta o ya hay una pausa en curso.",
    "attendance.no_open_break": "No hay ninguna pausa en curso que terminar.",
    "attendance.record_not_found": "No se ha podido corregir la jornada: no existe, la salida no es posterior a la entrada o reabrirla dejar\xEDa a la persona con dos jornadas abiertas.",
    "attendance.settings_not_saved": "No se han podido guardar los ajustes del control horario. Vuelve a intentarlo en un momento."
  },
  ui: {
    clock: {
      title: "Control horario",
      greeting: "Hola, {name}",
      now: "Son las {time}",
      statusOut: "No has fichado la entrada",
      statusIn: "Dentro desde las {time}",
      statusOnBreak: "En pausa desde las {time}",
      elapsed: "Tiempo desde la entrada",
      clockIn: "Fichar entrada",
      clockOut: "Fichar salida",
      breakStart: "Empezar pausa",
      breakEnd: "Terminar pausa",
      locating: "Obteniendo tu ubicaci\xF3n\u2026",
      locationRequired: "Al fichar la entrada desde este dispositivo se comprueba tu ubicaci\xF3n.",
      distance: "Est\xE1s a {distance} m del lugar de trabajo.",
      outsideRadius: "Est\xE1s a {distance} m del lugar de trabajo, fuera de los {radius} m permitidos. Ac\xE9rcate para fichar o ficha en el mostrador.",
      workplaceNotSet: "A\xFAn no se ha fijado la ubicaci\xF3n del lugar de trabajo, as\xED que este dispositivo no puede fichar. Pide a un encargado que la fije en los ajustes del control horario o ficha en el mostrador.",
      locationDenied: "El acceso a la ubicaci\xF3n est\xE1 denegado. Permite la ubicaci\xF3n a esta app para fichar desde este dispositivo o ficha en el mostrador.",
      clockedIn: "Entrada fichada a las {time}.",
      clockedOut: "Salida fichada a las {time}.",
      breakStarted: "Pausa iniciada a las {time}.",
      breakEnded: "Pausa terminada a las {time}.",
      today: "Hoy",
      workedToday: "Trabajado",
      breaksToday: "Pausas",
      recent: "\xDAltimas jornadas",
      empty: "Todav\xEDa no hay registros",
      noClockOut: "sin salida",
      reloadFailed: "No se pudo actualizar la pantalla: {reason}"
    },
    records: {
      title: "Registros",
      filterUser: "Persona",
      allUsers: "Todo el equipo",
      filterMonth: "Mes",
      filterStatus: "Estado",
      allStatuses: "Todos los estados",
      status: {
        open: "Abierta",
        closed: "Cerrada",
        needs_review: "Por revisar"
      },
      colDate: "Fecha",
      colUser: "Persona",
      colIn: "Entrada",
      colOut: "Salida",
      colBreaks: "Pausas (min)",
      colWorked: "Trabajado",
      colStatus: "Estado",
      colRadius: "Ubicaci\xF3n",
      colActions: "Acciones",
      inProgress: "En curso",
      radiusInInside: "Entrada dentro del radio del local",
      radiusInOutside: "Entrada fuera del radio del local",
      radiusOutInside: "Salida dentro del radio del local",
      radiusOutOutside: "Salida fuera del radio del local",
      noLocation: "Sin ubicaci\xF3n registrada",
      correct: "Corregir",
      history: "Historial",
      exportCsv: "Exportar CSV",
      exporting: "Exportando\u2026",
      exportEmpty: "No hay registros con este filtro: el fichero solo lleva la cabecera.",
      exportFailed: "No se pudo exportar el CSV. Int\xE9ntalo de nuevo.",
      loading: "Cargando registros\u2026",
      empty: "No hay registros en este mes.",
      loadFailed: "No se pudieron cargar los registros.",
      retry: "Reintentar",
      usersUnavailable: "No se pudieron cargar los nombres del equipo: cada persona aparece con su id.",
      breaksUnavailable: "No se pudieron cargar las pausas en curso: el tiempo trabajado de las jornadas abiertas puede incluirlas.",
      correctTitle: "Corregir jornada",
      fieldClockIn: "Entrada",
      fieldClockOut: "Salida (vac\xEDa = sigue abierta)",
      fieldReason: "Motivo",
      reasonHelper: "Obligatorio. Queda en el historial de la jornada con tu nombre.",
      save: "Guardar correcci\xF3n",
      saving: "Guardando\u2026",
      cancel: "Cancelar",
      close: "Cerrar",
      invalidClockIn: "Indica la fecha y la hora de entrada.",
      invalidCorrection: "La salida tiene que ser posterior a la entrada.",
      reasonRequired: "Escribe un motivo de al menos 3 caracteres.",
      corrected: "Jornada corregida.",
      saveFailed: "No se pudo guardar la correcci\xF3n. Int\xE9ntalo de nuevo.",
      historyTitle: "Historial de correcciones",
      historyLoading: "Cargando historial\u2026",
      historyEmpty: "Esta jornada no se ha corregido nunca.",
      historyFailed: "No se pudo cargar el historial.",
      historyBefore: "Antes",
      historyAfter: "Despu\xE9s",
      historyReason: "Motivo",
      systemActor: "Sistema"
    },
    settings: {
      title: "Ajustes del control horario",
      intro: "Decide si un dispositivo personal tiene que estar en el lugar de trabajo para fichar. Al TPV del mostrador (dispositivo compartido) nunca se le pide la ubicaci\xF3n.",
      requireLocation: "Pedir la ubicaci\xF3n al fichar desde un dispositivo personal",
      radius: "Radio permitido",
      radiusOption: "{radius} m",
      workplace: "Ubicaci\xF3n del lugar de trabajo",
      latitude: "Latitud",
      longitude: "Longitud",
      useMyLocation: "Usar mi ubicaci\xF3n actual",
      locating: "Obteniendo tu ubicaci\xF3n\u2026",
      accuracy: "Posici\xF3n le\xEDda con una precisi\xF3n de \xB1{accuracy} m. Hazlo desde el propio lugar de trabajo.",
      workplaceMissing: "Fija la ubicaci\xF3n del lugar de trabajo o nadie podr\xE1 fichar desde un dispositivo personal.",
      autoClose: "Marcar a revisar tras (horas)",
      autoCloseHelp: "Una jornada que sigue abierta pasadas estas horas se marca para revisar y que un encargado la corrija.",
      save: "Guardar",
      saving: "Guardando\u2026",
      saved: "Ajustes guardados.",
      invalidLatitude: "La latitud tiene que ser un n\xFAmero entre -90 y 90.",
      invalidLongitude: "La longitud tiene que ser un n\xFAmero entre -180 y 180.",
      coordinatesIncomplete: "Rellena la latitud y la longitud, o deja las dos vac\xEDas.",
      invalidAutoClose: "Escribe un n\xFAmero entero de horas entre 1 y 24.",
      locationDenied: "El acceso a la ubicaci\xF3n est\xE1 denegado. Permite la ubicaci\xF3n en este navegador para leer la posici\xF3n del lugar de trabajo o escribe las coordenadas.",
      readOnly: "Solo un encargado o administrador puede cambiar estos ajustes."
    },
    common: {
      loading: "Cargando\u2026",
      retry: "Reintentar",
      loadError: "No se ha podido cargar el control horario. Comprueba la conexi\xF3n y vuelve a intentarlo.",
      unexpectedError: "Algo ha fallado. Vuelve a intentarlo en un momento.",
      locationUnavailable: "No se ha podido determinar tu posici\xF3n. Ponte en un lugar despejado y vuelve a intentarlo.",
      locationTimeout: "Obtener tu posici\xF3n ha tardado demasiado. Vuelve a intentarlo.",
      locationUnsupported: "Este dispositivo no puede compartir su ubicaci\xF3n.",
      statusOpen: "En curso",
      statusClosed: "Cerrada",
      statusNeedsReview: "Para revisar"
    }
  }
};

// locales/en.json
var en_default = {
  name: "Time clock",
  description: "Time clock for employees: clock in and out with one tap, breaks, a legal working-day record (Spain, art. 34.9 ET) with a correction trail, and an optional workplace radius for personal devices.",
  navigation: {
    clock: {
      label: "Clock in"
    },
    records: {
      label: "Records"
    }
  },
  settings: {
    title: "Time clock",
    fields: {
      require_location: {
        label: "Require location when clocking in from a personal device",
        description: "The counter POS (shared device) is never asked for a location."
      },
      geofence_radius_m: {
        label: "Allowed radius (metres)",
        description: "How far from the workplace a personal device may clock in."
      },
      workplace_lat: {
        label: "Workplace latitude",
        description: "Leave empty until the workplace location is set."
      },
      workplace_lng: {
        label: "Workplace longitude",
        description: "Leave empty until the workplace location is set."
      },
      auto_close_after_hours: {
        label: "Flag open days for review after (hours)",
        description: "A working day still open after this many hours is marked for review."
      }
    }
  },
  widgets: {
    "attendance.clocked_in_now": {
      title: "Clocked in now",
      label: "Clocked in now"
    }
  },
  errors: {
    "attendance.clock_in_rejected": "Could not clock in: you already have an open working day, or this device is outside the allowed radius.",
    "attendance.no_open_record": "There is no open working day to clock out of.",
    "attendance.break_rejected": "Could not start a break: there is no open working day or a break is already running.",
    "attendance.no_open_break": "There is no running break to end.",
    "attendance.record_not_found": "The working day could not be corrected: it does not exist, the clock-out is not after the clock-in, or reopening it would leave the person with two open days.",
    "attendance.settings_not_saved": "The time clock settings could not be saved. Try again in a moment."
  },
  ui: {
    clock: {
      title: "Time clock",
      greeting: "Hello, {name}",
      now: "It is {time}",
      statusOut: "You are clocked out",
      statusIn: "Clocked in since {time}",
      statusOnBreak: "On break since {time}",
      elapsed: "Time since clock-in",
      clockIn: "Clock in",
      clockOut: "Clock out",
      breakStart: "Start break",
      breakEnd: "End break",
      locating: "Getting your location\u2026",
      locationRequired: "Your location is checked when you clock in from this device.",
      distance: "You are {distance} m from the workplace.",
      outsideRadius: "You are {distance} m from the workplace, outside the allowed {radius} m. Move closer to clock in, or clock in at the counter.",
      workplaceNotSet: "The workplace location is not set yet, so this device cannot clock in. Ask a manager to set it in the time clock settings, or clock in at the counter.",
      locationDenied: "Location access is denied. Allow location for this app to clock in from this device, or clock in at the counter.",
      clockedIn: "Clocked in at {time}.",
      clockedOut: "Clocked out at {time}.",
      breakStarted: "Break started at {time}.",
      breakEnded: "Break ended at {time}.",
      today: "Today",
      workedToday: "Worked",
      breaksToday: "Breaks",
      recent: "Recent days",
      empty: "No records yet",
      noClockOut: "no clock-out",
      reloadFailed: "The screen could not be refreshed: {reason}"
    },
    records: {
      title: "Records",
      filterUser: "Person",
      allUsers: "Everyone",
      filterMonth: "Month",
      filterStatus: "Status",
      allStatuses: "All statuses",
      status: {
        open: "Open",
        closed: "Closed",
        needs_review: "Needs review"
      },
      colDate: "Date",
      colUser: "Person",
      colIn: "Clock-in",
      colOut: "Clock-out",
      colBreaks: "Breaks (min)",
      colWorked: "Worked",
      colStatus: "Status",
      colRadius: "Location",
      colActions: "Actions",
      inProgress: "In progress",
      radiusInInside: "Clock-in inside the workplace radius",
      radiusInOutside: "Clock-in outside the workplace radius",
      radiusOutInside: "Clock-out inside the workplace radius",
      radiusOutOutside: "Clock-out outside the workplace radius",
      noLocation: "No location recorded",
      correct: "Correct",
      history: "History",
      exportCsv: "Export CSV",
      exporting: "Exporting\u2026",
      exportEmpty: "There are no records for this filter: the file only has the header.",
      exportFailed: "The CSV could not be exported. Try again.",
      loading: "Loading records\u2026",
      empty: "No records for this month.",
      loadFailed: "The records could not be loaded.",
      retry: "Retry",
      usersUnavailable: "The names of the team could not be loaded: people are shown by their id.",
      breaksUnavailable: "The running breaks could not be loaded: the worked time of open days may include them.",
      correctTitle: "Correct working day",
      fieldClockIn: "Clock-in",
      fieldClockOut: "Clock-out (empty = still open)",
      fieldReason: "Reason",
      reasonHelper: "Required. It stays in the history of the day with your name.",
      save: "Save correction",
      saving: "Saving\u2026",
      cancel: "Cancel",
      close: "Close",
      invalidClockIn: "Enter the clock-in date and time.",
      invalidCorrection: "The clock-out must be after the clock-in.",
      reasonRequired: "Write a reason of at least 3 characters.",
      corrected: "Working day corrected.",
      saveFailed: "The correction could not be saved. Try again.",
      historyTitle: "Correction history",
      historyLoading: "Loading history\u2026",
      historyEmpty: "This working day has never been corrected.",
      historyFailed: "The history could not be loaded.",
      historyBefore: "Before",
      historyAfter: "After",
      historyReason: "Reason",
      systemActor: "System"
    },
    settings: {
      title: "Time clock settings",
      intro: "Decide whether a personal device must be at the workplace to clock in. The counter POS (shared device) is never asked for a location.",
      requireLocation: "Require location when clocking in from a personal device",
      radius: "Allowed radius",
      radiusOption: "{radius} m",
      workplace: "Workplace location",
      latitude: "Latitude",
      longitude: "Longitude",
      useMyLocation: "Use my current location",
      locating: "Getting your location\u2026",
      accuracy: "Position read with an accuracy of \xB1{accuracy} m. Do this from the workplace itself.",
      workplaceMissing: "Set the workplace location or nobody on a personal device will be able to clock in.",
      autoClose: "Flag for review after (hours)",
      autoCloseHelp: "A working day still open after this many hours is marked for review so a manager can correct it.",
      save: "Save",
      saving: "Saving\u2026",
      saved: "Settings saved.",
      invalidLatitude: "Latitude must be a number between -90 and 90.",
      invalidLongitude: "Longitude must be a number between -180 and 180.",
      coordinatesIncomplete: "Fill in both latitude and longitude, or leave both empty.",
      invalidAutoClose: "Enter a whole number of hours between 1 and 24.",
      locationDenied: "Location access is denied. Allow location in this browser to read the workplace position, or type the coordinates.",
      readOnly: "Only a manager or administrator can change these settings."
    },
    common: {
      loading: "Loading\u2026",
      retry: "Retry",
      loadError: "The time clock could not be loaded. Check the connection and try again.",
      unexpectedError: "Something went wrong. Try again in a moment.",
      locationUnavailable: "Your position could not be determined. Move to an open area and try again.",
      locationTimeout: "Getting your position took too long. Try again.",
      locationUnsupported: "This device cannot share its location.",
      statusOpen: "In progress",
      statusClosed: "Closed",
      statusNeedsReview: "Needs review"
    }
  }
};

// ui/lib/geo.ts
var GeoError = class extends Error {
  constructor(code, message) {
    super(message || code);
    this.name = "GeoError";
    this.code = code;
  }
};
var EARTH_RADIUS_M = 63710088e-1;
var toRad = (deg) => deg * Math.PI / 180;
function haversineMeters(a3, b3) {
  const dLat = toRad(b3.lat - a3.lat);
  const dLng = toRad(b3.lng - a3.lng);
  const h4 = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a3.lat)) * Math.cos(toRad(b3.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h4)));
}
function withinRadius(distance, radius) {
  return Number.isFinite(distance) && distance <= radius;
}
var POSITION_TIMEOUT_MS = 15e3;
var NO_ANSWER_GRACE_MS = 15e3;
var BROWSER_CODES = { 1: "denied", 2: "unavailable", 3: "timeout" };
function getPosition() {
  const geo = globalThis.navigator?.geolocation;
  if (!geo || typeof geo.getCurrentPosition !== "function") {
    return Promise.reject(new GeoError("unsupported"));
  }
  return new Promise((resolve, reject) => {
    let settled = false;
    const guard = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new GeoError("timeout"));
    }, POSITION_TIMEOUT_MS + NO_ANSWER_GRACE_MS);
    const finish = (fn) => {
      if (settled) return;
      settled = true;
      clearTimeout(guard);
      fn();
    };
    try {
      geo.getCurrentPosition(
        (p4) => finish(
          () => resolve({ lat: p4.coords.latitude, lng: p4.coords.longitude, accuracy_m: p4.coords.accuracy })
        ),
        (e6) => finish(() => reject(new GeoError(BROWSER_CODES[e6?.code] ?? "unavailable", e6?.message))),
        { enableHighAccuracy: true, timeout: POSITION_TIMEOUT_MS, maximumAge: 0 }
      );
    } catch (e6) {
      finish(() => reject(new GeoError("unavailable", e6 instanceof Error ? e6.message : void 0)));
    }
  });
}

// ui/lib/duration.ts
var ms = (iso) => Date.parse(iso);
function minutesBetween(isoA, isoB) {
  const diff = ms(isoB) - ms(isoA);
  if (!Number.isFinite(diff) || diff <= 0) return 0;
  return Math.floor(diff / 6e4);
}
var whole = (n6) => Number.isFinite(n6) && n6 > 0 ? Math.floor(n6) : 0;
var pad2 = (n6) => String(n6).padStart(2, "0");
function formatHm(minutes) {
  const m4 = whole(minutes);
  return `${Math.floor(m4 / 60)}:${pad2(m4 % 60)}`;
}
function formatHms(seconds) {
  const s5 = whole(seconds);
  return `${Math.floor(s5 / 3600)}:${pad2(Math.floor(s5 % 3600 / 60))}:${pad2(s5 % 60)}`;
}
function safeZone(timezone) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return timezone;
  } catch {
    return "UTC";
  }
}
function localDateOf(iso, timezone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: safeZone(timezone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(ms(iso)));
  const get = (type) => parts.find((p4) => p4.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
function formatTime(iso, timezone, locale) {
  if (!iso || !Number.isFinite(ms(iso))) return "";
  return new Intl.DateTimeFormat(locale, {
    timeZone: safeZone(timezone),
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).format(new Date(ms(iso)));
}
function formatLocalDate(localDate2, locale) {
  const [y3, m4, d3] = localDate2.split("-").map(Number);
  if (!y3 || !m4 || !d3) return localDate2;
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short"
  }).format(new Date(Date.UTC(y3, m4 - 1, d3)));
}

// ui/lib/device-mode.ts
var STRICT = "shared";
function deviceId() {
  try {
    return localStorage.getItem("erplora.device_id") ?? "";
  } catch {
    return "";
  }
}
function fromSdk() {
  try {
    const mode = globalThis.erplora?.deviceMode;
    return mode === "personal" || mode === "shared" ? mode : null;
  } catch {
    return null;
  }
}
async function readDeviceMode(fetchImpl = globalThis.fetch) {
  const sdkMode = fromSdk();
  if (sdkMode) return sdkMode;
  try {
    if (typeof fetchImpl !== "function") return STRICT;
    const res = await fetchImpl("/api/device/mode", { headers: { "X-Device-Id": deviceId() } });
    if (!res.ok) return STRICT;
    const body = await res.json();
    return body?.ok === true && body.data?.mode === "personal" ? "personal" : STRICT;
  } catch {
    return STRICT;
  }
}

// ui/lib/errors.ts
var DOMAIN_CODE = /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/;
function errorCode(err) {
  const code = err?.code;
  if (typeof code === "string" && code.trim()) return code.trim();
  const message = err instanceof Error ? err.message.trim() : "";
  return DOMAIN_CODE.test(message) ? message : null;
}
function catalogText(catalog, locale, code) {
  for (const lang of [locale, locale.split("-")[0], "en"]) {
    const errors = catalog[lang]?.errors;
    const text = errors?.[code];
    if (typeof text === "string" && text.trim()) return text;
  }
  return null;
}
function errorMessage(catalog, locale, err, fallback) {
  const code = errorCode(err);
  const own = code ? catalogText(catalog, locale, code) : null;
  if (own) return own;
  const arrived = err instanceof Error ? err.message.trim() : "";
  return arrived && arrived !== code ? arrived : fallback;
}

// schemas/settings_update.json
var settings_update_default = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "attendance.settings.update",
  description: "Time clock settings (one row per hub). The screen sends the full snapshot. A flag is `integer` + `enum: [0, 1]` on purpose (staff#24): the shell's generic form paints it as a toggle.",
  type: "object",
  additionalProperties: false,
  required: [
    "require_location",
    "geofence_radius_m",
    "auto_close_after_hours"
  ],
  properties: {
    require_location: {
      type: "integer",
      enum: [
        0,
        1
      ],
      default: 0,
      title: "Require location when clocking in from a personal device",
      description: "The counter POS (shared device) is never asked for a location."
    },
    geofence_radius_m: {
      type: "integer",
      enum: [
        50,
        100,
        250,
        500,
        1e3
      ],
      default: 100,
      title: "Allowed radius (metres)",
      description: "How far from the workplace a personal device may clock in."
    },
    workplace_lat: {
      type: [
        "number",
        "null"
      ],
      minimum: -90,
      maximum: 90,
      default: null,
      title: "Workplace latitude",
      description: "Leave empty until the workplace location is set."
    },
    workplace_lng: {
      type: [
        "number",
        "null"
      ],
      minimum: -180,
      maximum: 180,
      default: null,
      title: "Workplace longitude",
      description: "Leave empty until the workplace location is set."
    },
    auto_close_after_hours: {
      type: "integer",
      minimum: 1,
      maximum: 24,
      default: 12,
      title: "Flag open days for review after (hours)",
      description: "A working day still open after this many hours is marked for review."
    }
  }
};

// ui/lib/settings.ts
var P2 = settings_update_default.properties;
var RADIUS_OPTIONS = P2.geofence_radius_m.enum;
var AUTO_CLOSE_MIN = P2.auto_close_after_hours.minimum;
var AUTO_CLOSE_MAX = P2.auto_close_after_hours.maximum;
var DEFAULT_SETTINGS = Object.freeze({
  require_location: P2.require_location.default,
  geofence_radius_m: P2.geofence_radius_m.default,
  workplace_lat: P2.workplace_lat.default,
  workplace_lng: P2.workplace_lng.default,
  auto_close_after_hours: P2.auto_close_after_hours.default
});
function num(v3) {
  if (v3 === null || v3 === void 0 || typeof v3 === "string" && !v3.trim()) return null;
  const n6 = Number(v3);
  return Number.isFinite(n6) ? n6 : null;
}
function coordinate(v3, limit) {
  const n6 = num(v3);
  return n6 !== null && Math.abs(n6) <= limit ? n6 : null;
}
function settingsFrom(rows) {
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row || typeof row !== "object") return { ...DEFAULT_SETTINGS };
  const flag2 = num(row.require_location);
  const radius = num(row.geofence_radius_m);
  const hours = num(row.auto_close_after_hours);
  return {
    require_location: flag2 === 1 ? 1 : flag2 === 0 ? 0 : DEFAULT_SETTINGS.require_location,
    geofence_radius_m: radius !== null && RADIUS_OPTIONS.includes(radius) ? radius : DEFAULT_SETTINGS.geofence_radius_m,
    workplace_lat: coordinate(row.workplace_lat, P2.workplace_lat.maximum),
    workplace_lng: coordinate(row.workplace_lng, P2.workplace_lng.maximum),
    auto_close_after_hours: hours !== null && Number.isInteger(hours) && hours >= AUTO_CLOSE_MIN && hours <= AUTO_CLOSE_MAX ? hours : DEFAULT_SETTINGS.auto_close_after_hours
  };
}

// ui/components/erp-attendance-clock/erp-attendance-clock.ts
var CATALOG = { es: es_default, en: en_default };
function erplora() {
  const c5 = globalThis.erplora;
  if (!c5) throw new Error("erplora SDK not initialised by the shell");
  return c5;
}
var NOT_LOCATED = { lat: null, lng: null, accuracy_m: null, distance_m: null, within_radius: null };
var TODAY_WINDOW_MS = 48 * 3600 * 1e3;
var RECENT_DAYS = 10;
var GEO_KEYS = {
  denied: "ui.clock.locationDenied",
  unavailable: "ui.common.locationUnavailable",
  timeout: "ui.common.locationTimeout",
  unsupported: "ui.common.locationUnsupported"
};
var STATUS = {
  open: { key: "ui.common.statusOpen", color: "success" },
  closed: { key: "ui.common.statusClosed", color: "medium" },
  needs_review: { key: "ui.common.statusNeedsReview", color: "warning" }
};
function sessionName() {
  try {
    const raw = globalThis.localStorage?.getItem("erplora.session");
    const name = raw ? JSON.parse(raw)?.name : "";
    return typeof name === "string" ? name.trim() : "";
  } catch {
    return "";
  }
}
var rowsOf = (page) => Array.isArray(page) ? page : Array.isArray(page?.rows) ? page.rows : [];
var ErpAttendanceClock = class extends i3 {
  constructor() {
    super(...arguments);
    this.loading = true;
    this.loaded = false;
    this.loadError = "";
    this.reloadError = "";
    this.settings = { ...DEFAULT_SETTINGS };
    this.mode = "shared";
    this.open = null;
    this.recent = [];
    this.windowDays = [];
    this.windowBreaks = [];
    this.busy = "";
    this.notice = null;
    this.distance = null;
    this.now = Date.now();
  }
  static {
    this.styles = i`
    :host {
      display: block;
      padding: 16px;
      color: var(--ion-text-color, #1c1b18);
      box-sizing: border-box;
      /* The shell may host this screen next to a side menu or a split pane: the layout follows the
         width the component gets, not the viewport's. */
      container-type: inline-size;
    }
    .layout {
      display: grid;
      gap: 16px;
      grid-template-columns: minmax(0, 1fr);
      max-width: 1100px;
      margin: 0 auto;
    }
    @container (min-width: 760px) {
      .layout {
        grid-template-columns: minmax(320px, 5fr) minmax(0, 6fr);
        align-items: start;
      }
    }
    .card {
      background: var(--ion-card-background, var(--ion-background-color, #fff));
      border: 1px solid var(--ion-border-color, rgba(0, 0, 0, 0.12));
      border-radius: 16px;
      padding: 20px;
    }
    .clock {
      display: flex;
      flex-direction: column;
      gap: 12px;
      text-align: center;
    }
    header h2 {
      margin: 0;
      font-size: 1.25rem;
    }
    header p,
    .muted {
      margin: 4px 0 0;
      color: var(--ion-color-medium, #6b6b6b);
      font-size: 0.95rem;
    }
    .status {
      margin: 8px 0 0;
      font-weight: 600;
      font-size: 1.05rem;
    }
    .timer {
      font-size: clamp(2.25rem, 9cqi, 3.25rem);
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      line-height: 1.1;
    }
    .actions {
      display: grid;
      gap: 10px;
    }
    .actions ion-button {
      margin: 0;
      min-height: 56px;
      font-size: 1.05rem;
    }
    .actions ion-button.primary {
      min-height: 72px;
      font-size: 1.2rem;
    }
    .note {
      display: flex;
      gap: 6px;
      align-items: center;
      justify-content: center;
      margin: 0;
      font-size: 0.9rem;
      color: var(--ion-color-medium, #6b6b6b);
    }
    .msg {
      margin: 0;
      padding: 10px 12px;
      border-radius: 10px;
      font-weight: 600;
      text-align: left;
    }
    .msg.error {
      color: var(--ion-color-danger, #c5000f);
      background: color-mix(in srgb, var(--ion-color-danger, #c5000f) 10%, transparent);
    }
    .msg.success {
      color: var(--ion-color-success-shade, #1f7a3a);
      background: color-mix(in srgb, var(--ion-color-success, #2dd36f) 12%, transparent);
    }
    .msg.reload {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .msg.reload ion-button {
      margin: 0;
      flex: 0 0 auto;
    }
    .msg.info {
      color: var(--ion-color-medium-shade, #555);
      background: color-mix(in srgb, var(--ion-color-medium, #92949c) 12%, transparent);
    }
    .side {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    h3 {
      margin: 0 0 12px;
      font-size: 1.05rem;
    }
    .stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .stat {
      border-radius: 12px;
      padding: 12px;
      background: color-mix(in srgb, var(--ion-color-primary, #3880ff) 7%, transparent);
    }
    .stat .label {
      font-size: 0.85rem;
      color: var(--ion-color-medium, #6b6b6b);
    }
    .stat .value {
      font-size: 1.6rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }
    ion-list {
      padding: 0;
      background: transparent;
    }
    /* A narrow column truncates a row; it never wraps a date or a time letter by letter. */
    ion-item ion-label {
      min-width: 0;
    }
    .day-date,
    .day-times {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .day-date {
      margin: 0 0 2px;
      font-size: 1rem;
    }
    .day-times {
      font-variant-numeric: tabular-nums;
    }
    .day-end {
      display: flex;
      flex: 0 0 auto;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }
    .center {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 48px 16px;
      text-align: center;
    }
    .big-icon {
      font-size: 40px;
    }
    /* Tones by token: the color attribute never paints inside this shadow root (module-toolkit#273). */
    ion-button.tone-success {
      --background: var(--ion-color-success, #2dd36f);
      --background-activated: var(--ion-color-success-shade, #28ba62);
      --background-hover: var(--ion-color-success-tint, #42d77d);
      --color: var(--ion-color-success-contrast, #fff);
    }
    ion-button.tone-danger {
      --background: var(--ion-color-danger, #c5000f);
      --background-activated: var(--ion-color-danger-shade, #ad000d);
      --background-hover: var(--ion-color-danger-tint, #cb1a27);
      --color: var(--ion-color-danger-contrast, #fff);
    }
    ion-button.tone-primary {
      --background: var(--ion-color-primary, #3880ff);
      --background-activated: var(--ion-color-primary-shade, #3171e0);
      --background-hover: var(--ion-color-primary-tint, #4c8dff);
      --color: var(--ion-color-primary-contrast, #fff);
    }
    ion-badge {
      --padding-start: 8px;
      --padding-end: 8px;
    }
    ion-badge.tone-success {
      --background: color-mix(in srgb, var(--ion-color-success, #2dd36f) 18%, transparent);
      --color: var(--ion-color-success-shade, #1f7a3a);
    }
    ion-badge.tone-medium {
      --background: color-mix(in srgb, var(--ion-color-medium, #92949c) 18%, transparent);
      --color: var(--ion-color-medium-shade, #555);
    }
    ion-badge.tone-warning {
      --background: color-mix(in srgb, var(--ion-color-warning, #ffc409) 25%, transparent);
      --color: color-mix(in srgb, var(--ion-color-warning-shade, #e0ac08) 45%, var(--ion-text-color, #1c1b18));
    }
    .empty {
      margin: 0;
      padding: 16px 0;
      text-align: center;
      color: var(--ion-color-medium, #6b6b6b);
    }
  `;
  }
  t(key, params) {
    return erplora().t(CATALOG, key, params);
  }
  get locale() {
    return erplora().locale || "es";
  }
  get timezone() {
    return erplora().timezone || "UTC";
  }
  connectedCallback() {
    super.connectedCallback();
    this.ticker = setInterval(() => this.now = Date.now(), 1e3);
    void this.load();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.ticker) clearInterval(this.ticker);
    this.ticker = void 0;
  }
  /**
   * Everything the screen shows, in parallel. Only the FIRST load paints the spinner and only a
   * failed FIRST load takes the whole screen: once loaded, a failed reload (typically right after a
   * command that did go through) keeps the screen and its message and is told as a notice.
   */
  async load() {
    this.loading = true;
    this.loadError = "";
    const sdk = erplora();
    const since = new Date(Date.now() - TODAY_WINDOW_MS).toISOString();
    try {
      const [settingsRows, openRows, mode, recentPage, todayRows, breakRows] = await Promise.all([
        sdk.query("attendance.settings.get"),
        sdk.query("attendance.records.mine_open"),
        readDeviceMode(),
        sdk.queryPage("attendance.records.mine", {
          limit: RECENT_DAYS,
          offset: 0,
          sort: "clock_in_at",
          dir: "desc"
        }),
        sdk.queryAll("attendance.records.mine", {
          filters: { clock_in_at: { from: since } },
          sort: "clock_in_at",
          dir: "desc"
        }),
        sdk.queryAll("attendance.breaks.mine", { filters: { started_at: { from: since } } })
      ]);
      this.settings = settingsFrom(settingsRows);
      this.open = (Array.isArray(openRows) ? openRows[0] : null) ?? null;
      this.mode = mode;
      this.recent = rowsOf(recentPage).slice(0, RECENT_DAYS);
      this.windowDays = todayRows ?? [];
      this.windowBreaks = breakRows ?? [];
      this.now = Date.now();
      this.loaded = true;
      this.reloadError = "";
    } catch (e6) {
      const text = errorMessage(CATALOG, this.locale, e6, this.t("ui.common.loadError"));
      if (this.loaded) this.reloadError = text;
      else this.loadError = text;
    } finally {
      this.loading = false;
    }
  }
  get locationChecked() {
    return this.settings.require_location === 1 && this.mode === "personal";
  }
  get workplaceSet() {
    return this.settings.workplace_lat !== null && this.settings.workplace_lng !== null;
  }
  geoText(e6) {
    const code = e6 instanceof GeoError ? e6.code : "unavailable";
    return this.t(GEO_KEYS[code] ?? "ui.common.locationUnavailable");
  }
  /** The measured position against the workplace (distance null when the workplace is not set). */
  measure(pos) {
    const { workplace_lat: lat, workplace_lng: lng, geofence_radius_m: radius } = this.settings;
    if (lat === null || lng === null) {
      return { lat: pos.lat, lng: pos.lng, accuracy_m: pos.accuracy_m, distance_m: null, within_radius: null };
    }
    const distance = Math.round(haversineMeters({ lat, lng }, pos));
    return {
      lat: pos.lat,
      lng: pos.lng,
      accuracy_m: pos.accuracy_m,
      distance_m: distance,
      within_radius: withinRadius(distance, radius) ? 1 : 0
    };
  }
  async clockIn() {
    if (this.busy) return;
    this.busy = "in";
    this.notice = null;
    this.distance = null;
    try {
      this.mode = await readDeviceMode();
      let located = NOT_LOCATED;
      if (this.locationChecked) {
        if (!this.workplaceSet) {
          this.notice = { kind: "error", text: this.t("ui.clock.workplaceNotSet") };
          return;
        }
        this.notice = { kind: "info", text: this.t("ui.clock.locating") };
        let pos;
        try {
          pos = await getPosition();
        } catch (e6) {
          this.notice = { kind: "error", text: this.geoText(e6) };
          return;
        }
        located = this.measure(pos);
        this.distance = located.distance_m;
        if (located.within_radius !== 1) {
          this.notice = {
            kind: "error",
            text: this.t("ui.clock.outsideRadius", {
              distance: located.distance_m,
              radius: this.settings.geofence_radius_m
            })
          };
          return;
        }
      }
      await this.send(() => erplora().command("attendance.clock_in", { source: this.mode, ...located }), "ui.clock.clockedIn");
    } finally {
      this.busy = "";
    }
  }
  /** Clocking out NEVER blocks: the position is recorded when it can be read, and that is all. */
  async clockOut() {
    if (this.busy) return;
    this.busy = "out";
    this.notice = null;
    try {
      let located = NOT_LOCATED;
      if (this.locationChecked) {
        this.notice = { kind: "info", text: this.t("ui.clock.locating") };
        try {
          located = this.measure(await getPosition());
          this.distance = located.distance_m;
        } catch {
          located = NOT_LOCATED;
        }
      }
      await this.send(() => erplora().command("attendance.clock_out", { ...located }), "ui.clock.clockedOut");
    } finally {
      this.busy = "";
    }
  }
  async toggleBreak() {
    if (this.busy || !this.open) return;
    this.busy = "break";
    this.notice = null;
    try {
      if (this.open.open_break_id) {
        await this.send(() => erplora().command("attendance.break_end", {}), "ui.clock.breakEnded");
      } else {
        await this.send(() => erplora().command("attendance.break_start", {}), "ui.clock.breakStarted");
      }
    } finally {
      this.busy = "";
    }
  }
  /**
   * Run a command (a thunk, so each call site names its command literally — ADR-0127) and reload. A refusal is spoken in the module's words and ALSO reloads: the
   * typical refusal (`clock_in_rejected`, `no_open_record`…) means the screen was out of date —
   * the day was opened or closed from another device — and the reload shows the real state.
   */
  async send(run, doneKey) {
    try {
      await run();
      this.notice = {
        kind: "success",
        text: this.t(doneKey, { time: formatTime((/* @__PURE__ */ new Date()).toISOString(), this.timezone, this.locale) })
      };
    } catch (e6) {
      this.notice = { kind: "error", text: errorMessage(CATALOG, this.locale, e6, this.t("ui.common.unexpectedError")) };
    }
    await this.load();
  }
  breakMinutes(b3, nowIso) {
    return minutesBetween(b3.started_at, b3.ended_at ?? nowIso);
  }
  /**
   * Today's worked time (net of breaks) and breaks, live while a day or a break is running. «Today»
   * is the business-zone date of the ticking `now`, so it moves on at local midnight by itself.
   */
  todayTotals() {
    const nowIso = new Date(this.now).toISOString();
    const today = localDateOf(nowIso, this.timezone);
    let worked = 0;
    let breaks = 0;
    for (const day of this.windowDays) {
      if (day.local_date !== today) continue;
      const end = day.clock_out_at ?? (day.status === "open" ? nowIso : null);
      const own = this.windowBreaks.filter((b3) => b3.record_id === day.id).reduce((sum, b3) => sum + this.breakMinutes(b3, nowIso), 0);
      breaks += own;
      if (end) worked += Math.max(0, minutesBetween(day.clock_in_at, end) - own);
    }
    return { worked, breaks };
  }
  renderStatusBadge(status) {
    const s5 = STATUS[status] ?? STATUS.closed;
    return b2`<ion-badge class=${e5({ [`tone-${s5.color}`]: true })}>${this.t(s5.key)}</ion-badge>`;
  }
  renderDay(day) {
    const tz = this.timezone;
    const locale = this.locale;
    const inAt = formatTime(day.clock_in_at, tz, locale);
    const outAt = day.clock_out_at ? formatTime(day.clock_out_at, tz, locale) : day.status === "open" ? "\u2026" : this.t("ui.clock.noClockOut");
    const duration = day.clock_out_at ? formatHm(Math.max(0, minutesBetween(day.clock_in_at, day.clock_out_at) - Number(day.breaks_closed_minutes ?? 0))) : "";
    return b2`<ion-item lines="full">
      <ion-label>
        <h3 class="day-date">${formatLocalDate(day.local_date, locale)}</h3>
        <p class="day-times">${inAt} – ${outAt}</p>
      </ion-label>
      <div class="day-end" slot="end">
        ${duration ? b2`<span>${duration}</span>` : A} ${this.renderStatusBadge(day.status)}
      </div>
    </ion-item>`;
  }
  renderNotice() {
    if (!this.notice) return A;
    return b2`<p
      class="msg ${this.notice.kind}"
      role=${this.notice.kind === "error" ? "alert" : "status"}
      data-testid="attendance-clock-message"
    >${this.notice.text}</p>`;
  }
  renderReloadError() {
    if (!this.reloadError) return A;
    return b2`<div class="msg error reload" role="alert" data-testid="attendance-clock-reload-error">
      <span>${this.t("ui.clock.reloadFailed", { reason: this.reloadError })}</span>
      <ion-button size="small" fill="clear" data-testid="attendance-clock-reload-retry"
        ?disabled=${this.loading} @click=${() => this.load()}>
        <ion-icon slot="start" name="refresh-outline"></ion-icon>${this.t("ui.common.retry")}
      </ion-button>
    </div>`;
  }
  renderClock() {
    const tz = this.timezone;
    const locale = this.locale;
    const name = sessionName();
    const open = this.open;
    const onBreak = !!open?.open_break_id;
    const elapsed = open ? Math.max(0, Math.floor((this.now - Date.parse(open.clock_in_at)) / 1e3)) : 0;
    const busy = this.busy !== "";
    return b2`<section class="card clock">
      <header>
        <h2>${name ? this.t("ui.clock.greeting", { name }) : this.t("ui.clock.title")}</h2>
        <p>${this.t("ui.clock.now", { time: formatTime(new Date(this.now).toISOString(), tz, locale) })}</p>
      </header>
      ${open ? b2`<p class="status">
              ${onBreak ? this.t("ui.clock.statusOnBreak", { time: formatTime(open.open_break_started_at, tz, locale) }) : this.t("ui.clock.statusIn", { time: formatTime(open.clock_in_at, tz, locale) })}
            </p>
            <div>
              <div class="muted">${this.t("ui.clock.elapsed")}</div>
              <div class="timer" data-testid="attendance-clock-timer">${formatHms(elapsed)}</div>
            </div>
            <div class="actions">
              ${onBreak ? b2`<ion-button expand="block" class="tone-primary" data-testid="attendance-break-end"
                    ?disabled=${busy} @click=${() => this.toggleBreak()}>
                    <ion-icon slot="start" name="play-outline"></ion-icon>${this.t("ui.clock.breakEnd")}
                  </ion-button>` : b2`<ion-button expand="block" fill="outline" data-testid="attendance-break-start"
                    ?disabled=${busy} @click=${() => this.toggleBreak()}>
                    <ion-icon slot="start" name="cafe-outline"></ion-icon>${this.t("ui.clock.breakStart")}
                  </ion-button>`}
              <ion-button expand="block" class="primary tone-danger" data-testid="attendance-clock-out"
                ?disabled=${busy} @click=${() => this.clockOut()}>
                ${this.busy === "out" ? b2`<ion-spinner slot="start" name="crescent"></ion-spinner>` : b2`<ion-icon slot="start" name="log-out-outline"></ion-icon>`}
                ${this.t("ui.clock.clockOut")}
              </ion-button>
            </div>` : b2`<p class="status">${this.t("ui.clock.statusOut")}</p>
            <div class="actions">
              <ion-button expand="block" class="primary tone-success" data-testid="attendance-clock-in"
                ?disabled=${busy} @click=${() => this.clockIn()}>
                ${this.busy === "in" ? b2`<ion-spinner slot="start" name="crescent"></ion-spinner>` : b2`<ion-icon slot="start" name="log-in-outline"></ion-icon>`}
                ${this.t("ui.clock.clockIn")}
              </ion-button>
            </div>`}
      ${this.locationChecked ? b2`<p class="note">
            <ion-icon name="location-outline" aria-hidden="true"></ion-icon>${this.t("ui.clock.locationRequired")}
          </p>` : A}
      ${this.distance !== null ? b2`<p class="note" data-testid="attendance-clock-distance">
            ${this.t("ui.clock.distance", { distance: this.distance })}
          </p>` : A}
      ${this.renderNotice()} ${this.renderReloadError()}
    </section>`;
  }
  renderSide() {
    const { worked, breaks } = this.todayTotals();
    return b2`<div class="side">
      <section class="card">
        <h3>${this.t("ui.clock.today")}</h3>
        <div class="stats">
          <div class="stat" data-testid="attendance-clock-today-worked">
            <div class="label">${this.t("ui.clock.workedToday")}</div>
            <div class="value">${formatHm(worked)}</div>
          </div>
          <div class="stat" data-testid="attendance-clock-today-breaks">
            <div class="label">${this.t("ui.clock.breaksToday")}</div>
            <div class="value">${formatHm(breaks)}</div>
          </div>
        </div>
      </section>
      <section class="card">
        <h3>${this.t("ui.clock.recent")}</h3>
        ${this.recent.length ? b2`<ion-list data-testid="attendance-clock-recent">${this.recent.map((d3) => this.renderDay(d3))}</ion-list>` : b2`<p class="empty" data-testid="attendance-clock-empty">${this.t("ui.clock.empty")}</p>`}
      </section>
    </div>`;
  }
  render() {
    if (!this.loaded && this.loading) {
      return b2`<div class="center" data-testid="attendance-clock-loading">
        <ion-spinner name="crescent"></ion-spinner>
        <span class="muted">${this.t("ui.common.loading")}</span>
      </div>`;
    }
    if (this.loadError) {
      return b2`<div class="center" role="alert" data-testid="attendance-clock-error">
        <ion-icon class="big-icon" name="cloud-offline-outline" aria-hidden="true"></ion-icon>
        <p>${this.loadError}</p>
        <ion-button data-testid="attendance-clock-retry" ?disabled=${this.loading} @click=${() => this.load()}>
          <ion-icon slot="start" name="refresh-outline"></ion-icon>${this.t("ui.common.retry")}
        </ion-button>
      </div>`;
    }
    return b2`<div class="layout">${this.renderClock()} ${this.renderSide()}</div>`;
  }
};
__decorateClass([
  r5()
], ErpAttendanceClock.prototype, "loading", 2);
__decorateClass([
  r5()
], ErpAttendanceClock.prototype, "loaded", 2);
__decorateClass([
  r5()
], ErpAttendanceClock.prototype, "loadError", 2);
__decorateClass([
  r5()
], ErpAttendanceClock.prototype, "reloadError", 2);
__decorateClass([
  r5()
], ErpAttendanceClock.prototype, "settings", 2);
__decorateClass([
  r5()
], ErpAttendanceClock.prototype, "mode", 2);
__decorateClass([
  r5()
], ErpAttendanceClock.prototype, "open", 2);
__decorateClass([
  r5()
], ErpAttendanceClock.prototype, "recent", 2);
__decorateClass([
  r5()
], ErpAttendanceClock.prototype, "windowDays", 2);
__decorateClass([
  r5()
], ErpAttendanceClock.prototype, "windowBreaks", 2);
__decorateClass([
  r5()
], ErpAttendanceClock.prototype, "busy", 2);
__decorateClass([
  r5()
], ErpAttendanceClock.prototype, "notice", 2);
__decorateClass([
  r5()
], ErpAttendanceClock.prototype, "distance", 2);
__decorateClass([
  r5()
], ErpAttendanceClock.prototype, "now", 2);
define("erp-attendance-clock", ErpAttendanceClock);

// ui/components/erp-attendance-records/minutes.ts
var MINUTE = 6e4;
function dayEnd(record, now) {
  if (record.clock_out_at) return Date.parse(record.clock_out_at);
  return record.status === "open" ? now : null;
}
function breakMinutes(record, breaks, now) {
  const closed = Number(record.breaks_closed_minutes ?? 0) || 0;
  const end = dayEnd(record, now) ?? now;
  let running = 0;
  for (const b3 of breaks) {
    if (b3.record_id !== record.id || b3.ended_at) continue;
    running += Math.max(0, Math.floor((end - Date.parse(b3.started_at)) / MINUTE));
  }
  return closed + running;
}
function workedMinutes(record, breaks, now) {
  const end = dayEnd(record, now);
  if (end === null) return null;
  const gross = Math.floor((end - Date.parse(record.clock_in_at)) / MINUTE);
  return Math.max(0, gross - breakMinutes(record, breaks, now));
}
function formatHm2(minutes) {
  const m4 = Math.max(0, Math.floor(minutes));
  return `${Math.floor(m4 / 60)}:${String(m4 % 60).padStart(2, "0")}`;
}
function runningBreaksFrom(rows) {
  let earliest = Infinity;
  for (const r6 of rows) {
    if (r6.status !== "open") continue;
    const ms2 = Date.parse(r6.clock_in_at);
    if (Number.isFinite(ms2) && ms2 < earliest) earliest = ms2;
  }
  return Number.isFinite(earliest) ? new Date(earliest).toISOString().slice(0, 19) : null;
}

// ui/components/erp-attendance-records/zone.ts
var formatters = /* @__PURE__ */ new Map();
function formatter(timezone) {
  let f3 = formatters.get(timezone);
  if (!f3) {
    f3 = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    formatters.set(timezone, f3);
  }
  return f3;
}
function partsAt(ms2, timezone) {
  const out = {};
  for (const p4 of formatter(timezone).formatToParts(new Date(ms2))) {
    if (p4.type !== "literal") out[p4.type] = Number(p4.value);
  }
  return {
    year: out.year,
    month: out.month,
    day: out.day,
    hour: out.hour === 24 ? 0 : out.hour,
    minute: out.minute,
    second: out.second
  };
}
function offsetAt(ms2, timezone) {
  const p4 = partsAt(ms2, timezone);
  const asUtc = Date.UTC(p4.year, p4.month - 1, p4.day, p4.hour, p4.minute, p4.second);
  return asUtc - Math.floor(ms2 / 1e3) * 1e3;
}
function wallToInstant(year, month, day, hour, minute, timezone) {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const first = guess - offsetAt(guess, timezone);
  const second = guess - offsetAt(first, timezone);
  return second;
}
var pad = (n6, width = 2) => String(n6).padStart(width, "0");
function utcBound(ms2) {
  const d3 = new Date(ms2);
  return `${d3.getUTCFullYear()}-${pad(d3.getUTCMonth() + 1)}-${pad(d3.getUTCDate())}T${pad(d3.getUTCHours())}:${pad(
    d3.getUTCMinutes()
  )}:${pad(d3.getUTCSeconds())}`;
}
function monthRange(month, timezone) {
  const [y3, m4] = month.split("-").map(Number);
  const nextY = m4 === 12 ? y3 + 1 : y3;
  const nextM = m4 === 12 ? 1 : m4 + 1;
  return {
    from: utcBound(wallToInstant(y3, m4, 1, 0, 0, timezone)),
    to: utcBound(wallToInstant(nextY, nextM, 1, 0, 0, timezone))
  };
}
function monthOf(ms2, timezone) {
  const p4 = partsAt(ms2, timezone);
  return `${p4.year}-${pad(p4.month)}`;
}
function recentMonths(month, count) {
  const [y3, m4] = month.split("-").map(Number);
  const out = [];
  for (let i7 = 0; i7 < count; i7++) {
    const total = y3 * 12 + (m4 - 1) - i7;
    out.push(`${Math.floor(total / 12)}-${pad(total % 12 + 1)}`);
  }
  return out;
}
function localDate(iso, timezone) {
  const p4 = partsAt(Date.parse(iso), timezone);
  return `${p4.year}-${pad(p4.month)}-${pad(p4.day)}`;
}
function localTime(iso, timezone) {
  const p4 = partsAt(Date.parse(iso), timezone);
  return `${pad(p4.hour)}:${pad(p4.minute)}`;
}
function localDateTime(iso, timezone) {
  return `${localDate(iso, timezone)} ${localTime(iso, timezone)}`;
}
function toLocalInput(iso, timezone) {
  return `${localDate(iso, timezone)}T${localTime(iso, timezone)}`;
}
var LOCAL_INPUT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/;
function fromLocalInput(value, timezone) {
  const m4 = LOCAL_INPUT.exec(String(value ?? "").trim());
  if (!m4) return null;
  const [, y3, mo, d3, h4, mi] = m4.map(Number);
  const ms2 = wallToInstant(y3, mo, d3, h4, mi, timezone);
  return Number.isFinite(ms2) ? new Date(ms2).toISOString() : null;
}

// ui/components/erp-attendance-records/csv.ts
var CSV_HEADER = "date,user,clock_in,clock_out,break_minutes,worked_minutes,status,within_radius_in,within_radius_out";
function cell(value) {
  let s5 = value === null || value === void 0 ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s5)) s5 = `'${s5}`;
  return /[",\r\n]/.test(s5) || s5 !== s5.trim() ? `"${s5.replace(/"/g, '""')}"` : s5;
}
var flag = (v3) => v3 === null || v3 === void 0 ? "" : String(Number(v3));
function toCsv(rows, users, opts) {
  const lines = [CSV_HEADER];
  for (const r6 of rows) {
    const worked = workedMinutes(r6, opts.breaks, opts.now);
    lines.push(
      [
        cell(r6.local_date),
        cell(users.get(r6.user_id) || r6.user_id),
        cell(localDateTime(r6.clock_in_at, opts.timezone)),
        cell(r6.clock_out_at ? localDateTime(r6.clock_out_at, opts.timezone) : ""),
        cell(breakMinutes(r6, opts.breaks, opts.now)),
        cell(worked === null ? "" : worked),
        cell(r6.status),
        flag(r6.in_within_radius),
        flag(r6.out_within_radius)
      ].join(",")
    );
  }
  return `${lines.join("\r\n")}\r
`;
}
function csvFileName(month) {
  return `attendance-${month}.csv`;
}

// lit-html/directive-helpers.js
var { I: t4 } = j;
var i5 = (o7) => o7;
var s4 = () => document.createComment("");
var v2 = (o7, n6, e6) => {
  const l3 = o7._$AA.parentNode, d3 = void 0 === n6 ? o7._$AB : n6._$AA;
  if (void 0 === e6) {
    const i7 = l3.insertBefore(s4(), d3), n7 = l3.insertBefore(s4(), d3);
    e6 = new t4(i7, n7, o7, o7.options);
  } else {
    const t5 = e6._$AB.nextSibling, n7 = e6._$AM, c5 = n7 !== o7;
    if (c5) {
      let t6;
      e6._$AQ?.(o7), e6._$AM = o7, void 0 !== e6._$AP && (t6 = o7._$AU) !== n7._$AU && e6._$AP(t6);
    }
    if (t5 !== d3 || c5) {
      let o8 = e6._$AA;
      for (; o8 !== t5; ) {
        const t6 = i5(o8).nextSibling;
        i5(l3).insertBefore(o8, d3), o8 = t6;
      }
    }
  }
  return e6;
};
var u3 = (o7, t5, i7 = o7) => (o7._$AI(t5, i7), o7);
var m3 = {};
var p3 = (o7, t5 = m3) => o7._$AH = t5;
var M2 = (o7) => o7._$AH;
var h3 = (o7) => {
  o7._$AR(), o7._$AA.remove();
};

// lit-html/directives/repeat.js
var u4 = (e6, s5, t5) => {
  const r6 = /* @__PURE__ */ new Map();
  for (let l3 = s5; l3 <= t5; l3++) r6.set(e6[l3], l3);
  return r6;
};
var c4 = e4(class extends i4 {
  constructor(e6) {
    if (super(e6), e6.type !== t3.CHILD) throw Error("repeat() can only be used in text expressions");
  }
  dt(e6, s5, t5) {
    let r6;
    void 0 === t5 ? t5 = s5 : void 0 !== s5 && (r6 = s5);
    const l3 = [], o7 = [];
    let i7 = 0;
    for (const s6 of e6) l3[i7] = r6 ? r6(s6, i7) : i7, o7[i7] = t5(s6, i7), i7++;
    return { values: o7, keys: l3 };
  }
  render(e6, s5, t5) {
    return this.dt(e6, s5, t5).values;
  }
  update(s5, [t5, r6, c5]) {
    const d3 = M2(s5), { values: p4, keys: a3 } = this.dt(t5, r6, c5);
    if (!Array.isArray(d3)) return this.ut = a3, p4;
    const h4 = this.ut ??= [], v3 = [];
    let m4, y3, x2 = 0, j2 = d3.length - 1, k2 = 0, w2 = p4.length - 1;
    for (; x2 <= j2 && k2 <= w2; ) if (null === d3[x2]) x2++;
    else if (null === d3[j2]) j2--;
    else if (h4[x2] === a3[k2]) v3[k2] = u3(d3[x2], p4[k2]), x2++, k2++;
    else if (h4[j2] === a3[w2]) v3[w2] = u3(d3[j2], p4[w2]), j2--, w2--;
    else if (h4[x2] === a3[w2]) v3[w2] = u3(d3[x2], p4[w2]), v2(s5, v3[w2 + 1], d3[x2]), x2++, w2--;
    else if (h4[j2] === a3[k2]) v3[k2] = u3(d3[j2], p4[k2]), v2(s5, d3[x2], d3[j2]), j2--, k2++;
    else if (void 0 === m4 && (m4 = u4(a3, k2, w2), y3 = u4(h4, x2, j2)), m4.has(h4[x2])) if (m4.has(h4[j2])) {
      const e6 = y3.get(a3[k2]), t6 = void 0 !== e6 ? d3[e6] : null;
      if (null === t6) {
        const e7 = v2(s5, d3[x2]);
        u3(e7, p4[k2]), v3[k2] = e7;
      } else v3[k2] = u3(t6, p4[k2]), v2(s5, d3[x2], t6), d3[e6] = null;
      k2++;
    } else h3(d3[j2]), j2--;
    else h3(d3[x2]), x2++;
    for (; k2 <= w2; ) {
      const e6 = v2(s5, v3[w2 + 1]);
      u3(e6, p4[k2]), v3[k2++] = e6;
    }
    for (; x2 <= j2; ) {
      const e6 = d3[x2++];
      null !== e6 && h3(e6);
    }
    return this.ut = a3, p3(s5, v3), E;
  }
});

// lit-html/directives/style-map.js
var n5 = "important";
var i6 = " !" + n5;
var o6 = e4(class extends i4 {
  constructor(t5) {
    if (super(t5), t5.type !== t3.ATTRIBUTE || "style" !== t5.name || t5.strings?.length > 2) throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
  }
  render(t5) {
    return Object.keys(t5).reduce((e6, r6) => {
      const s5 = t5[r6];
      return null == s5 ? e6 : e6 + `${r6 = r6.includes("-") ? r6 : r6.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${s5};`;
    }, "");
  }
  update(e6, [r6]) {
    const { style: s5 } = e6.element;
    if (void 0 === this.ft) return this.ft = new Set(Object.keys(r6)), this.render(r6);
    for (const t5 of this.ft) null == r6[t5] && (this.ft.delete(t5), t5.includes("-") ? s5.removeProperty(t5) : s5[t5] = null);
    for (const t5 in r6) {
      const e7 = r6[t5];
      if (null != e7) {
        this.ft.add(t5);
        const r7 = "string" == typeof e7 && e7.endsWith(i6);
        t5.includes("-") || r7 ? s5.setProperty(t5, r7 ? e7.slice(0, -11) : e7, r7 ? n5 : "") : s5[t5] = e7;
      }
    }
    return E;
  }
});

// @erplora/outfitkit/dist/shared/icons.js
var rawAdd = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M256 112v288m144-144H112"/></svg>';
var rawAlertCircle = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="currentColor" d="M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208s208-93.31 208-208S370.69 48 256 48m0 319.91a20 20 0 1 1 20-20a20 20 0 0 1-20 20m21.72-201.15l-5.74 122a16 16 0 0 1-32 0l-5.74-121.94v-.05a21.74 21.74 0 1 1 43.44 0Z"/></svg>';
var rawAlertCircleOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192s192-86 192-192Z"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M250.26 166.05L256 288l5.73-121.95a5.74 5.74 0 0 0-5.79-6h0a5.74 5.74 0 0 0-5.68 6"/><path fill="currentColor" d="M256 367.91a20 20 0 1 1 20-20a20 20 0 0 1-20 20"/></svg>';
var rawAppsOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><rect width="80" height="80" x="64" y="64" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" rx="40" ry="40"/><rect width="80" height="80" x="216" y="64" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" rx="40" ry="40"/><rect width="80" height="80" x="368" y="64" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" rx="40" ry="40"/><rect width="80" height="80" x="64" y="216" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" rx="40" ry="40"/><rect width="80" height="80" x="216" y="216" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" rx="40" ry="40"/><rect width="80" height="80" x="368" y="216" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" rx="40" ry="40"/><rect width="80" height="80" x="64" y="368" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" rx="40" ry="40"/><rect width="80" height="80" x="216" y="368" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" rx="40" ry="40"/><rect width="80" height="80" x="368" y="368" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" rx="40" ry="40"/></svg>';
var rawArchiveOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M80 152v256a40.12 40.12 0 0 0 40 40h272a40.12 40.12 0 0 0 40-40V152"/><rect width="416" height="80" x="48" y="64" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="32" rx="28" ry="28"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="m320 304l-64 64l-64-64m64 41.89V224"/></svg>';
var rawArrowRedoOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="32" d="M448 256L272 88v96C103.57 184 64 304.77 64 424c48.61-62.24 91.6-96 208-96v96Z"/></svg>';
var rawArrowUndoOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="32" d="M240 424v-96c116.4 0 159.39 33.76 208 96c0-119.23-39.57-240-208-240V88L64 256Z"/></svg>';
var rawBackspaceOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="32" d="M135.19 390.14a28.8 28.8 0 0 0 21.68 9.86h246.26A29 29 0 0 0 432 371.13V140.87A29 29 0 0 0 403.13 112H156.87a28.84 28.84 0 0 0-21.67 9.84L46.33 256l88.86 134.11Z"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M336.67 192.33L206.66 322.34m130.01 0L206.66 192.33m130.01 0L206.66 322.34m130.01 0L206.66 192.33"/></svg>';
var rawCalendarOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><rect width="416" height="384" x="48" y="80" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="32" rx="48"/><circle cx="296" cy="232" r="24" fill="currentColor"/><circle cx="376" cy="232" r="24" fill="currentColor"/><circle cx="296" cy="312" r="24" fill="currentColor"/><circle cx="376" cy="312" r="24" fill="currentColor"/><circle cx="136" cy="312" r="24" fill="currentColor"/><circle cx="216" cy="312" r="24" fill="currentColor"/><circle cx="136" cy="392" r="24" fill="currentColor"/><circle cx="216" cy="392" r="24" fill="currentColor"/><circle cx="296" cy="392" r="24" fill="currentColor"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M128 48v32m256-32v32"/><path fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="32" d="M464 160H48"/></svg>';
var rawCheckmarkCircle = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="currentColor" d="M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208s208-93.31 208-208S370.69 48 256 48m108.25 138.29l-134.4 160a16 16 0 0 1-12 5.71h-.27a16 16 0 0 1-11.89-5.3l-57.6-64a16 16 0 1 1 23.78-21.4l45.29 50.32l122.59-145.91a16 16 0 0 1 24.5 20.58"/></svg>';
var rawCheckmarkOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M416 128L192 384l-96-96"/></svg>';
var rawChevronBack = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M328 112L184 256l144 144"/></svg>';
var rawChevronBackOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M328 112L184 256l144 144"/></svg>';
var rawChevronDownOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="m112 184l144 144l144-144"/></svg>';
var rawChevronForward = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="m184 112l144 144l-144 144"/></svg>';
var rawChevronForwardOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="m184 112l144 144l-144 144"/></svg>';
var rawChevronUpOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="m112 328l144-144l144 144"/></svg>';
var rawClose = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="currentColor" d="m289.94 256l95-95A24 24 0 0 0 351 127l-95 95l-95-95a24 24 0 0 0-34 34l95 95l-95 95a24 24 0 1 0 34 34l95-95l95 95a24 24 0 0 0 34-34Z"/></svg>';
var rawCloseOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M368 368L144 144m224 0L144 368"/></svg>';
var rawCloudUploadOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M320 367.79h76c55 0 100-29.21 100-83.6s-53-81.47-96-83.6c-8.89-85.06-71-136.8-144-136.8c-69 0-113.44 45.79-128 91.2c-60 5.7-112 43.88-112 106.4s54 106.4 120 106.4h56"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="m320 255.79l-64-64l-64 64m64 192.42V207.79"/></svg>';
var rawCreateOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M384 224v184a40 40 0 0 1-40 40H104a40 40 0 0 1-40-40V168a40 40 0 0 1 40-40h167.48"/><path fill="currentColor" d="M459.94 53.25a16.06 16.06 0 0 0-23.22-.56L424.35 65a8 8 0 0 0 0 11.31l11.34 11.32a8 8 0 0 0 11.34 0l12.06-12c6.1-6.09 6.67-16.01.85-22.38M399.34 90L218.82 270.2a9 9 0 0 0-2.31 3.93L208.16 299a3.91 3.91 0 0 0 4.86 4.86l24.85-8.35a9 9 0 0 0 3.93-2.31L422 112.66a9 9 0 0 0 0-12.66l-9.95-10a9 9 0 0 0-12.71 0"/></svg>';
var rawContractOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M304 416V304h112m-101.8 10.23L432 432M208 96v112H96m101.8-10.23L80 80m336 128H304V96m10.23 101.8L432 80M96 304h112v112m-10.23-101.8L80 432"/></svg>';
var rawDocumentAttachOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M208 64h66.75a32 32 0 0 1 22.62 9.37l141.26 141.26a32 32 0 0 1 9.37 22.62V432a48 48 0 0 1-48 48H192a48 48 0 0 1-48-48V304"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M288 72v120a32 32 0 0 0 32 32h120"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M160 80v152a23.69 23.69 0 0 1-24 24c-12 0-24-9.1-24-24V88c0-30.59 16.57-56 48-56s48 24.8 48 55.38v138.75c0 43-27.82 77.87-72 77.87s-72-34.86-72-77.87V144"/></svg>';
var rawDocumentOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="32" d="M416 221.25V416a48 48 0 0 1-48 48H144a48 48 0 0 1-48-48V96a48 48 0 0 1 48-48h98.75a32 32 0 0 1 22.62 9.37l141.26 141.26a32 32 0 0 1 9.37 22.62Z"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M256 56v120a32 32 0 0 0 32 32h120"/></svg>';
var rawDocumentTextOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="32" d="M416 221.25V416a48 48 0 0 1-48 48H144a48 48 0 0 1-48-48V96a48 48 0 0 1 48-48h98.75a32 32 0 0 1 22.62 9.37l141.26 141.26a32 32 0 0 1 9.37 22.62Z"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M256 56v120a32 32 0 0 0 32 32h120m-232 80h160m-160 80h160"/></svg>';
var rawDownloadOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M336 176h40a40 40 0 0 1 40 40v208a40 40 0 0 1-40 40H136a40 40 0 0 1-40-40V216a40 40 0 0 1 40-40h40"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="m176 272l80 80l80-80M256 48v288"/></svg>';
var rawEllipsisVertical = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><circle cx="256" cy="256" r="48" fill="currentColor"/><circle cx="256" cy="416" r="48" fill="currentColor"/><circle cx="256" cy="96" r="48" fill="currentColor"/></svg>';
var rawExpandOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M432 320v112H320m101.8-10.23L304 304M80 192V80h112M90.2 90.23L208 208M320 80h112v112M421.77 90.2L304 208M192 432H80V320m10.23 101.8L208 304"/></svg>';
var rawFileTrayOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="32" d="M384 80H128c-26 0-43 14-48 40L48 272v112a48.14 48.14 0 0 0 48 48h320a48.14 48.14 0 0 0 48-48V272l-32-152c-5-27-23-40-48-40Z"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M48 272h144m128 0h144m-272 0a64 64 0 0 0 128 0"/></svg>';
var rawFolderOpenOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M64 192v-72a40 40 0 0 1 40-40h75.89a40 40 0 0 1 22.19 6.72l27.84 18.56a40 40 0 0 0 22.19 6.72H408a40 40 0 0 1 40 40v40"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M479.9 226.55L463.68 392a40 40 0 0 1-39.93 40H88.25a40 40 0 0 1-39.93-40L32.1 226.55A32 32 0 0 1 64 192h384.1a32 32 0 0 1 31.8 34.55"/></svg>';
var rawInformationCircle = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="currentColor" d="M256 56C145.72 56 56 145.72 56 256s89.72 200 200 200s200-89.72 200-200S366.28 56 256 56m0 82a26 26 0 1 1-26 26a26 26 0 0 1 26-26m48 226h-88a16 16 0 0 1 0-32h28v-88h-16a16 16 0 0 1 0-32h32a16 16 0 0 1 16 16v104h28a16 16 0 0 1 0 32"/></svg>';
var rawMenuOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M80 160h352M80 256h352M80 352h352"/></svg>';
var rawNotificationsOffOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M128.51 204.59q-.37 6.15-.37 12.76C128.14 304 110 320 84.33 351.43C73.69 364.45 83 384 101.62 384H320m94.5-48.7c-18.48-23.45-30.62-47.05-30.62-118c0-79.3-40.52-107.57-73.88-121.3c-4.43-1.82-8.6-6-9.95-10.55C294.21 65.54 277.82 48 256 48s-38.2 17.55-44 37.47c-1.35 4.6-5.52 8.71-10 10.53a150 150 0 0 0-18 8.79M320 384v16a64 64 0 0 1-128 0v-16"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M448 448L64 64"/></svg>';
var rawOpenOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M384 224v184a40 40 0 0 1-40 40H104a40 40 0 0 1-40-40V168a40 40 0 0 1 40-40h167.48M336 64h112v112M224 288L440 72"/></svg>';
var rawPlayOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" d="M112 111v290c0 17.44 17 28.52 31 20.16l247.9-148.37c12.12-7.25 12.12-26.33 0-33.58L143 90.84c-14-8.36-31 2.72-31 20.16Z"/></svg>';
var rawRemove = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M400 256H112"/></svg>';
var rawSearchOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" d="M221.09 64a157.09 157.09 0 1 0 157.09 157.09A157.1 157.1 0 0 0 221.09 64Z"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M338.29 338.29L448 448"/></svg>';
var rawSend = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="currentColor" d="m476.59 227.05l-.16-.07L49.35 49.84A23.56 23.56 0 0 0 27.14 52A24.65 24.65 0 0 0 16 72.59v113.29a24 24 0 0 0 19.52 23.57l232.93 43.07a4 4 0 0 1 0 7.86L35.53 303.45A24 24 0 0 0 16 327v113.31A23.57 23.57 0 0 0 26.59 460a23.94 23.94 0 0 0 13.22 4a24.55 24.55 0 0 0 9.52-1.93L476.4 285.94l.19-.09a32 32 0 0 0 0-58.8"/></svg>';
var rawSwapVerticalOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M464 208L352 96L240 208m112-94.87V416M48 304l112 112l112-112m-112 94V96"/></svg>';
var rawTrashOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="m112 112l20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320"/><path fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M80 112h352"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M192 112V72h0a23.93 23.93 0 0 1 24-24h80a23.93 23.93 0 0 1 24 24h0v40m-64 64v224m-72-224l8 224m136-224l-8 224"/></svg>';
var rawTrendingDown = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M352 368h112V256"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="m48 144l121.37 121.37a32 32 0 0 0 45.26 0l50.74-50.74a32 32 0 0 1 45.26 0L448 352"/></svg>';
var rawTrendingUp = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M352 144h112v112"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="m48 368l121.37-121.37a32 32 0 0 1 45.26 0l50.74 50.74a32 32 0 0 0 45.26 0L448 160"/></svg>';
var rawVolumeHighOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M126 192H56a8 8 0 0 0-8 8v112a8 8 0 0 0 8 8h69.65a15.93 15.93 0 0 1 10.14 3.54l91.47 74.89A8 8 0 0 0 240 392V120a8 8 0 0 0-12.74-6.43l-91.47 74.89A15 15 0 0 1 126 192m194 128c9.74-19.38 16-40.84 16-64c0-23.48-6-44.42-16-64m48 176c19.48-33.92 32-64.06 32-112s-12-77.74-32-112m48 272c30-46 48-91.43 48-160s-18-113-48-160"/></svg>';
var rawVolumeLowOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M189.65 192H120a8 8 0 0 0-8 8v112a8 8 0 0 0 8 8h69.65a16 16 0 0 1 10.14 3.63l91.47 75a8 8 0 0 0 12.74-6.46V119.83a8 8 0 0 0-12.74-6.44l-91.47 75a16 16 0 0 1-10.14 3.61M384 320c9.74-19.41 16-40.81 16-64c0-23.51-6-44.4-16-64"/></svg>';
var rawVolumeMuteOutline = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M416 432L64 80"/><path fill="currentColor" d="M224 136.92v33.8a4 4 0 0 0 1.17 2.82l24 24a4 4 0 0 0 6.83-2.82v-74.15a24.53 24.53 0 0 0-12.67-21.72a23.91 23.91 0 0 0-25.55 1.83a8 8 0 0 0-.66.51l-31.94 26.15a4 4 0 0 0-.29 5.92l17.05 17.06a4 4 0 0 0 5.37.26Zm0 238.16l-78.07-63.92a32 32 0 0 0-20.28-7.16H64v-96h50.72a4 4 0 0 0 2.82-6.83l-24-24a4 4 0 0 0-2.82-1.17H56a24 24 0 0 0-24 24v112a24 24 0 0 0 24 24h69.76l91.36 74.8a8 8 0 0 0 .66.51a23.93 23.93 0 0 0 25.85 1.69A24.49 24.49 0 0 0 256 391.45v-50.17a4 4 0 0 0-1.17-2.82l-24-24a4 4 0 0 0-6.83 2.82ZM352 256c0-24.56-5.81-47.88-17.75-71.27a16 16 0 0 0-28.5 14.54C315.34 218.06 320 236.62 320 256q0 4-.31 8.13a8 8 0 0 0 2.32 6.25l19.66 19.67a4 4 0 0 0 6.75-2A147 147 0 0 0 352 256m64 0c0-51.19-13.08-83.89-34.18-120.06a16 16 0 0 0-27.64 16.12C373.07 184.44 384 211.83 384 256c0 23.83-3.29 42.88-9.37 60.65a8 8 0 0 0 1.9 8.26l16.77 16.76a4 4 0 0 0 6.52-1.27C410.09 315.88 416 289.91 416 256"/><path fill="currentColor" d="M480 256c0-74.26-20.19-121.11-50.51-168.61a16 16 0 1 0-27 17.22C429.82 147.38 448 189.5 448 256c0 47.45-8.9 82.12-23.59 113a4 4 0 0 0 .77 4.55L443 391.39a4 4 0 0 0 6.4-1C470.88 348.22 480 307 480 256"/></svg>';
var rawWarning = '<svg viewBox="0 0 512 512" width="1.2em" height="1.2em" ><path fill="currentColor" d="M449.07 399.08L278.64 82.58c-12.08-22.44-44.26-22.44-56.35 0L51.87 399.08A32 32 0 0 0 80 446.25h340.89a32 32 0 0 0 28.18-47.17m-198.6-1.83a20 20 0 1 1 20-20a20 20 0 0 1-20 20m21.72-201.15l-5.74 122a16 16 0 0 1-32 0l-5.74-121.95a21.73 21.73 0 0 1 21.5-22.69h.21a21.74 21.74 0 0 1 21.73 22.7Z"/></svg>';
function bake(svg) {
  return `data:image/svg+xml;utf8,${svg}`;
}
var iconAdd = bake(rawAdd);
var iconAlertCircle = bake(rawAlertCircle);
var iconAlertCircleOutline = bake(rawAlertCircleOutline);
var iconAppsOutline = bake(rawAppsOutline);
var iconArchiveOutline = bake(rawArchiveOutline);
var iconArrowRedoOutline = bake(rawArrowRedoOutline);
var iconArrowUndoOutline = bake(rawArrowUndoOutline);
var iconBackspaceOutline = bake(rawBackspaceOutline);
var iconCalendarOutline = bake(rawCalendarOutline);
var iconCheckmarkCircle = bake(rawCheckmarkCircle);
var iconCheckmarkOutline = bake(rawCheckmarkOutline);
var iconChevronBack = bake(rawChevronBack);
var iconChevronBackOutline = bake(rawChevronBackOutline);
var iconChevronDownOutline = bake(rawChevronDownOutline);
var iconChevronForward = bake(rawChevronForward);
var iconChevronForwardOutline = bake(rawChevronForwardOutline);
var iconChevronUpOutline = bake(rawChevronUpOutline);
var iconClose = bake(rawClose);
var iconCloseOutline = bake(rawCloseOutline);
var iconCloudUploadOutline = bake(rawCloudUploadOutline);
var iconCreateOutline = bake(rawCreateOutline);
var iconDocumentAttachOutline = bake(rawDocumentAttachOutline);
var iconContractOutline = bake(rawContractOutline);
var iconDocumentOutline = bake(rawDocumentOutline);
var iconDocumentTextOutline = bake(rawDocumentTextOutline);
var iconDownloadOutline = bake(rawDownloadOutline);
var iconEllipsisVertical = bake(rawEllipsisVertical);
var iconExpandOutline = bake(rawExpandOutline);
var iconFileTrayOutline = bake(rawFileTrayOutline);
var iconFolderOpenOutline = bake(rawFolderOpenOutline);
var iconInformationCircle = bake(rawInformationCircle);
var iconMenuOutline = bake(rawMenuOutline);
var iconNotificationsOffOutline = bake(rawNotificationsOffOutline);
var iconOpenOutline = bake(rawOpenOutline);
var iconPlayOutline = bake(rawPlayOutline);
var iconRemove = bake(rawRemove);
var iconSearchOutline = bake(rawSearchOutline);
var iconSend = bake(rawSend);
var iconSwapVerticalOutline = bake(rawSwapVerticalOutline);
var iconTrashOutline = bake(rawTrashOutline);
var iconTrendingDown = bake(rawTrendingDown);
var iconTrendingUp = bake(rawTrendingUp);
var iconVolumeHighOutline = bake(rawVolumeHighOutline);
var iconVolumeLowOutline = bake(rawVolumeLowOutline);
var iconVolumeMuteOutline = bake(rawVolumeMuteOutline);
var iconWarning = bake(rawWarning);
var BY_NAME = {
  "add": iconAdd,
  "alert-circle": iconAlertCircle,
  "alert-circle-outline": iconAlertCircleOutline,
  "apps-outline": iconAppsOutline,
  "archive-outline": iconArchiveOutline,
  "arrow-redo-outline": iconArrowRedoOutline,
  "arrow-undo-outline": iconArrowUndoOutline,
  "backspace-outline": iconBackspaceOutline,
  "calendar-outline": iconCalendarOutline,
  "checkmark-circle": iconCheckmarkCircle,
  "checkmark-outline": iconCheckmarkOutline,
  "chevron-back": iconChevronBack,
  "chevron-back-outline": iconChevronBackOutline,
  "chevron-down-outline": iconChevronDownOutline,
  "chevron-forward": iconChevronForward,
  "chevron-forward-outline": iconChevronForwardOutline,
  "chevron-up-outline": iconChevronUpOutline,
  "close": iconClose,
  "close-outline": iconCloseOutline,
  "cloud-upload-outline": iconCloudUploadOutline,
  "create-outline": iconCreateOutline,
  "document-attach-outline": iconDocumentAttachOutline,
  "contract-outline": iconContractOutline,
  "document-outline": iconDocumentOutline,
  "document-text-outline": iconDocumentTextOutline,
  "download-outline": iconDownloadOutline,
  "ellipsis-vertical": iconEllipsisVertical,
  "expand-outline": iconExpandOutline,
  "file-tray-outline": iconFileTrayOutline,
  "folder-open-outline": iconFolderOpenOutline,
  "information-circle": iconInformationCircle,
  "menu-outline": iconMenuOutline,
  "notifications-off-outline": iconNotificationsOffOutline,
  "open-outline": iconOpenOutline,
  "play-outline": iconPlayOutline,
  "remove": iconRemove,
  "search-outline": iconSearchOutline,
  "send": iconSend,
  "swap-vertical-outline": iconSwapVerticalOutline,
  "trash-outline": iconTrashOutline,
  "trending-down": iconTrendingDown,
  "trending-up": iconTrendingUp,
  "volume-high-outline": iconVolumeHighOutline,
  "volume-low-outline": iconVolumeLowOutline,
  "volume-mute-outline": iconVolumeMuteOutline,
  "warning": iconWarning
};
function okIcon(value) {
  if (!value) return void 0;
  const trimmed = value.trimStart();
  if (trimmed.startsWith("<svg")) return bake(trimmed);
  return BY_NAME[value] ?? value;
}

// @erplora/outfitkit/dist/ok-data-table.js
var CSV_BOM = "\uFEFF";
var WINDOWS_1252_C1 = [
  8364,
  129,
  8218,
  402,
  8222,
  8230,
  8224,
  8225,
  710,
  8240,
  352,
  8249,
  338,
  141,
  381,
  143,
  144,
  8216,
  8217,
  8220,
  8221,
  8226,
  8211,
  8212,
  732,
  8482,
  353,
  8250,
  339,
  157,
  382,
  376
];
function decodeWindows1252(bytes) {
  let text = "";
  for (const byte of bytes) {
    text += String.fromCharCode(byte >= 128 && byte <= 159 ? WINDOWS_1252_C1[byte - 128] : byte);
  }
  return text;
}
function decodeCsvBuffer(buf) {
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    text = decodeWindows1252(new Uint8Array(buf));
  }
  return text.charCodeAt(0) === 65279 ? text.slice(1) : text;
}
var __defProp2 = Object.defineProperty;
var __decorateClass2 = (decorators, target, key, kind) => {
  var result = void 0;
  for (var i7 = decorators.length - 1, decorator; i7 >= 0; i7--)
    if (decorator = decorators[i7])
      result = decorator(target, key, result) || result;
  if (result) __defProp2(target, key, result);
  return result;
};
function decideRowActionsFit(input) {
  const { containerWidth, contentWidth, collapsed, decidedAtWidth } = input;
  if (!(containerWidth > 0)) return { collapsed, decidedAtWidth };
  if (containerWidth !== decidedAtWidth) {
    if (collapsed) return { collapsed: false, decidedAtWidth: containerWidth };
    return { collapsed: contentWidth > containerWidth, decidedAtWidth: containerWidth };
  }
  if (!collapsed && contentWidth > containerWidth) return { collapsed: true, decidedAtWidth };
  return { collapsed, decidedAtWidth };
}
var DEFAULT_LABELS = {
  search: "Search\u2026",
  empty: "No results",
  filters: "Filters",
  clear: "Clear",
  apply: "Apply",
  selected: "{n} selected",
  importCsv: "Import CSV",
  exportCsv: "Export CSV",
  add: "Add",
  moreActions: "More actions",
  rowsPerPage: "Rows per page",
  perPageShort: "{n} / page",
  viewList: "View as list",
  viewCards: "View as cards",
  columnsVisible: "Visible columns",
  columns: "Columns",
  actions: "Actions",
  close: "Close",
  newRecord: "New",
  form: "Form",
  filterPlaceholder: "Filter\u2026",
  from: "From",
  to: "To",
  fromOf: "{label} from",
  toOf: "{label} to",
  gte: "\u2265",
  lte: "\u2264",
  noValues: "No values",
  selectAll: "Select all",
  selectRow: "Select row",
  select: "Select",
  showing: "Showing {from}\u2013{to} of",
  recordSingular: "record",
  recordPlural: "records",
  loadMore: "Load more"
};
var ES_LABELS = {
  search: "Buscar\u2026",
  empty: "Sin resultados",
  filters: "Filtros",
  clear: "Limpiar",
  apply: "Aplicar",
  selected: "{n} seleccionados",
  importCsv: "Importar CSV",
  exportCsv: "Exportar CSV",
  add: "A\xF1adir",
  moreActions: "M\xE1s acciones",
  rowsPerPage: "Filas por p\xE1gina",
  perPageShort: "{n} / p\xE1g.",
  viewList: "Vista lista",
  viewCards: "Vista tarjetas",
  columnsVisible: "Columnas visibles",
  columns: "Columnas",
  actions: "Acciones",
  close: "Cerrar",
  newRecord: "Nuevo",
  form: "Formulario",
  filterPlaceholder: "Filtrar\u2026",
  from: "Desde",
  to: "Hasta",
  fromOf: "{label} desde",
  toOf: "{label} hasta",
  gte: "\u2265",
  lte: "\u2264",
  noValues: "Sin valores",
  selectAll: "Seleccionar todo",
  selectRow: "Seleccionar fila",
  select: "Seleccionar",
  showing: "Mostrando {from}\u2013{to} de",
  recordSingular: "registro",
  recordPlural: "registros",
  loadMore: "Cargar m\xE1s"
};
var _OkDataTable = class _OkDataTable2 extends i3 {
  constructor() {
    super(...arguments);
    this.columns = [];
    this.rows = [];
    this.searchKeys = [];
    this.rowKeyField = "id";
    this.pageSize = 10;
    this.labels = {};
    this.actions = [];
    this.addable = false;
    this.pageSizeOptions = [10, 25, 50, 100];
    this.fill = false;
    this.columnPicker = true;
    this.csv = false;
    this.csvName = "export.csv";
    this.serverSide = false;
    this.total = 0;
    this.page = 0;
    this.searchable = false;
    this.sortDir = "asc";
    this.filterValues = {};
    this.title = "";
    this.views = false;
    this.exportable = false;
    this.importable = false;
    this.columnSelector = false;
    this.rowClickable = false;
    this.selectable = false;
    this.inlineFilters = false;
    this.menuActions = [];
    this.q = "";
    this.clientPage = 0;
    this.clientPageSize = 0;
    this.mobileShown = 0;
    this.clientSort = "";
    this.clientSortDir = "asc";
    this.clientFilters = {};
    this.filterDraft = {};
    this.serverFilters = {};
    this.panel = "none";
    this.viewMode = "table";
    this.viewChosenByUser = false;
    this.isMobile = false;
    this.xOverflow = false;
    this.actionsTrackPx = 0;
    this.rowActionsCollapsed = false;
    this.fitDecidedAtWidth = -1;
    this.rowMenuOpen = false;
    this.hiddenKeys = /* @__PURE__ */ new Set();
    this.internalSelection = /* @__PURE__ */ new Set();
    this.menuOpen = false;
    this.onLocaleChanged = () => this.requestUpdate();
    this.onWindowResize = () => {
      this.measureXOverflow();
      this.measureRowActionsFit();
    };
    this.onSearch = (ev) => {
      const value = ev.target.value ?? "";
      if (this.serverSide) {
        this.q = value;
        this.emit("searchChange", value);
      } else {
        this.q = value;
        this.clientPage = 0;
        this.mobileShown = 0;
      }
    };
  }
  static {
    this.styles = i`
    :host {
      /* Vars overridable (estilo Ionic), default = cadena --ok-* → --ion-* → hex */
      --background: var(--ok-surface, var(--ion-card-background, var(--ion-background-color, #ffffff)));
      --color: var(--ok-text, var(--ion-text-color, #1c1b17));
      --color-muted: var(--ok-muted, var(--ion-color-medium, rgba(var(--ion-text-color-rgb, 24, 24, 27), 0.55)));
      --border-color: var(--ok-border, var(--ion-color-step-150, rgba(var(--ion-text-color-rgb, 24, 24, 27), 0.12)));
      --border-color-soft: var(--ok-border-soft, var(--ion-color-step-100, rgba(var(--ion-text-color-rgb, 24, 24, 27), 0.07)));
      /* Borde más marcado para los controles de la toolbar (selects/pastilla de fechas), para que se
       * distingan como controles en claro y oscuro aunque el lienzo y la superficie casi no contrasten. */
      --control-border: color-mix(in srgb, var(--color) 22%, transparent);
      /* Relieve de cabecera/pie: step-100 (definido en claro y oscuro) → contraste con el lienzo. */
      --header-background: var(--ok-surface-2, var(--ion-color-step-100, rgba(var(--ion-text-color-rgb, 24, 24, 27), 0.04)));
      --row-hover: var(--ok-row-hover, var(--ion-color-step-50, rgba(var(--ion-text-color-rgb, 24, 24, 27), 0.03)));
      --primary: var(--ok-primary, var(--ion-color-primary, #3880ff));
      --primary-contrast: var(--ok-primary-contrast, var(--ion-color-primary-contrast, #ffffff));
      --border-radius: var(--ok-radius, 16px);
      --font: var(--ok-font, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif);

      display: block;
      color: var(--color);
      font-family: var(--font);
    }
    * { box-sizing: border-box; }
    .card {
      position: relative;
      display: flex;
      flex-direction: column;
      /* Flat: sin borde ni elevación (directiva 2026-06-09). */
      border: 0;
      border-radius: var(--border-radius);
      overflow: hidden;
      background: var(--background);
      box-shadow: none;
    }

    /* Panel lateral derecho (drawer) DENTRO de la tabla: filtros / alta-edición. Base (sin media):
       overlay absoluto — es lo que había hasta #75 y lo que ve un navegador sin media queries. */
    .tk-scrim { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.18); z-index: 19; }
    .drawer { position: absolute; top: 0; right: 0; height: 100%; width: 340px; max-width: 88%;
      background: var(--background); border-left: 1px solid var(--border-color);
      display: flex; flex-direction: column; z-index: 20;
      animation: tk-slide-in 0.18s ease; }
    @keyframes tk-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
    /* #75 — El panel EMPUJA en escritorio y es HOJA COMPLETA en móvil; nunca tapa a medias.
       Medido en el hub (Servicios/Citas): a 1440 el overlay de 340px se pintaba ENCIMA de
       «Duración», «Acciones» y el selector de columnas, con el 90% de la tabla vacío a la
       izquierda; a 390 dejaba una tira de 45px de tabla (media lupa, medio «Co…») que hacía
       parecer el formulario un pop-up mal puesto. Square Dashboard reduce la tabla con un panel
       fijo; Fresha/Shopify/Odoo abren una hoja a pantalla completa en móvil.
       ≥ 834px: mientras hay panel, .card pasa a rejilla de DOS columnas (tabla | panel 360px):
       la tabla se estrecha (ya sabe hacer scroll-x, #67) y nada queda tapado. */
    @media (min-width: 834px) {
      .card.has-panel { display: grid; grid-template-columns: minmax(0, 1fr) 360px; grid-template-rows: auto minmax(0, 1fr) auto; }
      .card.has-panel > .bar { grid-column: 1; grid-row: 1; }
      .card.has-panel > .scroll, .card.has-panel > .cards-grid, .card.has-panel > .empty { grid-column: 1; grid-row: 2; min-height: 0; overflow: auto; }
      .card.has-panel > .pager { grid-column: 1; grid-row: 3; }
      .card.has-panel > .drawer { position: static; grid-column: 2; grid-row: 1 / -1; width: auto; max-width: none; height: auto; min-height: 0; animation: none; }
      .card.has-panel > .tk-scrim { display: none; }
    }
    /* < 834px: hoja a pantalla completa con su cabecera (título + Cerrar); sin tira residual.
       position:fixed dentro de ion-content se ancla al área de contenido (contain), que es justo el hueco
       bajo la cabecera de la app: el usuario conserva el título de la página. */
    @media (max-width: 833.98px) {
      .drawer { position: fixed; inset: 0; top: var(--ok-sheet-top, 0px); width: 100%; max-width: none; height: auto; border-left: 0; z-index: 1000; }
      .tk-scrim { display: none; }
    }
    .drawer .dh { flex: 0 0 auto; display: flex; align-items: center; justify-content: space-between;
      padding: 0.6rem 0.5rem 0.6rem 1rem; border-bottom: 1px solid var(--border-color); font-size: 1rem; }
    .drawer .db { flex: 1 1 auto; min-height: 0; overflow: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.85rem; }
    .fblock { display: flex; flex-direction: column; gap: 0.45rem; }
    .flabel { font-size: 13px; font-weight: 500; color: var(--color); }
    .frange { display: flex; gap: 0.5rem; }
    /* Filtros cliente: multi-select con ion-select (ventana flotante de Ionic) + rango de fechas. */
    .daterange { display: flex; gap: 0.6rem; }
    .daterange ion-input { flex: 1; }
    /* Pie del drawer de filtros: Limpiar / Aplicar. */
    .df { flex: 0 0 auto; display: flex; align-items: center; justify-content: flex-end; gap: 0.4rem; padding: 0.6rem 0.85rem; border-top: 1px solid var(--border-color); }
    .df .df-clear { margin-right: auto; }

    /* Modo fill: la tabla ocupa el alto del contenedor; filas con scroll interno; pager fijo. */
    :host([fill]) { display: flex; flex-direction: column; height: 100%; min-height: 0; }
    :host([fill]) .card { flex: 1 1 auto; min-height: 0; }
    :host([fill]) .bar, :host([fill]) .panel, :host([fill]) .pager { flex: 0 0 auto; }
    :host([fill]) .scroll, :host([fill]) .cards-grid { flex: 1 1 auto; min-height: 0; overflow: auto; }
    /* Sin filas, renderTable/renderCards devuelven SOLO el bloque .empty (sin .scroll). En modo
       fill hay que estirarlo para que ocupe el hueco entre toolbar y pager y centre su contenido
       (icono + mensaje) en vertical; si no, queda pegado arriba con el pager a media altura. */
    :host([fill]) .empty { flex: 1 1 auto; min-height: 0; }

    /* ── Topbar / cabecera (relieve) ─────────────────────────────────────────────────────── */
    .bar { display: flex; flex-direction: column; gap: 0.6rem; padding: 0.65rem 1rem; border-bottom: 1px solid var(--border-color); background: var(--header-background); }
    /* Toolbar CONSOLIDADA: TODOS los controles son hijos directos de UNA sola fila flex que
     * envuelve ELEMENTO A ELEMENTO (no por bloques): caben en una línea → una línea; los que no
     * caben bajan a la(s) línea(s) que hagan falta. El cluster derecho se empuja al borde con
     * .tk-spacer (hueco flexible) solo cuando todo cabe en una línea; al envolver, el spacer se
     * oculta y todo se apila a la izquierda.
     * ORDEN CANÓNICO (2026-06-22, izquierda→derecha): [buscador] · [filtros en línea] · ‹spacer› ·
     * [SELECTORES: columnas → filas/página] · [BOTONES: vistas → filtros(funnel) → import → export →
     * alta → ⋮ → acción primaria]. Es decir: buscador al inicio, filtros en medio, y al final los
     * selectores (columnas, luego «N por página») seguidos de los botones de acción. */
    .bar-main { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
    .bar-main > ion-button { --padding-start: 0.5rem; --padding-end: 0.5rem; margin: 0; }
    /* Spacer que absorbe el hueco libre en pantallas anchas (empuja el cluster derecho al borde).
     * Se oculta por debajo de 1024px para que, al envolver, los controles se apilen a la izquierda. */
    .tk-spacer { flex: 1 1 0; min-width: 0; align-self: stretch; }
    @media (max-width: 1024px) { .tk-spacer { display: none; } }
    /* Buscador a ancho completo (línea propia) en móvil; el resto envuelve debajo. */
    @media (max-width: 640px) { .search { flex-basis: 100%; max-width: none; } }
    .title-wrap { display: flex; align-items: baseline; gap: 0.5rem; }
    .title { font-size: 15px; font-weight: 600; line-height: 1; margin: 0; }
    .title-count { font-size: 12px; font-weight: 500; color: var(--color-muted); }

    /* Botón de herramienta cuadrado (filtros/import/export), look del Hub: 36×36, badge contador. */
    .toolbtn { position: relative; --padding-start: 0; --padding-end: 0; --border-radius: 10px; width: 36px; height: 36px; margin: 0; }
    .toolbtn .badge { position: absolute; top: -5px; right: -5px; min-width: 16px; height: 16px; padding: 0 3px; border-radius: 999px; background: var(--primary); color: var(--primary-contrast); font-size: 10px; font-weight: 700; line-height: 16px; text-align: center; pointer-events: none; }

    /* Buscador (caja con icono + limpiar), look del Hub. No crece (el spacer se queda el hueco);
     * puede encoger hasta min-width y, por debajo, envuelve. */
    .search { flex: 0 1 22rem; min-width: 12rem; max-width: 24rem; }
    ion-searchbar { --background: var(--background); --border-radius: 10px; padding: 0; min-height: 36px; }
    /* Flat: el buscador quita borde y elevación vía la clase específica de Ionic 'ion-no-border'.
     * (La regla global de Ionic para .ion-no-border no cruza el Shadow DOM, así que la
     * reimplementamos aquí dentro: --box-shadow controla la elevación; ::part(native) el borde.) */
    ion-searchbar.ion-no-border { --box-shadow: none; }
    ion-searchbar.ion-no-border::part(native) { border: none; box-shadow: none; }

    /* Toggle de vista lista/tarjetas (segmento) */
    .viewseg { display: inline-flex; align-items: center; gap: 2px; padding: 2px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--background); }
    .viewseg ion-button { --border-radius: 7px; }

    /* Botón primario (primaryAction) */
    .primary-btn { --background: var(--primary); --color: var(--primary-contrast); }
    /* #76 — El alta en MÓVIL: botón primario CON etiqueta y área táctil de 44px, en vez del «+»
       icónico de 36px al final de la barra. Fresha/Square/Shopify POS ponen la acción primaria
       de la lista como botón visible con texto (o FAB), nunca como icono anónimo.
       #113 — Y en ESCRITORIO igual: Odoo («New»), Business Central, Shopify («Add product»),
       WooCommerce, Lightspeed y Fresha rotulan y rellenan la acción principal de un listado; NN/g
       reserva el botón sin rótulo para lo universal (buscar, cerrar). Aquí solo cambia la ALTURA:
       36px para alinear con .toolbtn y el buscador, y los 44px táctiles vuelven abajo con el
       resto de objetivos de puntero grueso. */
    .add-btn { min-height: 36px; --border-radius: 10px; --padding-start: 0.9rem; --padding-end: 1rem; margin: 0; font-weight: 600; }
    .add-btn ion-icon { margin-inline-end: 0.35rem; }

    /* Selects de la toolbar: fondo + borde visibles (como el buscador y la pastilla de fechas) para
     * que se distingan como controles en claro y oscuro (sin fondo eran invisibles en dark). */
    .tk-cols { min-width: 6.5rem; max-width: 9rem; min-height: 38px; font-size: 13px; background: var(--background); color: var(--color); border: 1px solid var(--control-border); border-radius: 10px; --padding-start: 0.6rem; --padding-end: 0.4rem; --padding-top: 0.3rem; --padding-bottom: 0.3rem; }
    .vsep { width: 1px; align-self: stretch; background: var(--border-color); margin: 0.3rem 0.25rem; }

    /* Selector de filas/página en la toolbar (consolidado) */
    /* max-width: ion-select es display:block (sin core.css el host estira a la
     * línea entera cuando .bar-end hace wrap) — se capa como .tk-cols. */
    .tk-psize { min-width: 4.25rem; max-width: 5.5rem; min-height: 38px; font-size: 13px; background: var(--background); color: var(--color); border: 1px solid var(--control-border); border-radius: 10px; --padding-start: 0.6rem; --padding-end: 0.4rem; --padding-top: 0.35rem; --padding-bottom: 0.35rem; }

    /* Filtros EN LÍNEA en la toolbar (select / rango de fechas) */
    .tk-filter { min-width: 8.5rem; max-width: 13rem; min-height: 38px; font-size: 13px; background: var(--background); color: var(--color); border: 1px solid var(--control-border); border-radius: 10px; --padding-start: 0.7rem; --padding-end: 0.5rem; --padding-top: 0.35rem; --padding-bottom: 0.35rem; }
    .tk-daterange { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.6rem; min-height: 38px; border: 1px solid var(--control-border); border-radius: 10px; background: var(--background); color: var(--color-muted); font-size: 13px; }
    .tk-daterange ion-icon { font-size: 15px; flex: 0 0 auto; }
    .tk-daterange ion-input { --background: transparent; --padding-start: 0; --padding-end: 0; --padding-top: 2px; --padding-bottom: 2px; --color: var(--color); min-height: 26px; width: 6.8rem; font-size: 13px; }
    .tk-daterange .arr { color: var(--color-muted); }

    /* Barra contextual de selección */
    .selbar { display: flex; align-items: center; gap: 0.6rem; padding: 0.4rem 0.7rem; border-radius: 10px;
      font-size: 13px; color: var(--primary);
      background: color-mix(in srgb, var(--primary) 12%, transparent); }
    .selbar .sel-clear { margin-left: auto; display: inline-flex; align-items: center; gap: 0.25rem; cursor: pointer; font-weight: 500; color: inherit; background: none; border: 0; font: inherit; }
    .selbar .sel-clear:hover { text-decoration: underline; }

    /* Acordeones (alta / filtros en modo tarjetas) */
    .panel { padding: 0.85rem 1rem; border-bottom: 1px solid var(--border-color); background: var(--header-background); }
    .filters-panel { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.6rem; }

    /* ── Vista lista en CSS GRID (no <table>): permite ancho por columna ──────────────────── */
    /* #67 — La barra horizontal es PERMANENTE cuando hay desbordamiento: la overlay de macOS se
       esconde a los pocos ms y deja la tabla sin ninguna pista de que sigue a la derecha. Al
       declarar ::-webkit-scrollbar el navegador pinta la clásica, que ocupa sitio y se ve. */
    .scroll { overflow-x: auto; }
    .scroll::-webkit-scrollbar { height: 10px; }
    .scroll::-webkit-scrollbar-track { background: transparent; }
    .scroll::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--color) 25%, transparent); border-radius: 6px; }
    .scroll::-webkit-scrollbar-thumb:hover { background: color-mix(in srgb, var(--color) 40%, transparent); }
    /* #120 - The grid floor is the SUM OF THE COLUMN MINIMUMS (min-content), not its maximum
       size. With max-content the grid sizes itself to what the widest column asks for and, in
       doing so, every 1fr track ends up as wide AS THAT ONE: at 834px each column measured
       148.86px for content asking between 10px (a "4") and 100px ("Familia Perez"). The table
       always overflowed and the pinned actions column sat on top of Pax and Estado. With
       min-content the grid fits its container as long as the minimums fit, and 1fr shares out the
       leftover space; horizontal scroll shows up only when not even the minimums fit. */
    .grid { min-width: min-content; font-size: 14px; }
    .grow { display: grid; align-items: center; gap: 0.5rem; padding: 0 1rem; }
    .ghead { position: sticky; top: 0; z-index: 2; border-bottom: 1px solid var(--border-color);
      background: var(--header-background); padding-top: 0.55rem; padding-bottom: 0.55rem; }
    .gcell { display: flex; align-items: center; min-width: 0; }
    .gcell > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .gcell.right { justify-content: flex-end; text-align: right; }
    .gcell.center { justify-content: center; text-align: center; }
    /* #67 - PINNED ACTIONS COLUMN. When the grid overflows (since #120 only when not even the
       column minimums fit; before that it happened with six columns and room to spare) the button
       that opens the record went off screen: at 1440px it sat 335px past the edge with nothing to
       give it away. It stays stuck to the right edge, like Zendesk/Freshdesk/Shopify. With
       background:inherit it takes the row background (which is opaque for this very reason), so it
       keeps hover and selection without anything showing through. */
    .gcell.actions-col { position: sticky; right: 0; z-index: 1; background: inherit;
      margin-right: -1rem; padding-right: 1rem; }
    /* La sombra solo aparece cuando de verdad hay algo escondido a la izquierda (clase x-overflow);
       si la tabla cabe entera no se pinta nada. */
    .scroll.x-overflow .gcell.actions-col { box-shadow: -10px 0 10px -10px color-mix(in srgb, var(--color) 45%, transparent); }
    /* #120 - The pinned header has to be OPAQUE. background:inherit took --header-background,
       which is a 4% alpha TINT (measured rgba(24,24,27,0.04)): when the grid overflows the
       "Acciones" header went see-through and "PAX" and "ESTADO" could be read through it - the
       "PAXCIONESTAD" of the issue. It now sits on the opaque table background with the tint laid
       back on top, the same way .grow-data:hover does. */
    .ghead .gcell.actions-col { z-index: 3;
      background: linear-gradient(var(--header-background), var(--header-background)), var(--background); }
    .gh { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted); }
    .gh.sortable { cursor: pointer; user-select: none; white-space: nowrap; transition: background-color var(--ok-transition, 150ms ease), color var(--ok-transition, 150ms ease), box-shadow var(--ok-transition, 150ms ease), transform 120ms ease; }
    @media (hover: hover) {
      .gh.sortable:hover { color: var(--color); }
    }
    /* Caret de orden (3 estados, icono Ionic): neutral atenuado / activo en color primario. */
    .caret { display: inline-flex; align-items: center; margin-left: 0.25rem; flex: 0 0 auto; font-size: 13px; opacity: 0.3; }
    .caret.on { opacity: 1; color: var(--primary); }
    .grow-data { background: var(--background); border-bottom: 1px solid var(--border-color-soft); padding-top: 0.6rem; padding-bottom: 0.6rem; transition: background-color var(--ok-transition, 150ms ease), color var(--ok-transition, 150ms ease), box-shadow var(--ok-transition, 150ms ease), transform 120ms ease; }
    .grow-data:last-child { border-bottom: 0; }
    @media (hover: hover) {
      .grow-data:hover { background: linear-gradient(var(--row-hover), var(--row-hover)), var(--background); }
    }
    .grow-data:active { transform: scale(0.995); }
    .grow-data.selected { background: linear-gradient(color-mix(in srgb, var(--primary) 10%, transparent), color-mix(in srgb, var(--primary) 10%, transparent)), var(--background); }
    /* #67 — Fila clicable (opt-in row-clickable): es lo primero que intenta el usuario y lo que
       hacen Odoo, Jira SM, Shopify o Square en sus listados. */
    .grow-data.clickable { cursor: pointer; }
    .grow-data.clickable:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }
    .selcb { display: flex; align-items: center; justify-content: center; }
    .filters-grow { padding-top: 0.4rem; padding-bottom: 0.6rem; }
    .filters-grow input, .filters-grow select { width: 100%; box-sizing: border-box; font: inherit; font-size: 13px; padding: 0.3rem 0.4rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--background); color: var(--color); }
    .range { display: flex; gap: 0.25rem; }

    /* ── Vista tarjetas ──────────────────────────────────────────────────────────────────── */
    /* Cada tarjeta mide SU contenido (no se estira al alto de la fila ni del contenedor):
       - grid-auto-rows: max-content → cada fila implícita = alto de su contenido. CLAVE: sin esto,
         en modo fill (grid de alto fijo + align-content:start) cuando las tarjetas no caben el
         navegador encoge los tracks de fila y las tarjetas se solapan.
       - align-content: start → empaqueta las filas arriba (no reparte el hueco sobrante estirando).
       - align-items: start → en una fila multi-columna cada tarjeta mide su propio contenido.
       En modo fill el grid es flex-child con overflow:auto → cuando las tarjetas no caben aparece el
       scroll DENTRO de la tabla (no crece hacia fuera). */
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 0.75rem; padding: 1rem; grid-auto-rows: max-content; align-content: start; align-items: start; }
    /* Tarjeta = ion-card NATIVO de Ionic: su fondo, radio, elevación y padding son los de Ionic y NO
       se sobrescriben. Aquí solo se ajusta lo que el contexto de rejilla exige (margin) y los huecos
       que Ionic no trae (cabecera en fila, filas clave-valor, barra de acciones, resalte de selección). */
    ion-card.rcard { margin: 0; } /* la rejilla aporta el gap → sin esto el margin por defecto de ion-card lo duplica */
    ion-card.rcard.selected { outline: 2px solid var(--primary); outline-offset: -2px; }
    /* #74 — Tarjeta clicable (opt-in row-clickable): la mitad de #67 que faltaba. La vista de
       tarjetas es la que la tabla elige SOLA en móvil, así que sin esto el registro no se podía
       abrir desde un teléfono (medido con combos 0.1.4: 0 rowClick a 390px). */
    ion-card.rcard.clickable { cursor: pointer; }
    ion-card.rcard.clickable:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }
    @media (prefers-reduced-motion: reduce) {
      .gh.sortable:hover, .gh.sortable:active,
      .grow-data:hover, .grow-data:active { transform: none; }
    }
    /* Header: ion-card-header as a single row (icon + title + checkbox), keeping Ionic's padding.
       #79 — flex-direction/flex-wrap are SPELLED OUT on purpose: in ios mode (the mode the Hub
       shell pins, ADR-0143) Ionic's own host CSS gives ion-card-header a column direction, so a
       rule that only sets display:flex inherits it and the three children stack on three lines.
       Under md the same rule looked right, which is why it shipped. */
    ion-card-header.rcard-head { display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center; gap: 0.5rem; }
    .rcard-head .rc-icon { display: inline-flex; color: var(--primary); }
    .rcard-head .rc-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
    /* Cuerpo: ion-card-content (padding Ionic por defecto) con las filas clave-valor apiladas. */
    ion-card-content.rcard-body { display: flex; flex-direction: column; gap: 0.4rem; }
    .rrow { display: flex; justify-content: space-between; gap: 0.5rem; font-size: 13px; }
    .rrow .rk { color: var(--color-muted); }
    .rrow .rv { font-weight: 500; text-align: right; color: var(--color); }
    /* Barra de acciones (Ionic no trae "card actions"): pie alineado a la derecha, fondo transparente. */
    .ractions { display: flex; justify-content: flex-end; gap: 0.25rem; padding: 0 0.5rem 0.5rem; }
    /* ERPlora/appointments#154 - a card's action row must NEVER clip.
       The assumption was that they always fit across the card. With the eight actions an
       appointment carries they do not: on a 411dp phone the card leaves 363px and the buttons ask
       for 380px (8 x 44px of tap floor + 7 gaps of 4px). Without wrapping, justify-content:
       flex-end takes that difference off the START side, so the FIRST button - Cobrar - hung off
       the left edge of the card, clipped, with no scrollbar and nothing to say it was there.
       The wrap is scoped to the card on purpose: the LIST view's row is measured by its
       scrollWidth to pin the column track (#121), and a row that wraps changes width with the
       track it is measured against, which is the loop that measure avoids. */
    .ractions .actions { flex-wrap: wrap; }

    /* ── Estado vacío ────────────────────────────────────────────────────────────────────── */
    .empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; padding: 3.5rem 1rem; text-align: center; color: var(--color-muted); }
    .empty .empty-ic { display: grid; place-items: center; width: 3.25rem; height: 3.25rem; border-radius: 999px; background: var(--header-background); font-size: 26px; }

    .actions { display: flex; gap: 0.25rem; justify-content: flex-end; }
    /* #121 - The buttons NEVER shrink. Their track is pinned to the width measured here
       (the scrollWidth of .actions); if they could shrink, a narrow track would shrink the
       measurement, which would shrink the track again. flex: 0 0 auto is what makes the
       measurement a property of the CONTENT instead of a property of the current layout. */
    .actions ion-button { flex: 0 0 auto; }
    /* #122 - Header of the actions column while the buttons are folded into the menu. "ACCIONES"
       measures 62.83px and the folded track is 44px: painted, it spills out of its own cell and
       over "Estado" - the very thing the issue is about. The column keeps its name for assistive
       tech and paints nothing. */
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden;
      clip-path: inset(50%); white-space: nowrap; border: 0; }
    /* Las acciones de fila son icon-only y de tamaño small en escritorio. En tablet/móvil se
     * amplía el host completo (no solo el icono) para que el área táctil alcance 44×44 px. */
    @media (pointer: coarse), (max-width: 834px) {
      .actions ion-button { min-width: 44px; min-height: 44px; margin: 0; }
      .toolbtn { width: 44px; height: 44px; }
      .add-btn { min-height: 44px; }
      .pager .nav ion-button { min-width: 44px; min-height: 44px; margin: 0; }
    }
    /* Spinner de acción en curso (loading): contenido dentro del ion-button small (Ionic lo fija
     * a 28px en el :host, por eso width/height y no font-size). Cubre tabla y tarjetas: los
     * botones de fila siempre van dentro de .actions. */
    .actions ion-spinner { width: 18px; height: 18px; }

    /* ── Pie: contador + paginación ──────────────────────────────────────────────────────── */
    .pager { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.55rem 1rem; border-top: 1px solid var(--border-color); background: var(--header-background); font-size: 12.5px; color: var(--color-muted); }
    .pager .left { display: flex; align-items: center; gap: 0.6rem; }
    .pager .strong { font-weight: 600; color: var(--color); }
    .psize { font: inherit; font-size: 12.5px; padding: 0.2rem 0.35rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--background); color: var(--color); }
    .pager .nav { display: flex; align-items: center; gap: 0.2rem; }
    /* #78 — Pie en MÓVIL: un solo control «Cargar más» en lugar del pager numerado (Shopify
       IndexTable, Fresha, Square y Material hacen lo mismo: nadie pinta botones de página en un
       teléfono). Sin atributo fill: el sólido por defecto de Ionic es el único que pinta caja en
       modo ios (outfitkit#82 / ADR-0143). Los 44px son el área táctil mínima. */
    .pager .load-more { min-height: 44px; margin: 0; --padding-start: 1rem; --padding-end: 1rem; font-size: 13px; }
    .pager .nav .pp { font-weight: 600; color: var(--color); padding: 0 0.25rem; }
    /* Pager numerado: botón por página + «…» en los saltos (look del Hub). */
    /* #92 — min-width/height at 44px so a numbered page button matches the prev/next ion-button's
       own 44px tap target (line above): before this they were visibly smaller than their neighbors. */
    .pnum { min-width: var(--ok-tap-min, 44px); height: var(--ok-tap-min, 44px); padding: 0 0.4rem; border: 1px solid transparent; border-radius: 8px; background: none; font: inherit; font-size: 12.5px; font-weight: 600; color: var(--color); cursor: pointer; transition: background 0.12s, border-color 0.12s; }
    .pnum:hover { background: var(--row-hover); }
    .pnum.on { background: color-mix(in srgb, var(--primary) 14%, transparent); color: var(--primary); border-color: color-mix(in srgb, var(--primary) 40%, transparent); }
    .pgap { padding: 0 0.15rem; color: var(--color-muted); }
    ion-button { --box-shadow: none; }
  `;
  }
  static {
    this.MOBILE_BREAKPOINT = 640;
  }
  connectedCallback() {
    super.connectedCallback();
    if (typeof window !== "undefined") {
      window.addEventListener("erplora:locale-changed", this.onLocaleChanged);
      window.addEventListener("resize", this.onWindowResize);
    }
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      this.mq = window.matchMedia(`(max-width: ${_OkDataTable2.MOBILE_BREAKPOINT}px)`);
      this.isMobile = this.mq.matches;
      const handler = (e6) => {
        const matches = "matches" in e6 ? e6.matches : this.mq?.matches ?? false;
        if (this.isMobile === matches) return;
        this.isMobile = matches;
        if (matches && this.cardViewEnabled) this.viewMode = "cards";
        else if (!matches && this.viewMode === "cards") this.viewMode = "table";
      };
      this.mq.addEventListener("change", handler);
      this._mqHandler = handler;
    }
  }
  /** #67 — Recalcula si la vista lista desborda a lo ancho (`scrollWidth > clientWidth`).
   *
   * Se mide después de renderizar, que es cuando el navegador ya conoce los anchos, y solo se
   * escribe el estado si CAMBIA: asignarlo siempre reprogramaría un render en bucle. */
  measureXOverflow() {
    const scroll = this.renderRoot?.querySelector?.(".scroll");
    const overflow = !!scroll && scroll.scrollWidth > scroll.clientWidth;
    if (this.xOverflow !== overflow) this.xOverflow = overflow;
  }
  /** #121 — Ancho natural de los botones de acción de una fila, para clavar su pista en px.
   *
   * Se lee del `scrollWidth` de `.actions`, que es el ancho de SU CONTENIDO: como los botones
   * llevan `flex: 0 0 auto` nunca se encogen, así que la medida no depende de lo ancha que sea la
   * pista en ese momento. Eso es lo que la hace estable: clavar la pista al ancho natural no
   * cambia el ancho natural, así que la siguiente medida sale igual y no hay bucle. */
  measureActionsTrack() {
    if (!this.actions.length) {
      if (this.actionsTrackPx !== 0) this.actionsTrackPx = 0;
      return;
    }
    const el = this.renderRoot?.querySelector?.(".grow-data .gcell.actions-col .actions");
    const width = el ? Math.ceil(el.scrollWidth) : 0;
    if (width > 0 && width !== this.actionsTrackPx) this.actionsTrackPx = width;
  }
  /** #122 — Decide si los botones de acción de la fila caben o se pliegan en el menú «⋮».
   *  El criterio y la garantía de que no oscila viven en `decideRowActionsFit`. */
  measureRowActionsFit() {
    const scroll = this.renderRoot?.querySelector?.(".scroll");
    if (!scroll) return;
    const next = decideRowActionsFit({
      containerWidth: scroll.clientWidth,
      contentWidth: scroll.scrollWidth,
      collapsed: this.rowActionsCollapsed,
      decidedAtWidth: this.fitDecidedAtWidth
    });
    this.fitDecidedAtWidth = next.decidedAtWidth;
    if (this.rowActionsCollapsed !== next.collapsed) this.rowActionsCollapsed = next.collapsed;
  }
  /** Engancha el observador al contenedor de scroll del render actual (cambia entre vistas). */
  observeXOverflow() {
    if (typeof ResizeObserver === "undefined") return;
    const scroll = this.renderRoot?.querySelector?.(".scroll");
    if (!scroll) return;
    this.xObserver ??= new ResizeObserver(() => {
      this.measureXOverflow();
      this.measureActionsTrack();
      this.measureRowActionsFit();
    });
    this.xObserver.disconnect();
    this.xObserver.observe(scroll);
    const grid = scroll.querySelector(".grid");
    if (grid) this.xObserver.observe(grid);
  }
  updated(changed) {
    this.observeXOverflow();
    this.measureXOverflow();
    if (changed.has("columns") || changed.has("actions") || changed.has("hiddenKeys") || changed.has("selectable")) {
      this.fitDecidedAtWidth = -1;
    }
    this.measureActionsTrack();
    this.measureRowActionsFit();
    if (changed.has("panel")) this.syncSheetTop();
  }
  /** #75 — Where the mobile sheet starts. `position: fixed; inset: 0` painted it from y=0 and the
   *  app's `ion-header` (its own stacking context, above the content) covered the sheet's title and
   *  its only Close button — measured at 390×844 in the Appointments parity page. CSS inside a
   *  shadow root cannot know where the content area begins, so on open the table measures the
   *  closest `ion-content` (walking through shadow hosts) and hands the offset over as a custom
   *  property; on close it is removed. Without an `ion-content` around, the sheet keeps y=0. */
  syncSheetTop() {
    if (this.panel === "none") {
      this.style.removeProperty("--ok-sheet-top");
      return;
    }
    let node = this;
    let content = null;
    while (node && !content) {
      const parent = node.parentNode ?? node.getRootNode?.()?.host ?? null;
      if (parent && parent.nodeType === Node.ELEMENT_NODE && parent.tagName === "ION-CONTENT") content = parent;
      node = parent === node ? null : parent;
    }
    const top = content ? Math.max(0, Math.round(content.getBoundingClientRect().top)) : 0;
    this.style.setProperty("--ok-sheet-top", `${top}px`);
  }
  disconnectedCallback() {
    if (typeof window !== "undefined") {
      window.removeEventListener("erplora:locale-changed", this.onLocaleChanged);
      window.removeEventListener("resize", this.onWindowResize);
    }
    this.xObserver?.disconnect();
    this.xObserver = void 0;
    if (this.mq) {
      const handler = this._mqHandler;
      if (handler) this.mq.removeEventListener("change", handler);
      this.mq = void 0;
    }
    super.disconnectedCallback();
  }
  // ── i18n: idioma del documento ← overrides explícitos de `.labels` ─────────────────────────
  get t() {
    const lang = typeof document === "undefined" ? "en" : document.documentElement.lang.toLowerCase();
    return { ...lang.startsWith("es") ? ES_LABELS : DEFAULT_LABELS, ...this.labels };
  }
  /** Placeholder efectivo del buscador (prop explícita → label i18n → default inglés). */
  get effSearchPlaceholder() {
    return this.searchPlaceholder ?? this.t.search;
  }
  /** Mensaje efectivo de estado vacío (prop explícita → label i18n → default inglés). */
  get effEmptyMessage() {
    return this.emptyMessage ?? this.t.empty;
  }
  // ── Resolución de alias (compat + documentados) ──────────────────────────────────────────
  get effPageSizes() {
    return this.pageSizes ?? this.pageSizeOptions;
  }
  get effColumnPicker() {
    return this.columnPicker || this.columnSelector;
  }
  get effExport() {
    return this.csv || this.exportable;
  }
  get effImport() {
    return this.csv || this.importable;
  }
  /** ¿Está habilitado el conmutador de vista lista/tarjetas? */
  get viewToggle() {
    if (Array.isArray(this.views)) return this.views.length > 1;
    return this.views === true;
  }
  /** ¿Está disponible la vista tarjetas? (presente en `views` o `views === true`). */
  get cardViewEnabled() {
    if (Array.isArray(this.views)) return this.views.some((v3) => v3 === "cards" || v3 === "card");
    return this.views === true;
  }
  /** Columnas actualmente visibles (respeta el column chooser). */
  get visibleColumns() {
    return this.hiddenKeys.size ? this.columns.filter((c5) => !this.hiddenKeys.has(c5.key)) : this.columns;
  }
  setVisibleColumns(keys) {
    const visible = new Set(keys);
    this.hiddenKeys = new Set(this.columns.map((c5) => c5.key).filter((k2) => !visible.has(k2)));
    this.emit("columnsChange", { visible: keys });
  }
  // ── Selección ─────────────────────────────────────────────────────────────────────────────
  keyOf(row) {
    if (typeof this.rowKey === "function") return String(this.rowKey(row) ?? "");
    if (typeof this.rowKey === "string") return String(row[this.rowKey] ?? "");
    return String(row[this.rowKeyField] ?? "");
  }
  /** #143 — `<prefix>-<suffix>`, or `nothing` (= the attribute is not painted) when the host gave
   *  no prefix. A blank prefix counts as absent: `" "` would leave dangling `-add` hooks, identical
   *  on every table of the screen, which is exactly what the prefix prevents. */
  tid(suffix) {
    const prefix = this.testid?.trim();
    return prefix ? `${prefix}-${suffix}` : A;
  }
  get selection() {
    return this.selectedKeys ?? this.internalSelection;
  }
  setSelection(next) {
    if (!this.selectedKeys) this.internalSelection = next;
    this.emit("selectionChange", { keys: [...next] });
    this.requestUpdate();
  }
  toggleRow(key) {
    const next = new Set(this.selection);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this.setSelection(next);
  }
  toggleAll(visible) {
    const keys = visible.map((r6) => this.keyOf(r6));
    const allOn = keys.length > 0 && keys.every((k2) => this.selection.has(k2));
    const next = new Set(this.selection);
    if (allOn) keys.forEach((k2) => next.delete(k2));
    else keys.forEach((k2) => next.add(k2));
    this.setSelection(next);
  }
  // ── CSV ─────────────────────────────────────────────────────────────────────────────────────
  csvEscape(v3) {
    const s5 = v3 === null || v3 === void 0 ? "" : String(v3);
    return /[",\n\r]/.test(s5) ? `"${s5.replace(/"/g, '""')}"` : s5;
  }
  /** Exporta las filas a CSV (cabeceras = column.key). Si no hay filas, exporta solo la estructura. */
  exportCsv() {
    const cols = this.columns;
    const head = cols.map((c5) => this.csvEscape(c5.key)).join(",");
    const lines = this.rows.map((r6) => cols.map((c5) => this.csvEscape(r6[c5.key])).join(","));
    const csv = [head, ...lines].join("\r\n");
    const blob = new Blob([CSV_BOM + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a3 = document.createElement("a");
    a3.href = url;
    a3.download = this.csvName;
    a3.click();
    URL.revokeObjectURL(url);
    this.emit("csvExport", { rows: this.rows.length });
    this.emit("export", { rows: this.rows.length });
  }
  parseCsv(text) {
    const out = [];
    let row = [];
    let field = "";
    let q = false;
    for (let i7 = 0; i7 < text.length; i7++) {
      const c5 = text[i7];
      if (q) {
        if (c5 === '"') {
          if (text[i7 + 1] === '"') {
            field += '"';
            i7++;
          } else q = false;
        } else field += c5;
      } else if (c5 === '"') q = true;
      else if (c5 === ",") {
        row.push(field);
        field = "";
      } else if (c5 === "\n" || c5 === "\r") {
        if (c5 === "\r" && text[i7 + 1] === "\n") i7++;
        row.push(field);
        field = "";
        if (row.length > 1 || row[0] !== "") out.push(row);
        row = [];
      } else field += c5;
    }
    if (field !== "" || row.length) {
      row.push(field);
      out.push(row);
    }
    const headers = out.shift() ?? [];
    const rows = out.map((r6) => Object.fromEntries(headers.map((h4, i7) => [h4, r6[i7] ?? ""])));
    return { headers, rows };
  }
  async onImportFile(ev) {
    const input = ev.target;
    const file = input.files?.[0];
    if (!file) return;
    const text = decodeCsvBuffer(await file.arrayBuffer());
    const { headers, rows } = this.parseCsv(text);
    this.emit("csvImport", { headers, rows });
    this.emit("import", { headers, rows });
    input.value = "";
  }
  toggle(p4) {
    if (p4 === "filters" && this.panel !== "filters") {
      this.filterDraft = this.cloneFilters(this.clientFilters);
    }
    this.panel = this.panel === p4 ? "none" : p4;
  }
  // ── Filtros en memoria (modo cliente): borrador → aplicar. ───────────────────────────────────
  cloneFilters(src) {
    const out = {};
    for (const [k2, f3] of Object.entries(src)) {
      out[k2] = { values: f3.values ? new Set(f3.values) : void 0, from: f3.from, to: f3.to };
    }
    return out;
  }
  // Fija el conjunto de valores seleccionados de una columna (multi-select del drawer = ion-select).
  setFilterValues(key, values) {
    const next = this.cloneFilters(this.filterDraft);
    const clean = (values ?? []).filter((v3) => v3 != null && v3 !== "");
    if (clean.length) next[key] = { ...next[key], values: new Set(clean) };
    else next[key] = { ...next[key], values: void 0 };
    this.filterDraft = next;
  }
  setFilterRange(key, edge, value) {
    const next = this.cloneFilters(this.filterDraft);
    next[key] = { ...next[key], [edge]: value };
    this.filterDraft = next;
  }
  applyFilters() {
    const clean = {};
    for (const [k2, f3] of Object.entries(this.filterDraft)) {
      if (f3.values && f3.values.size > 0 || f3.from || f3.to) clean[k2] = f3;
    }
    this.clientFilters = clean;
    this.clientPage = 0;
    this.mobileShown = 0;
    this.panel = "none";
    this.emit("filterChange", { filters: this.serializeFilters(clean) });
  }
  clearFilters() {
    this.filterDraft = {};
  }
  serializeFilters(src) {
    const out = {};
    for (const [k2, f3] of Object.entries(src)) {
      if (f3.values && f3.values.size > 0) out[k2] = [...f3.values];
      else if (f3.from || f3.to) out[k2] = { from: f3.from ?? "", to: f3.to ?? "" };
    }
    return out;
  }
  /** Abre el panel lateral (API pública para el módulo, p.ej. "editar" abre el form pre-rellenado). */
  open(panel = "create") {
    this.panel = panel;
  }
  /** Cierra el panel lateral. */
  close() {
    this.panel = "none";
  }
  emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  }
  get hasSearch() {
    return this.searchable || this.searchKeys.length > 0;
  }
  /** Columnas filtrables (con control en el panel de filtros). En cliente y en servidor. */
  get filterColumns() {
    return this.columns.filter((c5) => c5.filterable);
  }
  /** ¿Hay que mostrar el botón de Filtros? (cualquier columna filtrable). */
  get hasFilterRow() {
    return this.filterColumns.length > 0;
  }
  /** Nº de filtros activos → badge del botón Filtros. En servidor cuenta `filterValues` (#106): sin
   *  esto el embudo no daba NINGUNA señal de que la lista venía acotada. */
  get activeFilterCount() {
    if (this.serverSide) {
      return Object.keys(this.serverFilters).filter((k2) => this.serverFilterState(k2) !== void 0).length;
    }
    return Object.values(this.clientFilters).filter(
      (f3) => f3.values && f3.values.size > 0 || f3.from || f3.to
    ).length;
  }
  // ── Estado de filtro VISIBLE (#106) ──────────────────────────────────────────────────────────
  /** Traduce un valor de `filterValues` (la forma que emite `filterChange`) a la forma interna que
   *  usan los `render*Filter`. `undefined` = ese filtro no está puesto. */
  serverFilterState(key) {
    const raw = this.serverFilters[key];
    if (raw === void 0 || raw === null || raw === "") return void 0;
    if (Array.isArray(raw)) {
      const values = raw.filter((v3) => v3 !== null && v3 !== void 0 && v3 !== "").map((v3) => String(v3));
      return values.length ? { values: new Set(values) } : void 0;
    }
    if (typeof raw === "object") {
      const range = raw;
      const from = range.from === null || range.from === void 0 || range.from === "" ? void 0 : String(range.from);
      const to = range.to === null || range.to === void 0 || range.to === "" ? void 0 : String(range.to);
      return from !== void 0 || to !== void 0 ? { from, to } : void 0;
    }
    return { values: /* @__PURE__ */ new Set([String(raw)]) };
  }
  /** Estado de filtro efectivo de una columna: servidor → `filterValues`/espejo; cliente → memoria. */
  filterStateOf(key) {
    return this.serverSide ? this.serverFilterState(key) : this.clientFilters[key];
  }
  /** Fija (o borra) el valor visible de un filtro en el espejo de servidor. */
  setServerFilter(key, value) {
    const next = { ...this.serverFilters };
    const empty = value === void 0 || value === null || value === "" || Array.isArray(value) && value.length === 0;
    if (empty) delete next[key];
    else next[key] = value;
    this.serverFilters = next;
  }
  /** Fija UN extremo de un rango en el espejo. Los dos extremos viajan en eventos SEPARADOS
   *  (`{from}` y luego `{to}`), así que aquí se MEZCLA: reemplazar borraría el otro extremo. */
  setServerRangeEdge(key, edge, value) {
    const prev = this.serverFilters[key];
    const base = prev && typeof prev === "object" && !Array.isArray(prev) ? { ...prev } : {};
    base[edge] = value;
    const alive = (v3) => v3 !== void 0 && v3 !== null && v3 !== "";
    this.setServerFilter(key, alive(base.from) || alive(base.to) ? base : void 0);
  }
  /** Valor crudo de una columna para ordenar/filtrar (usa format si lo hay, si no row[key]). */
  rawValue(col, row) {
    if (col.format) return col.format(row);
    return row[col.key];
  }
  /** Valores distintos de una columna (para los chips del filtro multi-select). */
  distinctValues(col) {
    const set = /* @__PURE__ */ new Set();
    for (const row of this.rows) {
      const v3 = this.rawValue(col, row);
      if (v3 != null && v3 !== "") set.add(String(v3));
    }
    return [...set].sort((a3, b3) => a3.localeCompare(b3));
  }
  /** Filas tras buscar + filtrar + ordenar EN MEMORIA (solo modo cliente). */
  get clientFiltered() {
    let result = this.rows;
    const needle = this.q.trim().toLowerCase();
    if (needle && this.searchKeys.length) {
      result = result.filter(
        (r6) => this.searchKeys.some((k2) => String(r6[k2] ?? "").toLowerCase().includes(needle))
      );
    }
    const fkeys = Object.keys(this.clientFilters);
    if (fkeys.length) {
      result = result.filter(
        (row) => fkeys.every((key) => {
          const f3 = this.clientFilters[key];
          const col = this.columns.find((c5) => c5.key === key);
          if (!col) return true;
          if (f3.values && f3.values.size > 0) {
            return f3.values.has(String(this.rawValue(col, row) ?? ""));
          }
          if (f3.from || f3.to) {
            const raw = this.rawValue(col, row);
            const t5 = raw == null ? NaN : new Date(raw).getTime();
            const from = f3.from ? new Date(f3.from).getTime() : -Infinity;
            const to = f3.to ? new Date(f3.to).getTime() + 864e5 - 1 : Infinity;
            return !Number.isNaN(t5) && t5 >= from && t5 <= to;
          }
          return true;
        })
      );
    }
    if (this.clientSort) {
      const col = this.columns.find((c5) => c5.key === this.clientSort);
      if (col) {
        const dir = this.clientSortDir === "asc" ? 1 : -1;
        result = [...result].sort((a3, b3) => {
          const va = this.rawValue(col, a3);
          const vb = this.rawValue(col, b3);
          if (va == null) return 1;
          if (vb == null) return -1;
          if (va < vb) return -1 * dir;
          if (va > vb) return 1 * dir;
          return 0;
        });
      }
    }
    return result;
  }
  cell(col, row) {
    if (col.format) return col.format(row);
    const v3 = row[col.key];
    return v3 === null || v3 === void 0 ? "" : String(v3);
  }
  /** ¿Es ordenable la columna? Servidor: opt-in (`sortable`). Cliente: por defecto SÍ (como el Hub),
   *  salvo `sortable: false` explícito. */
  isSortable(col) {
    return this.serverSide ? !!col.sortable : col.sortable !== false;
  }
  onHeaderClick(col) {
    if (!this.isSortable(col)) return;
    if (this.serverSide) {
      const dir = this.sort === col.key && this.sortDir === "asc" ? "desc" : "asc";
      this.emit("sortChange", { sort: col.key, dir });
      return;
    }
    this.mobileShown = 0;
    if (this.clientSort === col.key) {
      this.clientSortDir = this.clientSortDir === "asc" ? "desc" : "asc";
    } else {
      this.clientSort = col.key;
      this.clientSortDir = "asc";
    }
  }
  onFilterInput(col, ev) {
    const value = ev.target.value ?? "";
    this.setServerFilter(col.key, value);
    this.emit("filterChange", { col: col.key, value });
  }
  onRangeInput(col, edge, ev) {
    const raw = ev.target.value ?? "";
    const v3 = raw === "" ? "" : Number(raw);
    this.setServerRangeEdge(col.key, edge, v3);
    this.emit("filterChange", { col: col.key, value: { [edge]: v3 } });
  }
  onDateRangeInput(col, edge, ev) {
    const v3 = ev.target.value ?? "";
    this.setServerRangeEdge(col.key, edge, v3);
    this.emit("filterChange", { col: col.key, value: { [edge]: v3 } });
  }
  // ── Filtros EN LÍNEA (toolbar) ────────────────────────────────────────────────────────────
  // En modo cliente escriben directamente `clientFilters` (filtran en memoria); en servidor solo
  // emiten `filterChange`. Reutilizan la misma forma de filtro que el drawer (values / from / to).
  setClientFilter(key, patch) {
    const next = { ...this.clientFilters };
    const merged = { ...next[key], ...patch };
    const empty = (!merged.values || merged.values.size === 0) && !merged.from && !merged.to;
    if (empty) delete next[key];
    else next[key] = merged;
    this.clientFilters = next;
    this.clientPage = 0;
    this.mobileShown = 0;
  }
  // ion-select (select/multiselect) del panel de filtros (renderFilterControl). En servidor emite
  // `filterChange`; en cliente escribe `clientFilters` (multiselect ⇒ filtra por inclusión).
  onFilterSelect(col, value, multi) {
    if (this.serverSide) {
      const next = value ?? (multi ? [] : "");
      this.setServerFilter(col.key, next);
      this.emit("filterChange", { col: col.key, value: next });
      return;
    }
    if (multi) {
      const arr = Array.isArray(value) ? value.map((v3) => String(v3)) : value != null && value !== "" ? [String(value)] : [];
      this.setClientFilter(col.key, { values: arr.length ? new Set(arr) : void 0 });
    } else {
      const v3 = String(value ?? "");
      this.setClientFilter(col.key, { values: v3 ? /* @__PURE__ */ new Set([v3]) : void 0 });
    }
  }
  onInlineRange(col, edge, ev) {
    const v3 = ev.target.value ?? "";
    if (this.serverSide) {
      this.setServerRangeEdge(col.key, edge, v3);
      this.emit("filterChange", { col: col.key, value: { [edge]: v3 } });
      return;
    }
    this.setClientFilter(col.key, { [edge]: v3 || void 0 });
  }
  // Menú overflow: ancla el popover al botón vía el evento de click (compatible con Shadow DOM).
  openMenu(ev) {
    this.menuEv = ev;
    this.menuOpen = true;
  }
  /** #122 — Abre el menú «⋮» de UNA fila. Un solo popover para toda la tabla (uno por fila serían
   *  tantos como filas), anclado por evento porque `trigger` no resuelve dentro de Shadow DOM. */
  openRowMenu(ev, row) {
    ev.stopPropagation();
    this.rowMenuEv = ev;
    this.rowMenuRow = row;
    this.rowMenuOpen = true;
  }
  /** #122 — Las mismas acciones de la fila, como lista. Respeta `disabled`/`loading` por fila: una
   *  acción que no se puede pulsar en su botón tampoco se puede pulsar aquí. */
  renderRowMenu() {
    const row = this.rowMenuRow;
    if (!this.actions.length || !row) return A;
    const key = this.keyOf(row);
    return b2`
      <ion-popover
        class="row-menu"
        .isOpen=${this.rowMenuOpen}
        .event=${this.rowMenuEv}
        dismiss-on-select="true"
        @didDismiss=${() => this.rowMenuOpen = false}
      >
        <ion-content>
          <ion-list lines="none">
            ${this.actions.map((a3) => {
      const disabled = a3.loading?.(row) === true || a3.disabled?.(row) === true;
      const label = typeof a3.label === "function" ? a3.label(row) : a3.label;
      return b2`
                <!-- #143 — The action is named the SAME collapsed or not, so one spec works at any
                     width. It carries the hook only while the direct buttons are NOT there: the
                     popover survives its dismissal («rowMenuRow» is not cleared), and if the table
                     widened again there would be TWO elements with the hook and «getByTestId»
                     would pick one at random. -->
                <ion-item
                  button
                  data-testid=${this.rowActionsCollapsed ? this.tid(`row-${key}-${a3.id}`) : A}
                  ?disabled=${disabled}
                  aria-disabled=${disabled ? "true" : A}
                  .detail=${false}
                  @click=${() => {
        if (disabled) return;
        this.rowMenuOpen = false;
        this.emit("rowAction", { actionId: a3.id, row });
      }}
                >
                  ${a3.icon ? b2`<ion-icon slot="start" .icon=${okIcon(a3.icon)} color=${a3.color ?? A}></ion-icon>` : A}
                  <ion-label color=${a3.color ?? A}>${label}</ion-label>
                </ion-item>
              `;
    })}
          </ion-list>
        </ion-content>
      </ion-popover>
    `;
  }
  // Aplica la vista inicial declarada (`default-view`) una sola vez, tras el primer render. Es la
  // forma robusta de arrancar en tarjetas sin depender de fijar `viewMode` por referencia (que
  // falla si la tabla monta detrás de un `v-if`/loading y el ref aún es null).
  firstUpdated() {
    this.applyInitialView();
  }
  /** Re-evalúa la vista inicial cada render mientras el usuario no haya elegido a mano.
   *
   * `firstUpdated` NO basta: decide una sola vez, y los consumidores que asignan las props por JS
   * DESPUÉS de insertar el elemento —lo normal en páginas renderizadas por el servidor— llegan
   * tarde. En ese momento `cardViewEnabled` aún era `false`, así que no se conmutaba; y el
   * listener de `matchMedia` solo dispara al CAMBIAR el viewport, cosa que en un móvil no pasa
   * nunca. La tabla se quedaba con scroll lateral para siempre.
   *
   * Medido en Android contra producción el 2026-08-02 con el bundle ya actualizado:
   *   `views` antes de insertar  → tarjetas
   *   `views` después de insertar → tabla   ← lo que hace la página
   */
  willUpdate(changed) {
    this.applyInitialView();
    if (changed.has("filterValues")) this.serverFilters = { ...this.filterValues ?? {} };
    if (changed.has("search") && this.search !== void 0) {
      this.q = this.search;
      if (!this.serverSide) {
        this.clientPage = 0;
        this.mobileShown = 0;
      }
    }
    if (!this.serverSide && changed.has("rows") && this.mobileShown !== 0) this.mobileShown = 0;
  }
  applyInitialView() {
    if (this.viewChosenByUser) return;
    if (this.isMobile && this.cardViewEnabled) {
      this.viewMode = "cards";
    } else if (this.defaultView === "cards" && this.cardViewEnabled) {
      this.viewMode = "cards";
    } else if (this.defaultView === "table") {
      this.viewMode = "table";
    }
  }
  setViewMode(mode) {
    this.viewChosenByUser = true;
    if (this.viewMode === mode) return;
    this.viewMode = mode;
    this.emit("viewChange", mode);
  }
  // Control de filtro de una columna, con componentes Ionic (mismos inputs que el form de alta).
  renderFilterControl(col) {
    if (!col.filterable) return A;
    const type = col.filterType ?? "text";
    const f3 = this.filterStateOf(col.key);
    if (type === "select" || type === "multiselect") {
      const multi = type === "multiselect";
      const opts = col.options ?? this.distinctValues(col).map((v3) => ({ value: v3, label: v3 }));
      const current = this.selectValue(f3, multi);
      return b2`
        <ion-select
          label=${col.header}
          label-placement="stacked"
          fill="outline" mode="md"
          ?multiple=${multi}
          interface="modal"
          .interfaceOptions=${{ cssClass: "ok-overlay" }}
          placeholder=${this.t.select}
          .value=${current}
          @ionChange=${(e6) => this.onFilterSelect(col, e6.detail.value, multi)}
        >
          ${multi ? A : b2`<ion-select-option value="">${this.t.select}</ion-select-option>`}
          ${opts.map((o7) => b2`<ion-select-option value=${o7.value}>${o7.label}</ion-select-option>`)}
        </ion-select>
      `;
    }
    if (type === "range" || type === "daterange") {
      const t5 = type === "daterange" ? "date" : "number";
      const onEdge = type === "daterange" ? this.onDateRangeInput.bind(this) : this.onRangeInput.bind(this);
      return b2`
        <div class="fblock">
          <span class="flabel">${col.header}</span>
          <div class="frange">
            <ion-input type=${t5} fill="outline" mode="md" placeholder=${type === "daterange" ? this.t.from : this.t.gte}
              .value=${f3?.from ?? ""}
              @ionInput=${(e6) => onEdge(col, "from", e6)}></ion-input>
            <ion-input type=${t5} fill="outline" mode="md" placeholder=${type === "daterange" ? this.t.to : this.t.lte}
              .value=${f3?.to ?? ""}
              @ionInput=${(e6) => onEdge(col, "to", e6)}></ion-input>
          </div>
        </div>
      `;
    }
    const inputType = type === "number" ? "number" : type === "date" ? "date" : "text";
    return b2`
      <ion-input
        type=${inputType}
        fill="outline" mode="md"
        label=${col.header}
        label-placement="stacked"
        placeholder=${this.t.filterPlaceholder}
        .value=${this.selectValue(f3, false)}
        @ionInput=${(e6) => this.onFilterInput(col, e6)}
      ></ion-input>
    `;
  }
  /** Valor para un control de un solo valor (`ion-select`/`ion-input`) o multi (`ion-select
   *  multiple`) a partir del estado de filtro interno. '' / [] = sin filtro. */
  selectValue(f3, multi) {
    const values = [...f3?.values ?? /* @__PURE__ */ new Set()];
    if (multi) return values;
    return values.length ? values[0] : "";
  }
  // Controles de filtro COMPACTOS para la toolbar (modo `inlineFilters`). Solo select y rango de
  // fechas (los del screenshot); el resto de tipos siguen disponibles vía el drawer si no se activa
  // `inlineFilters`. Look: «Todos los Estados» (placeholder) / «01/10/25 → 18/10/25».
  renderInlineFilters() {
    const cols = this.filterColumns.filter((c5) => {
      const t5 = c5.filterType ?? "text";
      return t5 === "select" || t5 === "multiselect" || t5 === "date" || t5 === "daterange";
    });
    if (!cols.length) return A;
    return b2`${cols.map((c5) => this.renderInlineFilter(c5))}`;
  }
  renderInlineFilter(col) {
    const type = col.filterType ?? "text";
    const f3 = this.filterStateOf(col.key);
    if (type === "select" || type === "multiselect") {
      const multi = type === "multiselect";
      const opts = col.options ?? this.distinctValues(col).map((v3) => ({ value: v3, label: v3 }));
      const current = this.selectValue(f3, multi);
      return b2`
        <ion-select
          class="tk-filter"
          ?multiple=${multi}
          interface="modal"
          .interfaceOptions=${{ cssClass: "ok-overlay" }}
          aria-label=${col.header}
          placeholder=${col.header}
          .value=${current}
          @ionChange=${(e6) => this.onFilterSelect(col, e6.detail.value, multi)}
        >
          ${multi ? A : b2`<ion-select-option value="">${col.header}</ion-select-option>`}
          ${opts.map((o7) => b2`<ion-select-option value=${o7.value}>${o7.label}</ion-select-option>`)}
        </ion-select>
      `;
    }
    return b2`
      <span class="tk-daterange" role="group" aria-label=${col.header}>
        <ion-icon .icon=${iconCalendarOutline}></ion-icon>
        <ion-input type="date" aria-label=${this.t.fromOf.replace("{label}", col.header)} .value=${f3?.from ?? ""} @ionChange=${(e6) => this.onInlineRange(col, "from", e6)}></ion-input>
        <span class="arr">→</span>
        <ion-input type="date" aria-label=${this.t.toOf.replace("{label}", col.header)} .value=${f3?.to ?? ""} @ionChange=${(e6) => this.onInlineRange(col, "to", e6)}></ion-input>
      </span>
    `;
  }
  // Menú overflow («⋮») con ion-popover anclado por evento (Shadow-DOM-safe).
  renderOverflowMenu() {
    if (!this.menuActions.length) return A;
    return b2`
      <ion-button class="toolbtn" fill="clear" aria-label=${this.t.moreActions} @click=${(e6) => this.openMenu(e6)}>
        <ion-icon slot="icon-only" .icon=${iconEllipsisVertical}></ion-icon>
      </ion-button>
      <ion-popover
        .isOpen=${this.menuOpen}
        .event=${this.menuEv}
        dismiss-on-select="true"
        @didDismiss=${() => this.menuOpen = false}
      >
        <ion-content>
          <ion-list lines="none">
            ${this.menuActions.map(
      (a3) => b2`
                <ion-item button .detail=${false} @click=${() => {
        this.menuOpen = false;
        this.emit("menuAction", { actionId: a3.id });
      }}>
                  ${a3.icon ? b2`<ion-icon slot="start" .icon=${okIcon(a3.icon)} color=${a3.color ?? A}></ion-icon>` : A}
                  <ion-label color=${a3.color ?? A}>${a3.label}</ion-label>
                </ion-item>
              `
    )}
          </ion-list>
        </ion-content>
      </ion-popover>
    `;
  }
  // Row action buttons, shared by the table and the card views.
  //
  // `collapsible` = the LIST view, the only one that folds its buttons into a "⋮" menu when the
  // columns leave it no width (#122). The CARD view does not fold; it WRAPS instead, see
  // `.ractions .actions` in the stylesheet.
  //
  // This comment used to claim that a card's actions "always fit across the card". They do not,
  // and nobody had measured it (#132 / ERPlora/appointments#154): with the eight actions an
  // appointment carries, the row asks for 380px and the card gives 379px at 411dp, 237px at 768px
  // and 272px at 1440px — so the first button hung off the card at ALL THREE widths, not just on
  // a phone. If you add a view that lays these buttons out, MEASURE it.
  actionButtons(row, collapsible = false) {
    if (!this.actions.length) return A;
    const key = this.keyOf(row);
    if (collapsible && this.rowActionsCollapsed) {
      return b2`
        <div class="actions">
          <ion-button
            size="small"
            fill="clear"
            color="medium"
            data-testid=${this.tid(`row-${key}-menu`)}
            aria-label=${this.t.moreActions}
            title=${this.t.moreActions}
            aria-haspopup="menu"
            @click=${(e6) => this.openRowMenu(e6, row)}
          >
            <ion-icon slot="icon-only" .icon=${okIcon(iconEllipsisVertical)}></ion-icon>
          </ion-button>
        </div>
      `;
    }
    return b2`
      <div class="actions">
        ${this.actions.map(
      (a3) => {
        const loading = a3.loading?.(row) === true;
        const disabled = loading || a3.disabled?.(row) === true;
        const label = typeof a3.label === "function" ? a3.label(row) : a3.label;
        return b2`
            <ion-button
              size="small"
              fill="clear"
              color=${a3.color ?? "medium"}
              data-testid=${this.tid(`row-${key}-${a3.id}`)}
              ?disabled=${disabled}
              aria-disabled=${disabled ? "true" : A}
              aria-label=${label}
              title=${label}
              @click=${() => this.emit("rowAction", { actionId: a3.id, row })}
            >
              ${loading ? b2`<ion-spinner slot="icon-only" name="dots"></ion-spinner>` : a3.icon ? b2`<ion-icon slot="icon-only" .icon=${okIcon(a3.icon)}></ion-icon>` : label}
            </ion-button>
          `;
      }
    )}
      </div>
    `;
  }
  // Botón de barra icon-only (filtros / alta / conmutador de vista). `on` = estado activo.
  // `badge` opcional → contador (p.ej. nº de filtros activos), look del Hub.
  toolButton(icon, on, onClick, label, badge, testid = A) {
    return b2`
      <ion-button class="toolbtn" size="small" fill=${on ? "solid" : "outline"} data-testid=${testid} title=${label} aria-label=${label} @click=${onClick}>
        <ion-icon slot="icon-only" .icon=${okIcon(icon)}></ion-icon>
        ${badge && badge > 0 ? b2`<span class="badge">${badge}</span>` : A}
      </ion-button>
    `;
  }
  /** Plantilla de columnas del grid de la vista lista: [checkbox] [columnas…] [acciones]. */
  gridTemplate() {
    return [
      this.selectable ? "2.75rem" : null,
      // #120 - 5.5rem (88px) is the narrowest a data column can be and stay readable: ~11
      // characters at 14px, plus the ellipsis `.gcell > span` already applies. With the previous
      // floor (8rem = 128px) the six columns of a bookings list did not fit the counter tablet
      // (128x6 + 188 for actions + gaps = 1036px against 834) and the pinned column ended up on
      // top of the data. With 5.5rem they fit (796px) and `1fr` stretches them to 94px each.
      ...this.visibleColumns.map((c5) => c5.width ?? "minmax(5.5rem,1fr)"),
      // #121 - a LENGTH, not `max-content`. The header and every row are separate grids that
      // share this string, and a content-sized track is not a length: each grid resolves it
      // against ITS OWN content - the word "ACCIONES" (62.83px) in the header, four buttons
      // (188px) in the row. The leftover the `1fr` columns share then differed between the two,
      // and the header slid right, up to 125px by the last column (measured at 834px).
      // `actionsTrackPx` is the width of the buttons MEASURED on screen, so it also keeps #120's
      // contract: the track never shrinks under its content (an `auto` track collapsed to 16px
      // and the buttons spilled over the neighbouring column). Until the first measurement lands
      // - one frame - `max-content` reserves the same room it always did.
      this.actions.length ? this.actionsTrackPx > 0 ? `${this.actionsTrackPx}px` : "max-content" : null
    ].filter(Boolean).join(" ");
  }
  /** Lista de páginas a mostrar en el pager numerado (1-based): primera, última, vecinas de la
   *  actual y «…» donde haya saltos. P.ej. en página 1 de 52 → [1,2,3,'…',52]. */
  pageList(cur1, total) {
    if (total <= 7) return Array.from({ length: total }, (_2, i7) => i7 + 1);
    const want = /* @__PURE__ */ new Set([1, total, cur1, cur1 - 1, cur1 + 1]);
    if (cur1 <= 3) [2, 3].forEach((p4) => want.add(p4));
    if (cur1 >= total - 2) [total - 1, total - 2].forEach((p4) => want.add(p4));
    const sorted = [...want].filter((p4) => p4 >= 1 && p4 <= total).sort((a3, b3) => a3 - b3);
    const out = [];
    let prev = 0;
    for (const p4 of sorted) {
      if (p4 - prev > 1) out.push("\u2026");
      out.push(p4);
      prev = p4;
    }
    return out;
  }
  render() {
    const ps = this.serverSide ? this.pageSize : this.clientPageSize || this.pageSize;
    let visible;
    let pages;
    let current;
    let count;
    if (this.serverSide) {
      visible = this.rows;
      count = this.total;
      pages = Math.max(1, Math.ceil(this.total / ps));
      current = Math.min(this.page, pages - 1);
    } else {
      const filtered = this.clientFiltered;
      count = filtered.length;
      pages = Math.max(1, Math.ceil(filtered.length / ps));
      current = Math.min(this.clientPage, pages - 1);
      visible = this.isMobile ? filtered.slice(0, Math.min(this.mobileShown || ps, count)) : filtered.slice(current * ps, current * ps + ps);
    }
    const served = this.serverSide ? (current + 1) * ps : Math.min(this.mobileShown || ps, count);
    const canLoadMore = this.isMobile && served < count;
    const loadMore = () => {
      if (this.serverSide) this.emit("pageChange", current + 1);
      else this.mobileShown = Math.min((this.mobileShown || ps) + ps, count);
    };
    const goTo = (p4) => {
      if (this.serverSide) this.emit("pageChange", p4);
      else this.clientPage = p4;
    };
    const setPageSize = (n6) => {
      if (this.serverSide) this.emit("pageSizeChange", n6);
      else {
        this.clientPageSize = n6;
        this.clientPage = 0;
        this.mobileShown = 0;
      }
    };
    const searchbar = b2`<ion-searchbar class="ion-no-border" data-testid=${this.tid("search")} .value=${this.q} placeholder=${this.effSearchPlaceholder} debounce="250" @ionInput=${this.onSearch}></ion-searchbar>`;
    const selCount = this.selection.size;
    const showTopbar = !!this.title || this.hasSearch || this.viewToggle || this.effColumnPicker || this.effExport || this.effImport || this.hasFilterRow || this.addable || !!this.primaryAction;
    return b2`
      <div class=${`card${this.panel !== "none" ? " has-panel" : ""}`}>
        ${showTopbar ? b2`
              <div class="bar">
                <div class="bar-main">
                  ${this.title ? b2`<div class="title-wrap"><h2 class="title">${this.title}</h2><span class="title-count">${count}</span></div>` : A}
                  ${this.hasSearch ? b2`<div class="search">${searchbar}</div>` : A}
                  ${this.inlineFilters ? this.renderInlineFilters() : A}
                  <span class="tk-spacer"></span>
                    ${this.effColumnPicker && !this.isMobile ? b2`
                          <ion-select
                            class="tk-cols"
                            multiple
                            interface="popover"
                            aria-label=${this.t.columnsVisible}
                            .value=${this.visibleColumns.map((c5) => c5.key)}
                            .selectedText=${this.t.columns}
                            @ionChange=${(e6) => this.setVisibleColumns(e6.detail.value)}
                          >
                            ${this.columns.map((c5) => b2`<ion-select-option value=${c5.key}>${c5.header}</ion-select-option>`)}
                          </ion-select>
                        ` : A}
                    ${this.effPageSizes.length && !this.isMobile ? b2`
                          <ion-select
                            class="tk-psize"
                            interface="popover"
                            aria-label=${this.t.rowsPerPage}
                            .value=${ps}
                            @ionChange=${(e6) => setPageSize(Number(e6.detail.value))}
                          >
                            ${this.effPageSizes.map((n6) => b2`<ion-select-option .value=${n6}>${n6}</ion-select-option>`)}
                          </ion-select>
                        ` : A}
                    ${this.viewToggle ? b2`
                          <span class="viewseg">
                            ${this.toolButton("list-outline", this.viewMode === "table", () => this.setViewMode("table"), this.t.viewList)}
                            ${this.toolButton("grid-outline", this.viewMode === "cards", () => this.setViewMode("cards"), this.t.viewCards)}
                          </span>
                        ` : A}
                    ${this.hasFilterRow && !this.inlineFilters ? this.toolButton("funnel-outline", this.panel === "filters" || this.activeFilterCount > 0, () => this.toggle("filters"), this.t.filters, this.activeFilterCount) : A}
                    ${this.effImport ? b2`
                          ${this.toolButton("cloud-upload-outline", false, () => this.renderRoot.querySelector(".tk-file")?.click(), this.t.importCsv)}
                          <!-- #143 — The import hook goes on the INPUT, not on the button that
                               triggers it: what a spec drives is «setInputFiles», and nobody opens
                               the button's native dialog from a test. Same criterion as
                               «GrantFilePicker.vue» in the Hub (the hook goes on the control, not
                               on its disguise). -->
                          <input class="tk-file" data-testid=${this.tid("csv-import")} type="file" accept=".csv,text/csv" hidden @change=${(e6) => this.onImportFile(e6)} />
                        ` : A}
                    ${this.effExport ? this.toolButton("download-outline", false, () => this.exportCsv(), this.t.exportCsv, void 0, this.tid("csv-export")) : A}
                    <!-- #113 — Mismo botón en los dos viewports: la acción principal de la pantalla
                         se lee, no se adivina. En escritorio era un «+» de 36px idéntico a los
                         iconos de vista/filtrar/exportar, y era el último de cuatro. -->
                    ${this.addable ? b2`
                          <ion-button class="primary-btn add-btn" data-testid=${this.tid("add")} size="small" @click=${() => this.toggle("create")}>
                            <ion-icon slot="start" .icon=${okIcon("add")}></ion-icon>${this.t.add}
                          </ion-button>
                        ` : A}
                    ${this.renderOverflowMenu()}
                    ${this.primaryAction ? b2`
                          <!-- #143 — Its own hook and NOT «-add»: «addable» and «primaryAction» are
                               two different buttons that may coexist, and both are really used
                               («addable» in the modules, «primaryAction» in the SaaS screens).
                               Sharing the name would give two elements with the same hook as soon
                               as a screen declared both. -->
                          <ion-button class="primary-btn add-btn" data-testid=${this.tid("primary-action")} size="small" @click=${() => this.emit("primaryAction", {})}>
                            <ion-icon slot="start" .icon=${okIcon(this.primaryAction.icon ?? "add")}></ion-icon>${this.primaryAction.label}
                          </ion-button>
                        ` : A}
                    <!-- El módulo proyecta aquí acciones globales adicionales. -->
                    <slot name="toolbar"></slot>
                </div>
                ${this.selectable && selCount > 0 ? b2`
                      <div class="selbar">
                        <strong>${this.t.selected.replace("{n}", String(selCount))}</strong>
                        <button class="sel-clear" @click=${() => this.setSelection(/* @__PURE__ */ new Set())}>
                          <ion-icon .icon=${iconClose} style="font-size:14px"></ion-icon> ${this.t.clear}
                        </button>
                      </div>
                    ` : A}
              </div>
            ` : A}

        ${this.viewMode === "cards" && this.cardViewEnabled ? this.renderCards(visible) : this.renderTable(visible)}

        ${pages > 1 || this.effPageSizes.length ? b2`
              <div class="pager">
                <div class="left">
                  <span>
                    ${pages > 1 ? b2`${this.t.showing.replace("{from}", String(this.isMobile && !this.serverSide ? 1 : current * ps + 1)).replace("{to}", String(Math.min(served, count)))} ` : A}
                    <span class="strong">${count}</span> ${count === 1 ? this.t.recordSingular : this.t.recordPlural}
                  </span>
                  ${!showTopbar && this.effPageSizes.length ? b2`
                        <select class="psize" @change=${(e6) => setPageSize(Number(e6.target.value))}>
                          ${this.effPageSizes.map((n6) => b2`<option value=${n6} ?selected=${n6 === ps}>${this.t.perPageShort.replace("{n}", String(n6))}</option>`)}
                        </select>
                      ` : A}
                </div>
                ${this.isMobile ? canLoadMore ? b2`<ion-button class="load-more" data-testid=${this.tid("load-more")} size="small" @click=${loadMore}>${this.t.loadMore}</ion-button>` : A : pages > 1 ? b2`
                      <div class="nav">
                        <ion-button size="small" fill="clear" data-testid=${this.tid("page-prev")} ?disabled=${current === 0} @click=${() => goTo(current - 1)}><ion-icon slot="icon-only" .icon=${iconChevronBack}></ion-icon></ion-button>
                        ${this.pageList(current + 1, pages).map(
      (p4) => p4 === "\u2026" ? b2`<span class="pgap">…</span>` : b2`<button class=${`pnum${p4 === current + 1 ? " on" : ""}`} @click=${() => goTo(p4 - 1)}>${p4}</button>`
    )}
                        <ion-button size="small" fill="clear" data-testid=${this.tid("page-next")} ?disabled=${current >= pages - 1} @click=${() => goTo(current + 1)}><ion-icon slot="icon-only" .icon=${iconChevronForward}></ion-icon></ion-button>
                      </div>
                    ` : A}
              </div>
            ` : A}

        ${this.panel !== "none" ? this.renderDrawer() : A}
      </div>
    `;
  }
  // Panel lateral derecho DENTRO de la tabla (no empuja contenido; igual en lista y tarjetas).
  renderDrawer() {
    const isFilters = this.panel === "filters";
    const clientFilters = isFilters && !this.serverSide;
    return b2`
      <div class="tk-scrim" @click=${() => this.close()}></div>
      <aside class="drawer" role="dialog" aria-label=${isFilters ? this.t.filters : this.t.form}>
        <header class="dh">
          <strong>${isFilters ? this.t.filters : this.t.newRecord}</strong>
          <ion-button fill="clear" size="small" aria-label=${this.t.close} @click=${() => this.close()}><ion-icon slot="icon-only" .icon=${iconClose}></ion-icon></ion-button>
        </header>
        <div class="db">
          ${isFilters ? clientFilters ? this.filterColumns.map((c5) => this.renderClientFilter(c5)) : this.filterColumns.map((c5) => b2`<div class="fblock">${this.renderFilterControl(c5)}</div>`) : b2`<slot name="create"></slot>`}
        </div>
        ${clientFilters ? b2`
              <footer class="df">
                <button class="sel-clear df-clear" ?disabled=${Object.keys(this.filterDraft).length === 0} @click=${() => this.clearFilters()}>${this.t.clear}</button>
                <ion-button class="primary-btn" size="small" @click=${() => this.applyFilters()}>${this.t.apply}</ion-button>
              </footer>
            ` : A}
      </aside>
    `;
  }
  // Control de filtro CLIENTE de una columna: chips multi-select (select) o rango de fechas.
  renderClientFilter(col) {
    const label = col.header;
    if (col.filterType === "daterange" || col.filterType === "date") {
      const f3 = this.filterDraft[col.key] ?? {};
      return b2`
        <div class="fblock">
          <span class="flabel">${label}</span>
          <div class="daterange">
            <ion-input type="date" label=${this.t.from} label-placement="stacked" fill="outline" mode="md" .value=${f3.from ?? ""} @ionChange=${(e6) => this.setFilterRange(col.key, "from", e6.detail.value ?? "")}></ion-input>
            <ion-input type="date" label=${this.t.to} label-placement="stacked" fill="outline" mode="md" .value=${f3.to ?? ""} @ionChange=${(e6) => this.setFilterRange(col.key, "to", e6.detail.value ?? "")}></ion-input>
          </div>
        </div>
      `;
    }
    const opts = col.options ?? this.distinctValues(col).map((v3) => ({ value: v3, label: v3 }));
    const selected = [...this.filterDraft[col.key]?.values ?? /* @__PURE__ */ new Set()];
    return b2`
      <div class="fblock">
        <ion-select
          label=${label}
          label-placement="stacked"
          fill="outline" mode="md"
          multiple
          interface="modal"
          .interfaceOptions=${{ cssClass: "ok-overlay" }}
          placeholder=${this.t.select}
          .value=${selected}
          @ionChange=${(e6) => this.setFilterValues(col.key, e6.detail.value ?? [])}
        >
          ${opts.length === 0 ? b2`<ion-select-option .disabled=${true} value="">${this.t.noValues}</ion-select-option>` : opts.map((o7) => b2`<ion-select-option value=${o7.value}>${o7.label}</ion-select-option>`)}
        </ion-select>
      </div>
    `;
  }
  /** #67 — Enter/Espacio activan la fila clicable (y, desde #74, la tarjeta): si se llega con el
   *  tabulador, el ratón no puede ser el único camino. Espacio además NO debe desplazar la página. */
  onRowKeydown(e6, row) {
    if (e6.key !== "Enter" && e6.key !== " " && e6.key !== "Spacebar") return;
    e6.preventDefault();
    this.emit("rowClick", { row });
  }
  emptyState() {
    return b2`
      <div class="empty">
        <span class="empty-ic"><ion-icon .icon=${iconFileTrayOutline}></ion-icon></span>
        <span>${this.effEmptyMessage}</span>
      </div>
    `;
  }
  // Vista LISTA en CSS GRID (no <table>): permite ancho por columna y cabecera sticky.
  renderTable(visible) {
    if (visible.length === 0) return this.emptyState();
    const cols = this.visibleColumns;
    const tpl = { gridTemplateColumns: this.gridTemplate() };
    const allOn = this.selectable && visible.length > 0 && visible.every((r6) => this.selection.has(this.keyOf(r6)));
    const alignCls = (a3) => a3 === "right" ? "right" : a3 === "center" ? "center" : "left";
    return b2`
      <div class=${`scroll${this.xOverflow ? " x-overflow" : ""}`}>
        <div class="grid" role="table">
          <!-- Cabecera -->
          <div class="grow ghead" role="row" style=${o6(tpl)}>
            ${this.selectable ? b2`<span class="selcb"><ion-checkbox .checked=${allOn} aria-label=${this.t.selectAll} @ionChange=${() => this.toggleAll(visible)}></ion-checkbox></span>` : A}
            ${cols.map((c5) => {
      const sortable = this.isSortable(c5);
      const active = sortable && (this.serverSide ? this.sort === c5.key : this.clientSort === c5.key);
      const dir = this.serverSide ? this.sortDir : this.clientSortDir;
      const caretIcon = !active ? iconSwapVerticalOutline : dir === "asc" ? iconChevronUpOutline : iconChevronDownOutline;
      return b2`
                <div
                  class=${`gcell gh ${alignCls(c5.align)}${sortable ? " sortable" : ""}${c5.pinned === "end" ? " actions-col" : ""}`}
                  role="columnheader"
                  @click=${() => this.onHeaderClick(c5)}
                >
                  <span>${c5.header}</span>
                  ${sortable ? b2`<span class=${`caret${active ? " on" : ""}`}><ion-icon .icon=${okIcon(caretIcon)}></ion-icon></span>` : A}
                </div>
              `;
    })}
            ${this.actions.length ? b2`<div class="gcell gh right actions-col" role="columnheader">
                  ${this.rowActionsCollapsed ? b2`<span class="sr-only">${this.t.actions}</span>` : b2`<span>${this.t.actions}</span>`}
                </div>` : A}
          </div>

          <!-- Filas -->
          ${c4(
      visible,
      (row) => this.keyOf(row),
      (row) => {
        const key = this.keyOf(row);
        const selected = this.selectable && this.selection.has(key);
        return b2`
                <div
                  class=${`grow grow-data${selected ? " selected" : ""}${this.rowClickable ? " clickable" : ""}`}
                  role="row"
                  data-testid=${this.tid(`row-${key}`)}
                  style=${o6(tpl)}
                  tabindex=${this.rowClickable ? "0" : A}
                  @click=${this.rowClickable ? () => this.emit("rowClick", { row }) : A}
                  @keydown=${this.rowClickable ? (e6) => this.onRowKeydown(e6, row) : A}
                >
                  ${this.selectable ? b2`<span class="selcb" @click=${(e6) => e6.stopPropagation()}><ion-checkbox .checked=${selected} aria-label=${this.t.selectRow} @ionChange=${() => this.toggleRow(key)}></ion-checkbox></span>` : A}
                  ${cols.map(
          (c5) => b2`<div class=${`gcell ${alignCls(c5.align)}${c5.pinned === "end" ? " actions-col" : ""}`} role="cell">${c5.render ? c5.render(row) : b2`<span>${this.cell(c5, row)}</span>`}</div>`
        )}
                  ${this.actions.length ? b2`<div class="gcell right actions-col" role="cell" @click=${(e6) => e6.stopPropagation()}>${this.actionButtons(row, true)}</div>` : A}
                </div>
              `;
      }
    )}
        </div>
      </div>
      ${this.renderRowMenu()}
    `;
  }
  renderCards(visible) {
    if (visible.length === 0) return this.emptyState();
    const hasHead = !!this.cardTitle || !!this.cardIcon || this.selectable;
    return b2`
      <div class="cards-grid">
        ${c4(
      visible,
      (row) => this.keyOf(row),
      (row) => {
        const key = this.keyOf(row);
        const selected = this.selectable && this.selection.has(key);
        const icon = this.cardIcon?.(row);
        return b2`
              <ion-card
                class=${`rcard${selected ? " selected" : ""}${this.rowClickable ? " clickable" : ""}`}
                data-testid=${this.tid(`row-${key}`)}
                role=${this.rowClickable ? "button" : A}
                tabindex=${this.rowClickable ? "0" : A}
                @click=${this.rowClickable ? () => this.emit("rowClick", { row }) : A}
                @keydown=${this.rowClickable ? (e6) => this.onRowKeydown(e6, row) : A}
              >
                ${hasHead ? b2`
                      <ion-card-header class="rcard-head">
                        ${icon != null && icon !== "" ? b2`<span class="rc-icon">${typeof icon === "string" ? b2`<ion-icon .icon=${okIcon(icon)}></ion-icon>` : icon}</span>` : A}
                        <span class="rc-title">${this.cardTitle ? this.cardTitle(row) : A}</span>
                        ${this.selectable ? b2`<ion-checkbox .checked=${selected} aria-label=${this.t.select} @click=${(e6) => e6.stopPropagation()} @ionChange=${() => this.toggleRow(key)}></ion-checkbox>` : A}
                      </ion-card-header>
                    ` : A}
                <ion-card-content class="rcard-body">
                  ${this.renderCard ? this.renderCard(row) : this.visibleColumns.map(
          (c5) => b2`<div class="rrow"><span class="rk">${c5.header}</span><span class="rv">${c5.render ? c5.render(row) : this.cell(c5, row)}</span></div>`
        )}
                </ion-card-content>
                ${this.actions.length ? b2`<div class="ractions" @click=${(e6) => e6.stopPropagation()}>${this.actionButtons(row)}</div>` : A}
              </ion-card>
            `;
      }
    )}
      </div>
    `;
  }
};
__decorateClass2([
  n4({ attribute: false })
], _OkDataTable.prototype, "columns");
__decorateClass2([
  n4({ attribute: false })
], _OkDataTable.prototype, "rows");
__decorateClass2([
  n4({ attribute: false })
], _OkDataTable.prototype, "searchKeys");
__decorateClass2([
  n4({ attribute: "row-key-field" })
], _OkDataTable.prototype, "rowKeyField");
__decorateClass2([
  n4({ attribute: false })
], _OkDataTable.prototype, "rowKey");
__decorateClass2([
  n4({ type: Number, attribute: "page-size" })
], _OkDataTable.prototype, "pageSize");
__decorateClass2([
  n4({ attribute: "empty-message" })
], _OkDataTable.prototype, "emptyMessage");
__decorateClass2([
  n4({ attribute: "search-placeholder" })
], _OkDataTable.prototype, "searchPlaceholder");
__decorateClass2([
  n4({ attribute: false })
], _OkDataTable.prototype, "labels");
__decorateClass2([
  n4({ attribute: false })
], _OkDataTable.prototype, "actions");
__decorateClass2([
  n4({ type: Boolean })
], _OkDataTable.prototype, "addable");
__decorateClass2([
  n4({ attribute: false })
], _OkDataTable.prototype, "pageSizeOptions");
__decorateClass2([
  n4({ type: Boolean, reflect: true })
], _OkDataTable.prototype, "fill");
__decorateClass2([
  n4({ type: Boolean, attribute: "column-picker" })
], _OkDataTable.prototype, "columnPicker");
__decorateClass2([
  n4({ type: Boolean })
], _OkDataTable.prototype, "csv");
__decorateClass2([
  n4({ attribute: "csv-name" })
], _OkDataTable.prototype, "csvName");
__decorateClass2([
  n4({ type: Boolean, attribute: "server-side" })
], _OkDataTable.prototype, "serverSide");
__decorateClass2([
  n4({ type: Number })
], _OkDataTable.prototype, "total");
__decorateClass2([
  n4({ type: Number })
], _OkDataTable.prototype, "page");
__decorateClass2([
  n4({ type: Boolean })
], _OkDataTable.prototype, "searchable");
__decorateClass2([
  n4({ type: String })
], _OkDataTable.prototype, "search");
__decorateClass2([
  n4({ type: String })
], _OkDataTable.prototype, "sort");
__decorateClass2([
  n4({ attribute: "sort-dir" })
], _OkDataTable.prototype, "sortDir");
__decorateClass2([
  n4({ attribute: false })
], _OkDataTable.prototype, "filterValues");
__decorateClass2([
  n4()
], _OkDataTable.prototype, "title");
__decorateClass2([
  n4({ attribute: false })
], _OkDataTable.prototype, "views");
__decorateClass2([
  n4({ attribute: "default-view" })
], _OkDataTable.prototype, "defaultView");
__decorateClass2([
  n4({ type: Boolean })
], _OkDataTable.prototype, "exportable");
__decorateClass2([
  n4({ type: Boolean })
], _OkDataTable.prototype, "importable");
__decorateClass2([
  n4({ type: Boolean, attribute: "column-selector" })
], _OkDataTable.prototype, "columnSelector");
__decorateClass2([
  n4({ attribute: false })
], _OkDataTable.prototype, "pageSizes");
__decorateClass2([
  n4({ type: Boolean, attribute: "row-clickable" })
], _OkDataTable.prototype, "rowClickable");
__decorateClass2([
  n4({ type: Boolean })
], _OkDataTable.prototype, "selectable");
__decorateClass2([
  n4({ attribute: false })
], _OkDataTable.prototype, "selectedKeys");
__decorateClass2([
  n4({ attribute: false })
], _OkDataTable.prototype, "primaryAction");
__decorateClass2([
  n4({ type: Boolean })
], _OkDataTable.prototype, "inlineFilters");
__decorateClass2([
  n4({ attribute: false })
], _OkDataTable.prototype, "menuActions");
__decorateClass2([
  n4({ attribute: false })
], _OkDataTable.prototype, "cardTitle");
__decorateClass2([
  n4({ attribute: false })
], _OkDataTable.prototype, "cardIcon");
__decorateClass2([
  n4({ attribute: false })
], _OkDataTable.prototype, "renderCard");
__decorateClass2([
  n4({ type: String })
], _OkDataTable.prototype, "testid");
__decorateClass2([
  r5()
], _OkDataTable.prototype, "q");
__decorateClass2([
  r5()
], _OkDataTable.prototype, "clientPage");
__decorateClass2([
  r5()
], _OkDataTable.prototype, "clientPageSize");
__decorateClass2([
  r5()
], _OkDataTable.prototype, "mobileShown");
__decorateClass2([
  r5()
], _OkDataTable.prototype, "clientSort");
__decorateClass2([
  r5()
], _OkDataTable.prototype, "clientSortDir");
__decorateClass2([
  r5()
], _OkDataTable.prototype, "clientFilters");
__decorateClass2([
  r5()
], _OkDataTable.prototype, "filterDraft");
__decorateClass2([
  r5()
], _OkDataTable.prototype, "serverFilters");
__decorateClass2([
  r5()
], _OkDataTable.prototype, "panel");
__decorateClass2([
  r5()
], _OkDataTable.prototype, "viewMode");
__decorateClass2([
  r5()
], _OkDataTable.prototype, "isMobile");
__decorateClass2([
  r5()
], _OkDataTable.prototype, "xOverflow");
__decorateClass2([
  r5()
], _OkDataTable.prototype, "actionsTrackPx");
__decorateClass2([
  r5()
], _OkDataTable.prototype, "rowActionsCollapsed");
__decorateClass2([
  r5()
], _OkDataTable.prototype, "rowMenuOpen");
__decorateClass2([
  r5()
], _OkDataTable.prototype, "hiddenKeys");
__decorateClass2([
  r5()
], _OkDataTable.prototype, "internalSelection");
__decorateClass2([
  r5()
], _OkDataTable.prototype, "menuOpen");
var OkDataTable = _OkDataTable;
define("ok-data-table", OkDataTable);

// @erplora/module-sdk/src/quantity.ts
var QUANTITY_SCALE = 1e6;
function toMicro(quantity) {
  return Math.round(quantity * QUANTITY_SCALE);
}

// @erplora/module-sdk/src/index.ts
var DATA_TABLE_LABELS_ES = {
  search: "Buscar\u2026",
  empty: "Sin resultados",
  filters: "Filtros",
  clear: "Limpiar",
  apply: "Aplicar",
  selected: "{n} seleccionados",
  importCsv: "Importar CSV",
  exportCsv: "Exportar CSV",
  add: "A\xF1adir",
  moreActions: "M\xE1s acciones",
  rowsPerPage: "Filas por p\xE1gina",
  perPageShort: "{n} / p\xE1g.",
  viewList: "Vista lista",
  viewCards: "Vista tarjetas",
  columnsVisible: "Columnas visibles",
  columns: "Columnas",
  actions: "Acciones",
  close: "Cerrar",
  newRecord: "Nuevo",
  form: "Formulario",
  filterPlaceholder: "Filtrar\u2026",
  from: "Desde",
  to: "Hasta",
  fromOf: "{label} desde",
  toOf: "{label} hasta",
  gte: "\u2265",
  lte: "\u2264",
  noValues: "Sin valores",
  selectAll: "Seleccionar todo",
  selectRow: "Seleccionar fila",
  select: "Seleccionar",
  showing: "Mostrando {from}\u2013{to} de",
  recordSingular: "registro",
  recordPlural: "registros",
  loadError: "No se han podido cargar los datos",
  retry: "Reintentar"
};
var DATA_TABLE_LABELS_EN = {
  search: "Search\u2026",
  empty: "No results",
  filters: "Filters",
  clear: "Clear",
  apply: "Apply",
  selected: "{n} selected",
  importCsv: "Import CSV",
  exportCsv: "Export CSV",
  add: "Add",
  moreActions: "More actions",
  rowsPerPage: "Rows per page",
  perPageShort: "{n} / page",
  viewList: "List view",
  viewCards: "Card view",
  columnsVisible: "Visible columns",
  columns: "Columns",
  actions: "Actions",
  close: "Close",
  newRecord: "New",
  form: "Form",
  filterPlaceholder: "Filter\u2026",
  from: "From",
  to: "To",
  fromOf: "{label} from",
  toOf: "{label} to",
  gte: "\u2265",
  lte: "\u2264",
  noValues: "No values",
  selectAll: "Select all",
  selectRow: "Select row",
  select: "Select",
  showing: "Showing {from}\u2013{to} of",
  recordSingular: "record",
  recordPlural: "records",
  loadError: "Couldn't load the data",
  retry: "Retry"
};
function dataTableLabels(locale = "es") {
  return locale.toLowerCase().startsWith("en") ? DATA_TABLE_LABELS_EN : DATA_TABLE_LABELS_ES;
}
function dataTableShowsLoadError() {
  const registry = globalThis.customElements;
  const table = registry?.get("ok-data-table");
  return !!table && "error" in table.prototype;
}
function isEmpty(v3) {
  return v3 === null || v3 === void 0 || v3 === "";
}
var ListController = class {
  constructor(client, queryName, onChange = () => {
  }, opts = {}) {
    this.client = client;
    this.queryName = queryName;
    this.onChange = onChange;
    this.rows = [];
    this.total = 0;
    this.loading = false;
    this.error = "";
    /** Descarta respuestas obsoletas si llegan fuera de orden (race de cargas concurrentes). */
    this.seq = 0;
    this.state = {
      page: 0,
      pageSize: opts.pageSize ?? 50,
      search: "",
      sort: opts.sort,
      dir: opts.dir ?? "asc",
      filters: { ...opts.filters ?? {} },
      context: { ...opts.context ?? {} }
    };
    this.moneyFilters = new Set(opts.moneyFilters ?? []);
    this.quantityFilters = new Set(opts.quantityFilters ?? []);
    if (this.moneyFilters.size > 0 && typeof client.currencyDecimals !== "number") {
      throw new ErploraError(
        "list_money_filters_need_currency_decimals",
        "moneyFilters needs a list client that exposes currencyDecimals"
      );
    }
  }
  /**
   * The filters as the runtime compares them: money and quantity columns scaled from what the
   * person typed to the stored integer. `state.filters` stays as typed, so a table that echoes it
   * back keeps showing «12», not «1200».
   */
  wireFilters() {
    if (this.moneyFilters.size === 0 && this.quantityFilters.size === 0) return this.state.filters;
    const decimals = this.client.currencyDecimals ?? 0;
    const out = {};
    for (const [col, value] of Object.entries(this.state.filters)) {
      const scale = this.moneyFilters.has(col) ? (n6) => majorToMinor(n6, decimals) : this.quantityFilters.has(col) ? toMicro : null;
      out[col] = scale ? scaleFilterValue(value, scale) : value;
    }
    return out;
  }
  /** Nº de páginas según el total del servidor (mínimo 1). */
  get pageCount() {
    return Math.max(1, Math.ceil(this.total / this.state.pageSize));
  }
  /**
   * (Re)loads the current page from the server. On a phone, after «Load more» (hub#2365), the
   * current page is everything shown so far: a refresh brings back pages 0..page in one request.
   */
  async load() {
    const s5 = this.state;
    const mySeq = ++this.seq;
    const paging = mobilePagingOf(this);
    const window2 = nextListWindow(paging, s5);
    this.loading = true;
    this.error = "";
    this.onChange();
    try {
      const page = await this.client.queryPage(this.queryName, {
        limit: window2.limit,
        offset: window2.offset,
        search: s5.search,
        sort: s5.sort,
        dir: s5.dir,
        filters: this.wireFilters(),
        params: s5.context
      });
      if (mySeq !== this.seq) return;
      const rows = page.rows ?? [];
      this.rows = window2.append ? [...this.rows, ...rows] : rows;
      this.total = page.total ?? this.rows.length;
      if (window2.growsTo !== void 0) {
        s5.page = window2.growsTo;
        keepAccumulating(paging, () => void this.load());
      }
    } catch (e6) {
      if (mySeq !== this.seq) return;
      this.rows = [];
      this.total = 0;
      const reason = e6 instanceof Error ? e6.message.trim() : "";
      this.error = tableReadReason(e6, activeLocale()) || reason || listLoadFailedMessage(activeLocale());
    } finally {
      if (mySeq === this.seq) {
        this.loading = false;
        this.onChange();
      }
    }
  }
  /**
   * Goes to `page`. On a phone `<ok-data-table>` has no pager, only «Load more», which asks for
   * `page + 1`: that one is ADDED under the rows already shown (hub#2365). Any other jump replaces.
   */
  setPage(page) {
    const next = Math.max(0, page);
    const paging = mobilePagingOf(this);
    if (next === this.state.page + 1 && phoneViewport()?.matches) {
      paging.growNext = true;
    } else {
      stopAccumulating(paging);
      this.state.page = next;
    }
    void this.load();
  }
  setSort(sort, dir) {
    this.state.sort = sort;
    this.state.dir = dir;
    this.state.page = 0;
    void this.load();
  }
  setSearch(search) {
    this.state.search = search;
    this.state.page = 0;
    void this.load();
  }
  /** Cambia el nº de filas por página y recarga desde la página 0. */
  setPageSize(pageSize) {
    this.state.pageSize = Math.max(1, pageSize);
    this.state.page = 0;
    void this.load();
  }
  /** Aplica/quita un filtro de columna; valores vacíos lo eliminan. Vuelve a la página 0. */
  setFilter(col, value) {
    if (isEmpty(value)) {
      delete this.state.filters[col];
    } else if (typeof value === "object" && value !== null) {
      const prev = this.state.filters[col] ?? {};
      const merged = { ...prev, ...value };
      const cleaned = Object.fromEntries(Object.entries(merged).filter(([, v3]) => !isEmpty(v3)));
      if (Object.keys(cleaned).length === 0) delete this.state.filters[col];
      else this.state.filters[col] = cleaned;
    } else {
      this.state.filters[col] = value;
    }
    this.state.page = 0;
    void this.load();
  }
  /** Fija/actualiza los params de contexto obligatorios (p.ej. al seleccionar el padre).
   *  Vuelve a la página 0 y recarga. Pasa `{}` o keys con valor vacío para limpiar. */
  setContext(context) {
    this.state.context = { ...context };
    this.state.page = 0;
    void this.load();
  }
  reset() {
    this.state.page = 0;
    this.state.search = "";
    this.state.filters = {};
    void this.load();
  }
};
var PHONE_MEDIA = "(max-width: 640px)";
function phoneViewport() {
  const matchMedia = globalThis.matchMedia;
  return typeof matchMedia === "function" ? matchMedia(PHONE_MEDIA) : null;
}
var mobilePaging = /* @__PURE__ */ new WeakMap();
function mobilePagingOf(ctrl) {
  let paging = mobilePaging.get(ctrl);
  if (!paging) {
    paging = { accumulated: false, growNext: false };
    mobilePaging.set(ctrl, paging);
  }
  return paging;
}
function nextListWindow(paging, s5) {
  const size = s5.pageSize;
  const grow = paging.growNext;
  paging.growNext = false;
  if (grow) {
    const target = s5.page + 1;
    if (paging.accumulated || s5.page === 0) {
      return { offset: target * size, limit: size, append: true, growsTo: target };
    }
    return { offset: 0, limit: (target + 1) * size, append: false, growsTo: target };
  }
  if (s5.page === 0) stopAccumulating(paging);
  if (paging.accumulated) return { offset: 0, limit: (s5.page + 1) * size, append: false };
  return { offset: s5.page * size, limit: size, append: false };
}
function keepAccumulating(paging, reload) {
  paging.accumulated = true;
  if (paging.unwatch) return;
  const viewport = phoneViewport();
  if (!viewport?.addEventListener) return;
  const onChange = (e6) => {
    if (e6.matches) return;
    stopAccumulating(paging);
    reload();
  };
  viewport.addEventListener("change", onChange);
  paging.unwatch = () => viewport.removeEventListener?.("change", onChange);
}
function stopAccumulating(paging) {
  paging.accumulated = false;
  paging.unwatch?.();
  paging.unwatch = void 0;
}
function scaleFilterEdge(edge, scale) {
  const text = typeof edge === "string" ? edge.trim().replace(",", ".") : edge;
  if (text === "" || text === null || text === void 0) return "";
  const n6 = Number(text);
  return Number.isFinite(n6) ? scale(n6) : "";
}
function scaleFilterValue(value, scale) {
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([edge, v3]) => [edge, scaleFilterEdge(v3, scale)])
    );
  }
  return scaleFilterEdge(value, scale);
}
var LIST_LOAD_FAILED_EN = "The hub did not return the data.";
var LIST_LOAD_FAILED_ES = "El hub no ha devuelto los datos.";
function listLoadFailedMessage(locale) {
  return locale.toLowerCase().startsWith("en") ? LIST_LOAD_FAILED_EN : LIST_LOAD_FAILED_ES;
}
function createListController(client, queryName, onChange = () => {
}, opts = {}) {
  return new ListController(client, queryName, onChange, opts);
}
var ErploraError = class extends Error {
  constructor(code, message, permission, fields, retryAfterSecs) {
    super(message);
    this.code = code;
    this.permission = permission;
    this.fields = fields;
    this.retryAfterSecs = retryAfterSecs;
    this.name = "ErploraError";
  }
};
var SERVER_UNAVAILABLE = "server_unavailable";
var READ_UNREACHABLE_UNDER_HEADING_EN = "The hub is not responding. Check the connection and try again.";
var READ_UNREACHABLE_UNDER_HEADING_ES = "El hub no responde. Comprueba la conexi\xF3n e int\xE9ntalo de nuevo.";
function tableReadReason(e6, locale) {
  if (e6?.code !== SERVER_UNAVAILABLE || !dataTableShowsLoadError()) return "";
  return locale.toLowerCase().startsWith("en") ? READ_UNREACHABLE_UNDER_HEADING_EN : READ_UNREACHABLE_UNDER_HEADING_ES;
}
function activeLocale() {
  try {
    return localStorage.getItem("erplora.locale") || "es";
  } catch {
    return "es";
  }
}
function majorToMinor(amount, decimals) {
  const n6 = Number(amount);
  return Number.isFinite(n6) ? Math.round(n6 * 10 ** decimals) : 0;
}

// ui/lib/permissions.ts
function readSession() {
  try {
    return JSON.parse(localStorage.getItem("erplora.session") ?? "null") ?? {};
  } catch {
    return {};
  }
}
var isAdminRole = (session) => {
  const role = String(session.role ?? "").toLowerCase();
  return role === "admin" || role === "owner";
};
function sessionCan(sdk, session, permission) {
  if (isAdminRole(session)) return true;
  if (typeof sdk?.hasPermission === "function") {
    try {
      return sdk.hasPermission(permission) === true;
    } catch {
      return false;
    }
  }
  const perms = Array.isArray(session.permissions) ? session.permissions : [];
  return perms.includes("*") || perms.includes(permission);
}

// ui/components/erp-attendance-records/erp-attendance-records.ts
var CATALOG2 = { es: es_default, en: en_default };
function erplora2() {
  const c5 = globalThis.erplora;
  if (!c5) throw new Error("erplora SDK is not initialised by the shell");
  return c5;
}
function usersOf(result) {
  const rows = Array.isArray(result) ? result : result?.rows;
  return Array.isArray(rows) ? rows.filter((u5) => u5 && u5.id) : [];
}
var EXPORT_PAGE = 500;
var TICK_MS = 6e4;
var MONTHS_OFFERED = 49;
var STATUSES = ["open", "closed", "needs_review"];
var STATUS_COLOR = { open: "primary", closed: "medium", needs_review: "warning" };
var MODAL_ERROR_STYLE = "color: var(--ion-color-danger, #c5000f); font-weight: 600";
var LIVE_EVENTS = [
  "attendance.clocked_in",
  "attendance.clocked_out",
  "attendance.break.started",
  "attendance.break.ended",
  "attendance.record.corrected",
  "attendance.record.needs_review"
];
var ErpAttendanceRecords = class extends i3 {
  constructor() {
    super(...arguments);
    this.month = "";
    this.status = "";
    this.userId = "";
    this.users = [];
    this.usersFailed = false;
    this.runningBreaks = [];
    this.breaksFailed = false;
    this.now = Date.now();
    this.exporting = false;
    this.exportError = "";
    this.correcting = null;
    this.history = null;
    this.session = {};
    this.team = false;
    this.canCorrect = false;
    this.lastRows = null;
    this.unsubscribe = [];
  }
  static {
    this.styles = i`
    :host { display: block; color: var(--ion-text-color, #1c1b18); }
    header { display: flex; align-items: center; gap: .5rem; margin-bottom: .75rem; }
    h2 { margin: 0; font-size: 1.15rem; flex: 1; }
    .filters { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; margin-bottom: .75rem; }
    .filters ion-select { flex: 1 1 12rem; max-width: 20rem; }
    .note { margin: .25rem 0 .75rem; color: var(--ion-color-warning-shade, #b26b00); font-size: .9rem; }
    .err { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; margin: .25rem 0 .75rem;
      color: var(--ion-color-danger, #c5000f); font-weight: 600; }
    .err ion-button { --color: var(--ion-color-danger, #c5000f); --border-color: var(--ion-color-danger, #c5000f); }
  `;
  }
  t(key, params) {
    return erplora2().t(CATALOG2, key, params);
  }
  get timezone() {
    return erplora2().timezone || "UTC";
  }
  /** One page of days: the team's or the caller's (literal names: contracts, ADR-0127). */
  pageRecords(params) {
    return this.team ? erplora2().queryPage("attendance.records.list", params) : erplora2().queryPage("attendance.records.mine", params);
  }
  pageBreaks(params) {
    return this.team ? erplora2().queryPage("attendance.breaks.list", params) : erplora2().queryPage("attendance.breaks.mine", params);
  }
  connectedCallback() {
    super.connectedCallback();
    if (!this.ctrl) this.init();
    this.tick = setInterval(() => this.now = Date.now(), TICK_MS);
    const sdk = erplora2();
    if (typeof sdk.on === "function") {
      this.unsubscribe = LIVE_EVENTS.map((ev) => sdk.on(ev, () => void this.ctrl.load()));
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.tick) clearInterval(this.tick);
    this.unsubscribe.forEach((off) => off());
    this.unsubscribe = [];
  }
  init() {
    this.session = readSession();
    this.team = sessionCan(erplora2(), this.session, "attendance.view_all");
    this.canCorrect = sessionCan(erplora2(), this.session, "attendance.correct");
    this.month = monthOf(Date.now(), this.timezone);
    const opts = {
      pageSize: 50,
      sort: "clock_in_at",
      dir: "desc",
      filters: { clock_in_at: monthRange(this.month, this.timezone) }
    };
    const onChange = () => this.onListChange();
    this.ctrl = this.team ? createListController(erplora2(), "attendance.records.list", onChange, opts) : createListController(erplora2(), "attendance.records.mine", onChange, opts);
    void this.ctrl.load();
    if (this.team) void this.loadUsers();
  }
  onListChange() {
    this.requestUpdate();
    if (this.ctrl && !this.ctrl.loading && this.ctrl.rows !== this.lastRows) {
      this.lastRows = this.ctrl.rows;
      void this.refreshRunningBreaks(this.ctrl.rows);
    }
  }
  async loadUsers() {
    try {
      this.users = usersOf(await erplora2().query("hub.users.list"));
      this.usersFailed = false;
    } catch {
      this.users = [];
      this.usersFailed = true;
    }
  }
  /** The running breaks of the open days in `rows`, in one query (see `runningBreaksFrom`). */
  async fetchRunningBreaks(rows) {
    const from = runningBreaksFrom(rows);
    if (from === null) return [];
    const ids = new Set(rows.filter((r6) => r6.status === "open").map((r6) => r6.id));
    const page = await this.pageBreaks({
      limit: EXPORT_PAGE,
      offset: 0,
      filters: { started_at: { from } }
    });
    return (page?.rows ?? []).filter((b3) => ids.has(b3.record_id) && !b3.ended_at);
  }
  async refreshRunningBreaks(rows) {
    try {
      this.runningBreaks = await this.fetchRunningBreaks(rows);
      this.breaksFailed = false;
    } catch {
      this.runningBreaks = [];
      this.breaksFailed = true;
    }
  }
  nameOf(userId) {
    if (!this.team && userId === this.session.id && this.session.name) return this.session.name;
    return this.users.find((u5) => u5.id === userId)?.name?.trim() || userId;
  }
  shortDate(day) {
    const [y3, m4, d3] = day.split("-").map(Number);
    return new Intl.DateTimeFormat(erplora2().locale, {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      timeZone: "UTC"
    }).format(new Date(Date.UTC(y3, m4 - 1, d3)));
  }
  monthLabel(month) {
    const [y3, m4] = month.split("-").map(Number);
    const label = new Intl.DateTimeFormat(erplora2().locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(
      new Date(Date.UTC(y3, m4 - 1, 1))
    );
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
  /** `HH:MM`, with the day when it is not the day of the clock-in (a night shift). */
  timeOf(iso, day) {
    if (!iso) return "\u2014";
    const tz = this.timezone;
    const d3 = localDate(iso, tz);
    if (d3 === day) return localTime(iso, tz);
    const date = new Intl.DateTimeFormat(erplora2().locale, { day: "2-digit", month: "2-digit", timeZone: tz }).format(
      new Date(iso)
    );
    return `${localTime(iso, tz)} (${date})`;
  }
  statusLabel(status) {
    return status ? this.t(`ui.records.status.${status}`) : "\u2014";
  }
  badge(label, color) {
    return b2`<ion-badge
      style="--background: var(--ion-color-${color}); --color: var(--ion-color-${color}-contrast)"
      >${label}</ion-badge
    >`;
  }
  radiusIcon(value, inside, outside) {
    if (value === null || value === void 0) return A;
    const ok = Number(value) === 1;
    const label = ok ? inside : outside;
    return b2`<ion-icon
      name=${ok ? "checkmark-circle-outline" : "alert-circle-outline"}
      style="color: var(--ion-color-${ok ? "success" : "danger"})"
      title=${label}
      aria-label=${label}
      role="img"
    ></ion-icon>`;
  }
  get columns() {
    const row = (r6) => r6;
    const cols = [
      { key: "local_date", header: this.t("ui.records.colDate"), format: (r6) => this.shortDate(row(r6).local_date) }
    ];
    if (this.team) {
      cols.push({ key: "user_id", header: this.t("ui.records.colUser"), format: (r6) => this.nameOf(row(r6).user_id) });
    }
    cols.push(
      {
        key: "clock_in_at",
        header: this.t("ui.records.colIn"),
        sortable: true,
        format: (r6) => this.timeOf(row(r6).clock_in_at, row(r6).local_date)
      },
      {
        key: "clock_out_at",
        header: this.t("ui.records.colOut"),
        sortable: true,
        format: (r6) => this.timeOf(row(r6).clock_out_at, row(r6).local_date)
      },
      {
        key: "break_minutes",
        header: this.t("ui.records.colBreaks"),
        align: "right",
        format: (r6) => String(breakMinutes(row(r6), this.runningBreaks, this.now))
      },
      {
        key: "worked_minutes",
        header: this.t("ui.records.colWorked"),
        align: "right",
        render: (r6) => {
          const worked = workedMinutes(row(r6), this.runningBreaks, this.now);
          if (worked === null) return "\u2014";
          return row(r6).status === "open" ? b2`<span style="display: inline-flex; align-items: center; gap: .375rem; flex-wrap: wrap; justify-content: flex-end"
                >${formatHm2(worked)} ${this.badge(this.t("ui.records.inProgress"), "primary")}</span
              >` : formatHm2(worked);
        }
      },
      {
        key: "status",
        header: this.t("ui.records.colStatus"),
        sortable: true,
        render: (r6) => this.badge(this.statusLabel(row(r6).status), STATUS_COLOR[row(r6).status] ?? "medium")
      },
      {
        key: "within_radius",
        header: this.t("ui.records.colRadius"),
        render: (r6) => {
          const rec = row(r6);
          if (rec.in_within_radius == null && rec.out_within_radius == null) {
            return b2`<span title=${this.t("ui.records.noLocation")}>—</span>`;
          }
          return b2`<span style="display: inline-flex; gap: .25rem; font-size: 1.1rem"
            >${this.radiusIcon(rec.in_within_radius, this.t("ui.records.radiusInInside"), this.t("ui.records.radiusInOutside"))}${this.radiusIcon(
            rec.out_within_radius,
            this.t("ui.records.radiusOutInside"),
            this.t("ui.records.radiusOutOutside")
          )}</span
          >`;
        }
      }
    );
    if (this.team) {
      cols.push({
        key: "actions",
        header: this.t("ui.records.colActions"),
        pinned: "end",
        // Room for both labelled buttons: without it the pinned cell clips «Correct» out of sight.
        width: this.canCorrect ? "15rem" : "8rem",
        render: (r6) => this.rowActions(row(r6))
      });
    }
    return cols;
  }
  rowActions(r6) {
    return b2`<span style="display: inline-flex; gap: .25rem; flex-wrap: wrap; justify-content: flex-end; max-width: 100%">
      ${this.canCorrect ? b2`<ion-button
            size="small"
            fill="clear"
            data-testid=${`attendance-correct-${r6.id}`}
            title=${this.t("ui.records.correct")}
            @click=${() => this.openCorrection(r6)}
          >
            <ion-icon slot="start" name="create-outline" aria-hidden="true"></ion-icon>${this.t("ui.records.correct")}
          </ion-button>` : A}
      <ion-button
        size="small"
        fill="clear"
        data-testid=${`attendance-history-${r6.id}`}
        title=${this.t("ui.records.history")}
        @click=${() => void this.openHistory(r6)}
      >
        <ion-icon slot="start" name="time-outline" aria-hidden="true"></ion-icon>${this.t("ui.records.history")}
      </ion-button>
    </span>`;
  }
  // ── Filters ───────────────────────────────────────────────────────────────────────────────────
  setMonth(month) {
    if (!month || month === this.month) return;
    this.month = month;
    this.ctrl.setFilter("clock_in_at", monthRange(month, this.timezone));
  }
  setUser(userId) {
    this.userId = userId ?? "";
    this.ctrl.setFilter("user_id", this.userId);
  }
  setStatus(status) {
    this.status = status ?? "";
    this.ctrl.setFilter("status", this.status);
  }
  // ── Correction ────────────────────────────────────────────────────────────────────────────────
  openCorrection(r6) {
    const tz = this.timezone;
    this.correcting = {
      row: r6,
      clockIn: toLocalInput(r6.clock_in_at, tz),
      clockOut: r6.clock_out_at ? toLocalInput(r6.clock_out_at, tz) : "",
      reason: "",
      error: "",
      saving: false
    };
  }
  patchCorrection(patch) {
    if (this.correcting) this.correcting = { ...this.correcting, ...patch };
  }
  /** The catalogue text of a refusal code, or the SDK's own (already translated) message. */
  refusal(e6, fallbackKey) {
    const code = e6?.code;
    if (typeof code === "string") {
      const locale = String(erplora2().locale ?? "en").toLowerCase();
      const dict = CATALOG2[locale] ?? CATALOG2[locale.split("-")[0]] ?? CATALOG2.en;
      const text = dict.errors?.[code] ?? CATALOG2.en.errors?.[code];
      if (typeof text === "string" && text) return text;
    }
    const message = e6 instanceof Error ? e6.message.trim() : "";
    return message || this.t(fallbackKey);
  }
  async saveCorrection() {
    const draft = this.correcting;
    if (!draft || draft.saving) return;
    const tz = this.timezone;
    const row = draft.row;
    const clockIn = draft.clockIn === toLocalInput(row.clock_in_at, tz) ? new Date(row.clock_in_at).toISOString() : fromLocalInput(draft.clockIn, tz);
    if (!clockIn) return this.patchCorrection({ error: this.t("ui.records.invalidClockIn") });
    const hasOut = draft.clockOut.trim() !== "";
    const clockOut = !hasOut ? null : row.clock_out_at && draft.clockOut === toLocalInput(row.clock_out_at, tz) ? new Date(row.clock_out_at).toISOString() : fromLocalInput(draft.clockOut, tz);
    if (hasOut && (!clockOut || Date.parse(clockOut) <= Date.parse(clockIn))) {
      return this.patchCorrection({ error: this.t("ui.records.invalidCorrection") });
    }
    const reason = draft.reason.trim();
    if (reason.length < 3) return this.patchCorrection({ error: this.t("ui.records.reasonRequired") });
    this.patchCorrection({ saving: true, error: "" });
    try {
      await erplora2().command("attendance.records.correct", {
        record_id: draft.row.id,
        clock_in_at: clockIn,
        clock_out_at: clockOut,
        reason
      });
      this.correcting = null;
      erplora2().notify?.({ type: "success", message: this.t("ui.records.corrected") });
      await this.ctrl.load();
    } catch (e6) {
      this.patchCorrection({ saving: false, error: this.refusal(e6, "ui.records.saveFailed") });
    }
  }
  // Both modals render their content inside their OWN `div.ion-delegate-host.ion-page`: Ionic's
  // inline-modal delegate otherwise wraps the element children in a new one, which leaves Lit's
  // comment markers behind and the modal opens empty the second time.
  renderCorrection() {
    const c5 = this.correcting;
    return b2`<ion-modal .isOpen=${!!c5} @ionModalDidDismiss=${() => this.correcting = null}>
      <div class="ion-delegate-host ion-page">${c5 ? b2`<ion-header>
              <ion-toolbar>
                <ion-title>${this.t("ui.records.correctTitle")}</ion-title>
                <ion-buttons slot="end">
                  <ion-button fill="clear" data-testid="attendance-correct-cancel" @click=${() => this.correcting = null}>
                    ${this.t("ui.records.cancel")}
                  </ion-button>
                </ion-buttons>
              </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
              <p>
                <strong>${this.team ? this.nameOf(c5.row.user_id) : ""}</strong>
                ${this.team ? " \xB7 " : ""}${this.shortDate(c5.row.local_date)} · ${this.statusLabel(c5.row.status)}
              </p>
              <ion-input
                mode="md"
                fill="outline"
                type="datetime-local"
                label-placement="floating"
                class="ion-margin-bottom"
                label=${this.t("ui.records.fieldClockIn")}
                data-testid="attendance-correct-clock-in"
                .value=${c5.clockIn}
                @ionInput=${(e6) => this.patchCorrection({ clockIn: String(e6.target.value ?? "") })}
              ></ion-input>
              <ion-input
                mode="md"
                fill="outline"
                type="datetime-local"
                label-placement="floating"
                class="ion-margin-bottom"
                clear-input
                label=${this.t("ui.records.fieldClockOut")}
                data-testid="attendance-correct-clock-out"
                .value=${c5.clockOut}
                @ionInput=${(e6) => this.patchCorrection({ clockOut: String(e6.target.value ?? "") })}
              ></ion-input>
              <ion-textarea
                mode="md"
                fill="outline"
                label-placement="floating"
                auto-grow
                counter
                maxlength="500"
                class="ion-margin-bottom"
                label=${this.t("ui.records.fieldReason")}
                helper-text=${this.t("ui.records.reasonHelper")}
                data-testid="attendance-correct-reason"
                .value=${c5.reason}
                @ionInput=${(e6) => this.patchCorrection({ reason: String(e6.target.value ?? "") })}
              ></ion-textarea>
              ${c5.error ? b2`<p style=${MODAL_ERROR_STYLE} data-testid="attendance-correct-error" role="alert">${c5.error}</p>` : A}
              <ion-button
                expand="block"
                data-testid="attendance-correct-save"
                ?disabled=${c5.saving}
                @click=${() => void this.saveCorrection()}
              >
                ${c5.saving ? this.t("ui.records.saving") : this.t("ui.records.save")}
              </ion-button>
            </ion-content>` : A}</div>
    </ion-modal>`;
  }
  // ── History ───────────────────────────────────────────────────────────────────────────────────
  async openHistory(r6) {
    this.history = { row: r6, loading: true, error: "", items: [] };
    try {
      const page = await erplora2().queryPage("attendance.corrections.list", {
        limit: 200,
        offset: 0,
        sort: "created_at",
        dir: "desc",
        filters: { record_id: r6.id }
      });
      if (this.history?.row.id !== r6.id) return;
      this.history = { ...this.history, loading: false, items: page?.rows ?? [] };
    } catch (e6) {
      if (this.history?.row.id !== r6.id) return;
      this.history = { ...this.history, loading: false, error: this.refusal(e6, "ui.records.historyFailed") };
    }
  }
  span(inAt, outAt) {
    const tz = this.timezone;
    const a3 = inAt ? localDateTime(inAt, tz) : "\u2014";
    const b3 = outAt ? localDateTime(outAt, tz) : "\u2014";
    return `${a3} \u2192 ${b3}`;
  }
  renderHistory() {
    const h4 = this.history;
    return b2`<ion-modal .isOpen=${!!h4} @ionModalDidDismiss=${() => this.history = null}>
      <div class="ion-delegate-host ion-page">${h4 ? b2`<ion-header>
              <ion-toolbar>
                <ion-title>${this.t("ui.records.historyTitle")}</ion-title>
                <ion-buttons slot="end">
                  <ion-button fill="clear" data-testid="attendance-history-close" @click=${() => this.history = null}>
                    ${this.t("ui.records.close")}
                  </ion-button>
                </ion-buttons>
              </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
              <p>
                <strong>${this.nameOf(h4.row.user_id)}</strong> · ${this.shortDate(h4.row.local_date)}
              </p>
              ${h4.loading ? b2`<p><ion-spinner name="dots"></ion-spinner> ${this.t("ui.records.historyLoading")}</p>` : h4.error ? b2`<p style=${MODAL_ERROR_STYLE} data-testid="attendance-history-error" role="alert">${h4.error}</p>` : h4.items.length === 0 ? b2`<p data-testid="attendance-history-empty">${this.t("ui.records.historyEmpty")}</p>` : b2`<ion-list data-testid="attendance-history-list" lines="full">
                        ${h4.items.map(
      (c5) => b2`<ion-item>
                            <ion-label class="ion-text-wrap">
                              <h3>${c5.created_by ? this.nameOf(c5.created_by) : this.t("ui.records.systemActor")} · ${localDateTime(c5.created_at, this.timezone)}</h3>
                              <p>
                                ${this.t("ui.records.historyBefore")}: ${this.span(c5.old_clock_in_at, c5.old_clock_out_at)}
                                (${this.statusLabel(c5.old_status)})
                              </p>
                              <p>
                                ${this.t("ui.records.historyAfter")}: ${this.span(c5.new_clock_in_at, c5.new_clock_out_at)}
                                (${this.statusLabel(c5.new_status)})
                              </p>
                              <p>${this.t("ui.records.historyReason")}: ${c5.reason}</p>
                            </ion-label>
                          </ion-item>`
    )}
                      </ion-list>`}
            </ion-content>` : A}</div>
    </ion-modal>`;
  }
  // ── CSV ───────────────────────────────────────────────────────────────────────────────────────
  /** Every row of the current filter (not just the visible page), `EXPORT_PAGE` at a time. */
  async fetchAllRows() {
    const all = [];
    let total = Infinity;
    while (all.length < total) {
      const page = await this.pageRecords({
        limit: EXPORT_PAGE,
        offset: all.length,
        sort: this.ctrl.state.sort,
        dir: this.ctrl.state.dir,
        filters: { ...this.ctrl.state.filters }
      });
      const rows = page?.rows ?? [];
      total = Number(page?.total ?? rows.length);
      if (rows.length === 0) break;
      all.push(...rows);
    }
    return all;
  }
  csvNames() {
    const names = new Map(this.users.map((u5) => [u5.id, String(u5.name ?? "").trim()]));
    if (this.session.id && this.session.name && !names.has(this.session.id)) names.set(this.session.id, this.session.name);
    return names;
  }
  async exportCsv() {
    if (this.exporting) return;
    this.exporting = true;
    this.exportError = "";
    try {
      const rows = await this.fetchAllRows();
      const breaks = await this.fetchRunningBreaks(rows);
      const csv = toCsv(rows, this.csvNames(), { timezone: this.timezone, now: Date.now(), breaks });
      const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a3 = document.createElement("a");
      a3.href = url;
      a3.download = csvFileName(this.month);
      a3.hidden = true;
      document.body.appendChild(a3);
      a3.click();
      a3.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      if (rows.length === 0) erplora2().notify?.({ type: "info", message: this.t("ui.records.exportEmpty") });
    } catch (e6) {
      this.exportError = this.refusal(e6, "ui.records.exportFailed");
      erplora2().notify?.({ type: "error", message: this.exportError });
    } finally {
      this.exporting = false;
    }
  }
  // ── Render ────────────────────────────────────────────────────────────────────────────────────
  renderFilters() {
    const months = recentMonths(monthOf(Date.now(), this.timezone), MONTHS_OFFERED);
    if (!months.includes(this.month)) months.push(this.month);
    const users = [...this.users].sort((a3, b3) => String(a3.name).localeCompare(String(b3.name)));
    return b2`<div class="filters">
      ${this.team ? b2`<ion-select
            mode="md"
            fill="outline"
            label-placement="floating"
            label=${this.t("ui.records.filterUser")}
            data-testid="attendance-records-user"
            .value=${this.userId}
            @ionChange=${(e6) => this.setUser(e6.detail.value)}
          >
            <ion-select-option value="">${this.t("ui.records.allUsers")}</ion-select-option>
            ${users.map((u5) => b2`<ion-select-option value=${u5.id}>${u5.name || u5.id}</ion-select-option>`)}
          </ion-select>` : A}
      <ion-select
        mode="md"
        fill="outline"
        label-placement="floating"
        label=${this.t("ui.records.filterMonth")}
        data-testid="attendance-records-month"
        .value=${this.month}
        @ionChange=${(e6) => this.setMonth(e6.detail.value)}
      >
        ${months.map((m4) => b2`<ion-select-option value=${m4}>${this.monthLabel(m4)}</ion-select-option>`)}
      </ion-select>
      <ion-select
        mode="md"
        fill="outline"
        label-placement="floating"
        label=${this.t("ui.records.filterStatus")}
        data-testid="attendance-records-status"
        .value=${this.status}
        @ionChange=${(e6) => this.setStatus(e6.detail.value)}
      >
        <ion-select-option value="">${this.t("ui.records.allStatuses")}</ion-select-option>
        ${STATUSES.map((s5) => b2`<ion-select-option value=${s5}>${this.statusLabel(s5)}</ion-select-option>`)}
      </ion-select>
      <ion-button
        fill="outline"
        data-testid="attendance-export-csv"
        ?disabled=${this.exporting}
        @click=${() => void this.exportCsv()}
      >
        <ion-icon slot="start" name="download-outline" aria-hidden="true"></ion-icon>
        ${this.exporting ? this.t("ui.records.exporting") : this.t("ui.records.exportCsv")}
      </ion-button>
    </div>`;
  }
  render() {
    const ctrl = this.ctrl;
    const narrow = typeof window !== "undefined" && window.innerWidth <= 834;
    return b2`
      <header><h2>${this.t("ui.records.title")}</h2></header>
      ${this.renderFilters()}
      ${this.exportError ? b2`<p class="err" data-testid="attendance-export-error" role="alert">${this.exportError}</p>` : A}
      ${this.usersFailed ? b2`<p class="note" data-testid="attendance-records-users-note">${this.t("ui.records.usersUnavailable")}</p>` : A}
      ${this.breaksFailed ? b2`<p class="note" data-testid="attendance-records-breaks-note">${this.t("ui.records.breaksUnavailable")}</p>` : A}
      ${ctrl?.error ? b2`<div class="err" role="alert">
            <span data-testid="attendance-records-error">${ctrl.error || this.t("ui.records.loadFailed")}</span>
            <ion-button size="small" fill="outline" data-testid="attendance-records-retry" @click=${() => void ctrl.load()}>
              <ion-icon slot="start" name="refresh-outline" aria-hidden="true"></ion-icon>${this.t("ui.records.retry")}
            </ion-button>
          </div>` : A}
      <ok-data-table
        testid="attendance-records-table"
        .serverSide=${true}
        .views=${true}
        .defaultView=${narrow ? "cards" : "table"}
        .cardTitle=${(r6) => {
      const rec = r6;
      const day = this.shortDate(rec.local_date);
      return this.team ? `${day} \xB7 ${this.nameOf(rec.user_id)}` : day;
    }}
        .labels=${dataTableLabels(erplora2().locale)}
        .columns=${this.columns}
        .rows=${ctrl?.rows ?? []}
        .total=${ctrl?.total ?? 0}
        .page=${ctrl?.state.page ?? 0}
        .pageSize=${ctrl?.state.pageSize ?? 50}
        .pageSizeOptions=${[]}
        .sort=${ctrl?.state.sort}
        .sortDir=${ctrl?.state.dir ?? "desc"}
        .emptyMessage=${ctrl?.loading ? this.t("ui.records.loading") : ctrl?.error ? this.t("ui.records.loadFailed") : this.t("ui.records.empty")}
        @pageChange=${(e6) => ctrl.setPage(e6.detail)}
        @sortChange=${(e6) => ctrl.setSort(e6.detail.sort, e6.detail.dir)}
      ></ok-data-table>
      ${this.renderCorrection()} ${this.renderHistory()}
    `;
  }
};
__decorateClass([
  r5()
], ErpAttendanceRecords.prototype, "month", 2);
__decorateClass([
  r5()
], ErpAttendanceRecords.prototype, "status", 2);
__decorateClass([
  r5()
], ErpAttendanceRecords.prototype, "userId", 2);
__decorateClass([
  r5()
], ErpAttendanceRecords.prototype, "users", 2);
__decorateClass([
  r5()
], ErpAttendanceRecords.prototype, "usersFailed", 2);
__decorateClass([
  r5()
], ErpAttendanceRecords.prototype, "runningBreaks", 2);
__decorateClass([
  r5()
], ErpAttendanceRecords.prototype, "breaksFailed", 2);
__decorateClass([
  r5()
], ErpAttendanceRecords.prototype, "now", 2);
__decorateClass([
  r5()
], ErpAttendanceRecords.prototype, "exporting", 2);
__decorateClass([
  r5()
], ErpAttendanceRecords.prototype, "exportError", 2);
__decorateClass([
  r5()
], ErpAttendanceRecords.prototype, "correcting", 2);
__decorateClass([
  r5()
], ErpAttendanceRecords.prototype, "history", 2);
define("erp-attendance-records", ErpAttendanceRecords);

// ui/components/erp-attendance-settings/erp-attendance-settings.ts
var CATALOG3 = { es: es_default, en: en_default };
function erplora3() {
  const c5 = globalThis.erplora;
  if (!c5) throw new Error("erplora SDK not initialised by the shell");
  return c5;
}
var COORD_DECIMALS = 6;
var GEO_KEYS2 = {
  denied: "ui.settings.locationDenied",
  unavailable: "ui.common.locationUnavailable",
  timeout: "ui.common.locationTimeout",
  unsupported: "ui.common.locationUnsupported"
};
function valueOf(e6) {
  const detail = e6.detail;
  const raw = detail && "value" in detail ? detail.value : e6.target?.value;
  return raw === null || raw === void 0 ? "" : String(raw);
}
var coordText = (n6) => n6 === null ? "" : String(n6);
var ErpAttendanceSettings = class extends i3 {
  constructor() {
    super(...arguments);
    this.loading = true;
    this.loaded = false;
    this.loadError = "";
    this.requireLocation = DEFAULT_SETTINGS.require_location;
    this.radius = DEFAULT_SETTINGS.geofence_radius_m;
    this.latText = "";
    this.lngText = "";
    this.hoursText = String(DEFAULT_SETTINGS.auto_close_after_hours);
    this.accuracy = null;
    this.locating = false;
    this.saving = false;
    this.notice = null;
    this.canEdit = false;
  }
  static {
    this.styles = i`
    :host {
      display: block;
      padding: 16px;
      color: var(--ion-text-color, #1c1b18);
      box-sizing: border-box;
      /* Hosted next to the shell's side menu / split pane: breakpoints follow the component's width. */
      container-type: inline-size;
    }
    .card {
      max-width: 720px;
      margin: 0 auto;
      background: var(--ion-card-background, var(--ion-background-color, #fff));
      border: 1px solid var(--ion-border-color, rgba(0, 0, 0, 0.12));
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    h2 {
      margin: 0;
      font-size: 1.25rem;
    }
    h3 {
      margin: 0 0 8px;
      font-size: 1rem;
    }
    .muted,
    .help {
      margin: 4px 0 0;
      color: var(--ion-color-medium, #6b6b6b);
      font-size: 0.9rem;
    }
    ion-toggle {
      width: 100%;
    }
    /* A long label wraps instead of being cut with an ellipsis on a phone. */
    ion-toggle::part(label) {
      white-space: normal;
      overflow: visible;
      text-overflow: clip;
      line-height: 1.35;
    }
    .pair {
      display: grid;
      gap: 12px;
      grid-template-columns: minmax(0, 1fr);
    }
    @container (min-width: 600px) {
      .pair {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      }
    }
    .locate {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px 12px;
      margin-top: 8px;
    }
    .locate ion-button {
      margin: 0;
    }
    .warning {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin: 0;
      padding: 10px 12px;
      border-radius: 10px;
      /* The warning shade alone is too light to read on its own wash: darken it towards the text. */
      color: color-mix(in srgb, var(--ion-color-warning-shade, #e0ac08) 45%, var(--ion-text-color, #1c1b18));
      background: color-mix(in srgb, var(--ion-color-warning, #ffc409) 18%, transparent);
      border-left: 4px solid var(--ion-color-warning, #ffc409);
      font-weight: 600;
    }
    .info {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin: 0;
      padding: 10px 12px;
      border-radius: 10px;
      color: var(--ion-text-color, #1c1b18);
      background: color-mix(in srgb, var(--ion-color-primary, #3880ff) 10%, transparent);
      border-left: 4px solid var(--ion-color-primary, #3880ff);
    }
    .info ion-icon,
    .warning ion-icon {
      flex: 0 0 auto;
      font-size: 20px;
    }
    .msg {
      margin: 0;
      padding: 10px 12px;
      border-radius: 10px;
      font-weight: 600;
    }
    .msg.error {
      color: var(--ion-color-danger, #c5000f);
      background: color-mix(in srgb, var(--ion-color-danger, #c5000f) 10%, transparent);
    }
    .msg.success {
      color: var(--ion-color-success-shade, #1f7a3a);
      background: color-mix(in srgb, var(--ion-color-success, #2dd36f) 12%, transparent);
    }
    .actions {
      display: flex;
      justify-content: flex-end;
    }
    .actions ion-button {
      margin: 0;
      min-width: 140px;
    }
    @container (max-width: 599px) {
      .actions ion-button {
        width: 100%;
      }
    }
    .big-icon {
      font-size: 40px;
    }
    .center {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 48px 16px;
      text-align: center;
    }
  `;
  }
  t(key, params) {
    return erplora3().t(CATALOG3, key, params);
  }
  get locale() {
    return erplora3().locale || "es";
  }
  connectedCallback() {
    super.connectedCallback();
    this.canEdit = sessionCan(erplora3(), readSession(), "attendance.manage_settings");
    void this.load();
  }
  apply(s5) {
    this.requireLocation = s5.require_location;
    this.radius = s5.geofence_radius_m;
    this.latText = coordText(s5.workplace_lat);
    this.lngText = coordText(s5.workplace_lng);
    this.hoursText = String(s5.auto_close_after_hours);
  }
  async load() {
    this.loading = true;
    this.loadError = "";
    try {
      this.apply(settingsFrom(await erplora3().query("attendance.settings.get")));
      this.loaded = true;
    } catch (e6) {
      this.loadError = errorMessage(CATALOG3, this.locale, e6, this.t("ui.common.loadError"));
    } finally {
      this.loading = false;
    }
  }
  get workplaceMissing() {
    return this.requireLocation === 1 && (!this.latText.trim() || !this.lngText.trim());
  }
  async useMyLocation() {
    if (this.locating || !this.canEdit) return;
    this.locating = true;
    this.notice = null;
    try {
      const pos = await getPosition();
      this.latText = String(Number(pos.lat.toFixed(COORD_DECIMALS)));
      this.lngText = String(Number(pos.lng.toFixed(COORD_DECIMALS)));
      this.accuracy = Math.round(pos.accuracy_m);
    } catch (e6) {
      const code = e6 instanceof GeoError ? e6.code : "unavailable";
      this.notice = { kind: "error", text: this.t(GEO_KEYS2[code] ?? "ui.common.locationUnavailable") };
    } finally {
      this.locating = false;
    }
  }
  /** The snapshot to send, or the key of the first thing wrong with the form. */
  snapshot() {
    const lat = this.latText.trim();
    const lng = this.lngText.trim();
    if (!!lat !== !!lng) return { ok: false, key: "ui.settings.coordinatesIncomplete" };
    const latN = lat ? Number(lat) : null;
    const lngN = lng ? Number(lng) : null;
    if (latN !== null && !(Number.isFinite(latN) && Math.abs(latN) <= 90)) {
      return { ok: false, key: "ui.settings.invalidLatitude" };
    }
    if (lngN !== null && !(Number.isFinite(lngN) && Math.abs(lngN) <= 180)) {
      return { ok: false, key: "ui.settings.invalidLongitude" };
    }
    const hours = Number(this.hoursText.trim());
    if (!this.hoursText.trim() || !Number.isInteger(hours) || hours < AUTO_CLOSE_MIN || hours > AUTO_CLOSE_MAX) {
      return { ok: false, key: "ui.settings.invalidAutoClose" };
    }
    return {
      ok: true,
      value: {
        require_location: this.requireLocation,
        geofence_radius_m: this.radius,
        workplace_lat: latN,
        workplace_lng: lngN,
        auto_close_after_hours: hours
      }
    };
  }
  async save() {
    if (this.saving || !this.canEdit) return;
    this.notice = null;
    const snap = this.snapshot();
    if (!snap.ok) {
      this.notice = { kind: "error", text: this.t(snap.key) };
      return;
    }
    this.saving = true;
    try {
      await erplora3().command("attendance.settings.update", { ...snap.value });
      this.notice = { kind: "success", text: this.t("ui.settings.saved") };
    } catch (e6) {
      this.notice = { kind: "error", text: errorMessage(CATALOG3, this.locale, e6, this.t("ui.common.unexpectedError")) };
    } finally {
      this.saving = false;
    }
  }
  render() {
    if (!this.loaded && this.loading) {
      return b2`<div class="center" data-testid="attendance-settings-loading">
        <ion-spinner name="crescent"></ion-spinner>
        <span class="muted">${this.t("ui.common.loading")}</span>
      </div>`;
    }
    if (this.loadError) {
      return b2`<div class="center" role="alert" data-testid="attendance-settings-error">
        <ion-icon class="big-icon" name="cloud-offline-outline" aria-hidden="true"></ion-icon>
        <p>${this.loadError}</p>
        <ion-button data-testid="attendance-settings-retry" ?disabled=${this.loading} @click=${() => this.load()}>
          <ion-icon slot="start" name="refresh-outline"></ion-icon>${this.t("ui.common.retry")}
        </ion-button>
      </div>`;
    }
    return b2`<section class="card">
      <header>
        <h2>${this.t("ui.settings.title")}</h2>
        <p class="muted">${this.t("ui.settings.intro")}</p>
      </header>

      ${this.canEdit ? A : b2`<p class="info" role="note" data-testid="attendance-settings-read-only">
            <ion-icon name="lock-closed-outline" aria-hidden="true"></ion-icon>${this.t("ui.settings.readOnly")}
          </p>`}

      <ion-toggle
        label-placement="start"
        justify="space-between"
        data-testid="attendance-settings-require-location"
        ?disabled=${!this.canEdit}
        .checked=${this.requireLocation === 1}
        @ionChange=${(e6) => this.requireLocation = e6.detail?.checked ? 1 : 0}
        >${this.t("ui.settings.requireLocation")}</ion-toggle
      >

      <ion-select
        mode="md"
        fill="outline"
        interface="popover"
        label-placement="floating"
        label=${this.t("ui.settings.radius")}
        data-testid="attendance-settings-radius"
        ?disabled=${!this.canEdit}
        .value=${String(this.radius)}
        @ionChange=${(e6) => {
      const n6 = Number(valueOf(e6));
      if (RADIUS_OPTIONS.includes(n6)) this.radius = n6;
    }}
      >
        ${RADIUS_OPTIONS.map(
      (r6) => b2`<ion-select-option value=${String(r6)}>${this.t("ui.settings.radiusOption", { radius: r6 })}</ion-select-option>`
    )}
      </ion-select>

      <div>
        <h3>${this.t("ui.settings.workplace")}</h3>
        <div class="pair">
          <ion-input
            mode="md"
            fill="outline"
            type="number"
            inputmode="decimal"
            min="-90"
            max="90"
            step="any"
            label-placement="floating"
            label=${this.t("ui.settings.latitude")}
            data-testid="attendance-settings-lat"
          ?disabled=${!this.canEdit}
            .value=${this.latText}
            @ionInput=${(e6) => this.latText = valueOf(e6)}
          ></ion-input>
          <ion-input
            mode="md"
            fill="outline"
            type="number"
            inputmode="decimal"
            min="-180"
            max="180"
            step="any"
            label-placement="floating"
            label=${this.t("ui.settings.longitude")}
            data-testid="attendance-settings-lng"
          ?disabled=${!this.canEdit}
            .value=${this.lngText}
            @ionInput=${(e6) => this.lngText = valueOf(e6)}
          ></ion-input>
        </div>
        <div class="locate">
          ${this.canEdit ? b2`<ion-button fill="outline" data-testid="attendance-use-my-location" ?disabled=${this.locating}
                @click=${() => this.useMyLocation()}>
                ${this.locating ? b2`<ion-spinner slot="start" name="crescent"></ion-spinner>` : b2`<ion-icon slot="start" name="locate-outline"></ion-icon>`}
                ${this.locating ? this.t("ui.settings.locating") : this.t("ui.settings.useMyLocation")}
              </ion-button>` : A}
          ${this.accuracy !== null ? b2`<span class="help" data-testid="attendance-settings-accuracy">
                ${this.t("ui.settings.accuracy", { accuracy: this.accuracy })}
              </span>` : A}
        </div>
      </div>

      ${this.workplaceMissing ? b2`<p class="warning" role="status" data-testid="attendance-settings-location-warning">
            <ion-icon name="warning-outline" aria-hidden="true"></ion-icon>${this.t("ui.settings.workplaceMissing")}
          </p>` : A}

      <div>
        <ion-input
          mode="md"
          fill="outline"
          type="number"
          inputmode="numeric"
          min=${String(AUTO_CLOSE_MIN)}
          max=${String(AUTO_CLOSE_MAX)}
          step="1"
          label-placement="floating"
          label=${this.t("ui.settings.autoClose")}
          data-testid="attendance-settings-auto-close"
          ?disabled=${!this.canEdit}
          .value=${this.hoursText}
          @ionInput=${(e6) => this.hoursText = valueOf(e6)}
        ></ion-input>
        <p class="help">${this.t("ui.settings.autoCloseHelp")}</p>
      </div>

      ${this.notice ? b2`<p
            class="msg ${this.notice.kind}"
            role=${this.notice.kind === "error" ? "alert" : "status"}
            data-testid="attendance-settings-message"
          >${this.notice.text}</p>` : A}

      ${this.canEdit ? b2`<div class="actions">
            <ion-button data-testid="attendance-settings-save" ?disabled=${this.saving} @click=${() => this.save()}>
              ${this.saving ? b2`<ion-spinner slot="start" name="crescent"></ion-spinner>` : b2`<ion-icon slot="start" name="save-outline"></ion-icon>`}
              ${this.saving ? this.t("ui.settings.saving") : this.t("ui.settings.save")}
            </ion-button>
          </div>` : A}
    </section>`;
  }
};
__decorateClass([
  r5()
], ErpAttendanceSettings.prototype, "loading", 2);
__decorateClass([
  r5()
], ErpAttendanceSettings.prototype, "loaded", 2);
__decorateClass([
  r5()
], ErpAttendanceSettings.prototype, "loadError", 2);
__decorateClass([
  r5()
], ErpAttendanceSettings.prototype, "requireLocation", 2);
__decorateClass([
  r5()
], ErpAttendanceSettings.prototype, "radius", 2);
__decorateClass([
  r5()
], ErpAttendanceSettings.prototype, "latText", 2);
__decorateClass([
  r5()
], ErpAttendanceSettings.prototype, "lngText", 2);
__decorateClass([
  r5()
], ErpAttendanceSettings.prototype, "hoursText", 2);
__decorateClass([
  r5()
], ErpAttendanceSettings.prototype, "accuracy", 2);
__decorateClass([
  r5()
], ErpAttendanceSettings.prototype, "locating", 2);
__decorateClass([
  r5()
], ErpAttendanceSettings.prototype, "saving", 2);
__decorateClass([
  r5()
], ErpAttendanceSettings.prototype, "notice", 2);
__decorateClass([
  r5()
], ErpAttendanceSettings.prototype, "canEdit", 2);
define("erp-attendance-settings", ErpAttendanceSettings);
