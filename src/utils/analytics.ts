// Plausible Analytics setup
export const initAnalytics = (domain?: string) => {
  if (!domain) {
    console.warn('Plausible domain not configured');
    return;
  }

  // Plausible script injection
  const script = document.createElement('script');
  script.defer = true;
  script.setAttribute('data-domain', domain);
  script.src = 'https://plausible.io/js/plausible.js';
  document.head.appendChild(script);

  console.log('Plausible Analytics initialized for domain:', domain);
};

// Analytics events
export const trackEvent = (eventName: string, props?: Record<string, any>) => {
  if ((window as any).plausible) {
    (window as any).plausible(eventName, { props });
  } else {
    console.log('Analytics event:', eventName, props);
  }
};

// Page view tracking (usually auto-tracked by Plausible)
// But you can manually trigger page views
export const trackPageView = (page?: string) => {
  trackEvent('pageview', { page });
};
