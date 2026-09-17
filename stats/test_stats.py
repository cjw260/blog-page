import concurrent.futures
import http.client
import json
from pathlib import Path
import tempfile
import threading
import unittest
import uuid
from server import Store, Handler, ThreadingHTTPServer

class StatsTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.db=Path(self.tmp.name)/'stats.sqlite3'
        self.paths=['/blog/','/blog/article/test/','/blog/tags/astro/']
        self.store=Store(self.db,self.paths)
        self.visitor=str(uuid.uuid4())
    def tearDown(self): self.tmp.cleanup()
    def visit(self, **extra):
        return {'path':'/blog/article/test/','visitor':self.visitor,'event':str(uuid.uuid4()),**extra}
    def test_pv_uv_retries_and_persistence(self):
        v=self.visit();self.assertTrue(self.store.visit(v));self.assertFalse(self.store.visit(v))
        self.store.visit(self.visit());self.store.visit(self.visit(visitor=str(uuid.uuid4())))
        stats=Store(self.db,self.paths).total()
        self.assertEqual((stats['siteTotal'],stats['siteUnique']),(3,2))
        self.assertEqual(stats['articles'][0]['articleTotal'],3)
        self.assertEqual(stats['articles'][0]['articleUnique'],2)
        self.assertNotIn(self.visitor,self.db.read_bytes().decode(errors='ignore'))
    def test_listing_does_not_count_article_and_new_browser_counts_uv(self):
        self.store.visit(self.visit(path='/blog/'))
        self.store.visit(self.visit(path='/blog/tags/astro'))
        self.assertEqual(self.store.total()['articles'][0]['articleTotal'],0)
        self.assertEqual(self.store.total()['siteUnique'],1)
    def test_concurrent_visits_and_duplicate_events_are_atomic(self):
        event=self.visit()
        with concurrent.futures.ThreadPoolExecutor(8) as pool:
            results=list(pool.map(self.store.visit,[event]*20))
        self.assertEqual(sum(results),1)
        with concurrent.futures.ThreadPoolExecutor(8) as pool:
            list(pool.map(self.store.visit,[self.visit() for _ in range(20)]))
        self.assertEqual(self.store.total()['siteTotal'],21)
        self.assertEqual(self.store.total()['siteUnique'],1)
    def test_bad_paths_inputs_and_rate_limits(self):
        for patch in [{'path':'/blog/article/missing'},{'path':'/blog/../etc'},{'path':'/blog/?key=secret'}, {'visitor':'x'}, {'event':'x'}, {'extra':1}]:
            with self.assertRaises(ValueError):self.store.visit(self.visit(**patch))
        for _ in range(60):self.store.visit(self.visit())
        with self.assertRaises(OverflowError):self.store.visit(self.visit())
        self.assertEqual(self.store.total()['siteTotal'],60)
    def test_deleted_articles_are_not_exposed_but_counts_survive_restoration(self):
        self.store.visit(self.visit())
        self.assertEqual(Store(self.db,['/blog/']).total()['articles'],[])
        self.assertEqual(Store(self.db,self.paths).total()['articles'][0]['articleTotal'],1)
    def test_http_origin_content_type_and_read_only_get(self):
        server=ThreadingHTTPServer(('127.0.0.1',0),Handler);server.store=self.store
        thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
        def request(method,path,headers=None):
            c=http.client.HTTPConnection(*server.server_address)
            c.request(method,path,json.dumps(self.visit()) if method=='POST' else None,headers or {})
            r=c.getresponse();data=r.read();c.close();return r.status,json.loads(data)
        try:
            self.assertEqual(request('GET','/total')[1]['siteTotal'],0)
            self.assertEqual(request('GET','/visit')[0],404)
            self.assertEqual(request('POST','/visit',{'Origin':'https://evil.example','Content-Type':'application/json'})[0],403)
            self.assertEqual(request('POST','/visit',{'Origin':'https://cjw32.xyz','Content-Type':'text/plain'})[0],415)
            headers={'Origin':'https://cjw32.xyz','Content-Type':'application/json'}
            self.assertEqual(request('POST','/visit',headers)[0],200)
            self.assertEqual(request('GET','/total')[1]['siteTotal'],1)
        finally:
            server.shutdown();server.server_close();thread.join()

if __name__=='__main__':unittest.main()
