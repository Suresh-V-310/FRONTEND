export const WEB_FILES = ['index.html', 'style.css', 'script.js'];

export const DEFAULT_WEB_FILES = {
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Page</title>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Edit HTML, CSS, and JavaScript in separate file tabs.</p>
  <button id="btn">Click me</button>
</body>
</html>`,
  'style.css': `body {
  font-family: system-ui, sans-serif;
  padding: 2rem;
  background: #f8fafc;
}

h1 {
  color: #2563eb;
}

button {
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}`,
  'script.js': `document.getElementById('btn')?.addEventListener('click', () => {
  alert('Hello from script.js!');
});`,
};
