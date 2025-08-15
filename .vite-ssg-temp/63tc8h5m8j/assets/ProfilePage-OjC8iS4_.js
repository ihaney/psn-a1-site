import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, MapPin, Calendar, Bookmark, MessageSquare } from "lucide-react";
import { S as SEO } from "./SEO-hyFW1hhv.js";
import { e as useSavedItems, f as useContactHistory, L as LoadingSpinner, s as supabase } from "../main.mjs";
import { B as Breadcrumbs } from "./Breadcrumbs-Ciuu5swn.js";
import "react-dom/client";
import "@tanstack/react-query";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "goober";
import "@supabase/supabase-js";
import "meilisearch";
function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { data: savedItems = [] } = useSavedItems();
  const { data: messageHistory = [] } = useContactHistory();
  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        const { data: profileData, error } = await supabase.from("user_profiles").select("*").eq("auth_id", user.id).maybeSingle();
        if (error && error.code !== "PGRST116") {
          throw error;
        }
        if (!profileData) {
          navigate("/create-profile");
          return;
        }
        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [navigate]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsx(LoadingSpinner, {}) });
  }
  if (!profile) {
    return /* @__PURE__ */ jsx("div", { className: "pt-24 pb-16", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto px-4", children: [
      /* @__PURE__ */ jsx(Breadcrumbs, { currentPageTitle: "Profile Not Found" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 mb-4", children: "Please sign in to view your profile." }),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/create-profile",
          className: "btn-primary",
          children: "Create Profile"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Your Profile",
        description: "View and manage your profile settings"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "pt-24 pb-16 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsx(Breadcrumbs, { currentPageTitle: "Your Profile" }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 mb-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-8", children: [
          /* @__PURE__ */ jsx("div", { className: "w-20 h-20 bg-[#F4A024] rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx(User, { className: "w-10 h-10 text-gray-900" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-100", children: profile.username || "User Profile" }),
            /* @__PURE__ */ jsxs("p", { className: "text-gray-400", children: [
              "Member since ",
              new Date(profile.created_at).toLocaleDateString()
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-100 mb-4", children: "Personal Information" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              profile.username && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(User, { className: "w-5 h-5 text-[#F4A024]" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400", children: "Username" }),
                  /* @__PURE__ */ jsx("p", { className: "text-gray-100", children: profile.username })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(Mail, { className: "w-5 h-5 text-[#F4A024]" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400", children: "Email" }),
                  /* @__PURE__ */ jsx("p", { className: "text-gray-100", children: profile.email })
                ] })
              ] }),
              (profile.city || profile.country) && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(MapPin, { className: "w-5 h-5 text-[#F4A024]" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400", children: "Location" }),
                  /* @__PURE__ */ jsx("p", { className: "text-gray-100", children: [profile.city, profile.country].filter(Boolean).join(", ") })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(Calendar, { className: "w-5 h-5 text-[#F4A024]" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400", children: "Member since" }),
                  /* @__PURE__ */ jsx("p", { className: "text-gray-100", children: new Date(profile.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  }) })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-100 mb-4", children: "Activity Summary" }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "bg-gray-700/30 rounded-lg p-4 text-center", children: [
                /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-[#F4A024] mb-1", children: savedItems.length }),
                /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-400", children: "Saved Items" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-gray-700/30 rounded-lg p-4 text-center", children: [
                /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-[#F4A024] mb-1", children: messageHistory.length }),
                /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-400", children: "Contacts Made" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs(
                Link,
                {
                  to: "/saved-items",
                  className: "flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors",
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                      /* @__PURE__ */ jsx(Bookmark, { className: "w-5 h-5 text-[#F4A024]" }),
                      /* @__PURE__ */ jsx("span", { className: "text-gray-100", children: "Saved Items" })
                    ] }),
                    savedItems.length > 0 && /* @__PURE__ */ jsx("span", { className: "bg-[#F4A024] text-gray-900 text-xs px-2 py-1 rounded-full font-medium", children: savedItems.length })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                Link,
                {
                  to: "/message-history",
                  className: "flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors",
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                      /* @__PURE__ */ jsx(MessageSquare, { className: "w-5 h-5 text-[#F4A024]" }),
                      /* @__PURE__ */ jsx("span", { className: "text-gray-100", children: "Message History" })
                    ] }),
                    messageHistory.length > 0 && /* @__PURE__ */ jsx("span", { className: "bg-[#F4A024] text-gray-900 text-xs px-2 py-1 rounded-full font-medium", children: messageHistory.length })
                  ]
                }
              )
            ] })
          ] })
        ] })
      ] }),
      (savedItems.length > 0 || messageHistory.length > 0) && /* @__PURE__ */ jsxs("div", { className: "bg-gray-800/50 backdrop-blur-sm rounded-lg p-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-100 mb-6", children: "Recent Activity" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [
          savedItems.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-100 mb-4", children: "Recently Saved" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              savedItems.slice(0, 3).map((item) => /* @__PURE__ */ jsxs(
                Link,
                {
                  to: `/product/${item.id}`,
                  className: "flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors",
                  children: [
                    item.image && /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: item.image,
                        alt: item.name,
                        className: "w-12 h-12 object-cover rounded"
                      }
                    ),
                    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-gray-100 font-medium truncate", children: item.name }),
                      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400", children: item.supplier })
                    ] })
                  ]
                },
                item.id
              )),
              savedItems.length > 3 && /* @__PURE__ */ jsxs(
                Link,
                {
                  to: "/saved-items",
                  className: "block text-center text-[#F4A024] hover:text-[#F4A024]/80 text-sm py-2",
                  children: [
                    "View all ",
                    savedItems.length,
                    " saved items"
                  ]
                }
              )
            ] })
          ] }),
          messageHistory.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-100 mb-4", children: "Recent Contacts" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              messageHistory.slice(0, 3).map((item) => /* @__PURE__ */ jsxs(
                Link,
                {
                  to: `/product/${item.product.id}`,
                  className: "flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors",
                  children: [
                    item.product.image && /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: item.product.image,
                        alt: item.product.name,
                        className: "w-12 h-12 object-cover rounded"
                      }
                    ),
                    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-gray-100 font-medium truncate", children: item.product.name }),
                      /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-400", children: [
                        "Contacted ",
                        item.product.supplier,
                        " via ",
                        item.contactMethod
                      ] })
                    ] })
                  ]
                },
                item.id
              )),
              messageHistory.length > 3 && /* @__PURE__ */ jsxs(
                Link,
                {
                  to: "/message-history",
                  className: "block text-center text-[#F4A024] hover:text-[#F4A024]/80 text-sm py-2",
                  children: [
                    "View all ",
                    messageHistory.length,
                    " contacts"
                  ]
                }
              )
            ] })
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  ProfilePage as default
};
//# sourceMappingURL=ProfilePage-OjC8iS4_.js.map
