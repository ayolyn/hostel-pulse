---
name: hostelpulse-ui-patterns
description: Essential guidelines for HostelPulse UI routing, avatar logic, and data relationships.
trigger: always_on
---

# HostelPulse Architecture & UI Guidelines

## 1. Dashboard Routing & Context Preservation
- **Never** use standalone routes (like /rent or /market) inside the authenticated dashboard if it causes the user to lose their Sidebar and Dashboard shell context.
- **Always** use shallow tab-based routing (e.g., ?tab=find-hostel or ?tab=market) and embed the corresponding views natively within the Dashboard Shell layout (Student/Agent/Landlord).
- When adding links to sidebars, ensure they collapse the mobile menu on mobile devices (e.g., calling onClose?.() on click).

## 2. Avatar & Logo Logic (ProfileSettingsHub)
- Landlord and Agent accounts primarily store their business logo in logo_url, while students use vatar_url.
- When rendering avatars, **always** safely check both properties: use vatar_url if present, otherwise gracefully fallback to logo_url, and finally to a placeholder like Dicebear. Do not assume vatar_url will always be populated for providers.

## 3. Case-Insensitive Role Checks
- User roles in the database or profile objects may not always perfectly match expected casing. 
- **Always** use .toLowerCase() when doing conditional rendering or logic based on role (e.g., if (role?.toLowerCase() === 'agent')).

## 4. Database Cascade Deletions
- Be aware that reviews (in provider_reviews) have a foreign key to properties.
- If a user deletes a property, PostgreSQL's cascade deletion automatically removes all associated reviews. Do not interpret disappearing reviews as a frontend bug if the parent property was deleted.
