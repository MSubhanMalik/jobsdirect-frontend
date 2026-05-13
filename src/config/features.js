/**
 * Feature flags — single source of truth for feature availability.
 *
 * V1 hides certain features. V2 enables them by flipping flags to true.
 * Only checked at edges: navigation, routes, product displays.
 * Business logic and components never check these — they either get mounted or they don't.
 */
export const Features = {
  cvDatabase: false,            // Hidden for V1 — CV browsing + subscriptions
  fullMessaging: false,          // Hidden for V1 — structured actions remain on application detail
  featuredAddon: false,          // Not in spec — only Highlight addon
  top3Addon: false,              // Not in spec — removed per user decision
  emailApplicationMethod: false, // V1: employer email never shown on job page
}
