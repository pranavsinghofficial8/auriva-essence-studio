export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@200..400&display=swap" />
    <style>
      /* Brand palette and type (ivory, espresso, Jost), mirroring styles.css. */
      body { font: 17px/1.8 "Jost", ui-sans-serif, system-ui, sans-serif; background: #fafbf4; color: #302b28; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 30rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 2.4rem; font-weight: 200; line-height: 1.2; text-transform: lowercase; margin: 0 0 1.5rem; }
      p { color: #6f6660; margin: 0 0 2.5rem; }
      .actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
      a, button { font: inherit; font-size: 11px; letter-spacing: 0.26em; text-transform: uppercase; padding: 1rem 2.5rem; border-radius: 0; cursor: pointer; text-decoration: none; border: 1px solid #302b28; transition: opacity 0.5s ease; }
      a:hover, button:hover { opacity: 0.8; }
      .primary { background: #302b28; color: #fafbf4; }
      .secondary { background: transparent; color: #302b28; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>this page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">try again</button>
        <a class="secondary" href="/">return home</a>
      </div>
    </div>
  </body>
</html>`;
}
