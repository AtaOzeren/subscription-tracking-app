# 🎨 Typography & Color Standardization Plan

## 📊 Current Analysis

### Text Sizes Currently Used (from all screens):
- `text-5xl` - 3 occurrences (48px)
- `text-3xl` - 3 occurrences (30px)
- `text-2xl` - 3 occurrences (24px)
- `text-xl` - 9 occurrences (20px)
- `text-lg` - 6 occurrences (18px)
- `text-base` - 17 occurrences (16px)
- `text-sm` - 9 occurrences (14px)
- `text-xs` - 5 occurrences (12px)
- `text-[10px]` - 2 occurrences (10px)

### Text Colors Currently Used:
- `text-gray-900` - 48 occurrences (Primary text)
- `text-gray-800` - 4 occurrences (Slightly lighter primary)
- `text-gray-700` - 32 occurrences (Secondary text)
- `text-gray-600` - 9 occurrences (Tertiary text)
- `text-gray-500` - 28 occurrences (Muted/Label text)
- `text-gray-400` - 2 occurrences (Very muted)

---

## 🎯 Standardization Strategy

### 1. **Typography Scale** (Based on HomeScreen)
We'll create semantic typography classes in tailwind.config.js:

#### **Display/Heading Hierarchy:**
- **display-large** → `text-5xl` (48px) - Rarely used, special headers
- **heading-1** → `text-3xl` (30px) - Page titles (e.g., "Good Morning Alex")
- **heading-2** → `text-2xl` (24px) - Section titles
- **heading-3** → `text-xl` (20px) - Subsection titles
- **heading-4** → `text-lg` (18px) - Card/Component titles

#### **Body Text Hierarchy:**
- **body-large** → `text-base` (16px) - Primary body text
- **body-medium** → `text-sm` (14px) - Secondary body text
- **body-small** → `text-xs` (12px) - Captions, labels
- **body-tiny** → `10px` - Very small metadata

---

### 2. **Color Palette** (Semantic Naming)
Instead of `text-gray-900`, we'll use semantic names:

#### **Text Colors:**
- **text-primary** → `#1F2937` (gray-900) - Main headings, primary content
- **text-secondary** → `#374151` (gray-700) - Secondary content, descriptions
- **text-tertiary** → `#6B7280` (gray-600) - Less important text
- **text-muted** → `#9CA3AF` (gray-500) - Placeholders, disabled text, labels
- **text-subtle** → `#D1D5DB` (gray-400) - Very subtle text

#### **Accent Colors:**
- **text-accent** → `#3B82F6` (blue-500) - Links, interactive elements
- **text-success** → `#10B981` (green-600) - Success states
- **text-error** → `#EF4444` (red-600) - Error states
- **text-warning** → `#F59E0B` (amber-500) - Warning states

---

## 📝 Implementation Plan

### Phase 1: Update Tailwind Config
```javascript
// tailwind.config.js
theme: {
  extend: {
    fontSize: {
      // Display & Headings
      'display-lg': ['48px', { lineHeight: '56px', fontWeight: '700' }],
      'heading-1': ['30px', { lineHeight: '36px', fontWeight: '700' }],
      'heading-2': ['24px', { lineHeight: '32px', fontWeight: '700' }],
      'heading-3': ['20px', { lineHeight: '28px', fontWeight: '600' }],
      'heading-4': ['18px', { lineHeight: '26px', fontWeight: '600' }],
      
      // Body Text
      'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
      'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
      'body-sm': ['12px', { lineHeight: '18px', fontWeight: '400' }],
      'body-xs': ['10px', { lineHeight: '16px', fontWeight: '400' }],
    },
    colors: {
      text: {
        primary: '#1F2937',    // gray-900
        secondary: '#374151',  // gray-700
        tertiary: '#6B7280',   // gray-600
        muted: '#9CA3AF',      // gray-500
        subtle: '#D1D5DB',     // gray-400
      },
      accent: {
        DEFAULT: '#3B82F6',    // blue-500
        success: '#10B981',    // green-600
        error: '#EF4444',      // red-600
        warning: '#F59E0B',    // amber-500
      }
    }
  }
}
```

### Phase 2: Create Mapping Document
Before replacing, we'll create a mapping:

