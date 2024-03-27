import asyncio
import base64
import ctypes
import json
import os
import platform
import random
import threading
import time
import asyncio

from django.http import HttpResponse
from django.shortcuts import render
from django.views import View
import requests

from HNS_DFS.cross_headers import get_token
from HNS_DFS.settings import BASE_DIR, CACHE_LOC, SELF_NAME
from strosys.models import Block_file_map, Nodes
from strosys.sm3 import sm3
import base64

# Create your views here.
MISTAKE_HASH = "0000000000000000000000000000000000000000000000000000000000000000"


# template for class
class test(View):

    def get(self, rerquest):
        token = get_token(rerquest)
        return render(rerquest, "pages/test.html", {"d_csrf_token": token})

    def post(self, request):
        pass


class disk_test(View):

    def get(self, rerquest):
        token = get_token(rerquest)
        return render(rerquest, "pages/disk.html",
                      {"d_csrf_token": token, "test": [x for x in range(random.randint(1, 100))]})

    def post(self, request):
        pass


class login(View):

    def get(self, request):
        token = get_token(request)
        return render(request, "pages/login.html", {"d_csrf_token": token})

    def post(self, request):
        pass


class find_block(View):

    def get(self, request):
        token = get_token(request)
        return HttpResponse(json.dumps({"token": token}))

    def post(self, request):
        print("re66:", request.POST)
        res = json.loads(request.POST["data"])
        block_hash = res["block"]
        code = int(res["code"])
        """
            code: int # the block-ask source address
                # value:
                    0: register
                    1: normal
        """
        maps = Block_file_map.objects.filter(hash=block_hash)
        """
            local_flag: Flag of block's existence
                # value:
                    False Dose not exist
                    Ture: Exist
            network_flag: Flag of block's existence
                # value:
                    False Dose not exist
                    Ture: Exist
            loc: the node where store the block
                # value:
                    string: Domain
        """
        local_flag = False
        network_flag = False
        loc = None
        if maps.count() != 0:
            local_flag = True
            loc = SELF_NAME

        if local_flag is False:
            network_flag, loc = self.network_find(block_hash)

        """
            return code (int)
                # value:
                    1: The block exists
                    0: The block dose not exists
        """
        if local_flag:
            if code == 0:
                return HttpResponse(json.dumps({"code": 1}))
            return HttpResponse(json.dumps({"code": 1, "loc": loc}))
        elif network_flag:
            if code == 0:
                return HttpResponse(json.dumps({"code": 1}))
            return HttpResponse(json.dumps({"code": 1, "loc": loc}))
        return HttpResponse(json.dumps({"code": 0}))

    def network_find(self, block_hash):
        nodes = Nodes.objects.filter()
        url = "http://%s/checkblock/find/"
        flag = False
        loc = None
        for i in nodes:
            if i.is_alive == 1 and i.name != SELF_NAME:
                req = requests.get(url % i.name)
                token = json.loads(req.content)
                token = token["token"]
                if str(req.status_code) == "200":
                    req = requests.post(url % i.name, {"csrfmiddlewaretoken": token,
                                                       "data": json.dumps({"block": block_hash, "code": 0})})
                    if str(req.status_code) == "200":
                        res = json.loads(req.content)
                        code = res["code"]
                        if code == 1:
                            flag = True
                            loc = i.name
                        else:
                            continue
                    else:
                        continue
                else:
                    print(req.content)
        return flag, loc


class find_block_network(View):

    def get(self, request):
        token = get_token(request)
        return HttpResponse(json.dumps({"token": token}))

    def post(self, request):
        res = json.loads(request.POST["data"])
        print(res)
        code = int(res["code"])
        """
            code: option code (int)
                # value:
                    0: search_block
                        return 0 # do not exist
                        return 1 # exist
        """
        if code == 0:
            hash = res["block"]
            dbi = Block_file_map.objects.filter(hash=hash)
            if dbi.count() == 1:
                return HttpResponse(json.dumps({"code": 1}))
        return HttpResponse(json.dumps({"code": 0}))


