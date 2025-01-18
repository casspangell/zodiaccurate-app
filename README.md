
# Zodiaccurate Project

This project uses **GitHub** for version control and **Google Apps Script** for backend automation, managed via **clasp**. The project also uses **GitHub Actions** to deploy the code to Google Apps Script manually.

## Project Structure

- **Google Apps Script** is used for automating workflows between Google Sheets, Forms, and Firebase.
- **clasp** (Command Line Apps Script Projects) is used to sync and deploy the local version of the Apps Script project to Google’s environment.
- **GitHub Actions** is set up to manually trigger deployment to Google Apps Script via a workflow.
- **ChatGPT** creds are located in Google Secret Manager and are accessed via API Keys in the portal https://platform.openai.com/api-keys.
- **Firebase** client_email and private_key are located in Apps Script Project Settings.

---

## Getting Started

### 1. Clone the Repository

Clone this repository to your local machine:

```bash
git clone https://github.com/casspangell/zodiaccurate-app.git
cd zodiaccurate-app
```

### 2. Install `clasp`

Make sure you have `clasp` installed globally. You can install it via npm:

```bash
npm install -g @google/clasp
```

### 3. Authenticate `clasp`

Ensure you're logged into `clasp` with proper credentials. The credentials are stored in GitHub Secrets and are automatically used during GitHub Actions deployment. To locate clasp creds, go to the Google Cloud Console - API and Services - Credentials - OAuth 2.0 Client IDs

However, for local development, authenticate `clasp` manually:

```bash
clasp login --creds path/to/credentials.json
```

### 4. Pull Existing Google Apps Script Code

If you need to pull the latest changes from Google Apps Script:

```bash
clasp pull
```

This will sync the latest Google Apps Script code into your local environment.

---

## Version Control Workflow

### 1. Make Changes Locally

You can make changes to your Apps Script project files in your local environment using any code editor (e.g., PHPStorm). After making changes, use Git for version control.

### 2. Commit and Push Changes

Track your changes, commit them, and push to the repository:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

---

## Deployment Workflow

### Manual Deployment to Google Apps Script

The project uses **GitHub Actions** for manual deployment. Here's how to deploy the changes:

1. After pushing changes to GitHub, go to the **Actions** tab in your repository on GitHub.
2. Select the **Deploy to Google Apps Script** workflow.
3. Click the **Run workflow** button to trigger the deployment.

This action will automatically use `clasp` to push your latest code from GitHub to Google Apps Script.

---

## Syncing with Google Apps Script Editor

If you make changes directly in the Google Apps Script Editor, you can pull those changes into your local environment using `clasp`:

```bash
clasp pull
```

This will sync any changes from Google Apps Script into your local project directory.

---

## Troubleshooting

- **Missing Credentials**: If you see issues related to credentials during deployment, make sure your `credentials.json` file is properly configured and accessible.
- **Google OAuth Verification**: If you encounter warnings about app verification, remember that only approved test users can access the app while it's in development.

---

## Useful Commands

- **Pull latest code from Google Apps Script**:

  ```bash
  clasp pull
  ```

- **Push local changes to Google Apps Script**:

  ```bash
  clasp push
  ```

- **Deploy manually using GitHub Actions**:
  - Navigate to the **Actions** tab in your repository.
  - Select the **Deploy to Google Apps Script** workflow.
  - Click **Run workflow**.

