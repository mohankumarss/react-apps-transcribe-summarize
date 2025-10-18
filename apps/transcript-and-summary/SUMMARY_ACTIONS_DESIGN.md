# CallDetailPage Display Actions - Modern Design Specification

## Overview
This document outlines the design and implementation of two modern ways to view the CallDetailPage:
1. **Open in Collapsible Pane** - CallDetailPage displayed in a collapsible side panel with smooth animations
2. **Open in New Tab** - CallDetailPage displayed in a new browser window/tab

---

## 1. Action Buttons Design

### Button Placement
- Located in the **CallLogPage** (call list view), in each call record row
- Positioned at the end of each row, next to or replacing the existing "View" button
- Grouped together with visual separation
- Accessible via keyboard navigation

### Button Specifications

#### "Open in Collapsible Pane" Button
- **Icon**: Panel/Sidebar icon (e.g., `⊟` or custom SVG)
- **Label**: "Open in Pane" or icon-only with tooltip
- **Tooltip**: "Open call details in collapsible pane"
- **Variant**: Secondary or tertiary based on design system
- **Hover State**: Subtle background color change, slight scale up
- **Size**: Compact, touch-friendly (44px minimum on mobile)

#### "Open in New Tab" Button
- **Icon**: External link icon (e.g., `↗` or custom SVG)
- **Label**: "Open in Tab" or icon-only with tooltip
- **Tooltip**: "Open call details in new tab"
- **Variant**: Secondary or tertiary
- **Hover State**: Subtle background color change, slight scale up
- **Size**: Compact, touch-friendly (44px minimum on mobile)

### Modern Design Principles
- Flat design with subtle shadows
- Smooth transitions (200-300ms)
- Clear visual hierarchy
- Accessible color contrast (WCAG AA)
- Responsive sizing (touch-friendly on mobile)

---

## 2. Collapsible CallDetailPage Pane

### Desktop Layout (> 1024px)
- **Position**: Right side of the screen
- **Width**: 400-500px (adjustable)
- **Animation**: Slide in from right (300ms ease-out)
- **Backdrop**: Semi-transparent overlay (optional, subtle)
- **Close Button**: Top-right corner with X icon
- **Behavior**: Overlay on top of main content, doesn't reflow layout
- **Content**: Full CallDetailPage with all three columns (Transcript, Summary, Notes)

### Tablet Layout (480px - 1024px)
- **Position**: Right side as drawer
- **Width**: 70-80% of screen width
- **Animation**: Slide in from right (300ms ease-out)
- **Backdrop**: Semi-transparent overlay (more visible)
- **Close Button**: Top-right corner with X icon
- **Behavior**: May slightly compress main content or overlay
- **Content**: Full CallDetailPage, may stack columns vertically if needed

### Mobile Layout (< 480px)
- **Position**: Full screen overlay
- **Width**: 100% of screen
- **Animation**: Slide up from bottom or fade in (300ms ease-out)
- **Backdrop**: Semi-transparent overlay (visible)
- **Close Button**: Top-right corner with X icon
- **Swipe**: Support swipe-down to close
- **Behavior**: Full screen modal experience
- **Content**: Full CallDetailPage with responsive single-column layout

### Pane Content Structure
```
┌─────────────────────────────────────┐
│ Call Details                     [X] │  ← Header with close button
├─────────────────────────────────────┤
│                                     │
│  [Call Header Info]                 │
│  ─────────────────────────────────  │
│  Date | Duration | Direction | Phone│
│                                     │
│  [Three Column Layout]              │
│  ┌──────────┬──────────┬──────────┐ │
│  │Transcript│ Summary  │  Notes   │ │
│  │          │          │          │ │
│  │ [Content]│[Content] │[Content] │ │
│  │          │          │          │ │
│  └──────────┴──────────┴──────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### Styling
- **Background**: White or light theme color
- **Border**: Subtle left border (1px, primary color)
- **Shadow**: Elevation shadow (0 8px 24px rgba(0,0,0,0.15))
- **Scrolling**: Internal scroll if content exceeds height
- **Padding**: Consistent spacing (16-24px)

---

## 3. New Tab CallDetailPage View

### Window Specifications
- **Size**: 1200x900px (or 90% of screen if smaller)
- **Position**: Centered on screen
- **Features**: Resizable, scrollable
- **Title**: "Call Details - [Call ID/Date]"
- **Behavior**: Standalone window, independent from main app

### Layout
- **Header**: Call information (date, duration, direction, phone number) with back/close button
- **Content**: Full CallDetailPage with three columns (Transcript, Summary, Notes)
- **Styling**: Standalone, professional appearance
- **Scrolling**: Independent scrolling for each column

### Content Sections
1. **Call Header** - Date, time, duration, direction, phone number
2. **Transcript Column** - Full conversation transcript with search
3. **Summary Column** - AI Summary, Key Points, Action Items, Sentiment Analysis
4. **Notes Column** - User notes editor with auto-save
5. **Footer**: Optional action buttons (Print, Export, Close)

---

## 4. Implementation Details

### Component Structure
```
App.tsx
├── CallLogPage
│   ├── CallTable
│   │   └── CallTableRow (with action buttons)
│   │       ├── OpenInPaneButton
│   │       └── OpenInNewTabButton
│   └── CallDetailPane (new)
│       └── CallDetailPage (rendered in pane context)
└── CallDetailPage (normal navigation)
    ├── CallDetailHeader
    ├── CallDetailBody
    │   ├── TranscriptColumn
    │   ├── SummaryColumn
    │   └── NotesColumn
    └── [Responsive to display context]
```

### State Management
- `detailPaneOpen: boolean` - Controls pane visibility (in CallLogPage)
- `selectedCallForPane: CallRecord | null` - Call record to display in pane
- `displayContext: 'normal' | 'pane' | 'new-tab'` - Context for CallDetailPage rendering

### Animations
- **Pane Open**: `slideInRight` (300ms ease-out)
- **Pane Close**: `slideOutRight` (300ms ease-in)
- **Backdrop Fade**: `fadeIn/fadeOut` (300ms)
- **Respect**: `prefers-reduced-motion` media query

### Keyboard Shortcuts
- **Escape**: Close detail pane
- **Ctrl/Cmd + Shift + P**: Toggle detail pane
- **Ctrl/Cmd + Shift + T**: Open detail in new tab

### Accessibility
- **ARIA**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`
- **Focus**: Trap focus within pane when open, restore focus when closed
- **Buttons**: Keyboard accessible (Enter/Space), proper tab order
- **Contrast**: All text meets WCAG AA standards
- **Screen Readers**: Announce pane open/close, describe button purposes
- **Keyboard Navigation**: Full keyboard support for all interactions

---

## 5. Modern Design Features

### Visual Enhancements
- Smooth transitions and animations
- Subtle shadows and depth
- Consistent color scheme
- Modern typography
- Proper spacing and alignment

### Interaction Patterns
- Smooth slide animations
- Hover effects on buttons
- Loading states for async operations
- Success/error feedback
- Keyboard navigation support

### Responsive Behavior
- Adapts to all screen sizes
- Touch-friendly on mobile
- Swipe gestures on mobile
- Proper z-index management
- No layout shift when pane opens

---

## 6. Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 7. Future Enhancements
- Resizable pane width (desktop)
- Customizable pane position (left/right)
- Summary export to PDF
- Print-friendly summary view
- Share summary via link
- Summary comparison (multiple calls)