class upload(View):

    def get(self, request, op_name=""):
        if op_name == "get_token":
            token = get_token(request)
            return HttpResponse(json.dumps({"token": token}))

    def post(self, request, op_name=""):
        res = json.loads(request.POST["data"])
        code = res["code"]
        """
            code: int # the block upload method
                # value:
                    0: register
                    1: check_block 
                        # input param: token, check_sum
        """
        if code == 0:
            try:
                # block = request.FILES.get('block')
                sm3c = sm3()
                block = json.loads(request.POST["block"])
                block = block["block"]
                timestamp = time.localtime(time.time())
                timestamp = str(timestamp) + str(random.randint(1, 0xFFFFFFFFFFFFFFFFFFFFFFF))
                timestamp = sm3c.cal_sm3(timestamp)
                mis = 0
                while timestamp == MISTAKE_HASH and mis < 10:
                    timestamp = sm3c.cal_sm3(timestamp)
                    mis += 1
                file_path = os.path.join(CACHE_LOC, timestamp)
                with open(file_path, "wb") as f:
                    for i in block:
                        f.write(block[i].to_bytes(1, byteorder='little', signed=False))
                    f.close()
                """
                    return: code (int)
                        # value:
                            0: Block transfered successfully
                            1: Process Damaged
                """
            except:
                return HttpResponse(json.dumps({"code": 1}))
            get_hash = sm3().get_block_hash(file_path)
            Block_file_map.objects.create(hash=get_hash, path=file_path, token=request.POST["execution-token"])
            return HttpResponse(
                json.dumps({"code": 0, "token": timestamp, "checksum": get_hash}))
        elif code == 1:
            # try:
            sm3c = sm3()
            token = res["token"]
            get_hash = res["check_sum"]
            file_path = os.path.join(CACHE_LOC, token)
            """
                return: code (int)
                    # value:
                        0: Integration of uploading is right
                        1: Block Damaged
                        2: The token dose not exist
            """
            if os.path.isfile(file_path):
                token = sm3c.cal_sm3(token)
                mis = 0
                while token == MISTAKE_HASH and mis < 10:
                    token = sm3c.cal_sm3(token)
                    mis += 1
                cal_hash = sm3c.cal_block_hash(file_path, token)
                mis = 0
                while cal_hash == MISTAKE_HASH and mis < 10:
                    cal_hash = sm3c.cal_block_hash(file_path, token)
                    mis += 1
                time.sleep(0.2)
                if cal_hash == get_hash:
                    return HttpResponse(json.dumps({"code": 0}))
                print("cal", len(cal_hash), cal_hash, "get", get_hash, "token", token)
                return HttpResponse(json.dumps({"code": 1}))
            return HttpResponse(json.dumps({"code": 2, "mess": "The token dose not exist !"}))

        return HttpResponse(json.dumps({"code": -1}))


class campaigm:
    def __init__(self, k=1):
        self.Followers = Nodes.objects.filter(is_alive=1)
        self.threads = []
        self.res = []
        self.k = k

    def vote(self, i, size):
        url = "http://%s/election/"
        ans = requests.get(url % i.name)
        cookies = ans.cookies
        token = json.loads(ans.content)['token']
        data = {"csrfmiddlewaretoken": token, "data": json.dumps({"code": 1, "size": size})}
        print(data)
        start_time = time.time()
        ans = requests.post(url % i.name, data=data, cookies=cookies)
        recv_time = time.time()
        print("ans", ans)
        ans = json.loads(ans.content)
        if ans["acceptance"] == 1:
            rtt = recv_time - start_time
            space = float(ans["space"]) / (1024 * 1024 * 1024)
            if rtt < 1:
                value = space * self.k
            else:
                value = self.k * space / rtt
            self.res.append({"node": i.name, "value": value})

    def sort(self):
        if len(self.res) == 1:
            return self.res
        for i in range(len(self.res)):
            for j in range(len(self.res)):
                print(j, len(self.res))
                if j < len(self.res) and self.res[j] < self.res[j + 1]:
                    self.res[j], self.res[j + 1] = self.res[j + 1], self.res[j]
        return self.res

    def campaign(self, size):

        for i in self.Followers:
            if i.name != SELF_NAME:
                td = threading.Thread(target=self.vote, kwargs={"i": i, "size": size})
                self.threads.append(td)
                td.start()

        for t in self.threads:
            t.join()

        return self.sort()


