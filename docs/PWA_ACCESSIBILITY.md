# PWA Accessibility Guide

## Overview
This guide provides specific accessibility considerations and implementation details for the Dial a Service PWA application.

## PWA-Specific Accessibility Requirements

### Offline Support
- Clear offline indicators
- Graceful degradation
- Local storage fallbacks
- Offline content caching

### Service Worker Implementation
```typescript
// service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('dial-a-service-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/offline.html',
        '/assets/offline-icon.svg',
        '/css/offline.css'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).catch(() => {
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/offline.html');
        }
      });
    })
  );
});
```

### Offline UI
```tsx
// OfflineIndicator.tsx
export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, []);

  const handleNetworkChange = () => {
    setIsOnline(navigator.onLine);
    if (!navigator.onLine) {
      // Announce offline status
      const message = document.createElement('div');
      message.setAttribute('role', 'status');
      message.setAttribute('aria-live', 'assertive');
      message.textContent = 'You are currently offline.';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 5000);
    }
  };

  if (isOnline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-0 left-0 right-0 bg-red-500 text-white p-4 text-center"
    >
      You are currently offline. Some features may not be available.
    </div>
  );
}
```

### App Manifest
```json
{
  "name": "Dial a Service Marketplace",
  "short_name": "Dial a Service",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0070f3",
  "orientation": "any",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## Installation UI
```tsx
// InstallPrompt.tsx
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      setDeferredPrompt(null);
    });
  };

  return (
    <button
      onClick={handleInstall}
      aria-label="Install Dial a Service app"
      className="btn"
      disabled={!deferredPrompt}
    >
      Install App
    </button>
  );
}
```

## Accessibility Considerations

### Offline States
- Clear offline indicators
- Graceful degradation
- Offline content fallbacks
- Local storage management
- Error handling

### App Installation
- Clear installation prompts
- Proper ARIA labels
- Focus management
- Keyboard accessibility
- Screen reader support

### Push Notifications
- Accessible notification content
- Proper ARIA roles
- Keyboard navigation
- Focus management
- Screen reader support

### Local Storage
- Data persistence
- Offline sync
- Error handling
- User feedback
- Security considerations

## Best Practices

### Offline Support
- Always provide offline indicators
- Cache critical assets
- Handle network errors gracefully
- Provide local storage fallbacks
- Test offline scenarios

### App Installation
- Clear installation prompts
- Proper ARIA labels
- Keyboard accessible
- Screen reader support
- Test installation flow

### Push Notifications
- Accessible content
- Clear actions
- Proper ARIA roles
- Keyboard navigation
- Screen reader support

### Local Storage
- Data persistence
- Offline sync
- Error handling
- User feedback
- Security considerations

## Testing

### Offline Testing
- Network simulation
- Local storage testing
- Error handling
- Graceful degradation
- User feedback

### App Installation
- Installation flow
- ARIA labels
- Keyboard navigation
- Screen reader support
- Error handling

### Push Notifications
- Notification content
- ARIA roles
- Keyboard navigation
- Screen reader support
- Error handling

### Local Storage
- Data persistence
- Offline sync
- Error handling
- User feedback
- Security testing

## Resources

### Documentation
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Push Notifications](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

### Tools
- Chrome DevTools
- Lighthouse
- AXE CLI
- Wave
- Color Contrast Analyzer
