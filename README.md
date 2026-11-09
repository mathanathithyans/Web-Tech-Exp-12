# EcoLife

EcoLife is a React article frontend with an Express and MongoDB API.

## Run locally

1. In `backend/.env`, set `MONGO_URI` to your MongoDB Atlas connection string.
2. Start the API from `backend` with `npm install` and `npm start`.
3. In another terminal, start the frontend from `frontend` with `npm install` and `npm run dev`.
4. Open the Vite URL shown in the terminal.

The local frontend uses `http://localhost:5000/api/articles` by default. To use another API URL, set `VITE_API_URL` in the frontend environment.

## Deploy the backend to Render

The root `render.yaml` defines the `ecolife-api` web service. In Render, create a Blueprint from this repository and provide `MONGO_URI` when prompted. Keep the URI private; do not commit it to the repository. Render supplies the `PORT` environment variable.

After deployment, the API endpoint is:

```text
https://<your-render-service>.onrender.com/api/articles
```

## Deploy the frontend to GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds and deploys the frontend when changes are pushed to `main`.

After creating the Render service, open the GitHub repository's **Settings → Secrets and variables → Actions → Variables** and add:

- Name: `VITE_API_URL`
- Value: the Render API endpoint ending in `/api/articles`

The next workflow run builds the frontend with that API address and publishes it to GitHub Pages. The workflow enables Pages, but the repository must allow GitHub Actions deployments. The website URL will be `https://<github-user>.github.io/<repository-name>/`.
