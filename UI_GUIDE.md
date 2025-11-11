# 🎨 DownloadData UI Guide

## Preview Modal - Before & After

### ❌ Before (Old Version)
```
┌─────────────────────────────────────────────────────┐
│  รายงานข้อมูล                                [X]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Table with limited width                          │
│  Emoji: ✅ ⏰ ❌ (inconsistent rendering)           │
│  No statistics                                      │
│  Fixed container (no horizontal scroll)             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### ✅ After (New Version)
```
┌───────────────────────────────────────────────────────────────┐
│  รายงานข้อมูล                                      [X]       │
├───────────────────────────────────────────────────────────────┤
│  ℹ️ เลื่อนซ้าย-ขวาเพื่อดูข้อมูลทั้งหมด                        │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ ◄──────────────── Scroll Horizontally ──────────────►  │   │
│ │ ┌───────────────────────────────────────────────────┐  │   │
│ │ │ รหัส │ ชื่อ │ แผนก │ สถานะ │ GPS │ ...          │  │   │
│ │ ├───────────────────────────────────────────────────┤  │   │
│ │ │ 001  │ สม  │ HR   │ ✓ ตรงเวลา │ ✓ อยู่ในพื้นที่ │  │   │
│ │ │ 002  │ สมใ │ IT   │ ⏰ มาสาย │ ⚠ นอกพื้นที่     │  │   │
│ │ │ 003  │ สมศ │ HR   │ ❌ ขาดงาน │ -               │  │   │
│ │ └───────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌───────────────┬───────────────┬───────────────┬─────────┐ │
│  │ 👥 จำนวนพนักงาน │ 🏢 จำนวนแผนก │ 📍 จำนวนสาขา  │ 📊 %    │ │
│  │      50       │      5       │      2       │  92%    │ │
│  └───────────────┴───────────────┴───────────────┴─────────┘ │
│                                                               │
│  [ดาวน์โหลด Excel] [ดาวน์โหลด PDF] [ปิด]                    │
└───────────────────────────────────────────────────────────────┘
```

---

## Status Badges Comparison

### ❌ Old (Emoji)
```
✅ ตรงเวลา       (inconsistent size/color)
⏰ มาสาย        (may not render in PDF)
❌ ขาดงาน       (platform-dependent)
```

### ✅ New (SVG Badges)
```
┌─────────────┐
│ ✓ ตรงเวลา   │  ← Green badge with check icon
└─────────────┘

┌─────────────┐
│ ⏰ มาสาย    │  ← Yellow badge with clock icon
└─────────────┘

┌─────────────┐
│ ✗ ขาดงาน   │  ← Red badge with cross icon
└─────────────┘
```

**Benefits**:
- ✅ Consistent rendering across all browsers
- ✅ Works perfectly in PDF generation
- ✅ Scalable (SVG)
- ✅ Customizable colors
- ✅ Better accessibility

---

## Color Scheme

### Status Colors
```css
/* Success - Green */
.badge-success {
  background: #DCFCE7;      /* bg-green-100 */
  color: #166534;           /* text-green-800 */
  border: #86EFAC;          /* border-green-300 */
}

/* Warning - Yellow */
.badge-warning {
  background: #FEF3C7;      /* bg-yellow-100 */
  color: #854D0E;           /* text-yellow-800 */
  border: #FDE047;          /* border-yellow-300 */
}

/* Error - Red */
.badge-error {
  background: #FEE2E2;      /* bg-red-100 */
  color: #991B1B;           /* text-red-800 */
  border: #FCA5A5;          /* border-red-300 */
}

/* Info - Blue */
.badge-info {
  background: #DBEAFE;      /* bg-blue-100 */
  color: #1E40AF;           /* text-blue-800 */
  border: #93C5FD;          /* border-blue-300 */
}

