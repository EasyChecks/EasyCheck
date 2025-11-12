# ✅ Manual Testing Checklist - DownloadData Feature

**Tester**: ___________________________  
**Date**: ___________________________  
**Environment**: Dev / Staging / Production  
**Browser**: Chrome / Firefox / Safari / Edge  

---

## 🔐 1. Authentication & Role Verification

### Test 1.1: Super Admin Access
- [ ] Login as Super Admin (email: `admin.super@ggs.co.th`, password: `1234567890123`)
- [ ] Navigate to DownloadData page
- [ ] Verify "Branch Selection" dropdown shows all branches:
  - [ ] กรุงเทพ สาขา 101
  - [ ] กรุงเทพ สาขา 102
  - [ ] เชียงใหม่ สาขา 201
  - [ ] ภูเก็ต สาขา 301
- [ ] Can select multiple branches: ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 1.2: Admin Access (Branch Restriction)
- [ ] Login as Admin (email: `supaporn.admin@ggs.co.th`, password: `1209876543210`)
- [ ] Navigate to DownloadData page
- [ ] Verify "Branch Selection" dropdown shows only:
  - [ ] กรุงเทพ สาขา 101 (user's branch)
- [ ] Cannot select other branches: ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

---

## 📋 2. Data Selection Validation

### Test 2.1: Missing Report Type
- [ ] Leave "รายงาน" unselected
- [ ] Click "ดูข้อมูล"
- [ ] Verify alert shows: "กรุณาเลือกประเภทรายงาน"
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 2.2: Missing Date Range
- [ ] Select "รายงาน"
- [ ] Leave date fields empty
- [ ] Click "ดูข้อมูล"
- [ ] Verify alert shows: "กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด"
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 2.3: Missing Branch Selection (Super Admin)
- [ ] Login as Super Admin
- [ ] Select report + date range
- [ ] Leave branches unselected
- [ ] Click "ดูข้อมูล"
- [ ] Verify alert shows: "กรุณาเลือกอย่างน้อย 1 สาขา"
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 2.4: Missing Data Options
- [ ] Select report + date range + branches
- [ ] Uncheck all data options (ข้อมูลเวลาเข้า/ออก, ข้อมูลส่วนตัว/งาน, etc.)
- [ ] Click "ดูข้อมูล"
- [ ] Verify alert shows: "กรุณาเลือกอย่างน้อย 1 ประเภทข้อมูล"
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

---

## 👀 3. Preview Functionality

### Test 3.1: Basic Preview
- [ ] Select all required fields correctly
- [ ] Click "ดูข้อมูล"
- [ ] Preview modal opens: ☑ Yes / ☐ No
- [ ] Data displays in table: ☑ Yes / ☐ No
- [ ] Number of records displayed: _______
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 3.2: Horizontal Scroll
- [ ] Open preview modal with wide data (all options enabled)
- [ ] Verify scroll hint message visible: "เลื่อนซ้าย-ขวาเพื่อดูข้อมูลทั้งหมด"
- [ ] Table has horizontal scrollbar: ☑ Yes / ☐ No
- [ ] Can scroll left and right: ☑ Yes / ☐ No
- [ ] All columns accessible: ☑ Yes / ☐ No
- [ ] Header remains sticky when scrolling vertically: ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 3.3: Status Visualization
- [ ] Open preview with attendance data enabled
- [ ] Verify status badges appear:
  - [ ] ✓ ตรงเวลา (green badge)
  - [ ] ⏰ มาสาย (yellow badge)
  - [ ] ✗ ขาดงาน (red badge)
  - [ ] ℹ ลางาน (blue badge)
- [ ] Badges are visually consistent: ☑ Yes / ☐ No
- [ ] Icons render correctly (not emoji): ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 3.4: Statistics Cards
- [ ] Verify 4 statistics cards appear below table:
  - [ ] จำนวนพนักงาน: _______ (blue card)
  - [ ] จำนวนแผนก: _______ (purple card)
  - [ ] จำนวนสาขา: _______ (green card)
  - [ ] เปอร์เซ็นต์มาตรงเวลา: _______% (orange card)
- [ ] Numbers match data in table: ☑ Yes / ☐ No
- [ ] Cards are responsive (2 cols on mobile, 4 on desktop): ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 3.5: Table Styling
- [ ] Header has orange gradient background: ☑ Yes / ☐ No
- [ ] Header text is white: ☑ Yes / ☐ No
- [ ] Alternating row colors (white/gray): ☑ Yes / ☐ No
- [ ] Hover effect on rows (orange-50 background): ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

---

## 📥 4. Download Functionality

### Test 4.1: Excel/CSV Download
- [ ] Open preview modal
- [ ] Select "Excel" format
- [ ] Click "ดาวน์โหลด"
- [ ] File downloads successfully: ☑ Yes / ☐ No
- [ ] Filename format correct: `Report_รายงาน_YYYY-MM-DD_to_YYYY-MM-DD.xlsx`
  - Actual filename: ___________________________
- [ ] Open file in Excel/Sheets
- [ ] Thai characters display correctly: ☑ Yes / ☐ No
- [ ] Number of rows matches preview: ☑ Yes / ☐ No (Preview: _____ | Excel: _____)
- [ ] Data values match preview exactly: ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 4.2: PDF Download
- [ ] Open preview modal
- [ ] Select "PDF" format
- [ ] Click "ดาวน์โหลด"
- [ ] File downloads successfully: ☑ Yes / ☐ No
- [ ] Filename format correct: `Report_รายงาน_YYYY-MM-DD_to_YYYY-MM-DD.pdf`
  - Actual filename: ___________________________
- [ ] Open PDF in viewer
- [ ] Thai font renders correctly: ☑ Yes / ☐ No
- [ ] Status badges visible (colored with icons): ☑ Yes / ☐ No
- [ ] Statistics summary at top:
  - [ ] Report title: ___________________________
  - [ ] Date range: ___________________________
  - [ ] Generated by: ___________________________
  - [ ] Generated at: ___________________________
  - [ ] Total employees: _______
  - [ ] Total departments: _______
  - [ ] Total branches: _______
  - [ ] Avg attendance rate: _______%
- [ ] Data matches preview exactly: ☑ Yes / ☐ No
- [ ] Multi-page PDF if > 30 rows: ☑ Yes / ☐ No / ☐ N/A
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 4.3: CSV Download
- [ ] Open preview modal
- [ ] Select "CSV" format
- [ ] Click "ดาวน์โหลด"
- [ ] File downloads successfully: ☑ Yes / ☐ No
- [ ] Filename format correct: `Report_รายงาน_YYYY-MM-DD_to_YYYY-MM-DD.csv`
  - Actual filename: ___________________________
- [ ] Open file in text editor
- [ ] BOM present (starts with `EF BB BF` in hex): ☑ Yes / ☐ No
- [ ] Thai characters readable: ☑ Yes / ☐ No
- [ ] Data matches preview: ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

---

## 🌐 5. Branch Filtering Tests

### Test 5.1: Super Admin - Single Branch
- [ ] Login as Super Admin
- [ ] Select single branch (e.g., BKK101)
- [ ] Preview data
- [ ] All records belong to BKK101: ☑ Yes / ☐ No
  - Branch codes in data: ___________________________
- [ ] Statistics reflect BKK101 only: ☑ Yes / ☐ No
- [ ] Download Excel and verify: ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 5.2: Super Admin - Multiple Branches
- [ ] Login as Super Admin
- [ ] Select multiple branches (e.g., BKK101, CNX201)
- [ ] Preview data
- [ ] Records include both branches: ☑ Yes / ☐ No
  - Branch codes in data: ___________________________
- [ ] Statistics reflect combined totals: ☑ Yes / ☐ No
- [ ] Download PDF and verify: ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 5.3: Admin - Own Branch Only
- [ ] Login as Admin (branchCode: '101')
- [ ] Select options and preview
- [ ] All records belong to BKK101: ☑ Yes / ☐ No
  - Branch codes in data: ___________________________
- [ ] Cannot see other branches' data: ☑ Yes / ☐ No
- [ ] Download and verify: ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

---

## 🔧 6. Data Options Tests

### Test 6.1: Personal Data Only
- [ ] Enable only "ข้อมูลส่วนตัว/งาน"
- [ ] Preview data
- [ ] Columns include:
  - [ ] รหัสพนักงาน
  - [ ] ชื่อ-นามสกุล
  - [ ] แผนก
  - [ ] สาขา
- [ ] No attendance columns: ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 6.2: Attendance Data Only
- [ ] Enable only "ข้อมูลเวลาเข้า/ออก"
- [ ] Preview data
- [ ] Columns include:
  - [ ] ทำงานตรงเวลา
  - [ ] ทำงานมาสาย
  - [ ] ขาดงาน
  - [ ] ลางาน
  - [ ] สถานะปัจจุบัน
- [ ] No GPS or photo columns: ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 6.3: GPS Tracking Only
- [ ] Enable only "GPS Tracking"
- [ ] Preview data
- [ ] Columns include:
  - [ ] GPS สถานะ (อยู่ในพื้นที่ / อยู่นอกพื้นที่)
  - [ ] สถานะปัจจุบัน (ทำงานอยู่ / ออกจากงาน)
- [ ] No attendance or photo columns: ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 6.4: Photo Attendance Only
- [ ] Enable only "ข้อมูลภาพถ่าย"
- [ ] Preview data
- [ ] Columns include:
  - [ ] รูปถ่าย Check-in (มี / ไม่มี)
  - [ ] รูปถ่าย Check-out (มี / ไม่มี)
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 6.5: Event Stats Only
- [ ] Enable only "สถิติการเข้าร่วมกิจกรรม"
- [ ] Preview data
- [ ] Columns include:
  - [ ] กิจกรรมที่เข้าร่วม (number)
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 6.6: All Options Enabled
- [ ] Enable all 5 data options
- [ ] Preview data
- [ ] All columns present (15+ columns): ☑ Yes / ☐ No
- [ ] Horizontal scroll works: ☑ Yes / ☐ No
- [ ] Data complete: ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

---

## 📊 7. Data Accuracy Tests

### Test 7.1: Preview vs Download Consistency
- [ ] Open preview with specific filters
- [ ] Count records in preview: _______
- [ ] Note first record data: ___________________________
- [ ] Note last record data: ___________________________
- [ ] Download as Excel
- [ ] Count rows in Excel (excluding header): _______
- [ ] First record matches: ☑ Yes / ☐ No
- [ ] Last record matches: ☑ Yes / ☐ No
- [ ] Random spot check 5 records: ☑ All match / ☐ Mismatch
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 7.2: Statistics Calculation
- [ ] Open preview with known data set
- [ ] Count unique employees manually: _______
- [ ] Count unique departments manually: _______
- [ ] Count unique branches manually: _______
- [ ] Calculate on-time percentage: _______% 
  - Formula: (On-time count / Total records) * 100
- [ ] Compare with statistics cards:
  - [ ] Employees match: ☑ Yes / ☐ No
  - [ ] Departments match: ☑ Yes / ☐ No
  - [ ] Branches match: ☑ Yes / ☐ No
  - [ ] Attendance rate match: ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 7.3: Date Range Filtering
- [ ] Select date range: 2024-01-01 to 2024-01-31
- [ ] Preview data
- [ ] All records within date range: ☑ Yes / ☐ No
- [ ] No records outside range: ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

---

## 📱 8. Responsive Design Tests

### Test 8.1: Desktop (1920x1080)
- [ ] Preview modal fits screen: ☑ Yes / ☐ No
- [ ] Statistics cards in 4 columns: ☑ Yes / ☐ No
- [ ] Table columns readable: ☑ Yes / ☐ No
- [ ] Horizontal scroll smooth: ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 8.2: Tablet (768x1024)
- [ ] Preview modal responsive: ☑ Yes / ☐ No
- [ ] Statistics cards in 2 columns: ☑ Yes / ☐ No
- [ ] Table scrolls horizontally: ☑ Yes / ☐ No
- [ ] Touch scroll works: ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 8.3: Mobile (375x667)
- [ ] Preview modal fits screen: ☑ Yes / ☐ No
- [ ] Statistics cards in 2 columns: ☑ Yes / ☐ No
- [ ] Table scrolls horizontally: ☑ Yes / ☐ No
- [ ] Touch scroll works: ☑ Yes / ☐ No
- [ ] Buttons accessible: ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

---

## 🖥️ 9. Browser Compatibility

### Test 9.1: Chrome
- [ ] All features work: ☑ Yes / ☐ No
- [ ] SVG icons render: ☑ Yes / ☐ No
- [ ] PDF generates: ☑ Yes / ☐ No
- [ ] Version tested: _______
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 9.2: Firefox
- [ ] All features work: ☑ Yes / ☐ No
- [ ] SVG icons render: ☑ Yes / ☐ No
- [ ] PDF generates: ☑ Yes / ☐ No
- [ ] Version tested: _______
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 9.3: Safari
- [ ] All features work: ☑ Yes / ☐ No
- [ ] SVG icons render: ☑ Yes / ☐ No
- [ ] PDF generates: ☑ Yes / ☐ No
- [ ] Version tested: _______
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 9.4: Edge
- [ ] All features work: ☑ Yes / ☐ No
- [ ] SVG icons render: ☑ Yes / ☐ No
- [ ] PDF generates: ☑ Yes / ☐ No
- [ ] Version tested: _______
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

---

## ⚡ 10. Performance Tests

### Test 10.1: Load Time (50 Records)
- [ ] Select options that return ~50 records
- [ ] Click "ดูข้อมูล"
- [ ] Time from click to preview visible: _______ ms
- [ ] Target: < 500ms
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 10.2: Load Time (500 Records)
- [ ] Select options that return ~500 records
- [ ] Click "ดูข้อมูล"
- [ ] Time from click to preview visible: _______ ms
- [ ] Target: < 3000ms
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 10.3: PDF Generation (50 Records)
- [ ] Generate PDF with ~50 records
- [ ] Time from click to download: _______ seconds
- [ ] Target: < 5s
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 10.4: Multiple Downloads
- [ ] Download Excel (1st time)
- [ ] Download PDF (2nd time)
- [ ] Download CSV (3rd time)
- [ ] All downloads succeed: ☑ Yes / ☐ No
- [ ] Browser remains responsive: ☑ Yes / ☐ No
- [ ] No memory leaks (check Task Manager): ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 10.5: Horizontal Scroll Performance
- [ ] Open preview with 20+ columns
- [ ] Scroll horizontally back and forth rapidly
- [ ] Smooth 60 FPS: ☑ Yes / ☐ No
- [ ] No lag or jank: ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

---

## 🐛 11. Edge Cases & Error Handling

### Test 11.1: Empty Data Set
- [ ] Select filters that return no records
- [ ] Click "ดูข้อมูล"
- [ ] Alert shows: "ไม่มีข้อมูลที่เลือก"
- [ ] No error in console: ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 11.2: Invalid Date Range
- [ ] Set start date after end date
- [ ] Click "ดูข้อมูล"
- [ ] Appropriate validation: ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 11.3: Network Error Simulation (Future API)
- [ ] Simulate network error (offline mode)
- [ ] Click "ดูข้อมูล"
- [ ] Error message shown: ☑ Yes / ☐ No / ☐ N/A (prototype)
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 11.4: Rapid Clicking
- [ ] Click "ดูข้อมูล" multiple times rapidly
- [ ] No duplicate modals: ☑ Yes / ☐ No
- [ ] No errors: ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

---

## 🔍 12. Console & Lint Checks

### Test 12.1: Console Errors
- [ ] Open browser DevTools Console
- [ ] Navigate through all features
- [ ] No errors in console: ☑ Yes / ☐ No
- [ ] No warnings (or documented): ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 12.2: Lint Errors
- [ ] Run `npm run lint` (or check editor)
- [ ] No lint errors: ☑ Yes / ☐ No
- [ ] Output: ___________________________
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

### Test 12.3: Build Test
- [ ] Run `npm run build`
- [ ] Build succeeds: ☑ Yes / ☐ No
- [ ] No build warnings: ☑ Yes / ☐ No
- [ ] **Result**: ☐ Pass / ☐ Fail  
- **Notes**: ___________________________

---

## 📝 Overall Summary

**Total Tests**: 90+  
**Passed**: _______  
**Failed**: _______  
**Pass Rate**: _______% (Target: > 95%)

### Critical Issues Found:
1. ___________________________
2. ___________________________
3. ___________________________

### Minor Issues Found:
1. ___________________________
2. ___________________________
3. ___________________________

### Recommendations:
1. ___________________________
2. ___________________________
3. ___________________________

---

## ✍️ Sign-Off

**Tested By**: ___________________________ (Name)  
**Signature**: ___________________________  
**Date**: ___________________________  

**Reviewed By**: ___________________________ (Name)  
**Signature**: ___________________________  
**Date**: ___________________________  

**Approved for Production**: ☐ Yes / ☐ No / ☐ With Conditions

---

**Version**: 1.0.0  
**Last Updated**: November 15, 2024  
**Next Review**: ___________________________
