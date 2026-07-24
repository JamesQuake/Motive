# MotiveToday.com deployment notes

## Required before launch
1. Back up the existing WordPress files and database.
2. Preserve all current URLs. The included `.htaccess` handles the known commercial and solution routes and clean static URLs. Add 301 redirects for any additional URLs found in the WordPress sitemap or analytics.
3. Verify quote/contact form destinations before launch. Contact and quote forms are embedded through the CRM/NowCerts iframe widgets.
4. Submit `https://motivetoday.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

## Security controls included
- HTTPS/host canonicalization, HSTS, CSP, frame protection, MIME sniffing protection, referrer and permissions policies.
- Directory listing disabled.
- External new-tab links hardened with `noopener noreferrer`.
- CRM/NowCerts forms are embedded without storing form submissions in this static site.

## Important limitation
This is a source-code review, not a penetration test of the production server, DNS, hosting account, WordPress database, mail configuration, or third-party lead systems. Run an authenticated infrastructure scan after staging deployment.
