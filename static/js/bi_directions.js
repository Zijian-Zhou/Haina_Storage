//importScripts('/static/js/pre.js')
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
async function get_block(loc, block){
    return new Promise( async (resolve, reject) => {
        let url = "http://" + loc + "/download/";
        const check_token = await get_check_token(url, "");
        console.log("token", check_token);
        resolve({url: url, block: block, token: check_token});
    })
}
function search_block_loc(node, block){
    return new Promise( async (resolve, reject) => {
        let url = "http://" + node + "/checkblock/";
        const token = await get_check_token(url, "");
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = async function(){
            if(xhr.readyState === 4 && xhr.status === 200){
                let res = JSON.parse(xhr.response);
                console.log("res 51", res)
                if(res.code == 0){
                    resolve({"code": 0});
                }else if(res.code == 1){
                    let ans = await get_block(res.loc, block);
                    resolve({code: 1, url: ans.url, block: ans.block, token: ans.token, loc: res.loc});
                }
            }
        }
        var data = {
            data: {block: block, code: 1},
            token: token,
        };
        console.log("data 64:", data);
        xhr.send('data='+encodeURIComponent(JSON.stringify(data.data))+'&csrfmiddlewaretoken='+encodeURIComponent(data.token));
    })
}
self.onmessage = async (e) => {
    var data = e.data;
    console.log("work", data)
    if(e.data.block == e.data.header){
        self.postMessage({code: 2});
        return;
        //this.close();
    }
    let res = await search_block_loc(data.node, data.block, data.mask);
    console.log("res74", res, data);
    if(res.code == 0){
        self.postMessage({code:0});
        //this.close()
    }else{
        self.postMessage({code:1, url: res.url, block: res.block, token: res.token, loc: res.loc});
        //this.close();
    }
}