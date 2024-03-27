var struction = null;
var guider = {cur: null, super: null};
var capacity_chart = null;
var file_container = document.getElementById("files-list");
var dropzone = document.getElementById('up-area');
var getin_list = [];
var trans_list = new DataTransfer();
var capacity_option = {
  title: {
    text: '当前文件夹容量分布',
    subtext: '已用容量100MB',
    textStyle: {
        color: "white",
        fontFamily:'sans-serif'
    },
    subtextStyle: {
        color: "white",
        fontFamily:'sans-serif'
    },
    left: 'center'
  },
  tooltip: {
    trigger: 'item'
  },
  series: [
    {
      type: 'pie',
      radius: '50%',
      label: {
        normal: {
           position: 'inner',
           show : false
        }
      },
      data: [
        { value: 1048, name: '文件夹1' },
        { value: 735, name: '文件夹2' },
        { value: 580, name: '文件1' },
        { value: 484, name: '文件2' },
        { value: 300, name: '文件3' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
};
function remove_div(idn){
    var tar = document.getElementById(idn);
    tar.remove();
}
function init_top_center(){
    let outer = create_div("", "center");
    let temp = create_div("", "title");
    temp.innerHTML = "<b>海 纳 存 储</b>&emsp;-&emsp;H&emsp;N&emsp;S";
    outer.appendChild(temp);
    return outer;
}
function init_top_right(){
    let outer = create_div("", "right");
    let temp = create_div("search-bt", "op-item");
    temp.innerHTML = "<i class=\"fa fa-search\" aria-hidden=\"true\">搜索</i>";
    outer.appendChild(temp);
    temp = create_div("logout-bt", "op-item");
    temp.innerHTML = "<i class=\"fa fa-sign-out\" aria-hidden=\"true\">退出</i>";
    outer.appendChild(temp);
    return outer;
}
function init_top_sticky(){
    let outer = create_div("", "top-sticky");
    outer.appendChild(create_div("", "left"));
    outer.appendChild(init_top_center());
    outer.appendChild(init_top_right());
    return outer;
}
function gap_bar(){
    let outer = create_div("", "guide-bar");
    let temp = document.createElement("i");
    temp.setAttribute("class", "fa fa-chevron-right");
    //temp.setAttribute("aria-hidden=", "true");
    outer.appendChild(temp);
    return outer;
}
function init_guide_row(){
    let outer = create_div("guide-row", "guide-row");
    let temp = create_div("", "gap");
    temp.innerHTML = "&emsp;";
    outer.appendChild(temp);
    outer.appendChild(create_text("bar-0", "guide-item clickable", "根目录"));
    outer.appendChild(gap_bar());
    return outer;
}
function get_chart(){
    let outer = create_div("", "show-chart");
    let temp = create_div("capacity_chart", "");
    temp.style = "width: 450px;height: 450px;user-select: none;-webkit-tap-highlight-color: rgba(0, 0, 0, 0);position: fixed;left: -10%;top: 3.6%;";
    outer.appendChild(temp);
    return outer;
}
function init_left_box(){
    let outer = create_div("", "left-box");
    outer.appendChild(get_chart());
    let temp = create_div("", "run-inf");
    let cache = create_div("", "");
    cache.setAttribute("style", "height: \"3%\";");
    cache.innerHTML="&emsp;";
    temp.appendChild(cache);
    cache = create_div("", "title");
    cache.innerHTML = "<b>运行消息</b>";
    temp.appendChild(cache);
    temp.appendChild(create_div("run-inf-box", "inf-box style-1"));
    outer.appendChild(temp);
    return outer;
}
function create_icon_selection(flag, value){
    let temp;
    if(flag){
        temp = create_div("icon-mode", "show-type selected");
        temp.innerHTML = "<i class=\"fa fa-th-large\" aria-hidden=\"true\"></i>";
    }else{
        temp = create_div("list-mode", "show-type");
        temp.innerHTML = "<i class=\"fa fa-list\" aria-hidden=\"true\"></i>";
    }
    temp.innerHTML += value;
    return temp;
}
function init_files_box_bottom(){
    let outer = create_div("", "box-bottom");
    outer.appendChild(create_icon_selection(true, "图标"));
    outer.appendChild(create_icon_selection(false, "列表"));
    return outer;
}
function init_files_box(){
    let outer = create_div("", "files-box");
    let temp = create_div("show-files", "file-list style-1");
    temp.appendChild(draw_create());
    outer.appendChild(temp);
    outer.appendChild(init_files_box_bottom());
    return outer;
}
function init_footer(){
    let outer = create_div("", "footer");
    outer.innerHTML = "&copy;2023@海纳存储-HNS"
    return outer;
}
function listener(){
    $("#list-mode").click(function (){switch_icon();});
    $("#search-bt").click(function (){search_box();});
    $("#logout-bt").click(function (){
        set_messs_box("提示", "确定退出系统？");
    })
}
function init_adder(){
    let outer = create_div("adder", "adder");
    outer.style.visibility = "hidden";
    let box = create_div("", "box");
    let temp = create_div("", "title");
    temp.innerHTML = "请&emsp;选&emsp;择&emsp;操&emsp;作";
    box.appendChild(temp);
    temp = create_div("", "buts");
    let cache = create_div("create-new-file", "bt");
    cache.innerHTML = "上&emsp;传&emsp;文&emsp;件";
    temp.appendChild(cache);
    cache = create_div("create-new-folder", "bt");
    cache.innerHTML = "新&emsp;建&emsp;文&emsp;件&emsp;夹";
    temp.appendChild(cache);
    cache = create_div("create-cancel", "bt");
    cache.innerHTML = "取&emsp;消";
    temp.appendChild(cache);
    box.appendChild(temp);
    outer.appendChild(box);
    document.body.appendChild(outer);
}
function init_create_box(){
    let outer = create_div("create-new-folder-box", "adder");
    outer.style.visibility = "hidden";
    let box = create_div("", "box");
    let temp = create_div("", "title");
    temp.innerHTML = "请&emsp;输&emsp;入&emsp;文&emsp;件&emsp;夹&emsp;名";
    box.appendChild(temp);
    temp = create_button("folder-name-in", "", "请输入用户名", "text");
    box.appendChild(temp);
    temp = create_div("", "buts");
    let cache = create_div("confirm-new-folder", "bt");
    cache.innerHTML = "确&emsp;认";
    temp.appendChild(cache);
    cache = create_div("folder-creator-cancel", "bt");
    cache.innerHTML = "取&emsp;消";
    temp.appendChild(cache);
    box.appendChild(temp);
    outer.appendChild(box);
    document.body.appendChild(outer);
}
function init_create_mask(){
    let outer, box, temp ,cache;
    outer = create_div("create-new-mask", "create-new-mask");
    outer.style.visibility = "hidden";
    box = create_div("", "box");
    temp = create_div("", "box-title");
    temp.innerHTML = "上 传 文 件";
    box.appendChild(temp);
    temp = create_div("up-area", "up-area");
    temp.innerText = "点击此处或将文件拖拽至此处进行文件上传";
    box.appendChild(temp);
    temp = document.createElement("input");
    temp.type = "file";
    temp.style.visibility = "hidden";
    temp.setAttribute("id", "files-list");
    temp.setAttribute("multiple", true);
    box.appendChild(temp);
    temp = create_div("log-file-area", "log-area style-1");
    box.appendChild(temp);
    temp = create_div("", "buttons");
    cache = create_div("upload-cancel", "button item");
    cache.innerText = "取消";
    temp.appendChild(cache);
    cache = create_div("confirm-upload", "button item");
    cache.innerText = "确认上传";
    temp.appendChild(cache);
    box.appendChild(temp);
    outer.appendChild(box);
    document.body.appendChild(outer);
    listen_events();
}
function listen_events(){
    file_container = document.getElementById("files-list");
    dropzone = document.getElementById('up-area');
    dropzone.addEventListener("dragenter", dropevents);
    dropzone.addEventListener("dragover", dropevents);
    dropzone.addEventListener("drop", dropevents);
    dropzone.addEventListener("dragleave", dropevents);
    dropzone.addEventListener("click", dropevents);
    dropzone.addEventListener("mouseover", dropevents);
    dropzone.addEventListener("mouseout", dropevents);
    file_container.addEventListener("change", loadfiles);
    document.getElementById("create").addEventListener("click", function (){
        document.getElementById("adder").style.visibility = "visible";
    })
    document.getElementById("upload-cancel").addEventListener("click", function (){
        document.getElementById("create-new-mask").style.visibility = "hidden";
    });
    document.getElementById("create-new-file").addEventListener("click", function (){
        document.getElementById("adder").style.visibility = "hidden";
        document.getElementById("create-new-mask").style.visibility = "visible";
    });
    document.getElementById("create-cancel").addEventListener("click", function (){
        document.getElementById("adder").style.visibility = "hidden";
    });
    document.getElementById("create-new-folder").addEventListener("click", function (){
        document.getElementById("create-new-folder-box").style.visibility = "visible";
        document.getElementById("folder-name-in").value = "请输入文件夹名";
    });
    document.getElementById("folder-creator-cancel").addEventListener("click", function (){
        document.getElementById("adder").style.visibility = "hidden";
        document.getElementById("create-new-folder-box").style.visibility = "hidden";
    });
    document.getElementById("folder-name-in").addEventListener("focus", function (){
        if(document.getElementById("folder-name-in").value == "请输入文件夹名"){
            document.getElementById("folder-name-in").value = "";
        }
    });
    document.getElementById("confirm-upload").addEventListener("click", function (){
        pre_upload();
    });
    document.getElementById("confirm-new-folder").addEventListener("click", function(){
        check_create_new_folder();
    });

}
function check_folder_name(name){
    for(let i = 0 ;i < struction.fs.length;i++){
        if(struction.fs[i].father == struction.cur && struction.fs[i].type == "D" && struction.fs[i].name == name){
            return true;
        }
    }
    return false;
}
function check_create_new_folder(){
    let tar = document.getElementById("folder-name-in");
    if(tar.value == ""){
        set_messs_box("提示", "未输入文件夹名称!");
        return;
    }else if(tar.value == "请输入文件夹名"){
        set_messs_box("提示", "非法文件夹名称!");
        return;
    }else if(check_folder_name(tar.value)){
        set_messs_box("提示", "当前路径已存在该文件夹!");
        return;
    }
    struction.cnt++;
    struction.fs.push({
        id: struction.cnt,
        name: tar.value,
        type: "D",
        size: 0,
        last_date: get_this_time(),
        father: guider.cur
    });
    build_files_view();
    document.getElementById("create-new-folder-box").style.visibility = "hidden";
    document.getElementById("create-new-mask").style.visibility = "hidden";
    document.getElementById("adder").style.visibility = "hidden";
    update_user_meta();
}
function rebuild_desktop(){
    let desktop = document.getElementById("mask");
    desktop.setAttribute("id", "desktop");
    desktop.setAttribute("class", "desktop");
    desktop.appendChild(init_top_sticky());
    desktop.appendChild(init_guide_row());
    desktop.appendChild(init_left_box());
    desktop.appendChild(init_files_box());
    desktop.appendChild(init_footer());
    listener();
    init_adder();
    init_create_box();
    init_create_mask();
    document.getElementById("loader").style.visibility = "hidden";
}
function disk_init(){
    res_cancel();
    login_init();
}
function get_user_meta(){
    let res = Module.FS.readFile('./user_meta.dat');
    let ec = new TextDecoder();
    struction = JSON.parse(ec.decode(res));
    guider.cur = 0;
    guider.super = -1;
    capacity_option.title.subtext = "已用容量" + convert_unit(struction.size);
    capacity_option.series[0].data = [{ value: struction.size, name: '根目录' }]
    console.log(struction, struction.size);
    build_files_view();
}
function process_data(file){
    return new Promise( (resolve) => {
        file = file_container.files[file];
        let filecache_path = "source-" +  file.name + ".dat";
        let freader = new FileReader();
        freader.readAsArrayBuffer(file);
        freader.onload = function (){
            console.log(freader.result);
            Module.FS.writeFile(filecache_path, new Uint8Array(freader.result));
            var nums = pre_init(filecache_path, 10);
            let node = get_node();
            let mask = buf2hex(Module.FS.readFile('metafile.dat')).toUpperCase();
            block_upload("/cache/cache_" + 0, node, mask);
            getnext_Beginner(1, nums, node, mask, false).then( () => {
                resolve(node);
            })
        };
    })
}
function process_tran_data(file){
    return new Promise( (resolve) => {
        file = trans_list.items[file].getAsFile();
        let filecache_path = "source-" +  file.name + ".dat";
        let freader = new FileReader();
        freader.readAsArrayBuffer(file);
        freader.onload = function (){
            console.log(freader.result);
            Module.FS.writeFile(filecache_path, new Uint8Array(freader.result));
            var nums = pre_init(filecache_path, 10);
            let node = get_node();
            let mask = buf2hex(Module.FS.readFile('metafile.dat')).toUpperCase();
            block_upload("/cache/cache_" + 0, node, mask);
            getnext_Beginner(1, nums, node, mask, false).then( () => {
                resolve(node);
            })
        };
    })
}
function accumulate_size(id, size){
    let dirs = get_grandpas(id);
    console.log(dirs);
    for(let i = 0;i<struction.fs.length;i++){
        for(let j = 0;j<dirs.length;j++){
            if(dirs[j].id == struction.fs[i].id && struction.fs[i].type == "D"){
                struction.fs[i].size += size;
            }
        }
    }
}
async function pre_upload(uname, pwd){
    if(file_container.files.length == 0 && trans_list.items.length == 0){
        set_messs_box("错误", "未选择任何文件")
        return
    }
    let sum = file_container.files.length + trans_list.items.length;
    let cnt = 0;
    document.getElementById("loader-inf").innerText = "请勿刷新！正在上传数据... ...";
    document.getElementById("loader").style.visibility = "visible";
    for(let i = 0; i < file_container.files.length; i++, cnt++){
        let file_inf = file_container.files[i];
        if(check_cur(file_inf.name)){
            continue;
        }
        document.getElementById("loader-inf").innerText = "请勿刷新！正在上传数据... ...\n已完成" + (100 * (i/sum)).toFixed(2) + "%, 请稍候... ...";
        let first_loc = await process_data(i);
        struction.cnt++;
        struction.size += file_inf.size;
        let mask = buf2hex(Module.FS.readFile('metafile.dat')).toUpperCase();
        let ptrs = get_pointer_domain("/cache/cache_0", mask);
        struction.fs.push({
            id: struction.cnt,
            name: file_inf.name,
            type: "F",
            hash: sm3_file("source-" +  file_inf.name + ".dat"),
            first: ptrs.cur,
            mask: mask,
            size: file_inf.size,
            last_date: get_this_time(),
            father: guider.cur,
            header_loc: first_loc,
        })
        accumulate_size(struction.cnt, file_inf.size);
    }

    for(let i = 0; i < trans_list.files.length; i++, cnt++){
        let file_inf = trans_list.files[i];
        if(check_cur(file_inf.name)){
            continue;
        }
        document.getElementById("loader-inf").innerText = "请勿刷新！正在上传数据... ...\n已完成" + (100 * (cnt/sum)).toFixed(2) + "%, 请稍候... ...";
        let first_loc = await process_tran_data(i);
        struction.cnt++;
        struction.size += file_inf.size;
        let mask = buf2hex(Module.FS.readFile('metafile.dat')).toUpperCase();
        let ptrs = get_pointer_domain("/cache/cache_0", mask);
        struction.fs.push({
            id: struction.cnt,
            name: file_inf.name,
            type: "F",
            hash: sm3_file("source-" +  file_inf.name + ".dat"),
            first: ptrs.cur,
            mask: mask,
            size: file_inf.size,
            last_date: get_this_time(),
            father: guider.cur,
            header_loc: first_loc,
        })
        accumulate_size(struction.cnt, file_inf.size);
    }
    build_files_view();
    file_container.value = '';
    getin_list = [];
    trans_list = new DataTransfer();
    clear_children("log-file-area");
    document.getElementById("loader").style.visibility = "hidden";
    document.getElementById("create-new-mask").style.visibility = "hidden";
    update_user_meta();
}
function login_init(){
    clear_children("mask");
    rebuild_desktop();
    enforce_close();
    capacity_chart = echarts.init(document.getElementById('capacity_chart'));
    get_user_meta();
}
function switch_icon(){
    let icon = document.getElementById("icon-mode");
    let list = document.getElementById("list-mode");
    if(icon.getAttribute("class") == "show-type selected"){
        icon.setAttribute("class", "show-type");
        list.setAttribute("class", "show-type selected");
        $("#icon-mode").click(function (){switch_icon();});
        $("#list-mode").unbind();
    }else{
        list.setAttribute("class", "show-type");
        icon.setAttribute("class", "show-type selected");
        $("#icon-mode").unbind();
        $("#list-mode").click(function (){switch_icon();});
    }
}
function create_search_header(){
    let outer = create_div("", "results-header");
    let temp = create_div("", "header-td");
    temp.innerText = "名称";
    outer.appendChild(temp);
    temp = create_div("", "header-td op-td");
    temp.innerText = "修改时间";
    outer.appendChild(temp);
    temp = create_div("", "header-td op-td");
    temp.innerText = "大小";
    outer.appendChild(temp);
    temp = create_div("", "header-td op-td");
    temp.innerText = "操作";
    outer.appendChild(temp);
    return outer
}
function recover_dialog(){
    let temp = create_text("inf", "", "");
    temp.innerText = "some inf"
    document.getElementById("mess-content").appendChild(temp);
    temp = create_div("mess-comfirm", "mess-bt");
    temp.innerText = "确认";
    document.getElementById("mess-button").appendChild(temp);
}
function enforce_close(){
    document.getElementById("dialog").style.visibility = "hidden";
}
function close_search(){
    clear_children("mess-content");
    clear_children("mess-button");
    recover_dialog();
    switch_dialog();
    enforce_close();
}
function search_box(){
    document.getElementById("mess-title").innerText = add_spaces("搜索文件");
    clear_children("mess-content");

    let box = document.getElementById("mess-content");
    let outer = create_div("", "search-box");
    let temp = create_div("", "search-panel");
    let cache = create_text("", "", "请输入文件名: ");
    temp.appendChild(cache);
    cache = create_button("search-input", "search-input", "", "text");
    temp.appendChild(cache);
    cache = document.createElement("i");
    cache.setAttribute("class", "fa fa-search sbt");
    //cache.setAttribute("aria-hidden", "true");
    temp.appendChild(cache);
    outer.appendChild(temp);
    temp = create_div("", "search-results");
    temp.appendChild(create_search_header());
    cache = create_div("", "results-items style-1");
    temp.appendChild(cache);
    outer.appendChild(temp);
    box.appendChild(outer);


    document.getElementById("mess-comfirm").innerText = "关闭";
    document.getElementById("mess-comfirm").addEventListener("click", close_search);

    switch_dialog();
}
function drawawesome(class_name, arir){
    let outer = document.createElement("i");
    outer.setAttribute("class", class_name);
    //outer.setAttribute("aria-hidden", aria);
    return outer;
}
function draw_file_icon(type, name, size, date){
    let outer = create_div("", "item");
    let temp;
    if(type){
        temp = create_div("", "icon-folder");
    }else{
        temp = create_div("", "icon-file");
    }
    temp.appendChild(drawawesome("fa fa-folder-open", "true"));
    outer.appendChild(temp);
    temp = create_div("", "name");
    temp.innerText = name;
    outer.appendChild(temp);
    temp = create_div("", "date");
    temp.innerText = date;
    outer.appendChild(temp);
    temp = create_div("", "size");
    temp.innerText = size;
    outer.appendChild(temp);
    return outer;
}
class recovery{
    constructor(header, mask, flag=false, defilename="./user_meta.dat") {
        this.files = Module.FS.readdir("/downloads");
        this.nums = this.files.length - 2;
        this.flag = flag;
        this.defile = defilename;
        this.downdir = "/downloads/";
        this.prefix = this.downdir + "down_";
        this.header = header;
        this.mask = mask;
        this.blocks = {}
        this.chian = []
        this.offset = null;
        this.key = new Uint8Array(32);
    }

    chain_inf(){
        console.log(this.files, this.nums)
        for(let i = 0;i<this.nums+2;i++){
            console.log("blocks i ", i);
            if(this.files[i] != "." && this.files[i] != ".."){
                console.log("blocks for in i ", i);
                let temp = get_pointer_domain(this.downdir + this.files[i], this.mask);
                this.blocks[temp.cur] = temp;
                console.log("blocks temp:", temp)
            }
        }
    }

    construct_chain(){
        let flag = true;
        let name = this.header;
        let cnt = 0;
        while(flag){
            this.chian.push(name);
            console.log(this.blocks, name)
            name = this.blocks[name].next;
            if(name == this.header){
                flag = false;
            }
            cnt++;
            if(cnt > this.nums){
                return false;
            }
        }
        if(this.flag){this.chian.shift();}
    }

    get_key(){
        var FStreams = [];
        for(let i = 0;i<this.chian.length;i++){
            let path = this.prefix + this.chian[i] +".dat";
            var temp = Module.FS.open(path, "r");
            console.log("open :", temp, path);
            FStreams.push(temp);
        }
        let cnt = -1;
        /*if(this.flag){
            Module.FS.close(FStreams[0]);
            FStreams.shift();
        }*/
        this.offset = new Array(this.chian.length);
        for(let i = 0;i<this.chian.length;i++){this.offset[i]=0;}
        for(let i = 0;i<32;i++){
            let modv = i % this.chian.length;
            if(modv==0 && 32 / this.chian.length > modv){
                cnt += 1;
            }
            let buf = new Uint8Array(1);
            console.log("get key:", FStreams[modv], buf, 0, 1, modv, cnt, 96+cnt)
            Module.FS.read(FStreams[modv], buf, 0, 1, 96+cnt);
            this.offset[modv] += 1;
            this.key[i] = buf;
        }
        for(let i = 0;i<this.chian.length;i++){Module.FS.close(FStreams[i]);}
    }

    generate(){
        let cf = Module.FS.open('./download.dat', "w+");
        Module.FS.close(cf);
        cf = Module.FS.open('./download.dat', "a+");
        for(let i = 0;i<this.chian.length;i++){
            let path = this.prefix + this.chian[i] +".dat";
            let temp = Module.FS.open(path, "r");
            let readsize = Module.FS.stat(path).size - 96 - this.offset[i];
            let buf = new Uint8Array(readsize);
            console.log(path, "readsize:", readsize, "off:", 96 + this.offset[i]);
            Module.FS.read(temp, buf, 0, readsize, 96 + this.offset[i]);
            Module.FS.write(cf, buf, 0, readsize);
            Module.FS.close(temp);
            //remove(path);
        }
        Module.FS.close(cf);
    }

    decrypt(){
        Module.FS.writeFile('key.temp', this.key, {encoding: "binary"});
        decrypt_file('./download.dat', this.defile, "./key.temp");
    }
    show_file(){
        let res = Module.FS.readFile(this.defile);
        let ec = new TextDecoder();
        res = ec.decode(res);
        console.log("de-res", res);
    }

    start(){
        this.chain_inf();
        if(this.construct_chain()){return false;}
        this.get_key();
        console.log("key:", this.key, buf2hex(this.key));
        this.generate();
        this.decrypt();
        this.show_file();
        return true;
    }
}
function convert_unit(size){
    if(size == 0){
        return "0B"
    }
    let base = 1024;
    let unit = ['B','KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let i = Math.floor(Math.log(size) / Math.log(base));
    return (size / Math.pow(base, i)).toPrecision(3) + unit[i];
}
function check_in(file){
    for(let i = 0;i < getin_list.length; i++){
        let temp = getin_list[i];
        if(temp == file.name) return true;
    }
    return check_cur(file);
}
function check_cur(file){
    for(let i = 0;i < struction.fs.length; i++){
        let temp = struction.fs[i];
        if(temp.type == "F" && guider.cur == temp.father && temp.name == file.name) return true;
    }
    return false
}
function add_file_item(){
    for(let i = 0; i < file_container.files.length; i++){
        let file = file_container.files[i];
        if(check_in(file)){
            continue;
        }
        getin_list.push(file.name);
        let outer = create_div(file.lastModified + "-" + file.name, "item");
        let temp = document.createElement("span");
        temp.innerText = file.name;
        outer.appendChild(temp);
        temp = create_div("trash-" + file.lastModified + "-" + file.name, "trash");
        temp.innerHTML = "<i class=\"fa fa-trash-o\"></i>"
        outer.appendChild(temp);
        document.getElementById("log-file-area").appendChild(outer);
    }
}
function addfile2con(file){
    trans_list.items.add(file);
}
function dropevents(e){
    e.preventDefault();
    if(e.type == "drop"){
        console.log("drop");
        for (let file of e.dataTransfer.files) {
            console.log(file)
            if(check_in(file)){
                continue;
            }
            addfile2con(file);
            getin_list.push(file.name);
            let outer = create_div(file.lastModified + "-" + file.name, "item");
            let temp = document.createElement("span");
            temp.innerText = file.name;
            outer.appendChild(temp);
            temp = create_div("trash-" + file.lastModified + "-" + file.name, "trash");
            temp.innerHTML = "<i class=\"fa fa-trash-o\"></i>"
            outer.appendChild(temp);
            document.getElementById("log-file-area").appendChild(outer);
        }

        dropzone.style.background = "#f5f5dc00";
    }else if(e.type == "dragenter"){
        console.log("dragenter");
        dropzone.style.background = "rgba(255,255,255,0.5)";
    }else if(e.type == "dragover"){
        console.log("dragover");
        dropzone.style.background = "rgba(255,255,255,0.5)";
    }else if(e.type == "dragleave"){
        console.log("dragleave");
        dropzone.style.background = "#f5f5dc00";
    }else if(e.type == "click"){
        console.log("click");
        file_container.click();
    }else if(e.type == "mouseover"){
        console.log("over");
        dropzone.style.background = "rgba(255,255,255,0.5)";
    }else if(e.type == "mouseout"){
        console.log("out");
        dropzone.style.background = "#f5f5dc00";
    }
}
function loadfiles(e) {
    e.preventDefault();
    if(e.type == "change"){
        add_file_item();
    }
}
function big_date(date){
    let pos = date.indexOf(" ");
    return date.substring(0, pos);
}
function reduced_name(name){
    if(name.length <= 17) return name;
    return name.substring(0, 20) + "...";
}
function get_grandpas(id){
    let dirs = []
    while(id != 0){
        for(let i = 0;i<struction.fs.length;i++){
            if(struction.fs[i].id == id){
                dirs.push({id: struction.fs[i].id, name: struction.fs[i].name});
                id = struction.fs[i].father;
            }
        }
    }
    dirs.push({id: 0, name: "根目录"})
    return dirs.reverse();
}
function bar_events(e){
    e.preventDefault();
    if(e.type == "click"){
        open_folder(this.id.substring(4));
    }
}
function redraw_bars(id){
    clear_children("guide-row");
    let dirs = get_grandpas(id);
    let tar = document.getElementById("guide-row");
    let temp = create_div("", "gap");
    temp.innerHTML = "&emsp;";
    tar.appendChild(temp);
    for(let i = 0;i<dirs.length;i++){
        temp = create_text("bar-" + dirs[i].id, "guide-item clickable", dirs[i].name);
        temp.addEventListener("click", bar_events);
        tar.appendChild(temp);
        tar.appendChild(gap_bar());
    }
}
function open_folder(id){
    guider.super = guider.cur;
    guider.cur = id;
    redraw_bars(id);
    build_files_view();
}
function folder_events(e){
    e.preventDefault();
    if(e.type == "click"){
        open_folder(this.id.substring(5));
    }
}
function file_events(e){
    e.preventDefault();
    if(e.type == "click"){
        let file_inf = null;
        for(let i = 0;i < struction.fs.length ; i++){
            if(struction.fs[i].id == this.id.substring(5)){
                file_inf = struction.fs[i];
                break;
            }
        }
        if(file_inf!=null){
            file_download(file_inf);
        }else{
            set_messs_box("错误!", "Meta映射出错!");
        }
    }
}
function draw_folder(item){
    let outer = create_div("item-" + item.id, "item");
    let temp = create_div("", "icon-folder");
    temp.innerHTML = "<i class=\"fa fa-folder-open\" aria-hidden=\"true\"></i>";
    outer.appendChild(temp);
    temp = create_div("", "name");
    temp.innerText = reduced_name(item.name);
    outer.appendChild(temp);
    temp = create_div("", "date");
    temp.innerText = big_date(item.last_date);
    outer.appendChild(temp);
    temp = create_div("", "size");
    temp.innerText = convert_unit(item.size);
    outer.appendChild(temp);
    outer.addEventListener("click", folder_events);
    return outer;
}
function draw_file(item){
    let outer = create_div("item-" + item.id, "item");
    let temp = create_div("", "icon-file");
    let cache = create_div("", "document");
    cache.innerHTML = "<i class=\"fa fa-file-text\" aria-hidden=\"true\"></i>";
    temp.appendChild(cache);
    cache = create_div("", "lock");
    cache.innerHTML = "<i class=\"fa fa-lock\" aria-hidden=\"true\"></i>";
    temp.appendChild(cache);
    outer.appendChild(temp);
    temp = create_div("", "name");
    temp.innerText = reduced_name(item.name);
    outer.appendChild(temp);
    temp = create_div("", "date");
    temp.innerText = big_date(item.last_date);
    outer.appendChild(temp);
    temp = create_div("", "size");
    temp.innerText = convert_unit(item.size);
    outer.appendChild(temp);
    outer.addEventListener("click", file_events);
    return outer;
}
function draw_create(){
    let cache = create_div("create", "item create");
    cache.innerHTML = "<i class=\"fa fa-plus-square-o\" aria-hidden=\"true\"></i>";
    return cache;
}
function redraw_chart(){
    let sum = 0;
    capacity_option.series[0].data = [];
    for(let i = 0;i<struction.fs.length;i++){
        if(struction.fs[i].father == guider.cur){
            sum += struction.fs[i].size;
            capacity_option.series[0].data.push({value: struction.fs[i].size, name: struction.fs[i].name});
        }
    }
    capacity_option.title.subtext = "已用容量" + convert_unit(sum);
    capacity_chart.setOption(capacity_option);
}
function build_files_view(){
    let outer = document.getElementById("show-files");
    clear_children("show-files");
    for(let i = 0;i<struction.fs.length;i++){
        if(struction.fs[i].father == guider.cur && struction.fs[i].type == "D"){
            outer.appendChild(draw_folder(struction.fs[i]));
        }
    }
    for(let i = 0;i<struction.fs.length;i++){
        if(struction.fs[i].father == guider.cur && struction.fs[i].type == "F"){
            outer.appendChild(draw_file(struction.fs[i]));
        }
    }
    outer.appendChild(draw_create());
    document.getElementById("create").addEventListener("click", function (){
        document.getElementById("adder").style.visibility = "visible";
    })
    redraw_chart();
}
function clear_caches(){
    let files = Module.FS.readdir('/cache');
    for(let i = 0;i<files.length;i++){
        if (files[i] != "." && files[i] != ".."){
            remove("/cache/"+files[i]);
        }
    }
}
function regenerate_user_meta(){
    return new Promise((resolve) => {
        let data_domain = JSON.stringify(struction);
        let ec = new TextEncoder();
        data_domain = ec.encode(data_domain);
        clear_caches();
        Module.FS.writeFile("source.dat", data_domain);
        var nums = pre_init_res("source.dat", 2, user_mask, struction.username);
        let node = get_node();
        block_upload("/cache/cache_" + 0, node, user_mask);
        getnext_Beginner(1, nums, node, user_mask, false).then(() => {
            resolve();
        })
    })
}
function delete_block(hash, mask, loc, close_flag=false){
    return new Promise(resolve => {
        let url = "http://" + loc + "/deleteblock/";
        get_check_token(url, "").then(function (check_token) {
            $.ajax({
                url: url,
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                data: {
                    "data": JSON.stringify({"code": 0, "block": hash, "execution": sm3(mask+hash)}),
                    "csrfmiddlewaretoken": check_token,
                },
                success: async function (res) {
                    console.log(res);
                    console.log(mask+hash, sm3(mask+hash));
                    res = JSON.parse(res);
                    if(res.code == 0){
                        add_runinf("数据块" + hash + "删除成功!");
                        if(close_flag){
                            document.getElementById("loader-inf").innerText = "正在重载用户Meta... ...";
                            //await regenerate_user_meta();
                        }
                    }else{
                        set_messs_box("错误", "数据块" + hash + "删除失败!");
                    }
                    resolve();
                }
            });
        });
    })
}
function transe_remove(hash, mask){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/checkblock/",
            type: "POST",
            data: {
                "data": JSON.stringify({"block": hash, "code": 1}),
                "csrfmiddlewaretoken": document.getElementsByName("csrfmiddlewaretoken")[0].value,
            },
            success: function (res){
                res = JSON.parse(res);
                console.log(res);
                if(res.code == 0){
                    document.getElementById("loader").style.visibility = "hidden";
                    set_messs_box("错误", "用户Meta不存在!更新失败!");
                    reject();
                }else if(res.code == 1){
                    delete_block(hash, mask, res.loc).then(() => {
                        resolve();
                    })
                }
            }
        })
    })
}
async function traver_remove(mask){
    let files = Module.FS.readdir("/downloads");
    for(let i = 0;i<files.length;i++){
        if(files[i] != ".." && files[i] != "."){
            let hash = files[i].substring(5, 69);
            await transe_remove(hash, mask);
        }
    }
    document.getElementById("loader-inf").innerText = "正在重载用户Meta... ...";
    regenerate_user_meta().then(() =>{
        document.getElementById("loader").style.visibility = "hidden";
    })
}
function update_user_meta(){
    document.getElementById("loader").style.visibility = "visible";
    document.getElementById("loader-inf").innerText = "正在更新用户Meta... ...";
    $.ajax({
        url: "/checkblock/",
        type: "POST",
        data: {
            "data": JSON.stringify({"block": sm3(struction.username), "code": 1}),
            "csrfmiddlewaretoken": document.getElementsByName("csrfmiddlewaretoken")[0].value,
        },
        success: function (res){
            res = JSON.parse(res);
            console.log(res);
            if(res.code == 0){
                document.getElementById("loader").style.visibility = "hidden";
                set_messs_box("错误", "用户Meta不存在!更新失败!");
            }else if(res.code == 1){
                dire_times = 0;
                get_chain(sm3(struction.username), res.loc, user_mask, "download");
            }
        }
    })
}