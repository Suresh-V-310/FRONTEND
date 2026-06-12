export const RUNTIME_CAPABILITIES = {
  c: {
    headers: ['stdio.h', 'stdlib.h', 'string.h', 'math.h', 'time.h', 'ctype.h', 'signal.h', 'errno.h', 'stdbool.h', 'stdint.h', 'assert.h', 'locale.h', 'setjmp.h', 'pthread.h'],
    packages: [],
    snippets: ['main', 'printf', 'malloc', 'pthread_create', 'fopen'],
  },
  cpp: {
    headers: ['iostream', 'vector', 'string', 'map', 'set', 'unordered_map', 'algorithm', 'filesystem', 'thread', 'chrono', 'regex', 'memory', 'queue', 'stack', 'deque', 'list', 'tuple', 'functional', 'array', 'bitset', 'numeric', 'future', 'mutex'],
    packages: [],
    snippets: ['main', 'cout', 'vector', 'thread'],
  },
  python: {
    headers: [],
    packages: ['os', 'sys', 'math', 'random', 'datetime', 'json', 're', 'csv', 'sqlite3', 'threading', 'asyncio', 'pathlib', 'requests', 'numpy', 'pandas', 'matplotlib', 'scipy', 'tensorflow', 'torch', 'sklearn', 'flask', 'django', 'fastapi'],
    snippets: ['def', 'class', 'asyncio.run', 'pandas.read_csv'],
  },
  java: {
    headers: [],
    packages: ['java.lang', 'java.util', 'java.io', 'java.nio', 'java.net', 'java.sql', 'java.time', 'java.math', 'java.text', 'java.security', 'javax.crypto', 'java.xml'],
    snippets: ['main', 'class', 'record', 'interface'],
  },
  javascript: {
    headers: [],
    packages: ['fs', 'path', 'http', 'https', 'os', 'crypto', 'events', 'stream', 'express', 'react', 'vue', 'angular', 'axios', 'lodash', 'socket.io', 'mongoose', 'bcrypt', 'jsonwebtoken', 'multer'],
    snippets: ['require', 'async function', 'express app'],
  },
  typescript: {
    headers: [],
    packages: ['typescript', 'ts-node', 'express', 'axios', '@nestjs/core', 'typeorm', 'prisma', 'rxjs'],
    snippets: ['interface', 'type', 'async function'],
  },
  csharp: {
    headers: [],
    packages: ['System', 'System.IO', 'System.Collections', 'System.Collections.Generic', 'System.Linq', 'System.Net', 'System.Text', 'System.Threading', 'System.Data', 'Microsoft.EntityFrameworkCore', 'Microsoft.AspNetCore'],
    snippets: ['Main', 'class', 'LINQ'],
  },
  php: {
    headers: [],
    packages: ['mysqli', 'PDO', 'curl', 'json', 'mbstring', 'openssl', 'gd', 'laravel', 'symfony', 'codeigniter'],
    snippets: ['function', 'class', 'PDO'],
  },
  go: {
    headers: [],
    packages: ['fmt', 'os', 'io', 'net/http', 'strings', 'bytes', 'encoding/json', 'time', 'context', 'sync', 'gin', 'echo', 'gorm'],
    snippets: ['main', 'handler', 'goroutine'],
  },
  rust: {
    headers: [],
    packages: ['std', 'serde', 'tokio', 'reqwest', 'clap', 'rand', 'chrono', 'diesel', 'actix-web'],
    snippets: ['main', 'Result', 'tokio::main'],
  },
  kotlin: {
    headers: [],
    packages: ['kotlin.collections', 'kotlin.io', 'kotlin.text', 'kotlinx.coroutines', 'ktor', 'retrofit'],
    snippets: ['main', 'data class', 'suspend fun'],
  },
  swift: {
    headers: [],
    packages: ['Foundation', 'UIKit', 'SwiftUI', 'CoreData', 'Combine', 'AVFoundation'],
    snippets: ['main', 'struct View', 'class'],
  },
  ruby: {
    headers: [],
    packages: ['json', 'net/http', 'fileutils', 'date', 'rails', 'sinatra', 'rspec'],
    snippets: ['def', 'class', 'RSpec.describe'],
  },
  r: {
    headers: [],
    packages: ['dplyr', 'ggplot2', 'tidyr', 'readr', 'shiny', 'caret', 'data.table'],
    snippets: ['library', 'data.frame', 'ggplot'],
  },
  dart: {
    headers: [],
    packages: ['dart:core', 'dart:io', 'dart:convert', 'dart:async', 'flutter', 'provider', 'riverpod'],
    snippets: ['main', 'Future', 'StatelessWidget'],
  },
  sql: {
    headers: [],
    packages: ['MySQL', 'PostgreSQL', 'SQLite', 'SQL Server', 'Oracle', 'MariaDB'],
    snippets: ['SELECT', 'CREATE TABLE', 'INSERT'],
  },
  web: {
    headers: [],
    packages: ['HTML5', 'CSS3', 'Bootstrap', 'Tailwind CSS', 'Material UI', 'React.js', 'Vue.js'],
    snippets: ['html5', 'button', 'fetch'],
  },
  scala: {
    headers: [],
    packages: ['scala.collection', 'scala.io', 'scala.concurrent', 'akka', 'cats', 'play-json'],
    snippets: ['object Main', 'def main'],
  },
  matlab: {
    headers: [],
    packages: ['base', 'stats', 'plot'],
    snippets: ['disp', 'plot'],
  },
};
