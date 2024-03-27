var dire_times = 0;
var downloads = [];
var runinf = document.getElementById("run-inf-box");
var user_mask = null;
var user_token = null;
function check_rate(node, nums){
    if(node["nums"] / nums > Rate){
        return false;
    }
    return true;
}
function add_zero(val){
    if(val.length == 1) return "0" + val;
    return val;
}
function hash_convert(ptr){
    var value = "";
    for(let i = 0;i<32;i++){
        let ans = Module.HEAP32[ptr / 4 + i] ;
        value += add_zero(ans.toString(16));
    }
    console.log(value.toUpperCase());
    return value.toUpperCase();
}
function sm3(text) {
    var ptr = cal_sm3(text);
    return hash_convert(ptr)
}
function sm3_file(path){
    let ptr = cal_file_sm3(path, Module.FS.stat(path).size);
    return hash_convert(ptr);
}
function add_spaces(mess, num=3){
    let ans = "", space = " ";
    for(i=0;i<mess.length-1;i++){
        ans = ans.concat(mess[i], space.repeat(num));
    }
    return ans.concat(mess[mess.length-1]);
}
function switch_dialog(){
    let mask = document.getElementById("dialog");
    if(mask.style.visibility == "visible"){
        mask.style.visibility = "hidden";
    }else{
        mask.style.visibility = "visible";
    }
}
function set_messs_box(title, mess){
    document.getElementById("mess-title").innerText = add_spaces(title);
    document.getElementById("inf").style.color = "red";
    document.getElementById("inf").innerText = mess;
    document.getElementById("mess-comfirm").addEventListener("click", switch_dialog);
    switch_dialog();
}
function create_button(idn, classn, value, typen=""){
    var but = document.createElement("input");
    but.setAttribute("id", idn);
    but.setAttribute("class", classn);
    but.setAttribute("value", value);
    if(typen === "") {
        but.setAttribute("type", "button");
    }else{
        but.setAttribute("type", typen);
    }
    return but;
}
function create_text(idn, classn, value){
    var but = document.createElement("p");
    but.setAttribute("id", idn);
    but.setAttribute("class", classn);
    but.innerText = value;
    return but;
}
function create_div(idn, classn){
    var but = document.createElement("div");
    but.setAttribute("id", idn);
    but.setAttribute("class", classn);
    return but;
}
function clear_children(idn){
    let tar = document.getElementById(idn);
    while(tar.childNodes.length != 0){ tar.removeChild(tar.childNodes[0])}
}
function res_cancel(){
    clear_children("mess-content");
    clear_children("mess-button");
    let temp = create_text("inf", "", "");
    recover_dialog();
    switch_dialog();
}
function checklenth(idn){
    if(document.getElementById(idn).value.length < 8){
        document.getElementById(idn).style.color = "red";
    }else{
        document.getElementById(idn).style.color = "white";
    }
}
function double_check(){
    if(document.getElementById("res-pwd-f").style.color == "red"){
        document.getElementById("res-mess").innerText = "密码长度低于8位字符！";
        return;
    }
    if(document.getElementById("res-pwd-s").value != document.getElementById("res-pwd-f").value){
        document.getElementById("res-mess").innerText = "两次密码不一致！";
        return;
    }else{
        document.getElementById("res-mess").innerText = "";
    }
}
function get_register(){
    let uname = document.getElementById("res-uname");
    console.log(uname);
    let block = sm3(uname.value);
    $.ajax({
        url: "/checkblock/",
        type: "POST",
        data: {
            "data": JSON.stringify({"block": block, "code": 0}),
            "csrfmiddlewaretoken": document.getElementsByName("csrfmiddlewaretoken")[0].value,
        },
        success: function (res){
            res = JSON.parse(res);
            console.log(res);
            if(res.code === 1){
                document.getElementById("res-mess").innerText = "用户已存在！";
                document.getElementById("loader").style.visibility = "hidden";
                return;
            }else if(res.code === 0){
                document.getElementById("loader-inf").innerText = "用户信息处理中，请稍侯... ...";
                user_mask = sm3(document.getElementById("res-pwd-f").value);
                user_token = sm3(user_mask)
                user_register(uname.value, sm3(document.getElementById("res-pwd-s").value));
            }
        }
    })
}
function get_check_token(url, append){
    return new Promise(function (resolve, reject){
        $.ajax({
            url: url + append,
            type: "GET",
            success: function (res){
                res = JSON.parse(res);
                console.log("get_token:", res, res.token);
                resolve(res.token);
            },
            error: function (request, status, error){
                reject(request.responseText);
            }
        })
    })
}
function check_block(token, checksum, url, check_token){
    let data = new FormData();
    data.append("data", JSON.stringify({"code": 1, "token": token, "check_sum": checksum}));
    data.append("csrfmiddlewaretoken", check_token);
    $.ajax({
        url: url,
        type: "POST",
        data: data,
        processData: false,
        contentType: false,
        success: function (res){
            res = JSON.parse(res);
            console.log("line 92:", res);
        }
    })
}
function block_upload(block, node, mask){
    add_runinf("上传数据块" + block + "至节点" + node);
    console.log("line 97 upload", block);
    let url = "http://" + node + "/upload/";
    //FS.readFile('file', { encoding: 'utf8' })
    let block_data = Module.FS.readFile(block, { encoding: "binary" });
    let data = new FormData();
    let ptrs = get_pointer_domain(block, mask)
    let value = sm3(mask+ptrs.cur);
    console.log("log 178", value, mask+ptrs.cur)
    data.append("data", JSON.stringify({"code": 0}));
    get_check_token(url, "get_token/").then(function (check_token){
        console.log("check_token", check_token)
        data.append("csrfmiddlewaretoken", check_token);
        data.append("block", JSON.stringify({"block": block_data}));
        data.append("execution-token", sm3(value));
        console.log("line104", data);
        $.ajax({
                url: url + "get_token/",
                type: "POST",
                //headers: {'Access-Control-Allow-Credentials': true, " Access-Control-Allow-Origin": window.location.href},
                data: data,
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                processData: false,
                contentType: false,
                success: function (res){
                    res = JSON.parse(res);
                    console.log("line114", res);
                    if(res.code == 0){
                        check_block(res.token, res.checksum, url, check_token);
                    }
                    else{
                        set_messs_box("错 误", "传输出错，错误代码REG-0X01");
                    }
                }
            })
    })
    .catch(function (error){
        alert("发生错误，错误代码: UP-0x01.\ninf: ", error);
    })
}
function get_node(){
    let nid = Math.floor(Math.random() * nodes_nums);
    nid = nid % nodes_nums;
    console.log("line193", nid, stored[nid]);
    return stored[nid]["name"];
}
function get_this_time(){
    let date = new Date();
    let now = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() ;
    now += " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return now;
}
function user_register(uname, pwd){
    var data_domain = {"size": 0, "fs": [{
            "id": 0,
            "name": "root",
            "type": "D",
            "size": 0,
            "last_date": get_this_time(),
            "father": -1,
        }], "username": uname, "cnt": 0}
    data_domain = JSON.stringify(data_domain);
    var ec = new TextEncoder();
    data_domain = ec.encode(data_domain);
    Module.FS.writeFile("./user_meta.dat", data_domain);
    //var nums = pre_init("source.dat", 2);
    user_mask = pwd;
    var nums = pre_init_res("./user_meta.dat", 2, pwd, uname);
    let node = get_node();
    block_upload("/cache/cache_" + 0, node, pwd);
    getnext_Beginner(1, nums, node, pwd);
}
function check_res_inf(){
    if(document.getElementById("res-uname").value == ""){
        document.getElementById("res-mess").innerText = "请输入用户名！";
    }else if(document.getElementById("res-pwd-f").value.length < 8){
        document.getElementById("res-mess").innerText = "请输入足够8位长度的密码！";
    }else if(document.getElementById("res-pwd-s").value != document.getElementById("res-pwd-f").value){
        document.getElementById("res-mess").innerText = "两次密码不一致！";
    }else{
         document.getElementById("res-mess").innerText = "";
         document.getElementById("loader").style.visibility = "visible";
         document.getElementById("loader-inf").innerText = "正在进行注册信息校验... ...";
         get_register();
    }
}
function select_node(nodes_inf, nums){
    for(let i = 0; i < nodes_inf.length; i++){
        for(let j = 0; j < nodes_nums ; j++){
            console.log(stored[j]["name"], nodes_inf[i]["node"]);
            if(stored[j]["name"] == nodes_inf[i]["node"]){
                if(stored[j]["nums"] == 0){
                    stored[j]["nums"]++;
                    return stored[j]["name"];
                }
            }
        }
    }
    for(let i = 0; i < nodes_inf.length; i++){
        for(let j = 0; j < nodes_nums ; j++){
            console.log(stored[j]["name"], nodes_inf[i]["node"]);
            if(stored[j]["name"] == nodes_inf[i]["node"]){
                if(stored[j]["nums"] != 0 && check_rate(stored[j], nums)){
                    stored[j]["nums"]++;
                    return stored[j]["name"];
                }
            }
        }
    }
    for(let j = 0; j < nodes_nums ; j++){
        console.log(stored[j]["name"], nodes_inf[0]["node"]);
        if(stored[j]["name"] == nodes_inf[0]["node"]){
            stored[j]["nums"]++;
            rate_adjust();
            return nodes_inf[0]["node"];
        }
    }
}
function add_runinf(str){
    runinf = document.getElementById("run-inf-box");
    if(runinf != null){
        runinf.innerText += "\n" + str;
        runinf.scrollTop = runinf.scrollHeight;
    }
}
function getnext_Beginner(idx, nums, Beginner, mask, flag=true){
    console.log("line 163 get_next:", Beginner, idx, nums);
    if(idx == nums && flag) {
        document.getElementById("loader-inf").innerText = "完成注册信息同步，正在进行系统初始化... ...";
        disk_init();
        return Promise.resolve();
    }else if(idx == nums){
        add_runinf("文件上传完成!");
        return Promise.resolve();
    }
    add_runinf("竞选新存储节点" + (idx + 1) + "中... ...");
    let block_inf = Module.FS.stat("/cache/cache_" + idx);
    let block_size = block_inf.size;
    console.log("line 167 res", Beginner);
    let url = "http://" + Beginner + "/election/";
    return new Promise( (resolve, reject) => {
        get_check_token(url, "").then(function (check_token){
            console.log("line 169 begin", url);
            $.ajax({
                url: url,
                //headers: {'Access-Control-Allow-Credentials': true, " Access-Control-Allow-Origin": window.location.href},
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                data: {
                    "data": JSON.stringify({"code": 0, "size": block_size}),
                    "csrfmiddlewaretoken": check_token,
                },
                success: function (res){
                    res = JSON.parse(res);
                    console.log("line 180 res-res:",res);
                    let node = select_node(res, nums);
                    console.log("line 182 /cache/cache_" + idx);
                    add_runinf("竞选新存储节点为" + node);
                    block_upload("/cache/cache_" + idx, node, mask);
                    getnext_Beginner(idx+1, nums, node, mask, flag).then(() => {
                        resolve();
                    });
                }
            })
      }).catch(function (error){
            alert("发生错误，错误代码: NBeginner-0x01.\ninf: ", error);
        })
    })
}
function rate_adjust(){
    Rate = Math.min(Rate+0.1, 1);
}
function register_switch(){
    document.getElementById("mess-title").innerText = add_spaces("欢迎使用海纳存储！");
    document.getElementById("inf").style.color = "white";
    let butsc = document.getElementById("mess-button");
    clear_children("mess-button");
    butsc.appendChild(create_button("mess-res-com", "mess-bt", "注册"));
    butsc.appendChild(create_button("mess-res-cancel", "mess-bt", "取消"));
    clear_children("mess-content");

    let box = document.getElementById("mess-content");
    let outer = create_div("", "res-outer");
    let temp = create_div("", "res-bts");
    temp.appendChild(create_text("", "", " 用户名 "));
    temp.appendChild(create_button("res-uname", "res-inp", "", "text"));
    outer.appendChild(temp);
    temp = create_div("", "res-bts");
    temp.appendChild(create_text("", "", " 密 码 "));
    temp.appendChild(create_button("res-pwd-f", "res-inp", "", "password"));
    outer.appendChild(temp);
    temp = create_div("", "res-bts");
    temp.appendChild(create_text("", "", "确认密码"));
    temp.appendChild(create_button("res-pwd-s", "res-inp", "", "password"));
    outer.appendChild(temp);
    temp = create_text("res-mess", "res-mess", "");
    outer.appendChild(temp);
    box.appendChild(outer);

    document.getElementById("mess-res-cancel").addEventListener("click", res_cancel);
    document.getElementById("res-pwd-f").addEventListener("keyup", function (){
        checklenth("res-pwd-f");
    });
    document.getElementById("res-pwd-s").addEventListener("keyup", function (){
        checklenth("res-pwd-s");
        double_check();
    });
    document.getElementById("mess-res-com").addEventListener("click", function (){
        check_res_inf();
    });

    switch_dialog();
}
function login_status(){
    var uname, pwd;
    uname = document.getElementById("user-name").value;
    pwd = document.getElementById("pwd").value;
    if(uname == ""){
        set_messs_box("提示", "请输入用户名后再继续操作！");
        return;
    }
    if(pwd == ""){
        set_messs_box("提示", "请输入密码后再继续操作！");
        return;
    }else if(pwd.length < 8){
        set_messs_box("提示", "密码长度需要8位字符，请检查！");
        return;
    }
    document.getElementById("loader").style.visibility = "visible";
    document.getElementById("loader-inf").innerText = "正在获取身份信息... ...";
    $.ajax({
        url: "/checkblock/",
        type: "POST",
        data: {
            "data": JSON.stringify({"block": sm3(uname), "code": 1}),
            "csrfmiddlewaretoken": document.getElementsByName("csrfmiddlewaretoken")[0].value,
        },
        success: function (res){
            res = JSON.parse(res);
            console.log(res);
            if(res.code == 0){
                document.getElementById("loader").style.visibility = "hidden";
                set_messs_box("错误", "该用户不存在!");
            }else if(res.code == 1){
                 document.getElementById("loader-inf").innerText = "正在解析数据存储结构... ...";
                 user_mask = sm3(pwd);
                 dire_times = 0;
                 get_chain(sm3(uname), res.loc, user_mask);
            }
        }
    })
}
function buf2hex(buffer) {
   return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' +
         x.toString(16)).slice(-2)).join('');

}
function get_pointer_domain(path, mask){
    console.log("line 393", path, mask);
    let ptr = get_pointers(path, mask);
    var value = null;
    var res = {"pre": null, "cur": null, "next": null};
    for(let i = 0;i<3;i++){
        value = "";
        for(let j=0;j<32;j++){
            let ans = Module.HEAP32[ptr / 4 + j + (i*32)] ;
            value += add_zero(ans.toString(16));
        }
        if(i == 0){res.pre = value.toUpperCase()}
        else if(i == 1){res.cur = value.toUpperCase()}
        else {res.next = value.toUpperCase()}
    }
    return res;
}
function clear_downloads(){
    let files = Module.FS.readdir('/downloads');
    for(let i = 0;i<files.length;i++){
        if (files[i] != "." && files[i] != ".."){
            remove("/downloads/"+files[i]);
        }
    }
}
function check_downloaded(block){
    for(let i = 0;i<downloads.length;i++){
        if(downloads[i] == block) return false;
    }
    return true;
}
function file_download(fileinf){
    document.getElementById("loader").style.visibility = "visible";
    document.getElementById("loader-inf").innerText = "正在下载文件" + fileinf.name + "... ...";
    console.log(fileinf.first, fileinf.header_loc, fileinf.mask, "get_file", "./" + fileinf.name);
    get_chain(fileinf.first, fileinf.header_loc, fileinf.mask, "get_file", "./" + fileinf.name);
}
function transfer2loc(filepath){
    const data = Module.FS.readFile(filepath);
    const tar = document.createElement("a");
    tar.href = URL.createObjectURL(new Blob([data]));
    tar.download = filepath.substring(2);
    tar.click();
}
function methods_switch(header, mask, method, filename){
    let re;
    if(method == "get_file"){
        re = new recovery(header, mask, false, filename)
    }else{
        re = new recovery(header, mask, true, filename)
    }
    if(!re.start()){
        set_messs_box("错误", "数据链重构发生错误，数据错误！错误代码: 0x01REB");
    }else if(method == "download"){
        traver_remove(mask);
    }else if(method == "get_file"){
        transfer2loc(filename);
    }else{
        login_init();
    }
}
function download_block(url, block, token, header, flag, loc, mask, method, filename){
    add_runinf("正在下载数据块" + block);
    if(check_downloaded(block)){
        var data = {
            url: url,
            type: "POST",
            xhrFields: {
                withCredentials: true,
                responseType: "blob",
            },
            crossDomain: true,
            data: {
                "data": JSON.stringify({"code": 0, "block": block}),
                "csrfmiddlewaretoken": token,
            },
            success: function (data){
                add_runinf("数据块" + block + "下载完成!")
                let reader = new FileReader();
                reader.readAsArrayBuffer(data);
                reader.onload = () => {
                    var filePath = '/downloads/down_' + block + ".dat";
                    Module.FS.writeFile(filePath, new Uint8Array(reader.result), {encoding: "binary"});
                    let res = get_pointer_domain(filePath, mask);
                    if(flag == 1){
                        let next_dir = new Worker("/static/js/bi_directions.js");
                        next_dir.postMessage({header: header, block: res.next, flag: 1, node: loc})
                        next_dir.onmessage = e => {
                            if(e.data.code == 1){
                                download_block(e.data.url, e.data.block, e.data.token, header, 1, loc, mask, method,filename);
                            }else if(e.data.code == 2){
                            console.log("diretimes 443 ", dire_times);
                            if(dire_times == 1){
                                console.log("start 455");
                                dire_times = 0;
                                console.log(method);
                                methods_switch(header, mask, method, filename);
                            }else{
                                dire_times += 1;
                            }
                        }
                            console.log("后向解析结果:", e);
                        }
                    }else{
                        let pre_dir = new Worker("/static/js/bi_directions.js");
                        pre_dir.postMessage({header: header, block: res.pre, flag: 0, node: loc})
                        pre_dir.onmessage = e => {
                            if(e.data.code == 1){
                                download_block(e.data.url, e.data.block, e.data.token, header, 0, loc, mask, method, filename);
                            }else if(e.data.code == 2){
                            console.log("diretimes 461 ", dire_times);
                            if(dire_times == 1){
                                console.log("start 478");
                                dire_times = 0;
                                console.log(method);
                                methods_switch(header, mask, method, filename);
                            }else{
                                dire_times += 1;
                            }
                        }
                            console.log("前向解析结果:", e);
                        }
                    }
                }
            }
        }
        $.ajax(data);
    }else{
        if(dire_times == 1){
            console.log("start 491");
            dire_times = 0;
            console.log(method);
            methods_switch(header, mask, method, filename);
        }else{
            dire_times += 1;
        }
    }
}
function get_chain(header, loc, mask, method="res", filename="./user_meta.dat"){
    downloads = [];
    get_check_token("http://"+loc+"/download/", "").then(function (check_token){
        var data = {
            url: "http://"+loc+"/download/",
            type: "POST",
            xhrFields: {
                withCredentials: true,
                responseType: "blob",
            },
            crossDomain: true,
            data: {
                "data": JSON.stringify({"code": 0, "block": header}),
                "csrfmiddlewaretoken": check_token,
            },
            success: function (data){
                let reader = new FileReader();
                reader.readAsArrayBuffer(data);
                reader.onload = () => {
                    clear_downloads()
                    var filePath = '/downloads/down_' + header + ".dat";
                    Module.FS.writeFile(filePath, new Uint8Array(reader.result), {encoding: "binary"});
                    downloads.push(header);
                    let res = get_pointer_domain(filePath, mask);
                    let next_dir = new Worker("/static/js/bi_directions.js");
                    next_dir.postMessage({header: header, block: res.next, flag: 1, node: loc})
                    let pre_dir = new Worker("/static/js/bi_directions.js");
                    pre_dir.postMessage({header: header, block: res.pre, flag: 0, node: loc})
                    next_dir.onmessage = e => {
                        if(e.data.code == 1){
                            download_block(e.data.url, e.data.block, e.data.token, header, 1, loc, mask, method, filename);
                        }else if(e.data.code == 2){
                            console.log("diretimes 509 ", dire_times);
                            if(dire_times == 1){
                                console.log("start 510");
                                dire_times = 0;
                                console.log(method);
                                methods_switch(header, mask, method, filename);
                            }else{
                                dire_times += 1;
                            }
                        }
                        console.log("后向解析结果:", e);
                    }
                    pre_dir.onmessage = e => {
                        if(e.data.code == 1){
                            download_block(e.data.url, e.data.block, e.data.token, header, 0, loc, mask, method, filename);
                        }else if(e.data.code == 2){
                            console.log("diretimes 524 ", dire_times);
                            if(dire_times == 1){
                                console.log("start 559");
                                dire_times = 0;
                                console.log(method);
                                methods_switch(header, mask, method, filename);
                            }else{
                                dire_times += 1;
                            }
                        }
                        console.log("前向解析结果:", e);
                    }
                }
            }
        }
        $.ajax(data);
    })
}
