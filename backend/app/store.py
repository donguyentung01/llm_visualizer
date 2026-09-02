from collections import OrderedDict

class GenStore:
    def __init__(self, max_size=16):
        self._store = OrderedDict()
        self._max = max_size

    def put(self, gen_id, data):
        self._store[gen_id] = data
        self._store.move_to_end(gen_id)
        while len(self._store) > self._max:
            self._store.popitem(last=False)

    def get(self, gen_id):
        return self._store.get(gen_id)

    def clear(self):
        self._store.clear()

store = GenStore()  