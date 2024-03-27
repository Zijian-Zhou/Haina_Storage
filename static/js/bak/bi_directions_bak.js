importScripts('/static/js/pre.js')
async function get_check_token(url, append){
    return new Promise(function (resolve, reject){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url+append, true);
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4 && xhr.status === 200) {
              let res = JSON.parse(xhr.response);
              resolve(res.token);
          }
        };
        xhr.send();
    })
}
async function get_block(loc, block, mask){
    return new Promise( async (resolve, reject) => {
        let url = "http://"+loc+"/download/";
        const check_token = await get_check_token(url, "");
        console.log("token", check_token);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.responseType = 'blob';
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4 && xhr.status === 200){
                let reader = new FileReader();
                console.log("download 25:", typeof xhr.response, xhr.response);
                reader.readAsArrayBuffer(xhr.response);
                reader.onload = () => {
                    var filePath = '/downloads/down_' + block + ".dat";
                    FS.writeFile(filePath, new Uint8Array(reader.result), {encoding: "binary"});
                    let res = get_pointer_domain(filePath, mask);
                    resolve(res);
                }
            }
        }
        var data = {
            data: {code: 0, block: block},
            token: check_token,
        };
        xhr.send('data='+encodeURIComponent(JSON.stringify(data.data))+'&csrfmiddlewaretoken='+encodeURIComponent(data.token));
    })
}
function search_block_loc(node, block, mask){
    return new Promise( async (resolve, reject) => {
        let url = "http://" + node + "/checkblock/";
        const token = await get_check_token(url, "");
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4 && xhr.status === 200){
                let res = JSON.parse(xhr.response);
                console.log("res 51", res)
                if(res.code == 0){
                    resolve({"code": 0});
                }else if(res.code == 1){
                    let ans = get_block(res.loc, block, mask);
                    resolve({code: 1, res: ans, loc: res.loc});
                }
            }
        }
        var data = {
            data: {block: block, code: 1},
            token: token,
        };
        console.log("data 64:", data);
        xhr.send('data='+encodeURIComponent(JSON.stringify(data.data))+'&csrfmiddlewaretoken='+encodeURIComponent(data.token));
    }
    )
}
self.onmessage = async (e) => {
    var data = e.data;
    console.log("work", data)
    if(data.flag == 1){
        let res = await search_block_loc(data.node, data.block, data.mask);
        console.log("res74", res)
        if(res.code == 0){
            self.postMessage({code:0})
        }else{
            console.log("res ", res);
            if(res.res.next != data.header){
                let worker = new Worker("/static/js/bi_directions.js");
                worker.postMessage({header: data.header, block: res.res.next, flag: 1, node: res.loc, mask: data.mask})
                worker.onmessage = e => {
                    let data = e.data;
                    if(data.code == 1){
                        self.postMessage({code: 1})
                    }else{
                        self.postMessage({code: 0})
                    }
                }
            }else{
                self.postMessage({code: 1})
            }
        }
    }else{
        let res = await search_block_loc(data.node, data.block, data.mask)
        console.log(res)
        if(res.code == 0){
            self.postMessage({code:0})
        }else{
            if(res.res.pre != data.header){
                let worker = new Worker("/static/js/bi_directions.js");
                worker.postMessage({header: data.header, block: res.res.pre, flag: 0, node: res.loc, mask: data.mask})
                worker.onmessage = e => {
                    let data = e.data;
                    if(data.code == 1){
                        self.postMessage({code: 1})
                    }else{
                        self.postMessage({code: 0})
                    }
                }
            }else{
                self.postMessage({code: 1})
            }
        }
    }
    self.postMessage(data)
}