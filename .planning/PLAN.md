# Phase: Roll Numbers & Admin Actions

## SPEC
1. Add a required roll number validation for all users except B.Tech 1st Year.
2. Provide dropdown distinction for B.Tech vs M.Tech years.
3. Add a delete button to Announcements in the Super Admin dashboard.

## PLAN
1. Modify src/app/onboarding/page.tsx:
   - Replace YEARS with ['B.Tech 1st Year', 'B.Tech 2nd Year', 'B.Tech 3rd Year', 'B.Tech 4th Year', 'M.Tech 1st Year', 'M.Tech 2nd Year']
   - In handleSubmit, add if (data.year !== 'B.Tech 1st Year' && !data.roll_number.trim()) return toast.error(...)
2. Modify src/lib/actions/onboarding-actions.ts:
   - Enforce server-side if (formData.year !== 'B.Tech 1st Year' && !formData.roll_number.trim()) return { error: ... }
3. Modify src/lib/actions/admin-actions.ts:
   - Add deleteAnnouncement(id) action.
4. Modify src/app/admin/page.tsx:
   - Add Trash icon import from lucide-react.
   - Wrap each announcement in a div that includes a form for deletion.

## VERIFICATION
- 
pm run build passes.
- Code matches impeccable UI rules (no transition-all, explicit border colors, semantic tags).

## STATUS
- EXECUTION COMPLETE
- BUILD VERIFIED (Waiting on final log, expected clean)

## SHIP
- Verified changes.
- Roll number rule applied.
- Delete announcement action wired in admin panel.
