# Task 8a - Members Module (API-Connected)

**Agent:** members-agent
**Date:** 2026-03-04
**Status:** ✅ Completed

## File Created

1. `src/modules/members/page.tsx` — Full API-connected members management page

## Key Improvements Over Original

The original PuspaCare Members page used hardcoded mock data with `useState(initialMembers)`. This version **fully connects to the API** at `/api/v1/members` for all operations.

## Features Implemented

### 1. Header
- Title "Pengurusan Ahli Asnaf" with subtitle
- "Tambah Ahli" button and "Muat Semula" refresh button

### 2. Stats Row (4 cards)
- Jumlah Ahli — total count from API stats
- Aktif — active members count
- Tidak Aktif — inactive members count
- Senarai Hitam — blacklisted members count
- All fetched from API `data.stats` response field

### 3. Search & Filter
- Search input with 400ms debounce (searches name, IC, phone, email, member number via API)
- Status filter dropdown (Semua/Aktif/Tidak Aktif/Senarai Hitam)
- Marital status filter dropdown (Semua/Bujang/Berkahwin/Bercerai/Janda/Duda)
- Sort dropdown (name, income, join date — client-side sorting)

### 4. Desktop Table (md+)
- Columns: No. Ahli, Nama, No. IC, Telefon, Pendapatan, Status, Tindakan
- Color-coded status badges (emerald for Aktif, gray for Tidak Aktif, red for Senarai Hitam)
- Formatted currency (RM) using `Intl.NumberFormat('ms-MY')`
- Action buttons: View, Edit, Delete per row

### 5. Mobile Card List (<md)
- Responsive card layout with key member info
- Same status badges and action buttons
- Compact display with icons

### 6. Pagination
- Page navigation with Previous/Next buttons
- Page number buttons with ellipsis for large page counts
- Shows "Menunjukkan X–Y daripada Z ahli" counter
- 10 items per page

### 7. Add/Edit Dialog
- Full form with react-hook-form + zod validation
- 4 sections: Maklumat Peribadi, Alamat, Maklumat Kewangan, Status & Catatan
- Malaysian states dropdown for address field
- All required fields marked with red asterisk
- Proper error messages in Bahasa Melayu
- POST for create, PUT for update (with `?id=` param)

### 8. View Sheet (Side panel)
- Full member detail view in slide-over sheet
- Avatar with initial letter
- Organized sections with icons
- Edit and Delete action buttons at bottom

### 9. Delete Confirmation
- Alert dialog with member name and number
- Soft delete via API DELETE with `?id=` param
- Bahasa Melayu warning text

## API Integration

All data flows through the API client (`@/lib/api`):

- **GET `/members`** — Paginated list with search, status, maritalStatus params. Response includes `items`, `total`, `page`, `pageSize`, `totalPages`, `stats`
- **POST `/members`** — Create new member with auto-generated memberNumber (PUSPA-XXXX)
- **PUT `/members?id=X`** — Update member by ID
- **DELETE `/members?id=X`** — Soft delete (sets isDeleted: true)

## Display Mappings

- Status: active→Aktif, inactive→Tidak Aktif, blacklisted→Senarai Hitam
- Marital: single→Bujang, married→Berkahwin, divorced→Bercerai, widowed→Janda/Duda
- Currency: RM format via Intl.NumberFormat('ms-MY')

## Technical Details

- Zod schema matches API's memberCreateSchema exactly
- Debounced search (400ms) to avoid excessive API calls
- Client-side sorting after API fetch (name, income, join date)
- Loading skeletons during fetch operations
- Empty state with icon when no results
- Form reset on dialog close
- Error handling with toast notifications in Bahasa Melayu
- `useCallback` for fetchMembers to prevent unnecessary re-renders
- ESLint passes with zero errors