/* Neutral - Gray */
.badge-neutral {
  background: #F3F4F6;      /* bg-gray-100 */
  color: #1F2937;           /* text-gray-800 */
  border: #D1D5DB;          /* border-gray-300 */
}
```

### Table Header
```css
.table-header {
  background: linear-gradient(to right, #F97316, #EA580C);  /* Orange gradient */
  color: white;
  position: sticky;
  top: 0;
  z-index: 10;
}
```

### Table Rows
```css
/* Alternating rows */
tr:nth-child(even) {
  background: white;
}

tr:nth-child(odd) {
  background: #F9FAFB;      /* bg-gray-50 */
}

/* Hover effect */
tr:hover {
  background: #FFEDD5;      /* bg-orange-50 */
  transition: background-color 0.2s;
}
```

### Statistics Cards
```css
/* Blue Card - จำนวนพนักงาน */
.stat-card-blue {
  background: linear-gradient(135deg, #DBEAFE, #BFDBFE);
  border: 1px solid #93C5FD;
  color: #1E3A8A;
}

/* Purple Card - จำนวนแผนก */
.stat-card-purple {
  background: linear-gradient(135deg, #F3E8FF, #E9D5FF);
  border: 1px solid #D8B4FE;
  color: #581C87;
}

/* Green Card - จำนวนสาขา */
.stat-card-green {
  background: linear-gradient(135deg, #DCFCE7, #BBF7D0);
  border: 1px solid #86EFAC;
  color: #14532D;
}

/* Orange Card - เปอร์เซ็นต์มาตรงเวลา */
.stat-card-orange {
  background: linear-gradient(135deg, #FFEDD5, #FED7AA);
  border: 1px solid #FDBA74;
  color: #7C2D12;
}
```

---

## Responsive Design

### Desktop (> 768px)
```
┌───────────────────────────────────────────────────┐
│  Preview Table (full width with horizontal scroll)│
│  ┌──────────────────────────────────────────────┐ │
│  │ 10+ columns visible                          │ │
│  └──────────────────────────────────────────────┘ │
│                                                   │
│  Statistics Cards (4 columns)                     │
│  ┌──────┬──────┬──────┬──────┐                   │
│  │ Card │ Card │ Card │ Card │                   │
│  └──────┴──────┴──────┴──────┘                   │
└───────────────────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌─────────────────────────┐
│  Preview Table          │
│  (horizontal scroll)    │
│  ┌───────────────────┐  │
│  │ ← Scroll →        │  │
│  └───────────────────┘  │
│                         │
│  Statistics Cards       │
│  (2 columns)            │
│  ┌─────────┬─────────┐  │
│  │ Card 1  │ Card 2  │  │
│  ├─────────┼─────────┤  │
│  │ Card 3  │ Card 4  │  │
│  └─────────┴─────────┘  │
└─────────────────────────┘
```

### Tailwind Classes Used
```jsx
// Desktop: 4 columns
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

// Mobile: 2 columns
// md:grid-cols-4 activates at 768px breakpoint
```

---

## Horizontal Scroll Implementation

### HTML Structure
```jsx
<div className="overflow-y-auto">
  {/* Scroll Hint */}
  <div className="bg-blue-50 px-4 py-2 rounded-lg">
    ℹ️ เลื่อนซ้าย-ขวาเพื่อดูข้อมูลทั้งหมด
  </div>

  {/* Table Container with Horizontal Scroll */}
  <div className="overflow-x-auto">
    <div className="inline-block min-w-full">
      <table className="min-w-full">
        {/* Table content */}
      </table>
    </div>
  </div>
</div>
```

### Key CSS Classes
```css
/* Outer container - vertical scroll only */
.overflow-y-auto {
  overflow-y: auto;
  overflow-x: hidden;
}

/* Inner container - horizontal scroll */
.overflow-x-auto {
  overflow-x: auto;
  overflow-y: visible;
}

/* Inline-block ensures table can exceed container width */
.inline-block {
  display: inline-block;
}

/* Min-width ensures alignment */
.min-w-full {
  min-width: 100%;
}

/* Whitespace nowrap prevents column text wrapping */
.whitespace-nowrap {
  white-space: nowrap;
}
```

### Browser Scrollbar Styling (Optional)
```css
/* Webkit browsers (Chrome, Safari) */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #F97316;  /* Orange */
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #EA580C;  /* Darker orange */
}
```

---

## Icon Components

### Available Icons

#### 1. CheckIcon (✓)
```jsx
<CheckIcon className="text-green-600" size={16} />
```
**Use for**: ตรงเวลา, อยู่ในพื้นที่, มี

#### 2. CrossIcon (✗)
```jsx
<CrossIcon className="text-red-600" size={16} />
```
**Use for**: ขาดงาน, อยู่นอกพื้นที่, ไม่มี

#### 3. ClockIcon (⏰)
```jsx
<ClockIcon className="text-yellow-600" size={16} />
```
**Use for**: มาสาย

#### 4. WarningIcon (⚠)
```jsx
<WarningIcon className="text-yellow-600" size={16} />
```
**Use for**: แจ้งเตือน, อยู่นอกพื้นที่

#### 5. InfoIcon (ℹ)
```jsx
<InfoIcon className="text-blue-600" size={16} />
```
**Use for**: ลางาน, ข้อมูลเพิ่มเติม

#### 6. LocationIcon (📍)
```jsx
<LocationIcon className="text-green-600" size={16} />
```
**Use for**: GPS status

#### 7. UserIcon (👤)
```jsx
<UserIcon className="text-gray-600" size={16} />
```
**Use for**: Employee status

#### 8. CameraIcon (📷)
```jsx
<CameraIcon className="text-purple-600" size={16} />
```
**Use for**: Photo attendance

---

## PDF Output Example

### PDF Layout
```
┌───────────────────────────────────────────────────┐
│  รายงานข้อมูลพนักงาน                              │
│  ระยะเวลา: 01/01/2024 - 31/01/2024               │
│  สร้างโดย: นางสาวสุภาพร จันทร์เพ็ญ                │
│  สร้างเมื่อ: 15/11/2024 14:30                    │
├───────────────────────────────────────────────────┤
│  สรุปข้อมูล                                       │
│  • จำนวนพนักงาน: 50 คน                           │
│  • จำนวนแผนก: 5 แผนก                             │
│  • จำนวนสาขา: 2 สาขา                             │
│  • เปอร์เซ็นต์มาตรงเวลา: 92%                     │
├───────────────────────────────────────────────────┤
│  รหัส │ ชื่อ │ แผนก │ สาขา │ สถานะ │ GPS        │
│  001  │ สม   │ HR   │ BKK  │ ✓ ตรงเวลา │ ✓ อยู่ใน │
│  002  │ สมใจ │ IT   │ BKK  │ ⏰ มาสาย │ ⚠ นอก    │
│  003  │ สมศรี│ HR   │ CNX  │ ✗ ขาดงาน │ -        │
│  ...                                              │
└───────────────────────────────────────────────────┘
       Page 1 of 3
```

### PDF Features
- ✅ Thai font rendering (THSarabunNew)
- ✅ Inline SVG status badges (colored)
- ✅ Multi-page support (auto page break every ~30 rows)
- ✅ Statistics summary at top
- ✅ Metadata (report title, date range, generated by)
- ✅ Professional styling with gradient header

---

## Animation & Transitions

### Hover Effects
```css
/* Table row hover */
tr:hover {
  background: #FFEDD5;
  transition: background-color 0.2s ease-in-out;
}

/* Button hover */
button:hover {
  transform: scale(1.02);
  transition: transform 0.2s ease-in-out;
}

/* Badge hover */
.badge:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease-in-out;
}
```

### Loading States (Future Enhancement)
```jsx
{isLoading && (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
  </div>
)}
```

---

## Accessibility Improvements

### Keyboard Navigation
```jsx
// Focus visible on table cells
<td className="focus:ring-2 focus:ring-orange-500 focus:outline-none" tabIndex={0}>
  {value}
</td>

// Keyboard-accessible buttons
<button className="focus:ring-2 focus:ring-orange-500 focus:outline-none">
  ดาวน์โหลด
</button>
```

### Screen Reader Support
```jsx
// ARIA labels for status badges
<div role="status" aria-label={`สถานะ: ${status}`}>
  <StatusBadge status={status} />
</div>

// Table headers with scope
<th scope="col" className="...">
  รหัสพนักงาน
</th>

// Skip to content link
<a href="#main-content" className="sr-only focus:not-sr-only">
  ข้ามไปยังเนื้อหาหลัก
</a>
```

---

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 90+ (full support)
- ✅ Firefox 88+ (full support)
- ✅ Safari 14+ (full support)
- ✅ Edge 90+ (full support)

### Fallbacks
```javascript
// SVG support detection
const supportsSVG = document.implementation.hasFeature(
  "http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1"
);

if (!supportsSVG) {
  // Fallback to emoji or text
  return <span>{status}</span>;
}

// PDF generation support
if (!window.html2canvas) {
  // Fallback to CSV download
  console.warn('PDF generation not supported, using CSV');
  downloadCSV();
}
```

---

## Performance Metrics (Target)

### Load Times
- ✅ Preview modal open: < 500ms
- ✅ Data generation (50 records): < 100ms
- ✅ Data generation (500 records): < 500ms
- ✅ CSV download: < 1s
- ✅ PDF generation (50 records): < 3s
- ✅ Horizontal scroll: 60 FPS

### Memory Usage
- ✅ Preview data in memory: < 10 MB
- ✅ PDF generation peak: < 50 MB
- ✅ No memory leaks after multiple downloads

---

**Last Updated**: November 15, 2024  
**Design System**: Tailwind CSS + Custom Components  
**Icons**: Custom SVG Components  
**Fonts**: THSarabunNew (Thai), System Default (Fallback)
