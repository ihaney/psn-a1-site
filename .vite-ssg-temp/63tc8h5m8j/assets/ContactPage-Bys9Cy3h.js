import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Mail, Globe, Instagram } from "lucide-react";
import { S as SEO } from "./SEO-hyFW1hhv.js";
import { V as Vt } from "../main.mjs";
import "react-dom/client";
import "react-router-dom";
import "@tanstack/react-query";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "goober";
import "@supabase/supabase-js";
import "meilisearch";
function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Contact Form Submission from ${formData.name}`);
    const body = encodeURIComponent(`Name: ${formData.name}
Email: ${formData.email}

Message:
${formData.message}`);
    const mailtoLink = `mailto:paisanpublishing@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
    Vt.success("Opening email client...");
    setFormData({
      name: "",
      email: "",
      message: ""
    });
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Contact Us",
        description: "Get in touch with Paisán. Contact our team for support, partnerships, or general inquiries."
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "pt-24 pb-16 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-6xl font-bold italic text-[#F4A024] mb-12 paisan-text text-center", children: "Contact Us" }),
      /* @__PURE__ */ jsx("div", { className: "bg-gray-800/50 rounded-lg p-8 mb-12", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-[#F4A024] mb-6", children: "Get in Touch" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(Mail, { className: "w-5 h-5 text-[#F4A024]" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "mailto:paisanpublishing@gmail.com",
                  className: "text-gray-300 hover:text-[#F4A024]",
                  children: "paisanpublishing@gmail.com"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(Globe, { className: "w-5 h-5 text-[#F4A024]" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://paisan.net",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-gray-300 hover:text-[#F4A024]",
                  children: "paisan.net"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(Instagram, { className: "w-5 h-5 text-[#F4A024]" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.instagram.com/paisan.app?igsh=MWF2b2Jkb3VxbXNpbg%3D%3D",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-gray-300 hover:text-[#F4A024]",
                  children: "paisan.app"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-[#F4A024] mb-6", children: "Send us a Message" }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-300 mb-1", children: "Name" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  id: "name",
                  name: "name",
                  value: formData.name,
                  onChange: handleChange,
                  className: "w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F4A024]",
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-300 mb-1", children: "Email" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "email",
                  id: "email",
                  name: "email",
                  value: formData.email,
                  onChange: handleChange,
                  className: "w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F4A024]",
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "message", className: "block text-sm font-medium text-gray-300 mb-1", children: "Message" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  id: "message",
                  name: "message",
                  value: formData.message,
                  onChange: handleChange,
                  rows: 4,
                  className: "w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F4A024]",
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                className: "w-full btn-primary py-2",
                children: "Send Message"
              }
            )
          ] })
        ] })
      ] }) })
    ] }) })
  ] });
}
export {
  ContactPage as default
};
//# sourceMappingURL=ContactPage-Bys9Cy3h.js.map
