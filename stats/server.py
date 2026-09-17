"""First-party aggregate PV/UV counters. No IP, user-agent or article content stored."""
from contextlib import contextmanager
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import sqlite3
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlsplit

ORIGIN = 'https://cjw32.xyz'
UUID = re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}')


def normalize_path(value):
    if not isinstance(value, str) or len(value) > 512 or '?' in value or '#' in value:
        raise ValueError('Invalid path')
    value = unquote(value).rstrip('/')
    if not value.startswith('/blog') or any(part in ('.', '..') for part in value.split('/')):
        raise ValueError('Invalid path')
    return value


class Store:
    def __init__(self, database, paths):
        self.database = str(database)
        self.paths = {normalize_path(p) for p in paths}
        with self.connect() as db:
            db.execute('PRAGMA journal_mode=WAL')
            db.executescript('''
              CREATE TABLE IF NOT EXISTS metadata(key TEXT PRIMARY KEY, value TEXT NOT NULL);
              CREATE TABLE IF NOT EXISTS counts(path TEXT PRIMARY KEY, pv INTEGER NOT NULL, uv INTEGER NOT NULL);
              CREATE TABLE IF NOT EXISTS visitors(path TEXT NOT NULL, visitor TEXT NOT NULL, PRIMARY KEY(path,visitor));
              CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY, visitor TEXT NOT NULL, created INTEGER NOT NULL);
              CREATE INDEX IF NOT EXISTS event_time ON events(created);
              CREATE INDEX IF NOT EXISTS event_visitor_time ON events(visitor,created);
            ''')
            db.execute("INSERT OR IGNORE INTO metadata VALUES ('salt', ?)", (secrets.token_hex(32),))
            db.execute("INSERT OR IGNORE INTO metadata VALUES ('startedAt', ?)", (str(int(time.time())),))
            self.salt = db.execute("SELECT value FROM metadata WHERE key='salt'").fetchone()[0]

    @contextmanager
    def connect(self):
        db = sqlite3.connect(self.database, timeout=5)
        try:
            with db:
                yield db
        finally:
            db.close()

    def visit(self, payload):
        if not isinstance(payload, dict) or set(payload) != {'path', 'visitor', 'event'}:
            raise ValueError('Expected path, visitor and event')
        for key in ('visitor', 'event'):
            if not isinstance(payload[key], str) or not UUID.fullmatch(payload[key]):
                raise ValueError('Invalid anonymous identifier')
        path = normalize_path(payload['path'])
        if path not in self.paths:
            raise ValueError('Unknown page')
        visitor = hashlib.sha256((self.salt + payload['visitor']).encode()).hexdigest()
        event = hashlib.sha256((visitor + payload['event']).encode()).hexdigest()
        now = int(time.time())
        with self.connect() as db:
            db.execute('BEGIN IMMEDIATE')
            db.execute('DELETE FROM events WHERE created < ?', (now - 86400,))
            if db.execute('SELECT 1 FROM events WHERE id=?', (event,)).fetchone():
                return False
            if db.execute('SELECT count(*) FROM events WHERE visitor=? AND created>?', (visitor, now-60)).fetchone()[0] >= 60:
                raise OverflowError('Visit rate exceeded')
            db.execute('INSERT INTO events VALUES (?,?,?)', (event, visitor, now))
            # Site PV counts page loads, article PV counts actual article opens only.
            for key in ('@site', path):
                added = db.execute('INSERT OR IGNORE INTO visitors VALUES (?,?)', (key, visitor)).rowcount
                db.execute('INSERT INTO counts VALUES (?,1,?) ON CONFLICT(path) DO UPDATE SET pv=pv+1, uv=uv+excluded.uv', (key, added))
        return True

    def total(self):
        with self.connect() as db:
            counts = {path: (pv, uv) for path, pv, uv in db.execute('SELECT path,pv,uv FROM counts')}
            started = int(db.execute("SELECT value FROM metadata WHERE key='startedAt'").fetchone()[0])
        site = counts.get('@site', (0, 0))
        return {'siteTotal': site[0], 'siteUnique': site[1], 'startedAt': started,
                'articles': [{'path': path, 'articleTotal': counts.get(path, (0, 0))[0],
                              'articleUnique': counts.get(path, (0, 0))[1]}
                             for path in sorted(self.paths) if path.startswith('/blog/article/')]}


class Handler(BaseHTTPRequestHandler):
    def setup(self):
        super().setup()
        self.connection.settimeout(5)

    def log_message(self, *_):
        pass

    def reply(self, status, value):
        body = json.dumps(value, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        try:
            if self.path == '/healthz':
                with self.server.store.connect() as db:
                    db.execute('SELECT 1 FROM metadata LIMIT 1').fetchone()
                return self.reply(200, {'ok': True})
            if self.path == '/total':
                return self.reply(200, self.server.store.total())
            self.reply(404, {'error': 'Not found'})
        except sqlite3.Error:
            self.reply(503, {'error': 'Statistics temporarily unavailable'})

    def do_POST(self):
        if self.path != '/visit':
            return self.reply(404, {'error': 'Not found'})
        if self.headers.get('Origin') != ORIGIN or self.headers.get('Sec-Fetch-Site', 'same-origin') != 'same-origin':
            return self.reply(403, {'error': 'Same-origin requests only'})
        if self.headers.get('Content-Type', '').split(';')[0] != 'application/json':
            return self.reply(415, {'error': 'JSON required'})
        try:
            size = int(self.headers.get('Content-Length', '0'))
            if not 0 < size <= 2048:
                return self.reply(413, {'error': 'Invalid request size'})
            counted = self.server.store.visit(json.loads(self.rfile.read(size)))
            self.reply(200, {'counted': counted})
        except (ValueError, TypeError):
            self.reply(400, {'error': 'Invalid visit'})
        except OverflowError:
            self.reply(429, {'error': 'Too many visits'})
        except sqlite3.Error:
            self.reply(503, {'error': 'Statistics temporarily unavailable'})


if __name__ == '__main__':
    store = Store(os.environ.get('STATS_DB', '/data/stats.sqlite3'),
                  json.loads(Path(os.environ.get('STATS_PATHS', '/app/paths.json')).read_text()))
    server = ThreadingHTTPServer(('0.0.0.0', 8080), Handler)
    server.store = store
    server.serve_forever()
