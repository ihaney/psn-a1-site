import { jsxs, jsx } from "react/jsx-runtime";
import { H as Helmet, i as isBrowser } from "../main.mjs";
function SEO({
  title,
  description = "Discover authentic Latin American products and connect with trusted suppliers. Paisán bridges the gap between Latin American suppliers and global markets.",
  keywords = "Latin American products, wholesale, suppliers, marketplace, Mexico, Colombia, Brazil, import, export, B2B",
  image = "https://paisan.net/social-preview.jpg",
  url = isBrowser ? window.location.href : "https://paisan.net",
  type = "website"
}) {
  const fullTitle = `${title} | Paisán`;
  return /* @__PURE__ */ jsxs(Helmet, { children: [
    /* @__PURE__ */ jsx("title", { children: fullTitle }),
    /* @__PURE__ */ jsx("meta", { name: "title", content: fullTitle }),
    /* @__PURE__ */ jsx("meta", { name: "description", content: description }),
    /* @__PURE__ */ jsx("meta", { name: "keywords", content: keywords }),
    /* @__PURE__ */ jsx("meta", { property: "og:type", content: type }),
    /* @__PURE__ */ jsx("meta", { property: "og:url", content: url }),
    /* @__PURE__ */ jsx("meta", { property: "og:title", content: fullTitle }),
    /* @__PURE__ */ jsx("meta", { property: "og:description", content: description }),
    /* @__PURE__ */ jsx("meta", { property: "og:image", content: image }),
    /* @__PURE__ */ jsx("meta", { property: "twitter:card", content: "summary_large_image" }),
    /* @__PURE__ */ jsx("meta", { property: "twitter:url", content: url }),
    /* @__PURE__ */ jsx("meta", { property: "twitter:title", content: fullTitle }),
    /* @__PURE__ */ jsx("meta", { property: "twitter:description", content: description }),
    /* @__PURE__ */ jsx("meta", { property: "twitter:image", content: image }),
    /* @__PURE__ */ jsx("link", { rel: "canonical", href: url })
  ] });
}
export {
  SEO as S
};
//# sourceMappingURL=SEO-hyFW1hhv.js.map
