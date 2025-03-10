# Issues and Known Problems

Last Updated: 2023-03-15

## Top Priority Issues

- Build issue with top-level await
    - Stack:
    ``` error during build:
[vite:esbuild-transpile] Transform failed with 1 error:
assets/index-!~{001}~.js:52390:4: ERROR: Top-level await is not available in the configured target environment ("chrome87", "edge88", "es2020", "firefox78", "safari14" + 2 overrides)

Top-level await is not available in the configured target environment ("chrome87", "edge88", "es2020", "firefox78", "safari14" + 2 overrides)
52388|  if (isNode) {
52389|    try {
52390|      await __vitePreload(() => import('./config-!~{003}~.js').then(n => n.c),true?__VITE_PRELOAD__:void 0);
   |      ^
52391|      supabaseUrl = define_process_env_default.VITE_SUPABASE_URL;
52392|      supabaseKey = define_process_env_default.VITE_SUPABASE_KEY || define_process_env_default.VITE_SUPABASE_ANON_KEY;

    at failureErrorWithLog (/home/runner/work/CouponManager/CouponManager/node_modules/.pnpm/esbuild@0.21.5/node_modules/esbuild/lib/main.js:1472:15)
    at /home/runner/work/CouponManager/CouponManager/node_modules/.pnpm/esbuild@0.21.5/node_modules/esbuild/lib/main.js:755:50
    at responseCallbacks.<computed> (/home/runner/work/CouponManager/CouponManager/node_modules/.pnpm/esbuild@0.21.5/node_modules/esbuild/lib/main.js:622:9)
    at handleIncomingPacket (/home/runner/work/CouponManager/CouponManager/node_modules/.pnpm/esbuild@0.21.5/node_modules/esbuild/lib/main.js:677:12)
    at Socket.readFromStdout (/home/runner/work/CouponManager/CouponManager/node_modules/.pnpm/esbuild@0.21.5/node_modules/esbuild/lib/main.js:600:7)
    at Socket.emit (node:events:517:28)
    at addChunk (node:internal/streams/readable:368:12)
    at readableAddChunk (node:internal/streams/readable:341:9)
    at Readable.push (node:internal/streams/readable:278:10)
    at Pipe.onStreamRead (node:internal/stream_base_commons:190:23)
 ELIFECYCLE  Command failed with exit code 1.
Error: Process completed with exit code 1.
```

- User Management error message "Failed to fetch users. Please try again."
  - This error occurs when accessing the User Management tab as a manager
  - Issue may be related to Supabase admin API permissions
  - Occurs more frequently in production environment than development

## Medium Priority Issues

- In the coupon list page, when all coupons are expired, we cannot see there are possibly coupons.
- In the retailer list, when all coupons are expired for a given retailer, the link appears in green while it could appear in red (to indicate all are expired)
- When a user is promoted to manager, some managers report not seeing the changes immediately

## Low Priority Issues

- Barcode scanner has intermittent connection issues on certain Android devices
- Some translation placeholders appear in User Management section for non-English languages
- Role updates sometimes require a page refresh to reflect in the UI
- Permission errors sometimes use generic error messages without specific details

## Recently Resolved Issues

- Fixed: Coupon creation permission issues
- Fixed: Spanish translations for User Management 
- Fixed: Error handling in user authentication flow
- Fixed: Role assignment in local memory database