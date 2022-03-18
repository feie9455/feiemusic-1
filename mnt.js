//This module is used to access local music files 
//using FileAccess API and return a array including objects
//By feie9454 2022/2/17


"use strict"
async function mntdir() {
  var musicfilelist = []
  try {
    const dirHandle = await window.showDirectoryPicker();
    for await (const entry of dirHandle.values()) {
      if (entry.kind == "file") {
        if (validationEnd(entry.name, ".mp3") || validationEnd(entry.name, ".aac") || validationEnd(entry.name, ".ogg") || validationEnd(entry.name, ".flac")) {
          let music = new Fmusic(entry.name, entry, "music")
          //let music = new Object()
          //music.name = entry.name
          //music.file = await entry.getFile()
          //music.type = "music"
          //jsmediatags.read(music.file, {
          //  onSuccess: function (tag) {
          //    music.tag = tag
          //  },
          //});
          musicfilelist.push(music)
        } else if (validationEnd(entry.name, ".lrc")) {
          //let music = new Object()
          //music.name = entry.name
          //music.file = await entry.getFile()
          //music.type = "lrc"
          let music = new Fmusic(entry.name, entry, "lrc")
          musicfilelist.push(music)

        }else if(validationEnd(entry.name, ".mp4")||validationEnd(entry.name, ".webm")){
          let music = new Fmusic(entry.name, entry, "video")
          musicfilelist.push(music)

        }
      }
    }
    return musicfilelist
  }
  catch (e) {
    console.error(e);
  }
}
