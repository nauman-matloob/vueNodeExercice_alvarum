import { createRouter, createWebHistory } from "vue-router";
import pinia from "@/stores";
import { useAuthStore } from "@/stores/authStore";

/** @type {import("vue-router").RouteRecordRaw[]} */
const routes = [
  {
    path: "/",
    component: import("@/pages/_layout.user.vue"),
    children: [
      {
        path: "/",
        component: import("@/pages/home.vue"),
      },
      {
        path: "/logout",
        redirect: "/",
        meta: {
          public: true,
        },
        beforeEnter: async () => {
          useAuthStore(pinia).logout();
        },
      },
      {
        path: "/signin",
        component: import("@/pages/signin"),
        meta: {
          public: true,
        },
        beforeEnter: (to, from, next) => {
          const { me } = useAuthStore(pinia);
          if (me) {
            next("/");
          } else {
            next();
          }
        },
      },
    ],
  },
  {
    path: "/*",
    component: import("@/pages/_notFound.vue"),
    meta: {
      public: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (isPublicPath(to)) {
    return next();
  }
  if (useAuthStore(pinia).me) {
    return next();
  }
  useAuthStore(pinia)
    .authenticate()
    .then((me) => {
      if (me) {
        next();
      } else {
        next({
          path: "signin",
          replace: true,
        });
      }
    });
});

const isPublicPath = (to) => {
  for (let i = to.matched.length - 1; i >= 0; i--) {
    if (to.matched[i].meta.public !== undefined) {
      return to.matched[i].meta.public;
    }
  }
  return null;
};

export default router;
