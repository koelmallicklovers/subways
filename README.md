# Subway Rush — GitHub Pages edition

The complete HTML5 endless runner, ready to upload to GitHub Pages.
All game files and the Three.js runtime are included. No build command,
package installation, backend, API key, or ChatGPT login is required to play.

## Publish on GitHub Pages

1. Extract `subway-rush-github-pages.zip` on your computer.
2. Create a new public GitHub repository (for example, `subway-rush`).
3. Upload the **extracted contents** to the repository's top level on the `main`
   branch. Upload `index.html`, the JavaScript and CSS files, the `vendor` folder,
   and the other included files. Do not upload only the ZIP or place everything
   inside an extra folder. Preserve the `vendor` folder structure.
4. Open the repository's **Settings → Pages**.
5. Under **Build and deployment**, select **Deploy from a branch**.
6. Choose **main**, select **/(root)**, and click **Save**.
7. Wait for the Pages deployment to finish. Use the **Visit site** link shown
   in Settings → Pages to open your game.

The included `.nojekyll` file disables Jekyll processing. Keep it in the root
when uploading. All game asset paths are relative, so the game also works
under a project path such as `/subway-rush/`.

Official instructions:
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

### Optional upload using Git

Run these commands from the extracted folder, after creating an empty GitHub
repository. Replace `YOUR_USERNAME` and `YOUR_REPOSITORY` with your actual values.

```sh
git init
git add .
git commit -m "Add Subway Rush game"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Then enable Pages using the branch settings above.

## Controls

| Action | Keyboard | Phone |
| --- | --- | --- |
| Change lanes | Left/Right arrows or A/D | Swipe left/right or use arrow buttons |
| Jump | Up arrow or W | Swipe up or tap the up arrow |
| Roll / descend quickly | Down arrow or S | Swipe down or tap the down arrow |
| Hoverboard | Space | Double tap the game or tap the hoverboard button |
| Pause / resume | P or Escape | Pause button, then Keep Running |

Each run starts with two hoverboards. A board protects you for up to fourteen
seconds or one collision. Collect magnets and super sneakers, run up ramps
onto train roofs, and complete missions. Scores, completed-run coins, outfit
choices, and board choices are stored locally in the player's browser.
Sound starts muted; use the sound button to enable it.

## Run on your computer

Use a local HTTP server rather than double-clicking `index.html`, because the
game uses JavaScript modules. If Python is installed, run this from the extracted
folder:

```sh
python -m http.server 8080
```

Then open `http://localhost:8080` in your browser. GitHub Pages serves the files
over HTTPS automatically, so this local server is only for local previews.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Game page and menus; keep at the repository root |
| `styles.css` | Desktop and mobile layouts |
| `game.js` | Input, audio, menus, persistence, and rendering orchestration |
| `engine.js` | Gameplay, collision, scoring, and power-up simulation |
| `scene.js` | Procedural characters, trains, city, and collectible graphics |
| `canvas-renderer.js` | Canvas compatibility renderer when WebGL 2 is unavailable |
| `vendor/three.module.min.js` | Bundled Three.js 0.170.0 runtime |
| `vendor/THREE-LICENSE.txt` | Third-party MIT license |
| `engine.test.mjs` | Twelve gameplay tests |
| `package.json` | JavaScript module configuration and optional test command |
| `.nojekyll` | Static hosting configuration for GitHub Pages |

All authored game source files are included. Graphics are generated from code,
and audio is synthesized with Web Audio, so no separate image or sound downloads
are needed. The vendored Three.js license must remain with redistributed copies.

## Optional developer checks

With Node.js installed:

```sh
node --test engine.test.mjs
node --check game.js
node --check scene.js
node --check canvas-renderer.js
```

The tests cover collision behavior, lane bounds, jumping, rolling, ramps,
hoverboard protection, power-up expiry, coin collection, pause, restart,
scoring, and safe-lane generation. The game was checked in desktop and
phone-sized browser layouts using its Canvas fallback; the test browser did
not provide WebGL. The GitHub Pages deployment itself is performed by you.
