# Community Grove isolation

The Grove is intentionally isolated in this folder. To remove it:

1. Delete this folder.
2. Remove the `/grove` import and route from `src/App.jsx`.
3. Remove the Grove desktop/mobile links and Lounge availability entry from `src/layout/MarketingNav.jsx`.
4. Remove the Grove quick action/import from `src/pages/CommunityHome.jsx`.
5. Remove `src/layout/MarketingNav.css` only if its Grove-era mobile shortcut change is still present.
6. Remove the server router/query/test files and their `app.js`, `package.json`, and socket export connections.
7. After backing up, run the server's `019_rollback_community_grove.sql` only if stored Grove participation should also be permanently deleted.
