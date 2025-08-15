import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { L as LoadingSpinner, s as supabase, V as Vt, d as logError, a as analytics } from "../main.mjs";
import "react-dom/client";
import "@tanstack/react-query";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "goober";
import "@supabase/supabase-js";
import "lucide-react";
import "meilisearch";
function CreateProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    city: "",
    country: ""
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Vt.error("No user found. Please sign in again.");
        setLoading(false);
        return;
      }
      const { error: profileError } = await supabase.from("user_profiles").insert({
        auth_id: user.id,
        email: formData.email,
        username: formData.username,
        city: formData.city,
        country: formData.country
      });
      if (profileError) {
        await logError(profileError, {
          type: "profile_creation_error",
          context: {
            userId: user.id,
            formData
          }
        });
        throw profileError;
      }
      analytics.trackEvent("profile_created");
      Vt.success("Profile created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error creating profile:", error);
      Vt.error(error instanceof Error ? error.message : "Failed to create profile. Please try again.");
      await logError(error instanceof Error ? error : new Error("Profile creation failed"), {
        type: "profile_creation_error"
      });
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto p-6", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-100 mb-6", children: "Create Your Profile" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "username", className: "block text-sm font-medium text-gray-300 mb-2", children: "Username *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "username",
            value: formData.username,
            onChange: (e) => setFormData((prev) => ({ ...prev, username: e.target.value })),
            className: "w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F4A024]",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-300 mb-2", children: "Email *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            id: "email",
            value: formData.email,
            onChange: (e) => setFormData((prev) => ({ ...prev, email: e.target.value })),
            className: "w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F4A024]",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "city", className: "block text-sm font-medium text-gray-300 mb-2", children: "City *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "city",
            value: formData.city,
            onChange: (e) => setFormData((prev) => ({ ...prev, city: e.target.value })),
            className: "w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F4A024]",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "country", className: "block text-sm font-medium text-gray-300 mb-2", children: "Country *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "country",
            value: formData.country,
            onChange: (e) => setFormData((prev) => ({ ...prev, country: e.target.value })),
            className: "w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F4A024]",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "w-full btn-primary py-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
          children: loading ? /* @__PURE__ */ jsx(LoadingSpinner, {}) : "Create Profile"
        }
      )
    ] })
  ] });
}
export {
  CreateProfilePage as default
};
//# sourceMappingURL=CreateProfilePage-_GIsCjXX.js.map
