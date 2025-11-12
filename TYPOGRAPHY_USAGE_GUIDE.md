# 📚 Typography Usage Guide

## 🎯 Overview
This project uses semantic typography classes defined in `tailwind.config.js` for consistent text styling across all screens and components.

---

## 📖 Typography Classes

### Headings

#### `text-heading-1`
**Size:** 30px (line-height: 36px, weight: 700, letter-spacing: -0.5px)  
**Usage:** Page titles, greeting messages, main screen titles  
**Color:** Usually paired with `text-text-primary`

```tsx
<Text className="text-heading-1 text-text-primary">
  Good Morning Alex
</Text>
```

---

#### `text-heading-2`  
**Size:** 24px (line-height: 32px, weight: 700, letter-spacing: -0.3px)  
**Usage:** Major section titles, modal titles  
**Color:** Usually paired with `text-text-primary`

```tsx
<Text className="text-heading-2 text-text-primary">
  Monthly Spending
</Text>
```

---

#### `text-heading-3`
**Size:** 20px (line-height: 28px, weight: 600, letter-spacing: -0.2px)  
**Usage:** Card titles, list section headers  
**Color:** Usually paired with `text-text-primary`

```tsx
<Text className="text-heading-3 text-text-primary">
  Active Subscriptions
</Text>
```

---

#### `text-heading-4`
**Size:** 18px (line-height: 26px, weight: 600)  
**Usage:** Sub-card titles, form section labels  
**Color:** Usually paired with `text-text-primary`

```tsx
<Text className="text-heading-4 text-text-primary">
  Top Subscriptions
</Text>
```

---

### Body Text

#### `text-body-lg`
**Size:** 16px (line-height: 24px, weight: 400)  
**Usage:** Primary readable content, button text, input text  
**Color:** Varies - `text-text-primary`, `text-text-secondary`, `text-text-muted`

```tsx
<Text className="text-body-lg text-text-secondary">
  Your monthly subscription cost
</Text>
```

---

#### `text-body-md`
**Size:** 14px (line-height: 20px, weight: 400)  
**Usage:** Secondary content, descriptions, list items  
**Color:** Usually `text-text-tertiary` or `text-text-muted`

```tsx
<Text className="text-body-md text-text-tertiary">
  Last updated 2 hours ago
</Text>
```

---

#### `text-body-sm`
**Size:** 12px (line-height: 18px, weight: 400)  
**Usage:** Labels, captions, helper text  
**Color:** Usually `text-text-muted`

```tsx
<Text className="text-body-sm text-text-muted">
  Billing Cycle
</Text>
```

---

#### `text-body-xs`
**Size:** 10px (line-height: 16px, weight: 400)  
**Usage:** Timestamps, very small metadata, footnotes  
**Color:** Usually `text-text-subtle`

```tsx
<Text className="text-body-xs text-text-subtle">
  Updated just now
</Text>
```

---

## 🎨 Color Palette

### Text Colors

| Class | Hex | Usage |
|-------|-----|-------|
| `text-text-primary` | `#1F2937` (gray-900) | Main headings, primary content |
| `text-text-secondary` | `#374151` (gray-700) | Secondary content, descriptions |
| `text-text-tertiary` | `#6B7280` (gray-600) | Less important text |
| `text-text-muted` | `#9CA3AF` (gray-500) | Placeholders, disabled text, labels |
| `text-text-subtle` | `#D1D5DB` (gray-400) | Very subtle text |

### Accent Colors

| Class | Hex | Usage |
|-------|-----|-------|
| `text-accent` | `#3B82F6` (blue-500) | Links, interactive elements |
| `text-accent-hover` | `#2563EB` (blue-600) | Hover states |
| `text-accent-success` | `#10B981` (green-600) | Success states, positive values |
| `text-accent-error` | `#EF4444` (red-600) | Error states, negative values |
| `text-accent-warning` | `#F59E0B` (amber-500) | Warning states |

---

## 📋 Common Patterns

### Page Title (Top Bar)
```tsx
<View className="bg-white border-b border-gray-200">
  <View className="px-4 py-4">
    <Text className="text-heading-1 text-text-primary">
      Statistics
    </Text>
  </View>
</View>
```

