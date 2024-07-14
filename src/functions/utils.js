function getFromDict(object, key, default_value) {
    var result = object[key];
    return (typeof result !== "undefined") ? result : default_value;
}

function millisecondsToDays(millis) {
    return Math.round(millis / (3600 * 24 * 1000))
}

function getSongFormat(node){
    // Get the author and song name
    // If the author or song name are not defined, set them to "undefined"
    let author;
    if (!node.author){
        author = "undefined"
    }else{

        author = node.author.replaceAll(".", "").replaceAll("/", "").replaceAll(".", "")
    }

    let songName;
    if (!node.songName){
        songName = "undefined"
    }else{
        songName = node.songName.replaceAll(".", "").replaceAll("/", "").replaceAll(".", "")
    }
    let name = songName + "-" + author
    let value = {"bucket":node.bucket, "path":node.path, "url":node.url, "author":node.author || author, "songName":node.songName || songName, "reproductions":0}
    return [name, value]
}

function shuffleArray(arr){
    let currentIndex = arr.length, randomIndex;
    while (currentIndex !== 0){
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--

        [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]]
    }
}

export {getFromDict, millisecondsToDays, getSongFormat, shuffleArray}