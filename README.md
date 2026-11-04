# ednaiu.github.io

Personal site. Single static `index.html`, no build step, no dependencies
beyond the IBM Plex webfont.

## Deploy to GitHub Pages

1. Create a repository named exactly `ednaiu.github.io` on GitHub.
2. Push this folder to it:

   ```
   git init
   git add index.html README.md
   git commit -m "Add personal site"
   git branch -M main
   git remote add origin https://github.com/ednaiu/ednaiu.github.io.git
   git push -u origin main
   ```

3. In the repository, open Settings, then Pages, and set the source to
   the `main` branch, root folder.
4. The site goes live at https://ednaiu.github.io within a few minutes.

## Before publishing

Search the file for `TODO` — there are three:

- the GFLOP/s figure for the BLAS project, once measured,
- the source repository link for the VS Code extension, once published.

## Talk Mate case study

`talk-mate/index.html` is the product case, with a responsive layout, shared portfolio theme preference, before/after results comparison and a keyboard-accessible screen viewer. `talk-mate/assets/` contains the English demo screenshots in WebP, the existing app icon, cover and Manrope font with its OFL licence. All app content shown is demonstration data. The case distinguishes research context, design hypotheses and pending user validation.
