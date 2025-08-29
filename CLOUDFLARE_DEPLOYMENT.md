# Cloudflare Pages Deployment Guide

## Environment Variables Setup

When deploying your Saleor Storefront to Cloudflare Pages, you need to configure environment variables in two places:

### 1. Local Environment Variables for CLI Deployment

When deploying from your local machine using the Wrangler CLI, you need to set the following environment variables in your terminal session:

```bash
export CLOUDFLARE_ACCOUNT_ID="your-cloudflare-account-id"
export CLOUDFLARE_API_TOKEN="your-cloudflare-api-token"
```

To find your Cloudflare Account ID:

1. Log in to the Cloudflare dashboard
2. Navigate to your account settings
3. Your Account ID will be displayed on the right side of the screen

To create an API Token:

1. Log in to the Cloudflare dashboard
2. Navigate to "My Profile" > "API Tokens"
3. Click "Create Token"
4. Select "Edit Cloudflare Workers" template or create a custom token with the following permissions:
   - Account.Workers Pages: Edit
   - Account.Workers Scripts: Edit
   - Zone.Workers Routes: Edit
5. Set appropriate account and zone resources
6. Complete the token creation and copy the token value

### 2. Project Environment Variables on Cloudflare Dashboard

For your application to work correctly once deployed, configure these environment variables in the Cloudflare Pages dashboard:

1. Log in to Cloudflare Dashboard
2. Go to Pages > Your project
3. Click on "Settings" > "Environment variables"
4. Add the following variables:

```
NEXT_PUBLIC_SALEOR_API_URL=your-saleor-api-url
NEXT_PUBLIC_STOREFRONT_URL=your-cloudflare-pages-url
SALEOR_APP_TOKEN=your-saleor-app-token
```

### Updating Your wrangler.toml File

Make sure to update the `wrangler.toml` file with your actual project name and ensure the NodeJS compatibility flag is set:

```toml
name = "your-project-name"
pages_build_output_dir = ".vercel/output/static"
compatibility_date = "2025-08-29"
compatibility_flags = ["nodejs_compat"]
```

Note: The `compatibility_date` is required when using `compatibility_flags`. Set it to the current date when configuring your project.

Replace `your-project-name` with the name you want to use for your Cloudflare Pages project.

### Setting Up nodejs_compat Compatibility Flag

Next.js applications built with @cloudflare/next-on-pages require the `nodejs_compat` compatibility flag to be enabled in the Cloudflare dashboard. This is **critical** even if you've set it in your wrangler.toml file.

Follow these steps:

1. Log in to the Cloudflare Dashboard
2. Navigate to your Pages project
3. Click on "Settings" > "Functions"
4. Find the "Compatibility flags" section
5. Add `nodejs_compat` in the input box for both Production and Preview environments
6. Click "Save"

![Cloudflare Compatibility Flags Setup](https://developers.cloudflare.com/pages/static/functions-compatibility-flags-30ec09eb16e0f5c3.png)

> **Important!** After setting the Compatibility Flags, you need to re-deploy your application for the changes to take effect.

## Deployment Process

To deploy the storefront to Cloudflare Pages:

1. Ensure all environment variables are set correctly
2. Run the deployment command:
   ```bash
   npm run deploy
   ```

This will:

1. Build the Next.js application
2. Process it with the Cloudflare Pages adapter
3. Deploy it to Cloudflare Pages

## Troubleshooting

If you encounter errors during deployment:

1. Check if all environment variables are correctly set
2. Ensure your Cloudflare API token has the correct permissions
3. Verify that all routes requiring Edge Runtime have `export const runtime = 'edge';`
4. Confirm that no static generation functions (generateStaticParams) are used alongside Edge Runtime

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [@cloudflare/next-on-pages Documentation](https://github.com/cloudflare/next-on-pages)
