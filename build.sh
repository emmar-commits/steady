#!/usr/bin/env sh
# Wraps steady.html (the Claude artifact source, which has no <html>/<head>)
# in a full HTML document for GitHub Pages. Run after every change to steady.html.
set -e
cd "$(dirname "$0")"
mkdir -p docs
{
  printf '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
  printf '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
  printf '<meta name="theme-color" content="#FCF5F7">\n'
  printf '<meta name="apple-mobile-web-app-capable" content="yes">\n'
  printf '<meta name="apple-mobile-web-app-title" content="Steady">\n'
  printf '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%%}[hidden]{display:none!important}</style>\n'
  printf '</head>\n<body>\n'
  cat steady.html
  printf '\n</body>\n</html>\n'
} > docs/index.html
echo "Built docs/index.html"
