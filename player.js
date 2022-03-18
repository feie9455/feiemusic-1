//main script for feiemusic
//rebuild by feie9454 2022/2/18

"use strict"
var numOfLoadedSongs = 0
var musicObjList = []
var nowmusic = 0
var play = false
var nowplaynum = 0
var playedlist = []
var playmode = 1
var oldtime = 0
var isBlur = false
const main = document.getElementById("main")
const player = document.getElementById("player")
toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "md-toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": 300,
    "hideDuration": 1000,
    "timeOut": 5000,
    "extendedTimeOut": 1000,
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

class Fmusic {
    constructor(name, handle, type) {
        this.name = name
        this.handle = handle
        this.type = type
    }
}
localforage.getItem("bgpic").then(bgpic => { if (bgpic) { document.body.background = URL.createObjectURL(bgpic) } })

window.onload = () => {
    if (!window.showDirectoryPicker) {
        toastr["error"]("Your browser doesn't support the function we need.\nCheck if you are in HTTPS connection or upgrade your browser.")
    }
    setInterval(() => {
        refrush()
    }, 1000);
    document.getElementById("drag").addEventListener("click", () => {
        let d = new Date()
        if (d.getTime() - oldtime <= 500) {
            if (isBlur) {
                isBlur = false
                main.style.opacity = "90%"
            } else {
                isBlur = true
                main.style.opacity = "30%"
            }
            oldtime = 0
        } else {
            oldtime = d.getTime()

        }
    })
}

function refrush() {
    if (document.getElementById("player").src) {
        if (document.getElementById("player").currentTime == document.getElementById("player").duration) {
            gforward()
        }
        if (document.getElementById("player").duration) {
            document.getElementById("nowtime").innerHTML = String(Math.floor(document.getElementById("player").currentTime / 60)) + ":" + String(_padZero(Math.floor(document.getElementById("player").currentTime) % 60)) + " / " + String(Math.floor(document.getElementById("player").duration / 60)) + ":" + String(_padZero(Math.floor(document.getElementById("player").duration) % 60))
        }
        document.getElementById("len").ariaValueMax = Math.floor(document.getElementById("player").duration)
        document.getElementById("len").ariaValueNow = Math.floor(document.getElementById("player").currentTime)
        $("#len").css("width", String(Math.floor(document.getElementById("player").currentTime) / Math.floor(document.getElementById("player").duration) * 100 + "%"));
    }
}

function startstop() {
    if (play) {
        play = false
        $("#playicon").removeClass("fa-pause").addClass("fa-play")
        $("#player")[0].pause()
    } else {
        if ($("#player")[0].src) {
            $("#player")[0].play()
            $("#playicon").removeClass("fa-play").addClass("fa-pause")
            play = true
        } else { c(nowmusic) }
    }
}

function forward() {
    document.getElementById("player").currentTime = document.getElementById("player").currentTime + 15
    refrush()
}

function backward() {
    if (document.getElementById("player").currentTime >= 10) {
        document.getElementById("player").currentTime = document.getElementById("player").currentTime - 15
    } else {
        document.getElementById("player").currentTime = 0
    }
    refrush()
}

function gforward() {
    switch (playmode) {
        case 0:
            nowmusic = Math.ceil(Math.random() * musicObjList.length) - 1
            break;
        case 1:
            if (musicObjList.length - 1 >= nowmusic + 1) {
                nowmusic = nowmusic + 1
            } else {

                nowmusic = 0

            }
            break;
        case 2:
            nowmusic = nowmusic
            break;
    }
    c(nowmusic)
    nowplaynum++
}

function gbackward() {
    switch (playmode) {
        case 0:
            if (nowplaynum - 1 >= 0) {
                nowmusic = playedlist[nowplaynum - 1]
                nowplaynum--
            } else {
                nowmusic = playedlist[0]
            }
            break;
        case 1:
            if (nowmusic >= 1) {
                nowmusic = nowmusic - 1
            } else {
                nowmusic = musicObjList.length - 1
            }
            break;
        case 2:
            nowmusic = nowmusic
            break;
    }
    c(nowmusic)
}