| Old Class | New Class | Usage |
|-----------|-----------|-------|
| `text-3xl font-bold text-gray-900` | `text-heading-1 text-primary` | Page titles |
| `text-2xl font-bold text-gray-900` | `text-heading-2 text-primary` | Section headers |
| `text-xl font-semibold text-gray-900` | `text-heading-3 text-primary` | Subsection headers |
| `text-lg font-bold text-gray-900` | `text-heading-4 text-primary` | Card titles |
| `text-base text-gray-700` | `text-body-lg text-secondary` | Primary body |
| `text-sm text-gray-600` | `text-body-md text-tertiary` | Secondary body |
| `text-xs text-gray-500` | `text-body-sm text-muted` | Labels, captions |

### Phase 3: Replace Across All Files
We'll update in this order:
1. **HomeScreen** (reference/baseline)
2. **StatisticsScreen** 
3. **SubscriptionsScreen**
4. **ProfileScreen**
5. **SearchScreen**
6. **AddSubscriptionScreen**
7. **SubscriptionDetailScreen**
8. **SettingsScreen** (and all sub-settings)
9. **Auth Screens** (Login, Register, etc.)
10. **All Components** (Cards, Buttons, etc.)

---

## 🔍 Rules for Consistency

### When to use each typography level:

#### **Heading-1** (text-heading-1):
- ✅ Page titles at the top
- ✅ Greeting messages ("Good Morning Alex")
- ✅ Main screen titles in top bar
- Example: `<Text className="text-heading-1 text-primary">Statistics</Text>`

#### **Heading-2** (text-heading-2):
- ✅ Major section titles
- ✅ Modal titles
- Example: `<Text className="text-heading-2 text-primary">Monthly Spending</Text>`

#### **Heading-3** (text-heading-3):
- ✅ Card titles
- ✅ List section headers
- Example: `<Text className="text-heading-3 text-primary">Active Subscriptions</Text>`

#### **Heading-4** (text-heading-4):
- ✅ Sub-card titles
- ✅ Form section labels
- Example: `<Text className="text-heading-4 text-primary">Top Subscriptions</Text>`

#### **Body-lg** (text-body-lg):
- ✅ Primary readable content
- ✅ Button text
- ✅ Input text
- Example: `<Text className="text-body-lg text-secondary">Your monthly cost</Text>`

#### **Body-md** (text-body-md):
- ✅ Secondary content
- ✅ Descriptions
- ✅ List items
- Example: `<Text className="text-body-md text-tertiary">Last updated 2 hours ago</Text>`

#### **Body-sm** (text-body-sm):
- ✅ Labels
- ✅ Captions
- ✅ Helper text
- Example: `<Text className="text-body-sm text-muted">Billing Cycle</Text>`

#### **Body-xs** (text-body-xs):
- ✅ Timestamps
- ✅ Very small metadata
- ✅ Footnotes
- Example: `<Text className="text-body-xs text-subtle">Updated just now</Text>`

---

## ✅ Benefits

1. **Consistency**: All screens use the same font sizes and colors
2. **Maintainability**: Change once in config, applies everywhere
3. **Semantic**: Class names describe purpose, not appearance
4. **Scalability**: Easy to add new variants or adjust globally
5. **Readability**: Code is cleaner and easier to understand
6. **Accessibility**: Proper hierarchy helps screen readers

---

## 📋 Example Before/After

### Before:
```tsx
<Text className="text-3xl font-bold text-gray-900">Statistics</Text>
<Text className="text-base text-gray-500">View your spending</Text>
<Text className="text-lg font-bold text-gray-900 mb-3">Top Subscriptions</Text>
<Text className="text-sm text-gray-600">Active</Text>
```

### After:
```tsx
<Text className="text-heading-1 text-primary">Statistics</Text>
<Text className="text-body-lg text-muted">View your spending</Text>
<Text className="text-heading-4 text-primary mb-3">Top Subscriptions</Text>
<Text className="text-body-sm text-tertiary">Active</Text>
```

---

## 🚀 Next Steps

1. ✅ Review and approve this plan
2. ⏳ Update tailwind.config.js
3. ⏳ Start with HomeScreen as reference
4. ⏳ Update all other screens one by one
5. ⏳ Update all components
6. ⏳ Final review and testing

