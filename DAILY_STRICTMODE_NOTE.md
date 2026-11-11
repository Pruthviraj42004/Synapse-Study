/**
 * IMPORTANT NOTE about React StrictMode and Daily.co
 * 
 * If you're seeing "Duplicate DailyIframe instances are not allowed" errors
 * in development, this is caused by React 18's StrictMode mounting components twice.
 * 
 * SOLUTIONS:
 * 
 * 1. DISABLE STRICTMODE (Quick Fix for Development):
 *    In client/src/index.js, change:
 *      <React.StrictMode>
 *        <App />
 *      </React.StrictMode>
 *    To:
 *      <App />
 * 
 * 2. USE PRODUCTION BUILD (Best for Testing):
 *    Run: npm run build && serve -s build
 *    StrictMode only affects development mode
 * 
 * 3. IGNORE THE ERROR (It's Benign):
 *    The error appears in console but video still works
 *    Daily.co's library throws on second mount but first iframe works fine
 * 
 * The current code already has protections:
 * - Checks for existing iframe before creating
 * - Try-catch around creation
 * - Proper cleanup on unmount
 * 
 * But Daily's library throws the error BEFORE we can catch it in some cases.
 * This is a known issue with Daily.co + React StrictMode.
 */
