function getFromDict(object, key, default_value) {
    var result = object[key];
    return (typeof result !== "undefined") ? result : default_value;
}

function millisecondsToDays(millis) {
    return Math.round(millis / (3600 * 24 * 1000))
}

export {getFromDict, millisecondsToDays}