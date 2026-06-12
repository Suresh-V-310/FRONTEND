# OnlineCompiler Client

React + Vite frontend for the OnlineCompiler IDE.

## Editor Features

- Monaco syntax highlighting for all configured languages.
- C project tabs with `.c`, `.h`, and library file paths.
- Java project tabs with package-aware source paths.
- C autocomplete for standard/POSIX headers and common snippets.
- Compiler output panel with compile errors, runtime errors, line numbers, exit codes, and timeout text from the backend.

## C Project Support

C tabs are file-backed projects. The default file is `src/main.c`; use the file tab controls to add headers such as `src/math_utils.h` or source files such as `src/math_utils.c`.

Supported C editor paths:

- `.c` source files
- `.h` header files
- `.a` / `.lib` static libraries
- `.so` / `.dll` / `.dylib` dynamic libraries

The backend compiles C with GCC using `-std=c17 -Wall -Wextra -O2 -pthread -lm` by default.

## Commands

```bash
npm install
npm run dev
npm run build
```
