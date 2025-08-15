var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var _a, _b;
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import React__default, { Component, useEffect, useCallback, useState, useRef, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { useLocation, useNavigate, Link, Routes, Route, BrowserRouter } from "react-router-dom";
import { useQueryClient, useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import fastCompare from "react-fast-compare";
import invariant from "invariant";
import shallowEqual from "shallowequal";
import { keyframes, styled, setup, css } from "goober";
import { createClient } from "@supabase/supabase-js";
import { X as X$1, Package, Building2, ChevronDown, Search, UserCircle, MessageSquare, Bookmark, Menu } from "lucide-react";
import { MeiliSearch } from "meilisearch";
var TAG_NAMES = /* @__PURE__ */ ((TAG_NAMES2) => {
  TAG_NAMES2["BASE"] = "base";
  TAG_NAMES2["BODY"] = "body";
  TAG_NAMES2["HEAD"] = "head";
  TAG_NAMES2["HTML"] = "html";
  TAG_NAMES2["LINK"] = "link";
  TAG_NAMES2["META"] = "meta";
  TAG_NAMES2["NOSCRIPT"] = "noscript";
  TAG_NAMES2["SCRIPT"] = "script";
  TAG_NAMES2["STYLE"] = "style";
  TAG_NAMES2["TITLE"] = "title";
  TAG_NAMES2["FRAGMENT"] = "Symbol(react.fragment)";
  return TAG_NAMES2;
})(TAG_NAMES || {});
var SEO_PRIORITY_TAGS = {
  link: { rel: ["amphtml", "canonical", "alternate"] },
  script: { type: ["application/ld+json"] },
  meta: {
    charset: "",
    name: ["generator", "robots", "description"],
    property: [
      "og:type",
      "og:title",
      "og:url",
      "og:image",
      "og:image:alt",
      "og:description",
      "twitter:url",
      "twitter:title",
      "twitter:description",
      "twitter:image",
      "twitter:image:alt",
      "twitter:card",
      "twitter:site"
    ]
  }
};
var VALID_TAG_NAMES = Object.values(TAG_NAMES);
var REACT_TAG_MAP = {
  accesskey: "accessKey",
  charset: "charSet",
  class: "className",
  contenteditable: "contentEditable",
  contextmenu: "contextMenu",
  "http-equiv": "httpEquiv",
  itemprop: "itemProp",
  tabindex: "tabIndex"
};
var HTML_TAG_MAP = Object.entries(REACT_TAG_MAP).reduce(
  (carry, [key, value]) => {
    carry[value] = key;
    return carry;
  },
  {}
);
var HELMET_ATTRIBUTE = "data-rh";
var HELMET_PROPS = {
  DEFAULT_TITLE: "defaultTitle",
  DEFER: "defer",
  ENCODE_SPECIAL_CHARACTERS: "encodeSpecialCharacters",
  ON_CHANGE_CLIENT_STATE: "onChangeClientState",
  TITLE_TEMPLATE: "titleTemplate",
  PRIORITIZE_SEO_TAGS: "prioritizeSeoTags"
};
var getInnermostProperty = (propsList, property) => {
  for (let i = propsList.length - 1; i >= 0; i -= 1) {
    const props = propsList[i];
    if (Object.prototype.hasOwnProperty.call(props, property)) {
      return props[property];
    }
  }
  return null;
};
var getTitleFromPropsList = (propsList) => {
  let innermostTitle = getInnermostProperty(
    propsList,
    "title"
    /* TITLE */
  );
  const innermostTemplate = getInnermostProperty(propsList, HELMET_PROPS.TITLE_TEMPLATE);
  if (Array.isArray(innermostTitle)) {
    innermostTitle = innermostTitle.join("");
  }
  if (innermostTemplate && innermostTitle) {
    return innermostTemplate.replace(/%s/g, () => innermostTitle);
  }
  const innermostDefaultTitle = getInnermostProperty(propsList, HELMET_PROPS.DEFAULT_TITLE);
  return innermostTitle || innermostDefaultTitle || void 0;
};
var getOnChangeClientState = (propsList) => getInnermostProperty(propsList, HELMET_PROPS.ON_CHANGE_CLIENT_STATE) || (() => {
});
var getAttributesFromPropsList = (tagType, propsList) => propsList.filter((props) => typeof props[tagType] !== "undefined").map((props) => props[tagType]).reduce((tagAttrs, current) => ({ ...tagAttrs, ...current }), {});
var getBaseTagFromPropsList = (primaryAttributes, propsList) => propsList.filter((props) => typeof props[
  "base"
  /* BASE */
] !== "undefined").map((props) => props[
  "base"
  /* BASE */
]).reverse().reduce((innermostBaseTag, tag) => {
  if (!innermostBaseTag.length) {
    const keys = Object.keys(tag);
    for (let i = 0; i < keys.length; i += 1) {
      const attributeKey = keys[i];
      const lowerCaseAttributeKey = attributeKey.toLowerCase();
      if (primaryAttributes.indexOf(lowerCaseAttributeKey) !== -1 && tag[lowerCaseAttributeKey]) {
        return innermostBaseTag.concat(tag);
      }
    }
  }
  return innermostBaseTag;
}, []);
var warn = (msg) => console && typeof console.warn === "function" && console.warn(msg);
var getTagsFromPropsList = (tagName, primaryAttributes, propsList) => {
  const approvedSeenTags = {};
  return propsList.filter((props) => {
    if (Array.isArray(props[tagName])) {
      return true;
    }
    if (typeof props[tagName] !== "undefined") {
      warn(
        `Helmet: ${tagName} should be of type "Array". Instead found type "${typeof props[tagName]}"`
      );
    }
    return false;
  }).map((props) => props[tagName]).reverse().reduce((approvedTags, instanceTags) => {
    const instanceSeenTags = {};
    instanceTags.filter((tag) => {
      let primaryAttributeKey;
      const keys2 = Object.keys(tag);
      for (let i = 0; i < keys2.length; i += 1) {
        const attributeKey = keys2[i];
        const lowerCaseAttributeKey = attributeKey.toLowerCase();
        if (primaryAttributes.indexOf(lowerCaseAttributeKey) !== -1 && !(primaryAttributeKey === "rel" && tag[primaryAttributeKey].toLowerCase() === "canonical") && !(lowerCaseAttributeKey === "rel" && tag[lowerCaseAttributeKey].toLowerCase() === "stylesheet")) {
          primaryAttributeKey = lowerCaseAttributeKey;
        }
        if (primaryAttributes.indexOf(attributeKey) !== -1 && (attributeKey === "innerHTML" || attributeKey === "cssText" || attributeKey === "itemprop")) {
          primaryAttributeKey = attributeKey;
        }
      }
      if (!primaryAttributeKey || !tag[primaryAttributeKey]) {
        return false;
      }
      const value = tag[primaryAttributeKey].toLowerCase();
      if (!approvedSeenTags[primaryAttributeKey]) {
        approvedSeenTags[primaryAttributeKey] = {};
      }
      if (!instanceSeenTags[primaryAttributeKey]) {
        instanceSeenTags[primaryAttributeKey] = {};
      }
      if (!approvedSeenTags[primaryAttributeKey][value]) {
        instanceSeenTags[primaryAttributeKey][value] = true;
        return true;
      }
      return false;
    }).reverse().forEach((tag) => approvedTags.push(tag));
    const keys = Object.keys(instanceSeenTags);
    for (let i = 0; i < keys.length; i += 1) {
      const attributeKey = keys[i];
      const tagUnion = {
        ...approvedSeenTags[attributeKey],
        ...instanceSeenTags[attributeKey]
      };
      approvedSeenTags[attributeKey] = tagUnion;
    }
    return approvedTags;
  }, []).reverse();
};
var getAnyTrueFromPropsList = (propsList, checkedTag) => {
  if (Array.isArray(propsList) && propsList.length) {
    for (let index = 0; index < propsList.length; index += 1) {
      const prop = propsList[index];
      if (prop[checkedTag]) {
        return true;
      }
    }
  }
  return false;
};
var reducePropsToState = (propsList) => ({
  baseTag: getBaseTagFromPropsList([
    "href"
    /* HREF */
  ], propsList),
  bodyAttributes: getAttributesFromPropsList("bodyAttributes", propsList),
  defer: getInnermostProperty(propsList, HELMET_PROPS.DEFER),
  encode: getInnermostProperty(propsList, HELMET_PROPS.ENCODE_SPECIAL_CHARACTERS),
  htmlAttributes: getAttributesFromPropsList("htmlAttributes", propsList),
  linkTags: getTagsFromPropsList(
    "link",
    [
      "rel",
      "href"
      /* HREF */
    ],
    propsList
  ),
  metaTags: getTagsFromPropsList(
    "meta",
    [
      "name",
      "charset",
      "http-equiv",
      "property",
      "itemprop"
      /* ITEM_PROP */
    ],
    propsList
  ),
  noscriptTags: getTagsFromPropsList("noscript", [
    "innerHTML"
    /* INNER_HTML */
  ], propsList),
  onChangeClientState: getOnChangeClientState(propsList),
  scriptTags: getTagsFromPropsList(
    "script",
    [
      "src",
      "innerHTML"
      /* INNER_HTML */
    ],
    propsList
  ),
  styleTags: getTagsFromPropsList("style", [
    "cssText"
    /* CSS_TEXT */
  ], propsList),
  title: getTitleFromPropsList(propsList),
  titleAttributes: getAttributesFromPropsList("titleAttributes", propsList),
  prioritizeSeoTags: getAnyTrueFromPropsList(propsList, HELMET_PROPS.PRIORITIZE_SEO_TAGS)
});
var flattenArray = (possibleArray) => Array.isArray(possibleArray) ? possibleArray.join("") : possibleArray;
var checkIfPropsMatch = (props, toMatch) => {
  const keys = Object.keys(props);
  for (let i = 0; i < keys.length; i += 1) {
    if (toMatch[keys[i]] && toMatch[keys[i]].includes(props[keys[i]])) {
      return true;
    }
  }
  return false;
};
var prioritizer = (elementsList, propsToMatch) => {
  if (Array.isArray(elementsList)) {
    return elementsList.reduce(
      (acc, elementAttrs) => {
        if (checkIfPropsMatch(elementAttrs, propsToMatch)) {
          acc.priority.push(elementAttrs);
        } else {
          acc.default.push(elementAttrs);
        }
        return acc;
      },
      { priority: [], default: [] }
    );
  }
  return { default: elementsList, priority: [] };
};
var without = (obj, key) => {
  return {
    ...obj,
    [key]: void 0
  };
};
var SELF_CLOSING_TAGS = [
  "noscript",
  "script",
  "style"
  /* STYLE */
];
var encodeSpecialCharacters = (str, encode = true) => {
  if (encode === false) {
    return String(str);
  }
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
};
var generateElementAttributesAsString = (attributes) => Object.keys(attributes).reduce((str, key) => {
  const attr = typeof attributes[key] !== "undefined" ? `${key}="${attributes[key]}"` : `${key}`;
  return str ? `${str} ${attr}` : attr;
}, "");
var generateTitleAsString = (type, title, attributes, encode) => {
  const attributeString = generateElementAttributesAsString(attributes);
  const flattenedTitle = flattenArray(title);
  return attributeString ? `<${type} ${HELMET_ATTRIBUTE}="true" ${attributeString}>${encodeSpecialCharacters(
    flattenedTitle,
    encode
  )}</${type}>` : `<${type} ${HELMET_ATTRIBUTE}="true">${encodeSpecialCharacters(
    flattenedTitle,
    encode
  )}</${type}>`;
};
var generateTagsAsString = (type, tags, encode = true) => tags.reduce((str, t) => {
  const tag = t;
  const attributeHtml = Object.keys(tag).filter(
    (attribute) => !(attribute === "innerHTML" || attribute === "cssText")
  ).reduce((string, attribute) => {
    const attr = typeof tag[attribute] === "undefined" ? attribute : `${attribute}="${encodeSpecialCharacters(tag[attribute], encode)}"`;
    return string ? `${string} ${attr}` : attr;
  }, "");
  const tagContent = tag.innerHTML || tag.cssText || "";
  const isSelfClosing = SELF_CLOSING_TAGS.indexOf(type) === -1;
  return `${str}<${type} ${HELMET_ATTRIBUTE}="true" ${attributeHtml}${isSelfClosing ? `/>` : `>${tagContent}</${type}>`}`;
}, "");
var convertElementAttributesToReactProps = (attributes, initProps = {}) => Object.keys(attributes).reduce((obj, key) => {
  const mapped = REACT_TAG_MAP[key];
  obj[mapped || key] = attributes[key];
  return obj;
}, initProps);
var generateTitleAsReactComponent = (_type, title, attributes) => {
  const initProps = {
    key: title,
    [HELMET_ATTRIBUTE]: true
  };
  const props = convertElementAttributesToReactProps(attributes, initProps);
  return [React__default.createElement("title", props, title)];
};
var generateTagsAsReactComponent = (type, tags) => tags.map((tag, i) => {
  const mappedTag = {
    key: i,
    [HELMET_ATTRIBUTE]: true
  };
  Object.keys(tag).forEach((attribute) => {
    const mapped = REACT_TAG_MAP[attribute];
    const mappedAttribute = mapped || attribute;
    if (mappedAttribute === "innerHTML" || mappedAttribute === "cssText") {
      const content = tag.innerHTML || tag.cssText;
      mappedTag.dangerouslySetInnerHTML = { __html: content };
    } else {
      mappedTag[mappedAttribute] = tag[attribute];
    }
  });
  return React__default.createElement(type, mappedTag);
});
var getMethodsForTag = (type, tags, encode = true) => {
  switch (type) {
    case "title":
      return {
        toComponent: () => generateTitleAsReactComponent(type, tags.title, tags.titleAttributes),
        toString: () => generateTitleAsString(type, tags.title, tags.titleAttributes, encode)
      };
    case "bodyAttributes":
    case "htmlAttributes":
      return {
        toComponent: () => convertElementAttributesToReactProps(tags),
        toString: () => generateElementAttributesAsString(tags)
      };
    default:
      return {
        toComponent: () => generateTagsAsReactComponent(type, tags),
        toString: () => generateTagsAsString(type, tags, encode)
      };
  }
};
var getPriorityMethods = ({ metaTags, linkTags, scriptTags, encode }) => {
  const meta = prioritizer(metaTags, SEO_PRIORITY_TAGS.meta);
  const link = prioritizer(linkTags, SEO_PRIORITY_TAGS.link);
  const script = prioritizer(scriptTags, SEO_PRIORITY_TAGS.script);
  const priorityMethods = {
    toComponent: () => [
      ...generateTagsAsReactComponent("meta", meta.priority),
      ...generateTagsAsReactComponent("link", link.priority),
      ...generateTagsAsReactComponent("script", script.priority)
    ],
    toString: () => (
      // generate all the tags as strings and concatenate them
      `${getMethodsForTag("meta", meta.priority, encode)} ${getMethodsForTag(
        "link",
        link.priority,
        encode
      )} ${getMethodsForTag("script", script.priority, encode)}`
    )
  };
  return {
    priorityMethods,
    metaTags: meta.default,
    linkTags: link.default,
    scriptTags: script.default
  };
};
var mapStateOnServer = (props) => {
  const {
    baseTag,
    bodyAttributes,
    encode = true,
    htmlAttributes,
    noscriptTags,
    styleTags,
    title = "",
    titleAttributes,
    prioritizeSeoTags
  } = props;
  let { linkTags, metaTags, scriptTags } = props;
  let priorityMethods = {
    toComponent: () => {
    },
    toString: () => ""
  };
  if (prioritizeSeoTags) {
    ({ priorityMethods, linkTags, metaTags, scriptTags } = getPriorityMethods(props));
  }
  return {
    priority: priorityMethods,
    base: getMethodsForTag("base", baseTag, encode),
    bodyAttributes: getMethodsForTag("bodyAttributes", bodyAttributes, encode),
    htmlAttributes: getMethodsForTag("htmlAttributes", htmlAttributes, encode),
    link: getMethodsForTag("link", linkTags, encode),
    meta: getMethodsForTag("meta", metaTags, encode),
    noscript: getMethodsForTag("noscript", noscriptTags, encode),
    script: getMethodsForTag("script", scriptTags, encode),
    style: getMethodsForTag("style", styleTags, encode),
    title: getMethodsForTag("title", { title, titleAttributes }, encode)
  };
};
var server_default = mapStateOnServer;
var instances = [];
var isDocument = !!(typeof window !== "undefined" && window.document && window.document.createElement);
var HelmetData = class {
  constructor(context, canUseDOM) {
    __publicField(this, "instances", []);
    __publicField(this, "canUseDOM", isDocument);
    __publicField(this, "context");
    __publicField(this, "value", {
      setHelmet: (serverState) => {
        this.context.helmet = serverState;
      },
      helmetInstances: {
        get: () => this.canUseDOM ? instances : this.instances,
        add: (instance) => {
          (this.canUseDOM ? instances : this.instances).push(instance);
        },
        remove: (instance) => {
          const index = (this.canUseDOM ? instances : this.instances).indexOf(instance);
          (this.canUseDOM ? instances : this.instances).splice(index, 1);
        }
      }
    });
    this.context = context;
    this.canUseDOM = canUseDOM || false;
    if (!canUseDOM) {
      context.helmet = server_default({
        baseTag: [],
        bodyAttributes: {},
        htmlAttributes: {},
        linkTags: [],
        metaTags: [],
        noscriptTags: [],
        scriptTags: [],
        styleTags: [],
        title: "",
        titleAttributes: {}
      });
    }
  }
};
var defaultValue = {};
var Context = React__default.createContext(defaultValue);
var HelmetProvider = (_a = class extends Component {
  constructor(props) {
    super(props);
    __publicField(this, "helmetData");
    this.helmetData = new HelmetData(this.props.context || {}, _a.canUseDOM);
  }
  render() {
    return /* @__PURE__ */ React__default.createElement(Context.Provider, { value: this.helmetData.value }, this.props.children);
  }
}, __publicField(_a, "canUseDOM", isDocument), _a);
var updateTags = (type, tags) => {
  const headElement = document.head || document.querySelector(
    "head"
    /* HEAD */
  );
  const tagNodes = headElement.querySelectorAll(`${type}[${HELMET_ATTRIBUTE}]`);
  const oldTags = [].slice.call(tagNodes);
  const newTags = [];
  let indexToDelete;
  if (tags && tags.length) {
    tags.forEach((tag) => {
      const newElement = document.createElement(type);
      for (const attribute in tag) {
        if (Object.prototype.hasOwnProperty.call(tag, attribute)) {
          if (attribute === "innerHTML") {
            newElement.innerHTML = tag.innerHTML;
          } else if (attribute === "cssText") {
            if (newElement.styleSheet) {
              newElement.styleSheet.cssText = tag.cssText;
            } else {
              newElement.appendChild(document.createTextNode(tag.cssText));
            }
          } else {
            const attr = attribute;
            const value = typeof tag[attr] === "undefined" ? "" : tag[attr];
            newElement.setAttribute(attribute, value);
          }
        }
      }
      newElement.setAttribute(HELMET_ATTRIBUTE, "true");
      if (oldTags.some((existingTag, index) => {
        indexToDelete = index;
        return newElement.isEqualNode(existingTag);
      })) {
        oldTags.splice(indexToDelete, 1);
      } else {
        newTags.push(newElement);
      }
    });
  }
  oldTags.forEach((tag) => {
    var _a2;
    return (_a2 = tag.parentNode) == null ? void 0 : _a2.removeChild(tag);
  });
  newTags.forEach((tag) => headElement.appendChild(tag));
  return {
    oldTags,
    newTags
  };
};
var updateAttributes = (tagName, attributes) => {
  const elementTag = document.getElementsByTagName(tagName)[0];
  if (!elementTag) {
    return;
  }
  const helmetAttributeString = elementTag.getAttribute(HELMET_ATTRIBUTE);
  const helmetAttributes = helmetAttributeString ? helmetAttributeString.split(",") : [];
  const attributesToRemove = [...helmetAttributes];
  const attributeKeys = Object.keys(attributes);
  for (const attribute of attributeKeys) {
    const value = attributes[attribute] || "";
    if (elementTag.getAttribute(attribute) !== value) {
      elementTag.setAttribute(attribute, value);
    }
    if (helmetAttributes.indexOf(attribute) === -1) {
      helmetAttributes.push(attribute);
    }
    const indexToSave = attributesToRemove.indexOf(attribute);
    if (indexToSave !== -1) {
      attributesToRemove.splice(indexToSave, 1);
    }
  }
  for (let i = attributesToRemove.length - 1; i >= 0; i -= 1) {
    elementTag.removeAttribute(attributesToRemove[i]);
  }
  if (helmetAttributes.length === attributesToRemove.length) {
    elementTag.removeAttribute(HELMET_ATTRIBUTE);
  } else if (elementTag.getAttribute(HELMET_ATTRIBUTE) !== attributeKeys.join(",")) {
    elementTag.setAttribute(HELMET_ATTRIBUTE, attributeKeys.join(","));
  }
};
var updateTitle = (title, attributes) => {
  if (typeof title !== "undefined" && document.title !== title) {
    document.title = flattenArray(title);
  }
  updateAttributes("title", attributes);
};
var commitTagChanges = (newState, cb) => {
  const {
    baseTag,
    bodyAttributes,
    htmlAttributes,
    linkTags,
    metaTags,
    noscriptTags,
    onChangeClientState,
    scriptTags,
    styleTags,
    title,
    titleAttributes
  } = newState;
  updateAttributes("body", bodyAttributes);
  updateAttributes("html", htmlAttributes);
  updateTitle(title, titleAttributes);
  const tagUpdates = {
    baseTag: updateTags("base", baseTag),
    linkTags: updateTags("link", linkTags),
    metaTags: updateTags("meta", metaTags),
    noscriptTags: updateTags("noscript", noscriptTags),
    scriptTags: updateTags("script", scriptTags),
    styleTags: updateTags("style", styleTags)
  };
  const addedTags = {};
  const removedTags = {};
  Object.keys(tagUpdates).forEach((tagType) => {
    const { newTags, oldTags } = tagUpdates[tagType];
    if (newTags.length) {
      addedTags[tagType] = newTags;
    }
    if (oldTags.length) {
      removedTags[tagType] = tagUpdates[tagType].oldTags;
    }
  });
  if (cb) {
    cb();
  }
  onChangeClientState(newState, addedTags, removedTags);
};
var _helmetCallback = null;
var handleStateChangeOnClient = (newState) => {
  if (_helmetCallback) {
    cancelAnimationFrame(_helmetCallback);
  }
  if (newState.defer) {
    _helmetCallback = requestAnimationFrame(() => {
      commitTagChanges(newState, () => {
        _helmetCallback = null;
      });
    });
  } else {
    commitTagChanges(newState);
    _helmetCallback = null;
  }
};
var client_default = handleStateChangeOnClient;
var HelmetDispatcher = class extends Component {
  constructor() {
    super(...arguments);
    __publicField(this, "rendered", false);
  }
  shouldComponentUpdate(nextProps) {
    return !shallowEqual(nextProps, this.props);
  }
  componentDidUpdate() {
    this.emitChange();
  }
  componentWillUnmount() {
    const { helmetInstances } = this.props.context;
    helmetInstances.remove(this);
    this.emitChange();
  }
  emitChange() {
    const { helmetInstances, setHelmet } = this.props.context;
    let serverState = null;
    const state = reducePropsToState(
      helmetInstances.get().map((instance) => {
        const props = { ...instance.props };
        delete props.context;
        return props;
      })
    );
    if (HelmetProvider.canUseDOM) {
      client_default(state);
    } else if (server_default) {
      serverState = server_default(state);
    }
    setHelmet(serverState);
  }
  // componentWillMount will be deprecated
  // for SSR, initialize on first render
  // constructor is also unsafe in StrictMode
  init() {
    if (this.rendered) {
      return;
    }
    this.rendered = true;
    const { helmetInstances } = this.props.context;
    helmetInstances.add(this);
    this.emitChange();
  }
  render() {
    this.init();
    return null;
  }
};
var Helmet = (_b = class extends Component {
  shouldComponentUpdate(nextProps) {
    return !fastCompare(without(this.props, "helmetData"), without(nextProps, "helmetData"));
  }
  mapNestedChildrenToProps(child, nestedChildren) {
    if (!nestedChildren) {
      return null;
    }
    switch (child.type) {
      case "script":
      case "noscript":
        return {
          innerHTML: nestedChildren
        };
      case "style":
        return {
          cssText: nestedChildren
        };
      default:
        throw new Error(
          `<${child.type} /> elements are self-closing and can not contain children. Refer to our API for more information.`
        );
    }
  }
  flattenArrayTypeChildren(child, arrayTypeChildren, newChildProps, nestedChildren) {
    return {
      ...arrayTypeChildren,
      [child.type]: [
        ...arrayTypeChildren[child.type] || [],
        {
          ...newChildProps,
          ...this.mapNestedChildrenToProps(child, nestedChildren)
        }
      ]
    };
  }
  mapObjectTypeChildren(child, newProps, newChildProps, nestedChildren) {
    switch (child.type) {
      case "title":
        return {
          ...newProps,
          [child.type]: nestedChildren,
          titleAttributes: { ...newChildProps }
        };
      case "body":
        return {
          ...newProps,
          bodyAttributes: { ...newChildProps }
        };
      case "html":
        return {
          ...newProps,
          htmlAttributes: { ...newChildProps }
        };
      default:
        return {
          ...newProps,
          [child.type]: { ...newChildProps }
        };
    }
  }
  mapArrayTypeChildrenToProps(arrayTypeChildren, newProps) {
    let newFlattenedProps = { ...newProps };
    Object.keys(arrayTypeChildren).forEach((arrayChildName) => {
      newFlattenedProps = {
        ...newFlattenedProps,
        [arrayChildName]: arrayTypeChildren[arrayChildName]
      };
    });
    return newFlattenedProps;
  }
  warnOnInvalidChildren(child, nestedChildren) {
    invariant(
      VALID_TAG_NAMES.some((name) => child.type === name),
      typeof child.type === "function" ? `You may be attempting to nest <Helmet> components within each other, which is not allowed. Refer to our API for more information.` : `Only elements types ${VALID_TAG_NAMES.join(
        ", "
      )} are allowed. Helmet does not support rendering <${child.type}> elements. Refer to our API for more information.`
    );
    invariant(
      !nestedChildren || typeof nestedChildren === "string" || Array.isArray(nestedChildren) && !nestedChildren.some((nestedChild) => typeof nestedChild !== "string"),
      `Helmet expects a string as a child of <${child.type}>. Did you forget to wrap your children in braces? ( <${child.type}>{\`\`}</${child.type}> ) Refer to our API for more information.`
    );
    return true;
  }
  mapChildrenToProps(children, newProps) {
    let arrayTypeChildren = {};
    React__default.Children.forEach(children, (child) => {
      if (!child || !child.props) {
        return;
      }
      const { children: nestedChildren, ...childProps } = child.props;
      const newChildProps = Object.keys(childProps).reduce((obj, key) => {
        obj[HTML_TAG_MAP[key] || key] = childProps[key];
        return obj;
      }, {});
      let { type } = child;
      if (typeof type === "symbol") {
        type = type.toString();
      } else {
        this.warnOnInvalidChildren(child, nestedChildren);
      }
      switch (type) {
        case "Symbol(react.fragment)":
          newProps = this.mapChildrenToProps(nestedChildren, newProps);
          break;
        case "link":
        case "meta":
        case "noscript":
        case "script":
        case "style":
          arrayTypeChildren = this.flattenArrayTypeChildren(
            child,
            arrayTypeChildren,
            newChildProps,
            nestedChildren
          );
          break;
        default:
          newProps = this.mapObjectTypeChildren(child, newProps, newChildProps, nestedChildren);
          break;
      }
    });
    return this.mapArrayTypeChildrenToProps(arrayTypeChildren, newProps);
  }
  render() {
    const { children, ...props } = this.props;
    let newProps = { ...props };
    let { helmetData } = props;
    if (children) {
      newProps = this.mapChildrenToProps(children, newProps);
    }
    if (helmetData && !(helmetData instanceof HelmetData)) {
      const data = helmetData;
      helmetData = new HelmetData(data.context, true);
      delete newProps.helmetData;
    }
    return helmetData ? /* @__PURE__ */ React__default.createElement(HelmetDispatcher, { ...newProps, context: helmetData.value }) : /* @__PURE__ */ React__default.createElement(Context.Consumer, null, (context) => /* @__PURE__ */ React__default.createElement(HelmetDispatcher, { ...newProps, context }));
  }
}, __publicField(_b, "defaultProps", {
  defer: true,
  encodeSpecialCharacters: true,
  prioritizeSeoTags: false
}), _b);
var W = (e) => typeof e == "function", f = (e, t) => W(e) ? e(t) : e;
var F = /* @__PURE__ */ (() => {
  let e = 0;
  return () => (++e).toString();
})(), A = /* @__PURE__ */ (() => {
  let e;
  return () => {
    if (e === void 0 && typeof window < "u") {
      let t = matchMedia("(prefers-reduced-motion: reduce)");
      e = !t || t.matches;
    }
    return e;
  };
})();
var Y = 20;
var U = (e, t) => {
  switch (t.type) {
    case 0:
      return { ...e, toasts: [t.toast, ...e.toasts].slice(0, Y) };
    case 1:
      return { ...e, toasts: e.toasts.map((o) => o.id === t.toast.id ? { ...o, ...t.toast } : o) };
    case 2:
      let { toast: r } = t;
      return U(e, { type: e.toasts.find((o) => o.id === r.id) ? 1 : 0, toast: r });
    case 3:
      let { toastId: s } = t;
      return { ...e, toasts: e.toasts.map((o) => o.id === s || s === void 0 ? { ...o, dismissed: true, visible: false } : o) };
    case 4:
      return t.toastId === void 0 ? { ...e, toasts: [] } : { ...e, toasts: e.toasts.filter((o) => o.id !== t.toastId) };
    case 5:
      return { ...e, pausedAt: t.time };
    case 6:
      let a = t.time - (e.pausedAt || 0);
      return { ...e, pausedAt: void 0, toasts: e.toasts.map((o) => ({ ...o, pauseDuration: o.pauseDuration + a })) };
  }
}, P = [], y = { toasts: [], pausedAt: void 0 }, u = (e) => {
  y = U(y, e), P.forEach((t) => {
    t(y);
  });
}, q = { blank: 4e3, error: 4e3, success: 2e3, loading: 1 / 0, custom: 4e3 }, D = (e = {}) => {
  let [t, r] = useState(y), s = useRef(y);
  useEffect(() => (s.current !== y && r(y), P.push(r), () => {
    let o = P.indexOf(r);
    o > -1 && P.splice(o, 1);
  }), []);
  let a = t.toasts.map((o) => {
    var n, i, p;
    return { ...e, ...e[o.type], ...o, removeDelay: o.removeDelay || ((n = e[o.type]) == null ? void 0 : n.removeDelay) || (e == null ? void 0 : e.removeDelay), duration: o.duration || ((i = e[o.type]) == null ? void 0 : i.duration) || (e == null ? void 0 : e.duration) || q[o.type], style: { ...e.style, ...(p = e[o.type]) == null ? void 0 : p.style, ...o.style } };
  });
  return { ...t, toasts: a };
};
var J = (e, t = "blank", r) => ({ createdAt: Date.now(), visible: true, dismissed: false, type: t, ariaProps: { role: "status", "aria-live": "polite" }, message: e, pauseDuration: 0, ...r, id: (r == null ? void 0 : r.id) || F() }), x = (e) => (t, r) => {
  let s = J(t, e, r);
  return u({ type: 2, toast: s }), s.id;
}, c = (e, t) => x("blank")(e, t);
c.error = x("error");
c.success = x("success");
c.loading = x("loading");
c.custom = x("custom");
c.dismiss = (e) => {
  u({ type: 3, toastId: e });
};
c.remove = (e) => u({ type: 4, toastId: e });
c.promise = (e, t, r) => {
  let s = c.loading(t.loading, { ...r, ...r == null ? void 0 : r.loading });
  return typeof e == "function" && (e = e()), e.then((a) => {
    let o = t.success ? f(t.success, a) : void 0;
    return o ? c.success(o, { id: s, ...r, ...r == null ? void 0 : r.success }) : c.dismiss(s), a;
  }).catch((a) => {
    let o = t.error ? f(t.error, a) : void 0;
    o ? c.error(o, { id: s, ...r, ...r == null ? void 0 : r.error }) : c.dismiss(s);
  }), e;
};
var K = (e, t) => {
  u({ type: 1, toast: { id: e, height: t } });
}, X = () => {
  u({ type: 5, time: Date.now() });
}, b = /* @__PURE__ */ new Map(), Z = 1e3, ee = (e, t = Z) => {
  if (b.has(e)) return;
  let r = setTimeout(() => {
    b.delete(e), u({ type: 4, toastId: e });
  }, t);
  b.set(e, r);
}, O = (e) => {
  let { toasts: t, pausedAt: r } = D(e);
  useEffect(() => {
    if (r) return;
    let o = Date.now(), n = t.map((i) => {
      if (i.duration === 1 / 0) return;
      let p = (i.duration || 0) + i.pauseDuration - (o - i.createdAt);
      if (p < 0) {
        i.visible && c.dismiss(i.id);
        return;
      }
      return setTimeout(() => c.dismiss(i.id), p);
    });
    return () => {
      n.forEach((i) => i && clearTimeout(i));
    };
  }, [t, r]);
  let s = useCallback(() => {
    r && u({ type: 6, time: Date.now() });
  }, [r]), a = useCallback((o, n) => {
    let { reverseOrder: i = false, gutter: p = 8, defaultPosition: d } = n || {}, h = t.filter((m) => (m.position || d) === (o.position || d) && m.height), v = h.findIndex((m) => m.id === o.id), S = h.filter((m, E) => E < v && m.visible).length;
    return h.filter((m) => m.visible).slice(...i ? [S + 1] : [0, S]).reduce((m, E) => m + (E.height || 0) + p, 0);
  }, [t]);
  return useEffect(() => {
    t.forEach((o) => {
      if (o.dismissed) ee(o.id, o.removeDelay);
      else {
        let n = b.get(o.id);
        n && (clearTimeout(n), b.delete(o.id));
      }
    });
  }, [t]), { toasts: t, handlers: { updateHeight: K, startPause: X, endPause: s, calculateOffset: a } };
};
var oe = keyframes`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`, re = keyframes`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`, se = keyframes`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`, k = styled("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${(e) => e.primary || "#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${oe} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${re} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${(e) => e.secondary || "#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${se} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`;
var ne = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`, V = styled("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${(e) => e.secondary || "#e0e0e0"};
  border-right-color: ${(e) => e.primary || "#616161"};
  animation: ${ne} 1s linear infinite;
`;
var pe = keyframes`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`, de = keyframes`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`, _ = styled("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${(e) => e.primary || "#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${pe} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${de} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${(e) => e.secondary || "#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`;
var ue = styled("div")`
  position: absolute;
`, le = styled("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`, fe = keyframes`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`, Te = styled("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${fe} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`, M = ({ toast: e }) => {
  let { icon: t, type: r, iconTheme: s } = e;
  return t !== void 0 ? typeof t == "string" ? React.createElement(Te, null, t) : t : r === "blank" ? null : React.createElement(le, null, React.createElement(V, { ...s }), r !== "loading" && React.createElement(ue, null, r === "error" ? React.createElement(k, { ...s }) : React.createElement(_, { ...s })));
};
var ye = (e) => `
0% {transform: translate3d(0,${e * -200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`, ge = (e) => `
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e * -150}%,-1px) scale(.6); opacity:0;}
`, he = "0%{opacity:0;} 100%{opacity:1;}", xe = "0%{opacity:1;} 100%{opacity:0;}", be = styled("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`, Se = styled("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`, Ae = (e, t) => {
  let s = e.includes("top") ? 1 : -1, [a, o] = A() ? [he, xe] : [ye(s), ge(s)];
  return { animation: t ? `${keyframes(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards` : `${keyframes(o)} 0.4s forwards cubic-bezier(.06,.71,.55,1)` };
}, C = React.memo(({ toast: e, position: t, style: r, children: s }) => {
  let a = e.height ? Ae(e.position || t || "top-center", e.visible) : { opacity: 0 }, o = React.createElement(M, { toast: e }), n = React.createElement(Se, { ...e.ariaProps }, f(e.message, e));
  return React.createElement(be, { className: e.className, style: { ...a, ...r, ...e.style } }, typeof s == "function" ? s({ icon: o, message: n }) : React.createElement(React.Fragment, null, o, n));
});
setup(React.createElement);
var ve = ({ id: e, className: t, style: r, onHeightUpdate: s, children: a }) => {
  let o = React.useCallback((n) => {
    if (n) {
      let i = () => {
        let p = n.getBoundingClientRect().height;
        s(e, p);
      };
      i(), new MutationObserver(i).observe(n, { subtree: true, childList: true, characterData: true });
    }
  }, [e, s]);
  return React.createElement("div", { ref: o, className: t, style: r }, a);
}, Ee = (e, t) => {
  let r = e.includes("top"), s = r ? { top: 0 } : { bottom: 0 }, a = e.includes("center") ? { justifyContent: "center" } : e.includes("right") ? { justifyContent: "flex-end" } : {};
  return { left: 0, right: 0, display: "flex", position: "absolute", transition: A() ? void 0 : "all 230ms cubic-bezier(.21,1.02,.73,1)", transform: `translateY(${t * (r ? 1 : -1)}px)`, ...s, ...a };
}, De = css`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`, R = 16, Oe = ({ reverseOrder: e, position: t = "top-center", toastOptions: r, gutter: s, children: a, containerStyle: o, containerClassName: n }) => {
  let { toasts: i, handlers: p } = O(r);
  return React.createElement("div", { id: "_rht_toaster", style: { position: "fixed", zIndex: 9999, top: R, left: R, right: R, bottom: R, pointerEvents: "none", ...o }, className: n, onMouseEnter: p.startPause, onMouseLeave: p.endPause }, i.map((d) => {
    let h = d.position || t, v = p.calculateOffset(d, { reverseOrder: e, gutter: s, defaultPosition: t }), S = Ee(h, v);
    return React.createElement(ve, { id: d.id, key: d.id, onHeightUpdate: p.updateHeight, className: d.visible ? De : "", style: S }, d.type === "custom" ? f(d.message, d) : a ? a(d) : React.createElement(C, { toast: d, position: h }));
  }));
};
var Vt = c;
const supabaseUrl = "https://ruciccnefqjyjkmyyemo.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1Y2ljY25lZnFqeWprbXl5ZW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMDQxODcsImV4cCI6MjA1Njc4MDE4N30.5X-boYg83IoTWovN8yzVcDlXmxF5viQEjB9N4cMHYaM";
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error("Invalid Supabase URL format. Please check VITE_SUPABASE_URL in your .env file.");
}
let supabase;
try {
  console.log("Attempting to initialize Supabase client...");
  supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      db: {
        schema: "public"
      },
      global: {
        headers: {}
      }
    }
  );
  console.log("✅ Supabase client initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize Supabase client:", error);
  console.error("Environment variables:", {
    url: supabaseUrl,
    keyLength: (supabaseAnonKey == null ? void 0 : supabaseAnonKey.length) || 0
  });
  throw new Error(`Supabase client initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`);
}
const isBrowser = typeof window !== "undefined";
async function logError(error, context, severity = "error") {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : void 0;
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();
  const errorContext = {
    ...context,
    userAgent: isBrowser ? window.navigator.userAgent : void 0,
    url: isBrowser ? window.location.href : void 0,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    userId: user == null ? void 0 : user.id,
    sessionId: session == null ? void 0 : session.id,
    authStatus: user ? "authenticated" : "unauthenticated"
  };
  const errorLog = {
    message: errorMessage,
    stack: errorStack,
    context: errorContext,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    severity,
    userId: user == null ? void 0 : user.id,
    error: errorMessage,
    success: false
  };
  try {
    const { error: insertError } = await supabase.from("error_logs").insert([errorLog]);
    if (insertError) {
      console.error("Error inserting log:", insertError);
    }
  } catch (loggingError) {
    console.error("Error during error logging:", loggingError);
    console.error("Original error:", errorLog);
  }
}
class ErrorBoundary extends Component {
  constructor() {
    super(...arguments);
    __publicField(this, "state", {
      hasError: false
    });
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    logError(error, {
      type: "react_error_boundary",
      componentStack: errorInfo.componentStack
    });
  }
  render() {
    if (this.state.hasError) {
      return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-900", children: /* @__PURE__ */ jsxs("div", { className: "text-center px-4", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-[#F4A024] mb-4", children: "Something went wrong" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-300 mb-8", children: "We apologize for the inconvenience. Please try refreshing the page." }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => window.location.reload(),
            className: "btn-primary",
            children: "Refresh Page"
          }
        )
      ] }) });
    }
    return this.props.children;
  }
}
function LoadingSpinner() {
  return /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-[#F4A024]" }) });
}
const analytics = {
  trackPageview: (title) => {
    if (!isBrowser) return;
    if (window.plausible) {
      window.plausible("pageview", {
        props: {
          title: title || document.title,
          url: window.location.href,
          path: window.location.pathname,
          referrer: document.referrer
        }
      });
    }
  },
  trackEvent: (eventName, options) => {
    if (!isBrowser) return;
    if (window.gtag) {
      window.gtag("event", eventName, {
        ...options == null ? void 0 : options.props,
        non_interaction: (options == null ? void 0 : options.nonInteraction) || false
      });
    }
    if (window.plausible) {
      window.plausible(eventName, {
        props: {
          ...options == null ? void 0 : options.props,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          user_agent: navigator.userAgent
        }
      });
    }
  },
  // Track time spent on page
  startTimer: (pageName) => {
    if (!isBrowser) return () => {
    };
    const startTime = Date.now();
    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1e3);
      analytics.trackEvent("time_spent", {
        props: {
          page: pageName,
          duration: timeSpent,
          duration_readable: `${timeSpent} seconds`
        }
      });
    };
  }
};
function useAnalytics(pageName) {
  const location = useLocation();
  useEffect(() => {
    analytics.trackPageview();
    const stopTimer = analytics.startTimer(pageName);
    return () => stopTimer();
  }, [location, pageName]);
}
const MEILISEARCH_HOST = "https://ms-ee472b57457d-21922.fra.meilisearch.io";
const MEILISEARCH_API_KEY = "3c783ff9f865fdd4597670d5dcdc001cceb2d24a07990d12a022d546aae3dec6";
console.log("Meilisearch environment variables:", {
  host: true,
  apiKey: true,
  hostValue: MEILISEARCH_HOST,
  apiKeyLength: (MEILISEARCH_API_KEY == null ? void 0 : MEILISEARCH_API_KEY.length) || 0
});
const searchClient = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY
});
const productsIndex = searchClient.index("products");
const suppliersIndex = searchClient.index("suppliers");
function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}
async function logSearchQuery(queryText, searchMode) {
  if (!queryText.trim()) {
    return;
  }
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("search_queries_log").insert({
      query_text: queryText.trim(),
      search_mode: searchMode,
      user_id: (user == null ? void 0 : user.id) || null
    });
  } catch (error) {
    console.error("Failed to log search query:", error);
  }
}
function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
function createSupplierUrl(supplierTitle, supplierId) {
  const slug = slugify(supplierTitle);
  return `/supplier/${slug}/${supplierId}`;
}
function getSupplierIdFromParams(params) {
  return params.supplierId || null;
}
function getSavedSearchMode() {
  if (!isBrowser) return "products";
  try {
    const saved = localStorage.getItem("paisan_search_mode");
    return saved === "suppliers" ? "suppliers" : "products";
  } catch {
    return "products";
  }
}
function saveSearchMode(mode) {
  if (!isBrowser) return;
  try {
    localStorage.setItem("paisan_search_mode", mode);
  } catch {
  }
}
function SearchModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState(getSavedSearchMode);
  const debouncedQuery = useDebouncedValue(searchQuery, 300);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const queryClient2 = useQueryClient();
  const navigate = useNavigate();
  React__default.useEffect(() => {
    saveSearchMode(searchMode);
  }, [searchMode]);
  React__default.useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        let searchResults = [];
        if (searchMode === "products") {
          const productsResults = await productsIndex.search(debouncedQuery, {
            limit: 20,
            attributesToRetrieve: [
              "id",
              "title",
              "price",
              "image",
              "url",
              "moq",
              "country",
              "category",
              "supplier",
              "source"
            ]
          });
          searchResults = productsResults.hits.map((hit) => ({
            id: hit.id,
            name: hit.title,
            type: "product",
            image: hit.image || "",
            country: hit.country || "Unknown",
            category: hit.category || "Unknown",
            supplier: hit.supplier || "Unknown",
            marketplace: hit.source || "Unknown",
            price: hit.price,
            moq: hit.moq || "N/A",
            url: `/product/${hit.id}`
          }));
        } else {
          const suppliersResults = await suppliersIndex.search(debouncedQuery, {
            limit: 20,
            attributesToRetrieve: [
              "Supplier_ID",
              "Supplier_Title",
              "Supplier_Description",
              "Supplier_Country_Name",
              "Supplier_City_Name",
              "Supplier_Location",
              "Supplier_Source_ID",
              "product_count",
              "product_keywords"
            ]
          });
          const sourceIds = [...new Set(
            suppliersResults.hits.map((hit) => hit.Supplier_Source_ID).filter(Boolean)
          )];
          let sourceTitles = {};
          if (sourceIds.length > 0) {
            try {
              const { data: sourcesData, error: sourcesError } = await supabase.from("Sources").select("Source_ID, Source_Title").in("Source_ID", sourceIds);
              if (sourcesError) {
                console.error("Error fetching sources:", sourcesError);
              } else if (sourcesData) {
                sourceTitles = sourcesData.reduce((acc, source) => {
                  acc[source.Source_ID] = source.Source_Title;
                  return acc;
                }, {});
              }
            } catch (err) {
              console.error("Error in source fetch:", err);
            }
          }
          searchResults = suppliersResults.hits.map((hit) => ({
            id: hit.Supplier_ID,
            name: hit.Supplier_Title,
            type: "supplier",
            country: hit.Supplier_Country_Name || "Unknown",
            location: hit.Supplier_Location || hit.Supplier_City_Name || "Unknown",
            description: hit.Supplier_Description || "",
            product_count: hit.product_count || 0,
            sourceId: hit.Supplier_Source_ID || "",
            sourceTitle: sourceTitles[hit.Supplier_Source_ID] || "Unknown Source",
            productKeywords: hit.product_keywords || "",
            url: createSupplierUrl(hit.Supplier_Title, hit.Supplier_ID)
          }));
        }
        setResults(searchResults);
        if (!searchResults.length && debouncedQuery.length > 2) {
          logError(new Error("Search returned no results"), {
            type: "search_no_results",
            query: debouncedQuery,
            mode: searchMode
          }, "warning");
        }
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to perform search. Please try again.");
        logError(err instanceof Error ? err : new Error("Search failed"), {
          type: "search_error",
          query: debouncedQuery,
          mode: searchMode
        });
      } finally {
        setLoading(false);
      }
    }
    performSearch();
  }, [debouncedQuery, searchMode]);
  const handleResultClick = useCallback(
    (result) => {
      if (result.type === "product") {
        queryClient2.prefetchQuery({
          queryKey: ["product", result.id],
          queryFn: async () => {
            const { data } = await supabase.from("Products").select("*").eq("Product_ID", result.id).single();
            return data;
          }
        });
      } else if (result.type === "supplier") {
        queryClient2.prefetchQuery({
          queryKey: ["supplier", result.name],
          queryFn: async () => {
            const { data } = await supabase.from("Supplier").select("*").eq("Supplier_Title", result.name).single();
            return data;
          }
        });
      }
      if (searchQuery.trim()) {
        logSearchQuery(searchQuery.trim(), searchMode);
      }
      navigate(result.url);
      onClose();
      setSearchQuery("");
    },
    [navigate, onClose, searchQuery, searchMode, queryClient2]
  );
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        if (searchQuery.trim()) {
          logSearchQuery(searchQuery.trim(), searchMode);
          const searchParams = new URLSearchParams({
            q: searchQuery.trim(),
            mode: searchMode
          });
          navigate(`/search?${searchParams.toString()}`);
          onClose();
          setSearchQuery("");
        }
      }
    },
    [searchQuery, navigate, onClose, searchMode]
  );
  const handleClose = () => {
    onClose();
    setSearchQuery("");
    setResults([]);
  };
  if (!isOpen) return null;
  const placeholderText = searchMode === "products" ? "Search products, categories, suppliers..." : "Search suppliers by name, location, capabilities...";
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] p-6 relative", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleClose,
        className: "absolute -top-3 -right-3 text-gray-400 hover:text-white transition-colors bg-gray-800 rounded-full p-2 z-10",
        "aria-label": "Close search",
        children: /* @__PURE__ */ jsx(X$1, { className: "w-5 h-5" })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-4", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setSearchMode("products"),
          className: `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${searchMode === "products" ? "bg-[#F4A024] text-gray-900" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`,
          children: [
            /* @__PURE__ */ jsx(Package, { className: "w-4 h-4" }),
            "Products"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setSearchMode("suppliers"),
          className: `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${searchMode === "suppliers" ? "bg-[#F4A024] text-gray-900" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`,
          children: [
            /* @__PURE__ */ jsx(Building2, { className: "w-4 h-4" }),
            "Suppliers"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder: placeholderText,
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          onKeyDown: handleKeyDown,
          className: "w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-[#F4A024] focus:ring-1 focus:ring-[#F4A024]",
          autoFocus: true
        }
      ),
      loading && /* @__PURE__ */ jsx("div", { className: "absolute right-3 top-1/2 -translate-y-1/2", children: /* @__PURE__ */ jsx(LoadingSpinner, {}) })
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "text-red-400 mt-2 text-sm", children: error }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 max-h-[50vh] overflow-y-auto", children: results.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-2 text-sm text-gray-400", children: [
        "Found ",
        results.length,
        " ",
        searchMode === "products" ? "products" : "suppliers"
      ] }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: results.map((result) => /* @__PURE__ */ jsx(
        "li",
        {
          onClick: () => handleResultClick(result),
          className: "cursor-pointer rounded-lg p-3 hover:bg-gray-800 transition-colors",
          children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            result.image && /* @__PURE__ */ jsx(
              "img",
              {
                src: result.image,
                alt: result.name,
                className: "w-12 h-12 object-cover rounded"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-medium text-white", children: result.name }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 text-sm text-gray-400", children: result.type === "product" ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("span", { children: result.category }),
                /* @__PURE__ */ jsx("span", { children: "•" }),
                /* @__PURE__ */ jsx("span", { children: result.supplier }),
                /* @__PURE__ */ jsx("span", { children: "•" }),
                /* @__PURE__ */ jsx("span", { children: result.marketplace }),
                result.price && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("span", { children: "•" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[#F4A024]", children: result.price })
                ] })
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("span", { className: "text-[#F4A024] font-medium", children: "Supplier" }),
                /* @__PURE__ */ jsx("span", { children: "•" }),
                /* @__PURE__ */ jsx("span", { children: result.country }),
                result.location && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("span", { children: "•" }),
                  /* @__PURE__ */ jsx("span", { children: result.location })
                ] }),
                result.sourceTitle && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("span", { children: "•" }),
                  /* @__PURE__ */ jsx("span", { children: result.sourceTitle })
                ] }),
                result.product_count !== void 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("span", { children: "•" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    result.product_count,
                    " products"
                  ] })
                ] })
              ] }) }),
              result.type === "supplier" && result.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-1 line-clamp-2", children: result.description }),
              result.type === "supplier" && result.productKeywords && /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-600 mt-1 line-clamp-1", children: [
                "Keywords: ",
                result.productKeywords
              ] })
            ] })
          ] })
        },
        `${result.type}-${result.id}`
      )) })
    ] }) : searchQuery && !loading && /* @__PURE__ */ jsxs("p", { className: "text-center text-gray-400 py-4", children: [
      "No ",
      searchMode,
      " found. Try different keywords or switch search mode."
    ] }) })
  ] }) });
}
function useSavedItems() {
  const queryClient2 = useQueryClient();
  const query = useQuery({
    queryKey: ["savedItems"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!(session == null ? void 0 : session.user)) return [];
      const { data: savedItems, error } = await supabase.from("saved_items").select(`
          product_id,
          Products (
            Product_ID,
            Product_Title,
            Product_Price,
            Product_Image_URL,
            Product_URL,
            Product_MOQ,
            Product_Country_Name,
            Product_Category_Name,
            Product_Supplier_Name,
            Product_Source_Name
          )
        `).eq("user_id", session.user.id).order("saved_at", { ascending: false });
      if (error) throw error;
      return savedItems.map((item) => ({
        id: item.Products.Product_ID,
        name: item.Products.Product_Title,
        Product_Price: item.Products.Product_Price || "$0",
        image: item.Products.Product_Image_URL || "",
        country: item.Products.Product_Country_Name || "Unknown",
        category: item.Products.Product_Category_Name || "Unknown",
        supplier: item.Products.Product_Supplier_Name || "Unknown",
        Product_MOQ: item.Products.Product_MOQ || "0",
        sourceUrl: item.Products.Product_URL || "",
        marketplace: item.Products.Product_Source_Name || "Unknown"
      }));
    },
    staleTime: 1e3 * 60 * 5
    // 5 minutes
  });
  const toggleSavedItem = async (product) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!(session == null ? void 0 : session.user)) throw new Error("Must be logged in to save items");
    const previousData = queryClient2.getQueryData(["savedItems"]) || [];
    const isCurrentlySaved = previousData.some((item) => item.id === product.id);
    queryClient2.setQueryData(
      ["savedItems"],
      isCurrentlySaved ? previousData.filter((item) => item.id !== product.id) : [...previousData, product]
    );
    try {
      if (isCurrentlySaved) {
        await supabase.from("saved_items").delete().eq("user_id", session.user.id).eq("product_id", product.id);
      } else {
        await supabase.from("saved_items").insert({
          user_id: session.user.id,
          product_id: product.id
        });
      }
    } catch (error) {
      queryClient2.setQueryData(["savedItems"], previousData);
      throw error;
    }
  };
  return {
    ...query,
    toggleSavedItem
  };
}
function useContactHistory() {
  const queryClient2 = useQueryClient();
  const query = useQuery({
    queryKey: ["contactHistory"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!(session == null ? void 0 : session.user)) return [];
      const { data: memberData } = await supabase.from("members").select("id").eq("auth_id", session.user.id).single();
      if (!memberData) return [];
      const { data, error } = await supabase.from("member_messages").select(`
          id,
          contact_method,
          contacted_at,
          Products (
            Product_ID,
            Product_Title,
            Product_Price,
            Product_Image_URL,
            Product_URL,
            Product_MOQ,
            Countries (Country_Title),
            Categories (Category_Name),
            Supplier (Supplier_Title),
            Sources (Source_Title)
          )
        `).eq("member_id", memberData.id).order("contacted_at", { ascending: false });
      if (error) throw error;
      return data.map((item) => {
        var _a2, _b2, _c, _d;
        return {
          id: item.id,
          contactMethod: item.contact_method,
          contactedAt: item.contacted_at,
          product: {
            id: item.Products.Product_ID,
            name: item.Products.Product_Title,
            Product_Price: item.Products.Product_Price,
            image: item.Products.Product_Image_URL || "",
            country: ((_a2 = item.Products.Countries) == null ? void 0 : _a2.Country_Title) || "Unknown",
            category: ((_b2 = item.Products.Categories) == null ? void 0 : _b2.Category_Name) || "Unknown",
            supplier: ((_c = item.Products.Supplier) == null ? void 0 : _c.Supplier_Title) || "Unknown",
            Product_MOQ: item.Products.Product_MOQ,
            sourceUrl: item.Products.Product_URL || "",
            marketplace: ((_d = item.Products.Sources) == null ? void 0 : _d.Source_Title) || "Unknown"
          }
        };
      });
    }
  });
  const recordContact = async (productId, contactMethod) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!(session == null ? void 0 : session.user)) throw new Error("Must be logged in to contact suppliers");
    const { data: memberData } = await supabase.from("members").select("id").eq("auth_id", session.user.id).single();
    if (!memberData) throw new Error("Member profile not found");
    const { data: productData } = await supabase.from("Products").select("Product_Supplier_ID").eq("Product_ID", productId).single();
    if (!productData) throw new Error("Product not found");
    const { error } = await supabase.from("member_messages").insert({
      member_id: memberData.id,
      product_id: productId,
      supplier_id: productData.Product_Supplier_ID,
      contact_method: contactMethod
    });
    if (error) throw error;
    queryClient2.invalidateQueries(["contactHistory"]);
  };
  return {
    ...query,
    recordContact
  };
}
function AuthModal({ isOpen, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  if (!isOpen) return null;
  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        if (signUpError) {
          throw signUpError;
        }
        if (!authData.user) {
          throw new Error("No user returned from signup");
        }
        Vt.success("Account created successfully!");
        analytics.trackEvent("sign_up_success");
        onClose();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        Vt.success("Signed in successfully!");
        analytics.trackEvent("sign_in_success");
        onClose();
      }
    } catch (error) {
      console.error("Authentication error:", error);
      let errorMessage = "Authentication failed";
      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password";
        }
      }
      await logError(error instanceof Error ? error : new Error(errorMessage), {
        type: isSignUp ? "sign_up_error" : "sign_in_error",
        context: {
          email,
          error: errorMessage,
          stack: error instanceof Error ? error.stack : void 0
        }
      });
      Vt.error(errorMessage);
      analytics.trackEvent(isSignUp ? "sign_up_error" : "sign_in_error", {
        error: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-900/90 rounded-lg shadow-lg w-full max-w-md p-6 relative", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onClose,
        className: "absolute top-4 right-4 text-gray-400 hover:text-white transition-colors",
        children: /* @__PURE__ */ jsx(X$1, { className: "w-6 h-6" })
      }
    ),
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-100 mb-6", children: isSignUp ? "Create Account" : "Sign In" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-300 mb-1", children: "Email" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            id: "email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            className: `w-full bg-gray-800/50 text-white placeholder-gray-400 border ${errors.email ? "border-red-500" : "border-gray-700"} rounded-lg px-4 py-2 focus:outline-none focus:border-[#F4A024] focus:ring-1 focus:ring-[#F4A024]`,
            placeholder: "Enter your email"
          }
        ),
        errors.email && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-500", children: errors.email })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-300 mb-1", children: "Password" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "password",
            id: "password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            className: `w-full bg-gray-800/50 text-white placeholder-gray-400 border ${errors.password ? "border-red-500" : "border-gray-700"} rounded-lg px-4 py-2 focus:outline-none focus:border-[#F4A024] focus:ring-1 focus:ring-[#F4A024]`,
            placeholder: "Enter your password",
            minLength: 6
          }
        ),
        errors.password && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-500", children: errors.password })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "w-full btn-primary py-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
          children: loading ? /* @__PURE__ */ jsx(LoadingSpinner, {}) : isSignUp ? "Create Account" : "Sign In"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 text-center", children: /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => {
          setIsSignUp(!isSignUp);
          setErrors({});
        },
        className: "text-[#F4A024] hover:text-[#F4A024]/80 text-sm",
        children: isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"
      }
    ) })
  ] }) });
}
function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [categories, setCategories] = useState([]);
  const { data: savedItems = [] } = useSavedItems();
  useContactHistory();
  const [user, setUser] = useState(null);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const queryClient2 = useQueryClient();
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser((session == null ? void 0 : session.user) ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser((session == null ? void 0 : session.user) ?? null);
      }
    );
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from("Categories").select("Category_ID, Category_Name").order("Category_Name");
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      analytics.trackEvent("sign_out");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  const handleIconClick = (feature) => {
    if (!user) {
      Vt.error("Please log in to use this feature");
      setIsAuthOpen(true);
    }
  };
  const trackNavigation = (type, name) => {
    analytics.trackEvent("navigation_click", {
      props: { nav_type: type, item_name: name }
    });
    if (type === "category" && name) {
      queryClient2.prefetchQuery({
        queryKey: ["searchResults", { category: name }],
        queryFn: async () => {
          const { data } = await supabase.from("Products").select("*").eq("Product_Category_Name", name).limit(20);
          return data;
        }
      });
    } else if (type === "menu" && name === "products") {
      queryClient2.prefetchQuery({
        queryKey: ["products"],
        queryFn: async () => {
          const { data } = await supabase.from("Products").select("*").limit(20);
          return data;
        }
      });
    } else if (type === "menu" && name === "suppliers") {
      queryClient2.prefetchQuery({
        queryKey: ["suppliers", 0, 100],
        queryFn: async () => {
          const { data } = await supabase.rpc("get_suppliers_with_product_count", {
            limit_count: 100,
            offset_count: 0
          });
          return data;
        }
      });
    }
  };
  const handleMouseEnter = (dropdown) => {
    if (isBrowser && window.innerWidth >= 768) {
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
        setDropdownTimeout(null);
      }
      setActiveDropdown(dropdown);
    }
  };
  const handleMouseLeave = () => {
    if (isBrowser && window.innerWidth >= 768) {
      const timeout = setTimeout(() => {
        setActiveDropdown(null);
      }, 300);
      setDropdownTimeout(timeout);
    }
  };
  const handleDropdownMouseEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
  };
  const handleDropdownMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 300);
    setDropdownTimeout(timeout);
  };
  const toggleMobileDropdown = (dropdown) => setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("nav", { className: "fixed top-0 w-full bg-black z-50", children: [
      /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between h-16", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/",
              className: "flex items-center gap-2",
              onClick: () => trackNavigation("logo", "home"),
              children: /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-[#F4A024] paisan-text", children: "Paisán" })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-6", children: [
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: "relative",
                onMouseEnter: () => handleMouseEnter("discover"),
                onMouseLeave: handleMouseLeave,
                children: [
                  /* @__PURE__ */ jsxs("button", { className: "flex items-center text-gray-300 hover:text-gray-100 px-3 py-2 rounded-md", children: [
                    "Discover",
                    /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4 ml-1" })
                  ] }),
                  activeDropdown === "discover" && /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5",
                      onMouseEnter: handleDropdownMouseEnter,
                      onMouseLeave: handleDropdownMouseLeave,
                      children: /* @__PURE__ */ jsxs("div", { className: "py-1", role: "menu", children: [
                        /* @__PURE__ */ jsx(
                          Link,
                          {
                            to: "/products",
                            className: "block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700",
                            onClick: () => {
                              closeMobileMenu();
                              trackNavigation("menu", "products");
                            },
                            children: "All Products"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          Link,
                          {
                            to: "/suppliers",
                            className: "block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700",
                            onClick: () => {
                              closeMobileMenu();
                              trackNavigation("menu", "suppliers");
                            },
                            children: "Suppliers"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          Link,
                          {
                            to: "/sources",
                            className: "block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700",
                            onClick: () => {
                              closeMobileMenu();
                              trackNavigation("menu", "sources");
                            },
                            children: "Sources"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          Link,
                          {
                            to: "/countries",
                            className: "block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700",
                            onClick: () => {
                              closeMobileMenu();
                              trackNavigation("menu", "countries");
                            },
                            children: "Countries"
                          }
                        )
                      ] })
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: "relative",
                onMouseEnter: () => handleMouseEnter("categories"),
                onMouseLeave: handleMouseLeave,
                children: [
                  /* @__PURE__ */ jsxs(
                    Link,
                    {
                      to: "/categories",
                      className: "flex items-center text-gray-300 hover:text-gray-100 px-3 py-2 rounded-md",
                      onClick: () => trackNavigation("menu", "categories"),
                      children: [
                        "Categories",
                        /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4 ml-1" })
                      ]
                    }
                  ),
                  activeDropdown === "categories" && /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5",
                      onMouseEnter: handleDropdownMouseEnter,
                      onMouseLeave: handleDropdownMouseLeave,
                      children: /* @__PURE__ */ jsxs("div", { className: "py-1", role: "menu", children: [
                        /* @__PURE__ */ jsx(
                          Link,
                          {
                            to: "/categories",
                            className: "block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700 font-medium border-b border-gray-700",
                            onClick: () => {
                              closeMobileMenu();
                              trackNavigation("menu", "all-categories");
                            },
                            children: "View All Categories"
                          }
                        ),
                        categories.slice(0, 8).map((category) => /* @__PURE__ */ jsx(
                          Link,
                          {
                            to: `/search?category=${category.Category_ID}`,
                            className: "block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700",
                            onClick: () => {
                              closeMobileMenu();
                              trackNavigation("category", category.Category_Name);
                            },
                            children: category.Category_Name
                          },
                          category.Category_ID
                        ))
                      ] })
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: "relative",
                onMouseEnter: () => handleMouseEnter("tools"),
                onMouseLeave: handleMouseLeave,
                children: [
                  /* @__PURE__ */ jsxs("button", { className: "flex items-center text-gray-300 hover:text-gray-100 px-3 py-2 rounded-md", children: [
                    "Tools",
                    /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4 ml-1" })
                  ] }),
                  activeDropdown === "tools" && /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5",
                      onMouseEnter: handleDropdownMouseEnter,
                      onMouseLeave: handleDropdownMouseLeave,
                      children: /* @__PURE__ */ jsxs("div", { className: "py-1", role: "menu", children: [
                        /* @__PURE__ */ jsx(
                          Link,
                          {
                            to: "/tools/rfq-template",
                            className: "block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700",
                            onClick: () => {
                              closeMobileMenu();
                              trackNavigation("tools", "rfq-template");
                            },
                            children: "RFQ Template"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          Link,
                          {
                            to: "/tools/tariff-calculator",
                            className: "block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700",
                            onClick: () => {
                              closeMobileMenu();
                              trackNavigation("tools", "tariff-calculator");
                            },
                            children: "Tariff Calculator"
                          }
                        )
                      ] })
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: "relative",
                onMouseEnter: () => handleMouseEnter("about"),
                onMouseLeave: handleMouseLeave,
                children: [
                  /* @__PURE__ */ jsxs("button", { className: "flex items-center text-gray-300 hover:text-gray-100 px-3 py-2 rounded-md", children: [
                    "About",
                    /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4 ml-1" })
                  ] }),
                  activeDropdown === "about" && /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5",
                      onMouseEnter: handleDropdownMouseEnter,
                      onMouseLeave: handleDropdownMouseLeave,
                      children: /* @__PURE__ */ jsxs("div", { className: "py-1", role: "menu", children: [
                        /* @__PURE__ */ jsx(
                          Link,
                          {
                            to: "/about",
                            className: "block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700",
                            onClick: () => {
                              closeMobileMenu();
                              trackNavigation("menu", "about");
                            },
                            children: "About Us"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          Link,
                          {
                            to: "/policies",
                            className: "block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700",
                            onClick: () => {
                              closeMobileMenu();
                              trackNavigation("menu", "policies");
                            },
                            children: "Policies"
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          Link,
                          {
                            to: "/contact",
                            className: "block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700",
                            onClick: () => {
                              closeMobileMenu();
                              trackNavigation("menu", "contact");
                            },
                            children: "Contact"
                          }
                        )
                      ] })
                    }
                  )
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => {
                setIsSearchOpen(true);
                analytics.trackEvent("search_open");
              },
              className: "text-gray-300 hover:text-gray-100 p-2 rounded-full relative group",
              "aria-label": "Search",
              "data-tour": "search-button",
              children: [
                /* @__PURE__ */ jsx(Search, { className: "w-5 h-5" }),
                /* @__PURE__ */ jsx("span", { className: "absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap", children: "Search" })
              ]
            }
          ),
          user ? /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setActiveDropdown(activeDropdown === "user" ? null : "user"),
                className: "text-gray-300 hover:text-gray-100 p-2 rounded-full relative group",
                children: [
                  /* @__PURE__ */ jsx(UserCircle, { className: "w-5 h-5" }),
                  /* @__PURE__ */ jsx("span", { className: "absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap", children: "Account" })
                ]
              }
            ),
            activeDropdown === "user" && /* @__PURE__ */ jsx(
              "div",
              {
                className: "absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5",
                onMouseEnter: handleDropdownMouseEnter,
                onMouseLeave: handleDropdownMouseLeave,
                children: /* @__PURE__ */ jsxs("div", { className: "py-1", children: [
                  /* @__PURE__ */ jsx(
                    Link,
                    {
                      to: "/profile",
                      className: "block px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700",
                      onClick: () => {
                        setActiveDropdown(null);
                        trackNavigation("profile", "view-profile");
                      },
                      children: "View Profile"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => {
                        handleSignOut();
                        setActiveDropdown(null);
                      },
                      className: "block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-[#F4A024] hover:bg-gray-700",
                      children: "Sign Out"
                    }
                  )
                ] })
              }
            )
          ] }) : /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setIsAuthOpen(true),
              className: "text-gray-300 hover:text-gray-100 p-2 rounded-full relative group",
              children: [
                /* @__PURE__ */ jsx(UserCircle, { className: "w-5 h-5" }),
                /* @__PURE__ */ jsx("span", { className: "absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap", children: "Sign In" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/message-history",
              className: "text-gray-300 hover:text-gray-100 p-2 rounded-full relative group",
              onClick: () => handleIconClick(),
              "aria-label": "Message History",
              children: [
                /* @__PURE__ */ jsx(MessageSquare, { className: "w-5 h-5" }),
                /* @__PURE__ */ jsx("span", { className: "absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap", children: "Message History" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/saved-items",
              className: "text-gray-300 hover:text-gray-100 p-2 rounded-full relative group",
              onClick: () => handleIconClick(),
              "aria-label": "Saved Items",
              children: [
                /* @__PURE__ */ jsx(Bookmark, { className: "w-5 h-5", fill: user && savedItems.length > 0 ? "currentColor" : "none" }),
                user && savedItems.length > 0 && /* @__PURE__ */ jsx("span", { className: "absolute -top-1 -right-1 bg-[#F4A024] text-gray-900 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center", children: savedItems.length }),
                /* @__PURE__ */ jsx("span", { className: "absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap", children: "Saved Items" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setIsMobileMenuOpen(!isMobileMenuOpen),
              className: "md:hidden text-gray-300 hover:text-gray-100 p-2 rounded-full",
              "aria-label": "Toggle menu",
              children: isMobileMenuOpen ? /* @__PURE__ */ jsx(X$1, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Menu, { className: "w-5 h-5" })
            }
          )
        ] })
      ] }) }),
      isMobileMenuOpen && /* @__PURE__ */ jsx("div", { className: "md:hidden absolute left-0 right-0 top-16 bg-gray-800 z-40 max-h-[80vh] overflow-y-auto shadow-md rounded-b-lg", children: /* @__PURE__ */ jsxs("div", { className: "px-4 pt-2 pb-3 space-y-1", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => toggleMobileDropdown("discover"),
              className: "w-full flex items-center justify-between text-gray-300 hover:text-gray-100 px-3 py-2 rounded-md text-base font-medium bg-gray-700/50",
              children: [
                "Discover",
                /* @__PURE__ */ jsx(ChevronDown, { className: `w-4 h-4 transform transition-transform ${activeDropdown === "discover" ? "rotate-180" : ""}` })
              ]
            }
          ),
          activeDropdown === "discover" && /* @__PURE__ */ jsxs("div", { className: "pl-4 space-y-2 bg-gray-700", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/products",
                className: "block px-3 py-2 text-gray-300 hover:text-[#F4A024]",
                onClick: () => {
                  closeMobileMenu();
                  trackNavigation("mobile_menu", "products");
                },
                children: "All Products"
              }
            ),
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/suppliers",
                className: "block px-3 py-2 text-gray-300 hover:text-[#F4A024]",
                onClick: () => {
                  closeMobileMenu();
                  trackNavigation("mobile_menu", "suppliers");
                },
                children: "Suppliers"
              }
            ),
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/sources",
                className: "block px-3 py-2 text-gray-300 hover:text-[#F4A024]",
                onClick: () => {
                  closeMobileMenu();
                  trackNavigation("mobile_menu", "sources");
                },
                children: "Sources"
              }
            ),
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/countries",
                className: "block px-3 py-2 text-gray-300 hover:text-[#F4A024]",
                onClick: () => {
                  closeMobileMenu();
                  trackNavigation("mobile_menu", "countries");
                },
                children: "Countries"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => toggleMobileDropdown("categories"),
              className: "w-full flex items-center justify-between text-gray-300 hover:text-gray-100 px-3 py-2 rounded-md text-base font-medium bg-gray-700/50",
              children: [
                "Categories",
                /* @__PURE__ */ jsx(ChevronDown, { className: `w-4 h-4 transform transition-transform ${activeDropdown === "categories" ? "rotate-180" : ""}` })
              ]
            }
          ),
          activeDropdown === "categories" && /* @__PURE__ */ jsxs("div", { className: "pl-4 space-y-2 bg-gray-700", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/categories",
                className: "block px-3 py-2 text-gray-300 hover:text-[#F4A024] font-medium border-b border-gray-600",
                onClick: () => {
                  closeMobileMenu();
                  trackNavigation("mobile_menu", "all-categories");
                },
                children: "View All Categories"
              }
            ),
            categories.map((category) => /* @__PURE__ */ jsx(
              Link,
              {
                to: `/search?category=${category.Category_ID}`,
                className: "block px-3 py-2 text-gray-300 hover:text-[#F4A024]",
                onClick: () => {
                  closeMobileMenu();
                  trackNavigation("mobile_category", category.Category_Name);
                },
                children: category.Category_Name
              },
              category.Category_ID
            ))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => toggleMobileDropdown("tools"),
              className: "w-full flex items-center justify-between text-gray-300 hover:text-gray-100 px-3 py-2 rounded-md text-base font-medium bg-gray-700/50",
              children: [
                "Tools",
                /* @__PURE__ */ jsx(ChevronDown, { className: `w-4 h-4 transform transition-transform ${activeDropdown === "tools" ? "rotate-180" : ""}` })
              ]
            }
          ),
          activeDropdown === "tools" && /* @__PURE__ */ jsxs("div", { className: "pl-4 space-y-2 bg-gray-700", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/tools/rfq-template",
                className: "block px-3 py-2 text-gray-300 hover:text-[#F4A024]",
                onClick: () => {
                  closeMobileMenu();
                  trackNavigation("mobile_tools", "rfq-template");
                },
                children: "RFQ Template"
              }
            ),
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/tools/tariff-calculator",
                className: "block px-3 py-2 text-gray-300 hover:text-[#F4A024]",
                onClick: () => {
                  closeMobileMenu();
                  trackNavigation("mobile_tools", "tariff-calculator");
                },
                children: "Tariff Calculator"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => toggleMobileDropdown("about"),
              className: "w-full flex items-center justify-between text-gray-300 hover:text-gray-100 px-3 py-2 rounded-md text-base font-medium bg-gray-700/50",
              children: [
                "About",
                /* @__PURE__ */ jsx(ChevronDown, { className: `w-4 h-4 transform transition-transform ${activeDropdown === "about" ? "rotate-180" : ""}` })
              ]
            }
          ),
          activeDropdown === "about" && /* @__PURE__ */ jsxs("div", { className: "pl-4 space-y-2 bg-gray-700", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/about",
                className: "block px-3 py-2 text-gray-300 hover:text-[#F4A024]",
                onClick: () => {
                  closeMobileMenu();
                  trackNavigation("mobile_menu", "about");
                },
                children: "About Us"
              }
            ),
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/policies",
                className: "block px-3 py-2 text-gray-300 hover:text-[#F4A024]",
                onClick: () => {
                  closeMobileMenu();
                  trackNavigation("mobile_menu", "policies");
                },
                children: "Policies"
              }
            ),
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/contact",
                className: "block px-3 py-2 text-gray-300 hover:text-[#F4A024]",
                onClick: () => {
                  closeMobileMenu();
                  trackNavigation("mobile_menu", "contact");
                },
                children: "Contact"
              }
            )
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(SearchModal, { isOpen: isSearchOpen, onClose: () => setIsSearchOpen(false) }),
    /* @__PURE__ */ jsx(AuthModal, { isOpen: isAuthOpen, onClose: () => setIsAuthOpen(false) })
  ] });
}
function Footer() {
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        const results = await Promise.allSettled([
          supabase.from("Categories").select("Category_ID, Category_Name").order("Category_Name").limit(10),
          supabase.from("Sources").select("Source_ID, Source_Title").order("Source_Title").limit(10),
          supabase.from("Countries").select("Country_ID, Country_Title").order("Country_Title").limit(10)
        ]);
        const [categoriesResult, sourcesResult, countriesResult] = results;
        if (categoriesResult.status === "fulfilled" && categoriesResult.value.data) {
          setCategories(categoriesResult.value.data);
        } else {
          console.warn("Categories fetch failed, using empty array");
          setCategories([]);
        }
        if (sourcesResult.status === "fulfilled" && sourcesResult.value.data) {
          setSources(sourcesResult.value.data);
        } else {
          console.warn("Sources fetch failed, using empty array");
          setSources([]);
        }
        if (countriesResult.status === "fulfilled" && countriesResult.value.data) {
          setCountries(countriesResult.value.data);
        } else {
          console.warn("Countries fetch failed, using empty array");
          setCountries([]);
        }
      } catch (err) {
        console.warn("Footer data fetch error (non-critical):", err);
        setCategories([]);
        setSources([]);
        setCountries([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);
  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return /* @__PURE__ */ jsx("footer", { className: "bg-gray-900/50 backdrop-blur-sm border-t border-gray-800 py-16 mt-16", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-12 text-center", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-gray-100 mb-6", children: "Categories" }),
      categories.length > 0 ? /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: categories.map((category) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
        Link,
        {
          to: `/search?category=${category.Category_ID}`,
          className: "text-gray-400 hover:text-[#F4A024] transition-colors",
          onClick: handleLinkClick,
          children: category.Category_Name
        }
      ) }, category.Category_ID)) }) : /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm", children: "Browse categories" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-gray-100 mb-6", children: "Sources" }),
      sources.length > 0 ? /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: sources.map((source) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
        Link,
        {
          to: `/search?source=${source.Source_ID}`,
          className: "text-gray-400 hover:text-[#F4A024] transition-colors",
          onClick: handleLinkClick,
          children: source.Source_Title
        }
      ) }, source.Source_ID)) }) : /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm", children: "Browse sources" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-gray-100 mb-6", children: "Countries" }),
      countries.length > 0 ? /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: countries.map((country) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
        Link,
        {
          to: `/search?country=${country.Country_ID}`,
          className: "text-gray-400 hover:text-[#F4A024] transition-colors",
          onClick: handleLinkClick,
          children: country.Country_Title
        }
      ) }, country.Country_ID)) }) : /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm", children: "Browse countries" })
    ] })
  ] }) }) });
}
function TourGuide() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return isBrowser ? localStorage.getItem("tourDismissed") === "true" : false;
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [tourData, setTourData] = useState(null);
  useLocation();
  const navigate = useNavigate();
  const fetchTourData = async () => {
    try {
      const { data: product } = await supabase.from("Products").select(`
          Product_ID,
          Supplier (Supplier_ID, Supplier_Title)
        `).limit(1).single();
      if (product) {
        const tourData2 = {
          productId: product.Product_ID,
          supplierId: product.Supplier.Supplier_ID,
          supplierTitle: product.Supplier.Supplier_Title
        };
        setTourData(tourData2);
        return tourData2;
      }
    } catch (error) {
      console.error("Error fetching tour data:", error);
    }
    return null;
  };
  const getTourSteps = (data) => [
    {
      path: "/",
      element: "",
      title: "Take a Tour",
      description: "Learn how to navigate and find our products",
      position: "bottom"
    },
    {
      path: "/",
      element: '[data-tour="search-button"]',
      title: "Search Products",
      description: "Search for products across all categories and suppliers. Try searching for specific products or browse by category.",
      position: "bottom"
    },
    {
      path: data ? `/product/${data.productId}` : "/product/1",
      element: '[data-tour="product-details"]',
      title: "View Product Details",
      description: "Get detailed information about products, including pricing, minimum order quantities, and supplier information.",
      position: "bottom"
    },
    {
      path: data ? `/product/${data.productId}` : "/product/1",
      element: '[data-tour="contact-supplier"]',
      title: "Contact Supplier",
      description: "Connect directly with suppliers through email or WhatsApp to inquire about products.",
      position: "bottom"
    },
    {
      path: data ? createSupplierUrl(data.supplierTitle, data.supplierId) : "/supplier/test-supplier/1",
      element: '[data-tour="supplier-info"]',
      title: "Supplier Information",
      description: "View supplier profiles, including their product catalog and contact information.",
      position: "top"
    },
    {
      path: "/categories",
      element: '[data-tour="categories-grid"]',
      title: "Product Categories",
      description: "Browse products by category to find exactly what you're looking for.",
      position: "top"
    },
    {
      path: "/suppliers",
      element: '[data-tour="suppliers-list"]',
      title: "Supplier Directory",
      description: "Explore our directory of verified Latin American suppliers.",
      position: "top"
    },
    {
      path: "/sources",
      element: '[data-tour="sources-list"]',
      title: "Source Directory",
      description: "View all the marketplaces and sources where products are listed.",
      position: "top"
    },
    {
      path: "/countries",
      element: '[data-tour="countries-list"]',
      title: "Countries Directory",
      description: "Discover products and suppliers from different Latin American countries.",
      position: "top"
    }
  ];
  useEffect(() => {
    if (isVisible) {
      const steps2 = getTourSteps(tourData);
      const step2 = steps2[currentStep];
      if (step2.element) {
        const element = document.querySelector(step2.element);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("tour-highlight");
        }
      }
      return () => {
        document.querySelectorAll(".tour-highlight").forEach((el) => {
          el.classList.remove("tour-highlight");
        });
      };
    }
  }, [currentStep, isVisible, tourData]);
  const startTour = async () => {
    const data = await fetchTourData();
    setTourData(data);
    setIsVisible(true);
    setCurrentStep(0);
    navigate("/");
    analytics.trackEvent("tour_started");
  };
  const nextStep = () => {
    const steps2 = getTourSteps(tourData);
    if (currentStep < steps2.length - 1) {
      const nextStep2 = currentStep + 1;
      setCurrentStep(nextStep2);
      navigate(steps2[nextStep2].path);
      analytics.trackEvent("tour_step_viewed", {
        props: { step: nextStep2 + 1, total_steps: steps2.length }
      });
    } else {
      endTour();
    }
  };
  const prevStep = () => {
    const steps2 = getTourSteps(tourData);
    if (currentStep > 0) {
      const prevStep2 = currentStep - 1;
      setCurrentStep(prevStep2);
      navigate(steps2[prevStep2].path);
    }
  };
  const endTour = () => {
    setIsVisible(false);
    setCurrentStep(0);
    setTourData(null);
    analytics.trackEvent("tour_completed");
    document.querySelectorAll(".tour-highlight").forEach((el) => {
      el.classList.remove("tour-highlight");
    });
  };
  const dismissTour = () => {
    setIsDismissed(true);
    if (isBrowser) {
      localStorage.setItem("tourDismissed", "true");
    }
    analytics.trackEvent("tour_dismissed");
  };
  if (isDismissed) {
    return null;
  }
  if (!isVisible) {
    return /* @__PURE__ */ jsxs("div", { className: "fixed bottom-4 right-4 z-50", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: startTour,
          className: "bg-[#F4A024] text-gray-900 px-4 py-2 rounded-full shadow-lg hover:bg-[#F4A024]/90 transition-colors",
          children: "Take a Tour"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: dismissTour,
          className: "absolute -top-2 -right-2 bg-gray-800 rounded-full p-1 text-gray-400 hover:text-white transition-colors",
          "aria-label": "Dismiss tour button",
          children: /* @__PURE__ */ jsx(X$1, { className: "w-4 h-4" })
        }
      )
    ] });
  }
  const steps = getTourSteps(tourData);
  const step = steps[currentStep];
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 pointer-events-none", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/50" }),
    /* @__PURE__ */ jsxs("div", { className: "pointer-events-auto fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 rounded-lg shadow-xl p-6 max-w-md w-full mx-4", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: endTour,
          className: "absolute top-2 right-2 text-gray-400 hover:text-white transition-colors",
          "aria-label": "Close tour",
          children: /* @__PURE__ */ jsx(X$1, { className: "w-5 h-5" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-white", children: step.title }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-300", children: step.description }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-4", children: [
          /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: Array.from({ length: steps.length }).map((_2, index) => /* @__PURE__ */ jsx(
            "div",
            {
              className: `w-2 h-2 rounded-full ${index === currentStep ? "bg-[#F4A024]" : "bg-gray-600"}`
            },
            index
          )) }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            currentStep > 0 && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: prevStep,
                className: "px-4 py-2 text-gray-300 hover:text-white transition-colors",
                children: "Previous"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: nextStep,
                className: "bg-[#F4A024] text-gray-900 px-4 py-2 rounded-md hover:bg-[#F4A024]/90 transition-colors",
                children: currentStep === steps.length - 1 ? "Finish" : "Next"
              }
            )
          ] })
        ] })
      ] })
    ] })
  ] });
}
function useScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [pathname]);
}
const HomePage = React__default.lazy(() => import("./assets/HomePage-CsVpOiwZ.js"));
const ProductPage = React__default.lazy(() => import("./assets/ProductPage-CpugrE09.js"));
const ProductsPage = React__default.lazy(() => import("./assets/ProductsPage-CrltMV5-.js"));
const SupplierPage = React__default.lazy(() => import("./assets/SupplierPage-nva6IuOy.js"));
const CategoriesPage = React__default.lazy(() => import("./assets/CategoriesPage-COohdAzI.js"));
const AboutPage = React__default.lazy(() => import("./assets/AboutPage-BT9_C4Vf.js"));
const SearchResultsPage = React__default.lazy(() => import("./assets/SearchResultsPage-B6cD8jWN.js"));
const SuppliersListPage = React__default.lazy(() => import("./assets/SuppliersListPage-BNaC5CBu.js"));
const SourcesListPage = React__default.lazy(() => import("./assets/SourcesListPage-21gZEzsY.js"));
const CountriesListPage = React__default.lazy(() => import("./assets/CountriesListPage-CnHHRQCl.js"));
const SavedItemsPage = React__default.lazy(() => import("./assets/SavedItemsPage-D-EGzcOY.js"));
const MessageHistoryPage = React__default.lazy(() => import("./assets/MessageHistoryPage-BVZPet-I.js"));
const RFQTemplatePage = React__default.lazy(() => import("./assets/RFQTemplatePage-eB1r3-7I.js"));
const TariffCalculatorPage = React__default.lazy(() => import("./assets/TariffCalculatorPage-BuCscKvO.js"));
const CreateProfilePage = React__default.lazy(() => import("./assets/CreateProfilePage-_GIsCjXX.js"));
const ProfilePage = React__default.lazy(() => import("./assets/ProfilePage-OjC8iS4_.js"));
const PoliciesPage = React__default.lazy(() => import("./assets/PoliciesPage-DZJTJWHM.js"));
const ContactPage = React__default.lazy(() => import("./assets/ContactPage-Bys9Cy3h.js"));
const routes = [
  {
    path: "/",
    element: /* @__PURE__ */ jsx(HomePage, {})
  },
  {
    path: "/products",
    element: /* @__PURE__ */ jsx(ProductsPage, {})
  },
  {
    path: "/product/:id",
    element: /* @__PURE__ */ jsx(ProductPage, {})
  },
  {
    path: "/supplier/:slug/:supplierId",
    element: /* @__PURE__ */ jsx(SupplierPage, {})
  },
  {
    path: "/categories",
    element: /* @__PURE__ */ jsx(CategoriesPage, {})
  },
  {
    path: "/about",
    element: /* @__PURE__ */ jsx(AboutPage, {})
  },
  {
    path: "/policies",
    element: /* @__PURE__ */ jsx(PoliciesPage, {})
  },
  {
    path: "/contact",
    element: /* @__PURE__ */ jsx(ContactPage, {})
  },
  {
    path: "/search",
    element: /* @__PURE__ */ jsx(SearchResultsPage, {})
  },
  {
    path: "/suppliers",
    element: /* @__PURE__ */ jsx(SuppliersListPage, {})
  },
  {
    path: "/sources",
    element: /* @__PURE__ */ jsx(SourcesListPage, {})
  },
  {
    path: "/countries",
    element: /* @__PURE__ */ jsx(CountriesListPage, {})
  },
  {
    path: "/saved-items",
    element: /* @__PURE__ */ jsx(SavedItemsPage, {})
  },
  {
    path: "/message-history",
    element: /* @__PURE__ */ jsx(MessageHistoryPage, {})
  },
  {
    path: "/tools/rfq-template",
    element: /* @__PURE__ */ jsx(RFQTemplatePage, {})
  },
  {
    path: "/tools/tariff-calculator",
    element: /* @__PURE__ */ jsx(TariffCalculatorPage, {})
  },
  {
    path: "/create-profile",
    element: /* @__PURE__ */ jsx(CreateProfilePage, {})
  },
  {
    path: "/profile",
    element: /* @__PURE__ */ jsx(ProfilePage, {})
  }
];
function NavigationHistoryTracker({ children }) {
  const location = useLocation();
  useEffect(() => {
    if (!isBrowser) return;
    const historyStack = JSON.parse(sessionStorage.getItem("navigationHistory") || "[]");
    let pageTitle = "Home";
    if (location.pathname === "/") {
      pageTitle = "Home";
    } else if (location.pathname === "/products") {
      pageTitle = "Products";
    } else if (location.pathname === "/categories") {
      pageTitle = "Categories";
    } else if (location.pathname === "/about") {
      pageTitle = "About";
    } else if (location.pathname === "/policies") {
      pageTitle = "Policies";
    } else if (location.pathname === "/contact") {
      pageTitle = "Contact";
    } else if (location.pathname === "/search") {
      pageTitle = "Search Results";
    } else if (location.pathname === "/suppliers") {
      pageTitle = "Suppliers";
    } else if (location.pathname === "/sources") {
      pageTitle = "Sources";
    } else if (location.pathname === "/countries") {
      pageTitle = "Countries";
    } else if (location.pathname === "/saved-items") {
      pageTitle = "Saved Items";
    } else if (location.pathname === "/message-history") {
      pageTitle = "Message History";
    } else if (location.pathname === "/tools/rfq-template") {
      pageTitle = "RFQ Template";
    } else if (location.pathname === "/tools/tariff-calculator") {
      pageTitle = "Tariff Calculator";
    } else if (location.pathname === "/create-profile") {
      pageTitle = "Create Profile";
    } else if (location.pathname === "/profile") {
      pageTitle = "Profile";
    } else if (location.pathname.startsWith("/product/")) {
      pageTitle = "Product Details";
    } else if (location.pathname.startsWith("/supplier/")) {
      pageTitle = "Supplier Details";
    }
    const currentEntry = historyStack.length > 0 ? historyStack[historyStack.length - 1] : null;
    if (currentEntry && currentEntry.path === location.pathname) {
      return;
    }
    const newHistoryStack = [...historyStack, { path: location.pathname, title: pageTitle }];
    if (newHistoryStack.length > 10) {
      newHistoryStack.shift();
    }
    sessionStorage.setItem("navigationHistory", JSON.stringify(newHistoryStack));
  }, [location.pathname]);
  return /* @__PURE__ */ jsx(Fragment, { children });
}
function AnalyticsWrapper({ children }) {
  useAnalytics("app");
  useScrollToTop();
  return /* @__PURE__ */ jsx(Fragment, { children });
}
function App() {
  return /* @__PURE__ */ jsx(ErrorBoundary, { children: /* @__PURE__ */ jsx(AnalyticsWrapper, { children: /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-b from-gray-900 to-black", children: [
    /* @__PURE__ */ jsx("div", { className: "fixed inset-0 pointer-events-none gradient-overlay" }),
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center min-h-screen", children: /* @__PURE__ */ jsx(LoadingSpinner, {}) }), children: /* @__PURE__ */ jsx(NavigationHistoryTracker, { children: /* @__PURE__ */ jsx(Routes, { children: routes.map((route) => /* @__PURE__ */ jsx(
      Route,
      {
        path: route.path,
        element: route.element
      },
      route.path
    )) }) }) }),
    /* @__PURE__ */ jsx(Footer, {}),
    /* @__PURE__ */ jsx(TourGuide, {})
  ] }) }) });
}
const CACHE_KEY_PREFIX = "paisan_cache_";
const CACHE_TTL = 1e3 * 60 * 60 * 24;
function createPersistentCache(queryClient2) {
  try {
    if (!isBrowser) return;
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_KEY_PREFIX));
    for (const key of cacheKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const cache = JSON.parse(raw);
      if (Date.now() - cache.timestamp > CACHE_TTL) {
        localStorage.removeItem(key);
        continue;
      }
      const queryKey = JSON.parse(key.replace(CACHE_KEY_PREFIX, ""));
      queryClient2.setQueryData(queryKey, cache.data);
    }
  } catch (error) {
    logError(error instanceof Error ? error : new Error("Cache initialization failed"), {
      source: "cache"
    });
  }
  queryClient2.getQueryCache().subscribe((event) => {
    if (!isBrowser) return;
    if (!event.query.isActive()) return;
    try {
      const queryKey = JSON.stringify(event.query.queryKey);
      const cacheKey = `${CACHE_KEY_PREFIX}${queryKey}`;
      if (event.type === "updated" && event.action.type === "success") {
        const entry = {
          data: event.query.state.data,
          timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(entry));
      }
    } catch (error) {
      logError(error instanceof Error ? error : new Error("Cache update failed"), {
        source: "cache",
        queryKey: event.query.queryKey
      });
    }
  });
}
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1e3 * 60 * 5,
        // 5 minutes
        cacheTime: 1e3 * 60 * 30,
        // 30 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1e3 * 2 ** attemptIndex, 3e4),
        onError: (error) => {
          logError(error instanceof Error ? error : new Error(String(error)), {
            source: "react-query"
          });
        },
        // For SSG, we want to use the cache and not refetch
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
      }
    }
  });
};
const queryClient = createQueryClient();
if (isBrowser) {
  createPersistentCache(queryClient);
}
function mount() {
  const el = typeof document !== "undefined" ? document.getElementById("root") : null;
  if (!el) return;
  createRoot(el).render(
    /* @__PURE__ */ jsx(React__default.StrictMode, { children: /* @__PURE__ */ jsx(HelmetProvider, { children: /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxs(BrowserRouter, { children: [
      /* @__PURE__ */ jsx(App, {}),
      /* @__PURE__ */ jsx(Oe, { position: "top-right" }),
      false
    ] }) }) }) })
  );
}
if (typeof window !== "undefined" && typeof document !== "undefined") {
  mount();
}
function createApp() {
  return /* @__PURE__ */ jsx(React__default.StrictMode, { children: /* @__PURE__ */ jsx(HelmetProvider, { children: /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(BrowserRouter, { children: /* @__PURE__ */ jsx(App, {}) }) }) }) });
}
export {
  Helmet as H,
  LoadingSpinner as L,
  Vt as V,
  analytics as a,
  suppliersIndex as b,
  createSupplierUrl as c,
  createApp,
  logError as d,
  useSavedItems as e,
  useContactHistory as f,
  getSupplierIdFromParams as g,
  isBrowser as i,
  logSearchQuery as l,
  mount,
  productsIndex as p,
  queryClient as q,
  supabase as s,
  useDebouncedValue as u
};
//# sourceMappingURL=main.mjs.map
