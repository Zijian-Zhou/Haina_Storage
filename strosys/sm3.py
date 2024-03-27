import ctypes
import os.path
from ctypes import *

from HNS_DFS.settings import BASE_DIR, CACHE_LOC


class sm3:
    def __init__(self):
        dll_path = os.path.join(BASE_DIR, "strosys", "export_sm3.dll")
        self.sm3dll = cdll.LoadLibrary(dll_path)

    def return_res(self, out):
        return out.value.hex().upper()

    def sm3_file(self, path):
        """
        while self.is_used(path):
            print("the file %s is using..." % path)
        """
        path = create_string_buffer(path.encode(), len(path))
        #buf = (c_char * 32)()
        buf = create_string_buffer(32)
        # flag = self.sm3dll.sm3_file(path, byref(buf))
        self.sm3dll.sm3_file(path, buf)
        buf = buf[:32]
        return buf.hex().upper()
        #return self.return_res(buf)

    def cal_sm3(self, buf):
        #output = (c_char * 32)()
        output = create_string_buffer(32)
        inp = create_string_buffer(buf.encode(), len(buf))
        self.sm3dll.sm3(inp, len(buf), output)
        output = output[:32]
        return output.hex().upper()
        #return self.return_res(output)

    def get_block_hash(self, path):
        f = open(path, "rb")
        f.seek(32)
        buf = f.read(32)
        f.close()
        return buf.hex().upper()

    def cal_block_hash(self, path, token):
        with open(path, "rb") as f:
            f.seek(96)
            buf = f.read()
        with open(os.path.join(CACHE_LOC, token), "wb") as f:
            f.write(buf)

        res = self.sm3_file(os.path.join(CACHE_LOC, token))
        os.remove(os.path.join(CACHE_LOC, token))
        return res

    """def is_used(self, file_name):
        try:
            vHandle = win32file.CreateFile(file_name, win32file.GENERIC_READ, 0, None, win32file.OPEN_EXISTING,
                                           win32file.FILE_ATTRIBUTE_NORMAL, None)
            return int(vHandle) == win32file.INVALID_HANDLE_VALUE
        except:
            return True"""
