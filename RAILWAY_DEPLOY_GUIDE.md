# 🚀 Deployment Guide: Railway (Backend)

Follow these steps to deploy your Laravel Backend to Railway.

## Prerequisites
- You have a GitHub account.
- You have signed up for [Railway.app](https://railway.app/).

## Step 1: Create a New Project on Railway
1. Go to your [Railway Dashboard](https://railway.app/dashboard).
2. Click **+ New Project**.
3. Select **Deploy from GitHub repo**.
4. Select your repository: `trdeing-web`.

## Step 2: Configure the Backend Service
Since your repository has both frontend and backend, we need to tell Railway to only build the `backend` folder for this service.

1. Once the project is created, click on the **Settings** tab of the new service.
2. Scroll down to **Root Directory**.
3. Enter: `backend`
   - *This tells Railway to look for the Dockerfile in the backend folder.*
4. Railway should automatically detect the `Dockerfile`.

## Step 3: Add Database (MySQL)
1. In the Railway Project view, click **+ New** (to add a second service).
2. Select **Database** -> **MySQL**.
3. Railway will create a MySQL service for you.

## Step 4: Link Database to Backend
1. Click on your **MySQL** service on the canvas.
2. Go to the **Variables** tab. 
3. Copy the standard variables like `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`.

4. Now, go back to your **Backend Service** (the simple box representing your GitHub repo).
5. Go to the **Variables** tab.
6. Add the following environment variables (using the values you just copied):

   | Variable Name | Value |
   |--------------|-------|
   | `APP_ENV`    | `production` |
   | `APP_DEBUG`  | `false` |
   | `APP_KEY`    | *Generate a secure key (see below)* |
   | `DB_CONNECTION` | `mysql` |
   | `DB_HOST`    | `${{MySQL.MYSQLHOST}}` *(Railway variable reference)* |
   | `DB_PORT`    | `${{MySQL.MYSQLPORT}}` |
   | `DB_DATABASE`| `${{MySQL.MYSQLDATABASE}}` |
   | `DB_USERNAME`| `${{MySQL.MYSQLUSER}}` |
   | `DB_PASSWORD`| `${{MySQL.MYSQLPASSWORD}}` |

   *> **Tip:** For `APP_KEY`, you can run `php artisan key:generate --show` locally to get one, or generate a random 32-char string.*

## Step 5: Final Deploy
1. Once variables are saved, Railway will redeploy automatically.
2. Wait for the "Build" to complete.
3. Once active, Railway will provide you with a **Public Domain** (e.g., `web-production-1234.up.railway.app`).

## Step 6: Connect Frontend
1. Copy that new **Public Domain** from Railway.
2. Go to your local code, verify which file points to the backend (usually `src/services/api.js` or `.env`).
3. Update the `API_URL` to your new Railway URL.
4. Push that change to GitHub.
5. Your GitHub Pages frontend will now talk to your real Railway backend!