class election(View):
    def get(self, request):
        token = get_token(request)
        return HttpResponse(json.dumps({"token": token}))

    def post(self, request):
        print(request.POST)
        res = json.loads(request.POST["data"])
        code = res["code"]
        """
            code: the option code
                # value:
                    0: campaign a election
                    1: participate in a election
        """
        if code == 0:
            cmp = campaigm()
            res = cmp.campaign(res["size"])
            return HttpResponse(json.dumps(res))
        elif code == 1:
            freespace = self.get_free_space_mb(CACHE_LOC)
            size = res["size"]
            if size < freespace:
                return HttpResponse(json.dumps({"acceptance": 1, "space": freespace}))
            return HttpResponse(json.dumps({"acceptance": 0}))

    def get_free_space_mb(self, folder):
        if platform.system() == 'Windows':
            free_bytes = ctypes.c_ulonglong(0)
            ctypes.windll.kernel32.GetDiskFreeSpaceExW(ctypes.c_wchar_p(folder), None, None, ctypes.pointer(free_bytes))
            return free_bytes.value
        else:
            st = os.statvfs(folder)
            return st.f_bavail * st.f_frsize


class nodes(View):
    def get(self, request, op_name=""):
        if op_name == "":
            nodes = Nodes.objects.filter()
            res = {}
            cnt = 0
            for i in nodes:
                if i.is_alive == 1:
                    res["%d" % cnt] = i.name
                    cnt += 1
            res["nums"] = cnt
            return HttpResponse(json.dumps(res))
        elif op_name == "get_token":
            token = get_token(request)
            return HttpResponse(json.dumps({"token": token}))

    def post(self, request, op_name=""):
        res = json.loads(request.POST["data"])
        code = res["code"]
        """
            code : option code (int)
                # value:
                    0: check the Node File Hash
                        # return:
                            code: 1 : successful
                                NFH: The hash of Node File
                            code 0 :  error
        """
        if code == 0:
            try:
                nodes = Nodes.objects.all().order_by("name").values()
                sm3c = sm3()
                res = {}
                cnt = 0
                for i in nodes:
                    res["%d" % cnt] = {"name": i["name"], "active_status": i["is_alive"]}
                    cnt += 1
                NF_HASH = sm3c.cal_sm3(json.dumps(res))
                return HttpResponse(json.dumps({"code": 1, "NFH": NF_HASH}))
            except:
                return HttpResponse(json.dumps({"code": 0}))


class download(View):
    def get(self, request):
        token = get_token(request)
        return HttpResponse(json.dumps({"token": token}))

    def post(self, request):
        print(request.POST)
        data = json.loads(request.POST["data"])
        print(data)
        code = int(data["code"])
        """
            code: option code:
                #value 0:
                    :param block
                    return the corresponding block of the hash
        """
        if code == 0:
            block = Block_file_map.objects.get(hash=data["block"])
            path = block.path
            with open(path, "rb") as f:
                buf = f.read()
            response = HttpResponse(buf, content_type='application/octet-stream')
            response["processData"] = "false"
            return response
        return HttpResponse("ok")


class delete_block(View):
    def get(self, request):
        token = get_token(request)
        return HttpResponse(json.dumps({"token": token}))

    def post(self, request):
        print(request.POST)
        data = json.loads(request.POST["data"])
        code = int(data["code"]);
        if code == 0:
            print("get in")
            block = data["block"]
            execution = sm3().cal_sm3(data["execution"])
            cnt = 0;
            while execution == MISTAKE_HASH and cnt < 20:
                execution = sm3().cal_sm3(data["execution"])
                cnt += 1
            if(self.delete_block_phy(block, execution)):
                return HttpResponse(json.dumps({"code": 0}))
        return HttpResponse(json.dumps({"code": 1}))

    def delete_block_phy(self, hash, execution):
        blockinf = Block_file_map.objects.get(hash=hash)
        print(blockinf.token, execution, str(blockinf.token) == str(execution))
        if str(blockinf.token) == str(execution):
            try:
                os.remove(blockinf.path)
                blockinf.delete()
                return True
            except BaseException as e:
                print(e)
                return False
        return False