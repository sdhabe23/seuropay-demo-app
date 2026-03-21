# Deploying this project to GitHub Pages

This repo is a Vite-powered React app. The repository contains a GitHub Actions workflow that will build the app and deploy it to GitHub Pages automatically when you push to the `main` branch.

Follow the steps below to publish the project under your GitHub account `sdhabe23`.

1) Choose a repository name on GitHub (for example: `europay-consumer-app`).

2) Create the repository on GitHub (one of the options below):

- Using the GitHub website: create a new repo under `https://github.com/sdhabe23` and **do not** initialize with a README (you already have files locally).
- Or using the GitHub CLI (if installed):

  gh repo create sdhabe23/europay-consumer-app --public --source=. --remote=origin --push

3) Or create & push manually from your machine (recommended if you prefer git commands):

  # initialize (only if you haven't already)
  git init
  git add .
  git commit -m "Initial commit"
  git branch -M main

  # Add remote (use SSH or HTTPS as you prefer). Replace <repo> if you chose a different name.
  git remote add origin git@github.com:sdhabe23/europay-consumer-app.git
  # or using HTTPS:
  # git remote add origin https://github.com/sdhabe23/europay-consumer-app.git

  git push -u origin main

4) After pushing, GitHub Actions will run the workflow `.github/workflows/deploy-pages.yml`:

- It installs dependencies with pnpm, runs `pnpm build` (which outputs to `./dist`), and deploys `./dist` to GitHub Pages.
- You don’t need to enable Pages manually — the workflow deploys automatically. If you want to verify or change settings, go to the repository Settings > Pages.

5) Where the site will be available

- If the repo name is `sdhabe23.github.io` (recommended for a user site), the site will be available at:
  `https://sdhabe23.github.io/`

- For a project site (e.g. repo `europay-consumer-app`), the site will be available at:
  `https://sdhabe23.github.io/europay-consumer-app/`

Notes & tips

- We updated `vite.config.ts` to use a relative `base: './'` so assets load correctly when served from a subpath.
- The workflow uses pnpm; if you don't have pnpm locally and want to run builds locally, install pnpm (`npm i -g pnpm`) or use `npm run` with the appropriate commands.
- If you prefer Netlify or Vercel for previews and easier deployments, those work well with Vite and can be connected directly to your GitHub repo.

If you'd like, I can also:
- Create the GitHub repository by running the `gh` CLI (if you authorize/allow it), or
- Push the code for you (requires your GitHub credentials or an SSH key configured in this environment).
