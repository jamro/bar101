
function trackEvent(eventName, data = {}) {
  console.log('[tracking event]', eventName, data);
  if(window.gtag) {
    window.gtag('event', eventName, data);
  } else {
    console.warn('[tracking event] gtag not found, skipping event', eventName, data);
  }
}

export default trackEvent;