//刷新歌曲列表
function refreshSongList() {
    for (let index = 0; index < musicObjList.length; index++) {
        if (index % 2) {
            $("#c" + index).removeClass("list-group-item list-group-item-action list-group-item-warning waves-effect").addClass("list-group-item list-group-item-action list-group-item-dark waves-effect")
        } else {
            $("#c" + index).removeClass("list-group-item list-group-item-action list-group-item-warning waves-effect").addClass("list-group-item list-group-item-action list-group-item-primary waves-effect")
        }
    }
    if (nowmusic % 2) {
        $("#c" + nowmusic).removeClass("list-group-item list-group-item-action list-group-item-dark").addClass("list-group-item list-group-item-action list-group-item-warning")
    }
    else {
        $("#c" + nowmusic).removeClass("list-group-item list-group-item-action list-group-item-primary").addClass("list-group-item list-group-item-action list-group-item-warning")
    }
}

//选择歌曲
async function c(music) {

    let element = musicObjList[music]
    if (element.type == "music") {
        play = true
        nowmusic = music
        refreshSongList()
        element.handle.getFile().then(file => {
            console.log(file);
            document.getElementById("player").src = URL.createObjectURL(file)
            $("#playicon").removeClass("fa-play").addClass("fa-pause")
            $("#player")[0].play()
            playedlist[nowplaynum] = nowmusic
            readTags(file)
                .then(tag => {
                    console.log(tag);
                    if (tag.tags.title) {
                        document.getElementById("title").innerHTML = tag.tags.title
                        document.getElementById("artist").innerHTML = tag.tags.artist
                        document.querySelector("#c" + nowmusic).scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
                        changeFavicon(tag)

                    }
                    else {
                        let arr = file.name.split(".")
                        arr.pop()
                        document.getElementById("title").innerHTML = arr.join(".")
                        document.getElementById("artist").innerHTML = "未知艺术家"
                        changeFavicon("default")
                    }
                })
                .catch(() => {
                    let arr = file.name.split(".")
                    arr.pop()
                    document.getElementById("title").innerHTML = arr.join(".")
                    document.getElementById("artist").innerHTML = "未知艺术家"
                    changeFavicon("default")
                })
        })

    } else if (element.type == "video") {
        play = true
        nowmusic = music
        refreshSongList()
        element.handle.getFile().then(file => {
            document.getElementById("player").src = URL.createObjectURL(file)
            $("#playicon").removeClass("fa-play").addClass("fa-pause")
            $("#player")[0].play()
            playedlist[nowplaynum] = nowmusic
            let namearr = file.name.split(".")
            namearr.pop()

            document.getElementById("title").innerHTML = namearr.join(".")
            document.getElementById("artist").innerHTML = ""

            document.querySelector("#c" + nowmusic).scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });

        })
    }


}


async function readTags(file) {
    console.log(file);
    return new Promise(function (resolve, reject) {
        jsmediatags.read(file, {
            onSuccess: function (tag) {
                resolve(tag)
            },
            onError: function () {
                console.log("Cannot read tag");
                reject("Cannot read tag")
            }
        });
    })

}

async function getFile(music) {
    return await musicObjList[music].handle.getFile()
}

//获取歌曲文件
function getMusicObj() {
    $("#loading").css("display", "inline-block")
    return new Promise(function (resolve, reject) {
        if (!window.showDirectoryPicker) {
            toastr["error"]("Your browser doesn't support the function we need.\nCheck if you are in HTTPS connection or upgrade your browser.")
            reject()
        } else {
            mntdir().then(list => {
                musicObjList = musicObjList.concat(list)
                resolve(musicObjList)
            })
        }
    })
        .then(
            list => {
                $(".list-group").remove()
                $("#mlist").append('<div class="list-group">')
                list.forEach(element => {
                    if (numOfLoadedSongs % 2) {
                        $(".list-group").append('<a href="javascript:c(' + numOfLoadedSongs + ')" class="list-group-item list-group-item-action list-group-item-dark waves-effect" id="c' + numOfLoadedSongs + '">' + element.name + '</a>')
                    } else {
                        $(".list-group").append('<a href="javascript:c(' + numOfLoadedSongs + ')" class="list-group-item list-group-item-action list-group-item-primary waves-effect" id="c' + numOfLoadedSongs + '">' + element.name + '</a>')
                    }
                    numOfLoadedSongs++
                });
                $("#int_").remove()
                $("#loading").css("display", "none")
            }
        )
        .catch(
            err => {
                $("#loading").css("display", "none")
                reject(err)
            }
        )
}

