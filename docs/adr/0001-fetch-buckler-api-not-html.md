# Fetch Buckler stats API directly, not HTML

We download ranked-match statistics by calling `/6/buckler/api/en/stats/{dataset}/{YYYYMM}` and storing the raw JSON response. The Buckler website fetches the same API client-side; saved HTML bundles are larger, harder to parse, and only contain one active control-view per page. The API returns all control views (All/Classic/Modern for usage, `ci` and `c` for diagrams) in a single response per month.

**Considered options:** browser automation (Playwright), parsing saved HTML, direct API calls.

**Consequences:** Requests need browser-like headers (`User-Agent`, `Referer`) or CloudFront returns 403. No separate downloads are needed per control-type toggle.
