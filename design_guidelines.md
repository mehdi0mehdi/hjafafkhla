# Steam Family Design Guidelines

## Design Approach

**Selected Approach**: Hybrid Reference-Based (Steam/GitHub-inspired) + Custom Dark Gaming Aesthetic

**Justification**: This is a gaming tools directory requiring both visual appeal to engage gamers and functional clarity for tool discovery. Drawing inspiration from Steam's dark, content-rich interface and GitHub's organized repository browsing patterns while maintaining a distinctive red-accented gaming identity.

**Core Aesthetic**: Dark, modern gaming platform with bold red accents (#FF0000 or #DC2626), crisp white text (#FFFFFF), and subtle gray tones (#1A1A1A, #262626, #404040) for depth and hierarchy.

---

## Typography System

**Font Families** (via Google Fonts CDN):
- **Primary (Headings)**: Inter Bold/Extrabold - clean, modern, gaming-appropriate
- **Secondary (Body)**: Inter Regular/Medium - excellent readability on dark backgrounds

**Type Scale**:
- Hero/Page Titles: text-5xl md:text-6xl font-extrabold (60-72px desktop)
- Section Headers: text-3xl md:text-4xl font-bold (36-48px desktop)
- Tool Titles: text-2xl md:text-3xl font-bold (30-36px desktop)
- Subsections: text-xl font-semibold (24px)
- Body Text: text-base leading-relaxed (16px, 1.75 line-height)
- Small Text/Meta: text-sm text-gray-400 (14px)
- Buttons: text-base font-semibold uppercase tracking-wide

---

## Layout & Spacing System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16, 20, 24** for consistency

**Container Strategy**:
- Max-width: max-w-7xl for main content areas
- Padding: px-4 md:px-6 lg:px-8 for edge breathing room
- Section spacing: py-12 md:py-16 lg:py-20 between major sections

**Grid System**:
- Tool Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Feature Highlights: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4
- Admin Dashboard Stats: grid-cols-2 lg:grid-cols-4 gap-4

---

## Component Library

### Navigation
**Top Navigation Bar**:
- Fixed header with backdrop-blur-md bg-black/90 for depth
- Height: h-16 md:h-20
- Logo left (Steam Family with red accent icon), nav center, auth buttons right
- Mobile: Hamburger menu transforming to slide-out panel
- Active state: red bottom border (border-b-2 border-red-600)

### Tool Cards (Homepage Grid)
**Structure**:
- Dark card background: bg-gray-900 rounded-lg overflow-hidden
- Hover state: transform hover:scale-105 transition-transform duration-200
- Image: aspect-video object-cover with gradient overlay for text legibility
- Content padding: p-6
- Tag pills: inline-flex items-center px-3 py-1 rounded-full bg-gray-800 text-xs text-gray-300
- Download count: Red icon + white number (e.g., "1.2K downloads")
- Rating: Yellow stars + average score

### Tool Detail Page
**Hero Section**:
- Full-width dark gradient background (black to gray-900)
- Two-column layout on desktop: Left 60% (images/gallery), Right 40% (title, tags, action buttons)
- Image gallery: Main large image with thumbnail strip below (4-5 thumbnails)
- Download buttons stacked vertically: Primary red button (bg-red-600 hover:bg-red-700) with white text, secondary buttons with red outline
- Donate/Telegram buttons: Icon + label, bg-gray-800 hover:bg-gray-700

**Content Sections**:
- Description: Rendered Markdown with custom dark styling (headings in white, code blocks in bg-gray-800)
- Reviews: Card-based layout, user avatar (placeholder circle), 5-star rating display, review text, timestamp

### Admin Panel
**Dashboard Layout**:
- Sidebar navigation (left, w-64): Dark bg-gray-900 with red active indicators
- Main content area: bg-black with gray-800 cards for stats/forms
- Stats cards: bg-gray-900 rounded-lg p-6, large numbers in red, labels in gray-400
- Forms: Dark inputs (bg-gray-800 border-gray-700 text-white) with red focus rings
- Markdown preview: Split-pane editor (50/50) with live preview on right

### Buttons
**Primary Action** (Downloads, Submit):
- bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg
- Icons: Heroicons placed before text with mr-2 spacing

**Secondary Action** (Cancel, Back):
- border-2 border-gray-700 hover:border-gray-600 text-white bg-transparent px-6 py-3 rounded-lg

**Icon Buttons** (Donate, Telegram):
- bg-gray-800 hover:bg-gray-700 p-3 rounded-full with icon centered
- Tooltip on hover showing label

### Forms & Inputs
**Text Inputs**:
- bg-gray-800 border border-gray-700 focus:border-red-600 focus:ring-2 focus:ring-red-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-500

**Textareas** (Reviews, Admin):
- Same styling as text inputs, min-h-32 for reviews, min-h-64 for admin descriptions

**Star Rating Input**:
- Interactive 5-star selector, gray-400 default, red-500 selected, hover shows preview

### Modals/Popups (Donate/Telegram)
**Session Popups**:
- Fixed center overlay with backdrop-blur-sm bg-black/80
- Content card: bg-gray-900 rounded-xl p-8 max-w-md
- Close button: top-right, text-gray-400 hover:text-white
- CTA button: Red primary button with external link icon
- Show once per session using sessionStorage

---

## Page-Specific Layouts

### Homepage
1. **Hero Section** (h-96 md:h-[500px]):
   - Dark gradient background with subtle red glow effect
   - Centered content: "Discover Essential Steam & Gaming Tools"
   - Search bar: Large (h-14), dark with red accent on focus
   - Quick stats: "500+ Tools • 10K+ Downloads • Trusted Community"

2. **Featured Tools Section**:
   - "Featured Tools" heading with red accent underline
   - 3-column grid of top-rated tools with large cards

3. **Browse All Tools**:
   - Filter sidebar (left 1/4): Categories, tags, sort options (bg-gray-900)
   - Tool grid (right 3/4): Responsive card grid
   - Pagination at bottom: Red active page, gray inactive

4. **Footer**:
   - bg-gray-900 pt-12 pb-6
   - Three columns: About, Quick Links, Legal (Privacy/Terms)
   - Social icons in red-600 hover:red-500
   - Copyright text-gray-500 text-sm

### Tool Detail Page
1. Hero with image gallery + action sidebar (described above)
2. Tabbed content: Description (default) | Reviews | Download History (if logged in)
3. Related Tools carousel at bottom

### Admin Dashboard
1. Sidebar + main content layout
2. Dashboard home: Stats cards grid + recent activity list
3. Manage Tools: Data table with edit/delete actions, "Add New Tool" prominent red button
4. Create/Edit Tool: Full-width form with preview pane

---

## Images

**Homepage Hero**: 
- Gaming-themed abstract background (dark with red/black gradients, subtle tech patterns)
- 1920x600px, optimized for web
- Placement: Full-width background with centered text overlay

**Tool Cards**:
- Tool screenshots or icons, 16:9 aspect ratio
- 800x450px minimum resolution
- Each tool should have 1 primary image for cards, 3-5 images for detail page gallery

**Admin Default Placeholder**:
- Generic tool icon or "No image" graphic in gray-700 on gray-900 background

---

## Accessibility & Polish

- All interactive elements have focus:ring-2 ring-red-600 for keyboard navigation
- Icon buttons include aria-labels
- Forms have proper labels and error states (red-500 text + border)
- Loading states: Animated red pulse effect for async actions
- Toast notifications: Slide-in from top-right, bg-gray-900 with red/green accent for success/error

This design creates a cohesive, modern gaming platform aesthetic with excellent usability for both casual users browsing tools and admins managing content.