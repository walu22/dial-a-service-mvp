# Developer Accessibility Guide

## Setup

### Local Development
```bash
# Run accessibility tests locally
npm run test:accessibility

# Test keyboard navigation
npm run test:keyboard

# Check color contrast
npm run test:color
```

### VS Code Extensions
- AXE for VS Code
- Color Contrast Analyzer
- Accessibility Insights

## Common Components

### Buttons
```tsx
<button
  type="button"
  className="btn"
  aria-label="Primary action"
  onClick={handleClick}
>
  Action
</button>
```

### Links
```tsx
<Link
  href="/about"
  className="link"
  aria-label="About page"
>
  About
</Link>
```

### Forms
```tsx
<form onSubmit={handleSubmit}>
  <label htmlFor="name">Name</label>
  <input
    id="name"
    name="name"
    type="text"
    aria-required="true"
    aria-invalid={errors.name ? 'true' : 'false'}
  />
  {errors.name && (
    <span role="alert" aria-live="polite">
      {errors.name}
    </span>
  )}
</form>
```

### Tables
```tsx
<table role="grid">
  <thead>
    <tr>
      <th scope="col">Header 1</th>
      <th scope="col">Header 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Cell 1</td>
      <td>Cell 2</td>
    </tr>
  </tbody>
</table>
```

### Images
```tsx
<img
  src="/image.jpg"
  alt="Description of image"
  width="300"
  height="200"
  loading="lazy"
/>
```

## ARIA Patterns

### Tabs
```tsx
<div role="tablist">
  <button
    role="tab"
    aria-selected="true"
    aria-controls="panel-1"
  >
    Tab 1
  </button>
  <div id="panel-1" role="tabpanel">
    Content
  </div>
</div>
```

### Modal
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  tabIndex={-1}
>
  <h2 id="modal-title">Title</h2>
  <p id="modal-description">Description</p>
</div>
```

## Common Patterns

### Skip Navigation
```tsx
<a
  href="#main-content"
  className="skip-link"
  tabIndex={0}
>
  Skip to main content
</a>
```

### Focus Management
```tsx
const handleFocus = (e: React.FocusEvent) => {
  if (e.target instanceof HTMLElement) {
    e.target.focus();
  }
};
```

### Error Messages
```tsx
<div role="alert" aria-live="assertive">
  {error}
</div>
```

## Testing Checklist

### Manual Testing
- [ ] Test with keyboard only
- [ ] Test with screen reader
- [ ] Check color contrast
- [ ] Test form validation
- [ ] Check dynamic content
- [ ] Test navigation

### Automated Testing
- [ ] Run AXE CLI
- [ ] Check keyboard navigation
- [ ] Test color contrast
- [ ] Validate ARIA attributes
- [ ] Check focus management

## Common Issues and Fixes

### Keyboard Navigation
- Issue: Tab order is incorrect
- Fix: Use proper HTML structure and tabindex="0"

### Color Contrast
- Issue: Insufficient contrast
- Fix: Use color contrast checker and adjust colors

### ARIA Attributes
- Issue: Missing or incorrect attributes
- Fix: Add proper ARIA roles and attributes

### Focus Management
- Issue: Focus trap
- Fix: Implement proper focus management

### Dynamic Content
- Issue: Changes not announced
- Fix: Use ARIA live regions

## Resources

### Tools
- AXE CLI
- Lighthouse
- Wave
- Color Contrast Analyzer

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.2/)
- [WebAIM](https://webaim.org/)

### Best Practices
- [Deque University](https://dequeuniversity.com/)
- [Accessibility Guidelines](https://www.accessibilityguidelines.com/)
- [A11y Project](https://a11yproject.com/)
