# 🗺️ Routing ve Layout Yapısı

## Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       index.html                             │
│                           ↓                                  │
│                      src/main.tsx                            │
│                           ↓                                  │
│                      src/App.tsx                             │
│                           ↓                                  │
│                   <RouterProvider>                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     MainLayout.tsx                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Header.tsx                         │  │
│  │  Logo | Nav Links | Language | User Menu             │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌──────────┬────────────────────────────────────────────┐  │
│  │ Sidebar  │          Main Content Area                 │  │
│  │          │  ┌──────────────────────────────────────┐  │  │
│  │ • Main   │  │      Breadcrumbs                     │  │  │
│  │   - DB   │  ├──────────────────────────────────────┤  │  │
│  │   - CV   │  │                                      │  │  │
│  │   - CL   │  │        <Outlet />                    │  │  │
│  │   - Jobs │  │    (Page Content Here)               │  │  │
│  │          │  │                                      │  │  │
│  │ • Account│  │                                      │  │  │
│  │   - Prof │  │                                      │  │  │
│  │   - Docs │  └──────────────────────────────────────┘  │  │
│  │   - Sett │          Footer.tsx                        │  │
│  └──────────┴────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Route Hierarchy

```
/
├── / (Home)
│   └── Hero Section + 3 Feature Cards
│
├── /dashboard
│   └── Dashboard Overview (placeholder)
│
├── /cv-builder
│   └── CV Builder Interface (placeholder)
│
├── /cover-letter
│   └── Cover Letter Builder (placeholder)
│
├── /jobs
│   └── Job Listings (placeholder)
│
├── /profile
│   └── User Profile (placeholder)
│
├── /settings
│   └── Settings Page (placeholder)
│
├── /404
│   └── Not Found Page
│
└── /* (any other)
    └── → Redirect to /404
```

## Component Structure

```
src/
├── router/
│   └── index.tsx ..................... Router configuration
│
├── components/
│   ├── layout/
│   │   ├── MainLayout.tsx ............ Main app layout wrapper
│   │   ├── Header.tsx ................ Top navigation bar
│   │   ├── Sidebar.tsx ............... Left sidebar (desktop + mobile)
│   │   ├── Footer.tsx ................ Bottom footer
│   │   ├── Breadcrumbs.tsx ........... Navigation breadcrumbs
│   │   └── LanguageSwitcher.tsx ...... Language selection dropdown
│   │
│   └── ui/ ........................... shadcn/ui components
│       ├── button.tsx
│       ├── dropdown-menu.tsx
│       ├── avatar.tsx
│       ├── separator.tsx
│       ├── scroll-area.tsx
│       └── sheet.tsx
│
├── pages/
│   ├── Home.tsx ...................... Landing page
│   ├── Dashboard.tsx ................. Dashboard page
│   ├── CVBuilder.tsx ................. CV builder page
│   ├── CoverLetter.tsx ............... Cover letter page
│   ├── JobListings.tsx ............... Job listings page
│   ├── Profile.tsx ................... User profile page
│   ├── Settings.tsx .................. Settings page
│   └── NotFound.tsx .................. 404 error page
│
└── lib/
    ├── constants.ts .................. App constants (ROUTES, APP_NAME, etc.)
    └── utils.ts ...................... Utility functions (cn)
```

## Responsive Behavior

### Desktop (> 1024px)
```
┌────────────────────────────────────────┐
│  Header                                │
├──────────┬─────────────────────────────┤
│          │                             │
│ Sidebar  │    Main Content             │
│          │                             │
│          │                             │
└──────────┴─────────────────────────────┘
```

### Mobile (< 1024px)
```
┌────────────────────────────────────────┐
│  ☰ Header                              │
├────────────────────────────────────────┤
│                                        │
│        Main Content (Full Width)       │
│                                        │
│                                        │
└────────────────────────────────────────┘

When ☰ clicked:
┌────────────────────┐
│ Sheet Sidebar      │
│                    │
│ • Main             │
│   - Dashboard      │
│   - CV Builder     │
│   - Cover Letter   │
│   - Jobs           │
│                    │
│ • Account          │
│   - Profile        │
│   - Documents      │
│   - Settings       │
└────────────────────┘
```

## Navigation Features

### Header Navigation
- **Logo**: Links to home (/)
- **Desktop Nav Links**: Dashboard, CV Builder, Cover Letter, Jobs
- **Language Switcher**: EN/TR selection
- **User Menu**: Profile, Settings, Logout

### Sidebar Navigation
- **Main Section**:
  - Dashboard (📊)
  - CV Builder (📄)
  - Cover Letter (✉️)
  - Job Listings (💼)

- **Account Section**:
  - Profile (👤)
  - My Documents (📁)
  - Settings (⚙️)

### Footer
- **4 Columns**: About, Product, Resources, Legal
- **Social Links**: Twitter, GitHub, LinkedIn
- **Copyright**: Dynamic year + app version

## State Management (Ready for Future)

```typescript
// Auth State (Step 5)
const user = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: '',
  initials: 'JD',
}

// i18n State (Step 4)
const currentLanguage = 'en'
const languages = ['en', 'tr']

// Theme State (Step 3)
const theme = 'light' | 'dark'
```

## CSS Variables (Theme System)

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  --muted: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}

.dark {
  /* Dark theme values ready */
}
```

## Next Steps Integration Points

### ADIM 3: Theme Switcher
- Add toggle button in Header
- Use existing CSS variables
- localStorage persistence

### ADIM 4: i18n
- Connect LanguageSwitcher to i18n
- Add translation files
- Update all text content

### ADIM 5: Authentication
- Replace mock user in Header
- Add auth routes (login/register)
- Protected route wrapper

### ADIM 6-8: Profile Pages
- Implement Profile.tsx
- User data management
- Settings page functionality

### ADIM 9-19: CV Builder
- Implement CVBuilder.tsx
- Multi-step form
- Preview functionality