### Section Header
```tsx
<Text className="text-heading-4 text-text-primary mb-3">
  Active Subscriptions
</Text>
```

### Label + Value Pair
```tsx
<View className="flex-row justify-between">
  <Text className="text-body-lg text-text-muted">
    Monthly Spending
  </Text>
  <Text className="text-body-lg text-text-primary font-semibold">
    $49.99
  </Text>
</View>
```

### Loading State
```tsx
<MinimalLoader size="large" color="#000000" />
<Text className="text-body-lg text-text-tertiary mt-4">
  Loading...
</Text>
```

### Error Message
```tsx
<Text className="text-body-lg text-accent-error text-center mb-4">
  Failed to load data
</Text>
<TouchableOpacity onPress={retry}>
  <Text className="text-body-lg text-accent font-semibold">
    Try Again
  </Text>
</TouchableOpacity>
```

---

## ✅ Do's and Don'ts

### ✅ DO
- Use semantic classes (`text-heading-1`, `text-body-lg`)
- Pair size classes with appropriate color classes
- Use `text-text-primary` for main headings
- Use `text-text-muted` for labels and less important text
- Keep font weights consistent with the defined scale

### ❌ DON'T
- Don't use raw Tailwind sizes like `text-3xl`, `text-base`
- Don't use raw color values like `text-gray-900`
- Don't override font weights defined in typography scale
- Don't mix old and new class names

---

## 🔄 Migration Examples

### Before
```tsx
<Text className="text-3xl font-bold text-gray-900">Statistics</Text>
<Text className="text-base text-gray-500">View your spending</Text>
<Text className="text-lg font-bold text-gray-900 mb-3">Top Subscriptions</Text>
<Text className="text-sm text-gray-600">Active</Text>
<Text className="text-blue-500">Learn More</Text>
```

### After
```tsx
<Text className="text-heading-1 text-text-primary">Statistics</Text>
<Text className="text-body-lg text-text-muted">View your spending</Text>
<Text className="text-heading-4 text-text-primary mb-3">Top Subscriptions</Text>
<Text className="text-body-md text-text-tertiary">Active</Text>
<Text className="text-accent">Learn More</Text>
```

---

## 📱 Screen-Specific Examples

### HomeScreen
```tsx
// Page title
<Text className="text-heading-1 text-text-primary">
  {greetingMessage}
</Text>

// Section header
<Text className="text-heading-4 text-text-primary mb-3">
  Active Subscriptions
</Text>

// Loading text
<Text className="text-body-lg text-text-tertiary mt-4">
  {t('common.loading')}
</Text>
```

### StatisticsScreen
```tsx
// Top bar title
<Text className="text-heading-1 text-text-primary">
  {t('navigation.statistics')}
</Text>

// Card title
<Text className="text-heading-4 text-text-primary mb-3">
  {t('stats.topSubscriptions')}
</Text>

// Label
<Text className="text-body-lg text-text-muted">
  {t('stats.monthlySpending')}
</Text>

// Value
<Text className="text-body-lg text-text-primary font-semibold">
  {formatPrice(amount, currency)}
</Text>
```

### ProfileScreen
```tsx
// User name
<Text className="text-heading-3 text-text-primary mb-1">
  {user?.name}
</Text>

// Email
<Text className="text-body-lg text-text-tertiary">
  {user?.email}
</Text>

// Section title
<Text className="text-heading-3 text-text-primary mb-4">
  {t('profile.regionalSettings')}
</Text>

// Row label
<Text className="text-body-lg text-text-muted">
  {t('profile.region')}
</Text>

// Row value
<Text className="text-body-lg text-text-primary font-semibold">
  {user?.region}
</Text>
```

---

## 🚀 Benefits

1. **Consistency**: All text follows the same visual hierarchy
2. **Maintainability**: Update once in config, changes everywhere
3. **Semantic**: Class names describe purpose, not appearance
4. **Scalability**: Easy to add new variants or adjust globally
5. **Readability**: Code is cleaner and self-documenting
6. **Accessibility**: Proper hierarchy helps screen readers

---

## 📝 Notes

- All font sizes include line-height and default font-weight
- Letter-spacing is applied to heading classes for better readability
- Color classes are semantic and describe their usage
- The system is based on a consistent 2px baseline grid
- All measurements are in pixels for React Native compatibility

