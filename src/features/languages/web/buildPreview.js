/** Build full HTML document for web preview */
export function buildWebPreviewDocument(files) {
  const html = files['index.html'] || '';
  const css = files['style.css'] || '';
  const js = files['script.js'] || '';

  const hasHtmlStructure = /<!DOCTYPE\s+html/i.test(html) || /<html[\s>]/i.test(html);
  const styleLinkPattern = /<link[^>]+rel=["']stylesheet["'][^>]+href=["'](?:\.\/)?style\.css["'][^>]*>/i;
  const scriptSrcPattern = /<script[^>]+src=["'](?:\.\/)?script\.js["'][^>]*>\s*<\/script>/i;

  if (hasHtmlStructure) {
    let doc = html;
    let cssInjected = false;
    let jsInjected = false;

    // Replace explicit style.css references with inline CSS
    if (css && styleLinkPattern.test(doc)) {
      doc = doc.replace(styleLinkPattern, `<style type="text/css">\n${css}\n</style>`);
      cssInjected = true;
    }

    // Replace explicit script.js references with inline JavaScript
    if (js && scriptSrcPattern.test(doc)) {
      doc = doc.replace(scriptSrcPattern, `<script type="text/javascript">\n${js}\n</script>`);
      jsInjected = true;
    }

    // Inject CSS if it was not already inlined
    if (css && !cssInjected) {
      if (/<\/head>/i.test(doc)) {
        doc = doc.replace(/<\/head>/i, `<style type="text/css">\n${css}\n</style>\n</head>`);
      } else if (/<html[\s>]/i.test(doc)) {
        doc = doc.replace(/<html[\s>]/i, (match) => `${match}\n<head>\n<style type="text/css">\n${css}\n</style>\n</head>`);
      } else {
        doc = `<style type="text/css">\n${css}\n</style>\n${doc}`;
      }
    }

    // Inject JS if it was not already inlined
    if (js && !jsInjected) {
      if (/<\/body>/i.test(doc)) {
        doc = doc.replace(/<\/body>/i, `<script type="text/javascript">\n${js}\n</script>\n</body>`);
      } else if (/<\/html>/i.test(doc)) {
        doc = doc.replace(/<\/html>/i, `<script type="text/javascript">\n${js}\n</script>\n</html>`);
      } else {
        doc += `\n<script type="text/javascript">\n${js}\n</script>`;
      }
    }

    return doc;
  }

  // Create a complete HTML structure if minimal HTML provided
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Web Preview</title>
  <style type="text/css">
${css || '/* Add CSS here */'}
  </style>
</head>
<body>
${html || '<h1>Hello, World!</h1>'}
  <script type="text/javascript">
${js || '// Add JavaScript here'}
  </script>
</body>
</html>`;
}