function changeplaymode() {
    switch (playmode) {
        case 2:
            playmode = 0
            $("#playmode").removeClass("fas fa-redo");
            $("#playmode").addClass("fas fa-random");
            break;
        case 0:
            playmode = 1
            $("#playmode").removeClass("fas fa-random");
            $("#playmode").addClass("fas fa-exchange-alt");
            break;
        case 1:
            playmode = 2
            $("#playmode").removeClass("fas fa-exchange-alt");
            $("#playmode").addClass("fas fa-redo");
            break;
    }
}

var drag = document.getElementById('drag');
drag.onmousedown = function (event) {
    console.log(11);
    var event = event || window.event;
    var diffX = event.clientX
    var diffY = event.clientY
    let Y0 = parseInt($("#main").css("top"))
    let X0 = parseInt($("#main").css("left"))
    function refrush(event) {
        $("#main").css("top", Y0 + event.clientY - diffY);
        $("#main").css("left", X0 + event.clientX - diffX)
    }
    if (typeof drag.setCapture !== 'undefined') {
        drag.setCapture();
    }
    document.onmousemove = function (event) {
        var event = event || window.event;
        refrush(event)
    }
    document.onmouseup = function (event) {
        this.onmousemove = null;
        this.onmouseup = null;
        if (typeof drag.releaseCapture != 'undefined') {
            drag.releaseCapture();
        }
    }
}

function bgp() {
    $("#file").trigger("click");
}

function getFilePath() {
    $("body").css("background-image", URL.createObjectURL(document.getElementById("bgfileSelector").files[0]))
    document.body.background = URL.createObjectURL(document.getElementById("bgfileSelector").files[0])
    $('#savepicConfirm').css('display', 'inline')
}

async function savepictrue() {
    let bgpic = document.getElementById("bgfileSelector").files[0]
    try {
        localforage.setItem("bgpic", bgpic);
    } catch (error) {
        alert("Picture is too large. I cannot handle it. (っ °Д °;)っ")
    }
}



//Some method

function _padZero(num) {
    let len = num.toString().length;
    while (len < 2) {
        num = "0" + num;
        len++;
    }
    return num;
}

async function changeFavicon(tags) {
    let needToAdd=false
    let $favicon = document.querySelector('link[rel="icon"]');
    if (!$favicon) { $favicon = document.createElement("link"); let needToAdd = true }
    $favicon.rel = "icon";
    if (tags === "default") {
        $favicon.href = "favicon.ico"
        if (needToAdd) { document.head.appendChild($favicon); }
    } else {
        if (tags.tags.picture) {
            let picture = tags.tags.picture;
            var base64String = "";
            for (var i = 0; i < picture.data.length; i++) {
                base64String += String.fromCharCode(picture.data[i]);
            }
            var imageUri = "data:" + picture.format + ";base64," + window.btoa(base64String);
            var img = new Image();
            img.src = imageUri
            var canvas = document.getElementById('tutorial');
            var ctx = canvas.getContext("2d");
            setTimeout(function () {
                ctx.drawImage(img, 0, 0, 64, 64)
                imageUri = canvas.toDataURL("image/jpeg", 1)
                let $favicon = document.querySelector('link[rel="icon"]');
                $favicon.href = imageUri;
                if (needToAdd) { document.head.appendChild($favicon); }
            }
                , 200);
        } else {
            $favicon.href = "favicon.ico"
            if(needToAdd){document.head.appendChild($favicon);}
        }
    }
}

function validationEnd(str, appoint) {
    str = str.toLowerCase();
    var start = str.length - appoint.length;
    var char = str.substr(start, appoint.length);
    if (char == appoint) {
        return true;
    }
    return false;
}

window.onerror = err => {
    toastr["error"](err)

}

window.onkeydown = event => {
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if (e.keyCode == 40 & e.ctrlKey) {
        if (player.volume >= 0.1) {
            player.volume -= 0.1
        } else {
            player.volume = 0
        }
        toastr["success"](`Volum has been decreased by 10%, now it is ${~~(player.volume * 100)}%`)
    }
    if (e.keyCode == 38 & e.ctrlKey) {
        if (player.volume <= 0.9) {
            player.volume += 0.1
        } else {
            player.volume = 1.0
        }
        toastr["success"](`Volum has been increased by 10%, now it is ${~~(player.volume * 100)}%`)
    }
}