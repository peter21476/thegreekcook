# Google Analytics Setup Guide

This guide will help you set up Google Analytics 4 (GA4) for your Zorbas' Kitchen website.

## Step 1: Create a Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Start measuring"
3. Follow the setup wizard to create your account
4. Choose "Web" as your data stream
5. Enter your website details:
   - Website name: "Zorbas' Kitchen"
   - Website URL: Your domain (e.g., https://zorbaskitchen.com)
   - Industry category: "Food and Drink"
   - Business size: Choose appropriate size

## Step 2: Get Your Measurement ID

1. After creating your property, you'll get a Measurement ID that looks like `G-XXXXXXXXXX`
2. Copy this ID - you'll need it for the next steps

## Step 3: Configure Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add your Google Analytics Measurement ID:

```env
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

3. Replace `G-XXXXXXXXXX` with your actual Measurement ID

## Step 4: Update the HTML Template

The Google Analytics script has already been added to `public/index.html`. You just need to:

1. Replace `G-XXXXXXXXXX` in the script with your actual Measurement ID
2. The script is located in the `<head>` section of the HTML file

## Step 5: Verify Installation

1. Deploy your website or run it locally
2. Open Google Analytics
3. Go to "Reports" → "Realtime" → "Overview"
4. Visit your website and you should see real-time data

## Step 6: Set Up Custom Events (Optional)

The website already tracks these custom events:

### Recipe Engagement
- **recipe_search**: When users search for recipes
- **recipe_view**: When users view a recipe
- **recipe_like**: When users like/unlike recipes
- **recipe_submission**: When users submit new recipes

### User Engagement
- **user_registration**: When users register
- **user_login**: When users log in
- **navigation**: When users navigate between pages

### Error Tracking
- **error**: When errors occur on the website

## Step 7: Set Up Goals and Conversions

In Google Analytics:

1. Go to "Admin" → "Goals"
2. Create goals for:
   - Recipe submissions
   - User registrations
   - Recipe searches
   - Time spent on recipe pages

## Step 8: Configure Enhanced Ecommerce (Optional)

If you plan to add e-commerce features later:

1. Enable Enhanced Ecommerce in Google Analytics
2. Set up product tracking for recipes
3. Configure checkout funnels

## Step 9: Privacy and GDPR Compliance

1. Update your privacy policy to mention Google Analytics
2. Consider adding a cookie consent banner
3. Ensure compliance with GDPR if serving EU users

## Step 10: Monitor and Optimize

Regular monitoring tasks:

1. **Weekly**: Check for unusual traffic patterns
2. **Monthly**: Review user behavior reports
3. **Quarterly**: Analyze conversion rates and optimize

## Troubleshooting

### No Data Appearing
1. Check that your Measurement ID is correct
2. Verify the script is loading (check browser console)
3. Ensure your website is accessible
4. Check for ad blockers that might block analytics

### Missing Events
1. Verify the analytics utility is imported correctly
2. Check browser console for JavaScript errors
3. Ensure the analytics object is initialized

### Performance Issues
1. The analytics script loads asynchronously
2. Custom events are batched for performance
3. No impact on page load times

## Advanced Configuration

### Custom Dimensions
You can add custom dimensions in Google Analytics for:
- Recipe categories
- User types (registered vs anonymous)
- Recipe sources (API vs user-submitted)

### Enhanced Link Attribution
Enable enhanced link attribution for better tracking of user interactions.

### Demographics and Interests
Enable demographics and interests reports for better audience insights.

## Support

If you encounter issues:
1. Check the Google Analytics Help Center
2. Verify your implementation with Google Tag Assistant
3. Review the browser console for errors
4. Test with a fresh browser session

## Security Notes

- Never expose your Measurement ID in client-side code (it's public anyway)
- Consider implementing IP anonymization for GDPR compliance
- Regularly review your analytics data for security insights
