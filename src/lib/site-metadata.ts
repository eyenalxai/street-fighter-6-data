const SITE_TITLE = "SF6 Ranked Data"
const SITE_DESCRIPTION = "Ranked Street Fighter 6 matchup analytics from Buckler reporting periods."

const createSiteHead = () => {return {
  meta: [
    { charSet: "utf8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { title: SITE_TITLE },
    { name: "description", content: SITE_DESCRIPTION },
    { property: "og:title", content: SITE_TITLE },
    { property: "og:description", content: SITE_DESCRIPTION },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_TITLE },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: SITE_TITLE },
    { name: "twitter:description", content: SITE_DESCRIPTION },
  ],
  links: [
    { rel: "icon", href: "/favicon.ico", sizes: "any" },
    { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
    { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
    { rel: "manifest", href: "/site.webmanifest" },
  ],
}}

export { SITE_DESCRIPTION, SITE_TITLE, createSiteHead }
