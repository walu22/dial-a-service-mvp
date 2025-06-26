# Accessibility Testing Guide

## Overview
This guide provides detailed procedures for testing the accessibility of the Dial a Service marketplace application.

## Testing Framework

### Automated Testing
```typescript
// accessibility.test.ts
import { axe } from 'jest-axe';
import { render } from '@testing-library/react';
import App from './App';

describe('Accessibility', () => {
  it('should have no detectable a11y violations', async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Cypress Testing
```typescript
// cypress/support/commands.ts
cy.injectAxe();

cy.checkA11y({
  includedImpacts: ['serious', 'critical'],
  detailedReport: true,
  detailedReportOptions: {
    html: true,
    reportWith: 'violation',
  },
});
```

## Testing Procedures

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] Tab order follows logical sequence
- [ ] All interactive elements are keyboard accessible
- [ ] Clear visible focus indicator
- [ ] No keyboard traps
- [ ] Skip navigation links work
- [ ] Form controls can be filled out
- [ ] Modal dialogs can be closed

#### Screen Reader Testing
- [ ] All content is readable
- [ ] Headings are properly structured
- [ ] Links have descriptive text
- [ ] Form controls have labels
- [ ] Interactive elements have roles
- [ ] Dynamic content is announced
- [ ] Error messages are clear

#### Color Contrast
- [ ] Text meets 4.5:1 contrast ratio
- [ ] Large text meets 3:1 contrast ratio
- [ ] Interactive elements are distinguishable
- [ ] Focus states are visible
- [ ] Error states are clear

#### Forms
- [ ] All fields have labels
- [ ] Required fields are marked
- [ ] Error messages are clear
- [ ] Validation feedback is helpful
- [ ] Submit buttons are accessible
- [ ] Reset functionality works

#### Dynamic Content
- [ ] Changes are announced
- [ ] Loading states are clear
- [ ] Animations can be paused
- [ ] Updates are smooth
- [ ] Error states are handled

### Automated Testing Checklist

#### AXE CLI
- [ ] Run on all pages
- [ ] Check all components
- [ ] Validate ARIA attributes
- [ ] Test color contrast
- [ ] Check keyboard navigation
- [ ] Validate forms
- [ ] Test dynamic content

#### Lighthouse
- [ ] Performance audit
- [ ] Accessibility audit
- [ ] Best practices
- [ ] SEO
- [ ] Progressive Web App

#### Wave
- [ ] Visual audit
- [ ] Color contrast
- [ ] Keyboard navigation
- [ ] ARIA attributes
- [ ] Forms
- [ ] Dynamic content

### Common Issues and Fixes

#### Keyboard Navigation
- Issue: Tab order is incorrect
- Fix: Use proper HTML structure and tabindex="0"

```typescript
// Fix: Proper tab order
<div>
  <button tabIndex="0">First</button>
  <button tabIndex="0">Second</button>
  <button tabIndex="0">Third</button>
</div>
```

#### Color Contrast
- Issue: Insufficient contrast
- Fix: Use color contrast checker and adjust colors

```typescript
// Fix: Proper contrast
<button className="text-white bg-blue-600 hover:bg-blue-700">
  Action
</button>
```

#### ARIA Attributes
- Issue: Missing or incorrect attributes
- Fix: Add proper ARIA roles and attributes

```typescript
// Fix: Proper ARIA
<div role="dialog" aria-modal="true">
  <h2 id="dialog-title">Title</h2>
  <p>Content</p>
</div>
```

#### Focus Management
- Issue: Focus trap
- Fix: Implement proper focus management

```typescript
// Fix: Focus management
const handleFocus = (e: React.FocusEvent) => {
  if (e.target instanceof HTMLElement) {
    e.target.focus();
  }
};
```

### Testing Tools

#### Automated
- AXE CLI
- Lighthouse
- Wave
- Color Contrast Analyzer
- Cypress A11y Plugin
- Jest A11y Plugin

#### Manual
- NVDA
- JAWS
- VoiceOver
- Keyboard only
- Color Contrast Analyzer
- Screen Magnifier

### Testing Environments

#### Desktop
- Chrome with NVDA
- Firefox with JAWS
- Safari with VoiceOver
- Edge with Narrator

#### Mobile
- iOS with VoiceOver
- Android with TalkBack
- Chrome DevTools mobile emulation

### Documentation

#### Test Cases
- Keyboard navigation scenarios
- Screen reader flows
- Color contrast checks
- Form validation
- Dynamic content
- Error handling

#### Results
- AXE CLI reports
- Lighthouse scores
- Manual test logs
- Issue tracking
- Fix documentation

### Best Practices

#### Testing
- Regular automated tests
- Manual testing
- Cross-browser testing
- Mobile testing
- Performance testing

#### Documentation
- Test plans
- Results tracking
- Issue documentation
- Fix procedures
- Training materials

#### Continuous Integration
- Automated tests in CI
- Regular audits
- Performance monitoring
- Issue tracking
- Fix verification
