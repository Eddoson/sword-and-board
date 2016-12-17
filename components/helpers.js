//helpers for random things

exports.recursiveStringify = function recursiveStringify(obj) {
    var objKeys = Object.keys(obj);
    var keyValueArray = new Array();
    for (var i = 0; i < objKeys.length; i++) {
        var keyValueString = '"' + objKeys[i] + '":';
        var objValue = obj[objKeys[i]];
        if (typeof objValue == "string") {
            keyValueString = keyValueString + '"' + objValue + '"';
        } else {
            keyValueString = keyValueString + recursiveStringify(objValue);
        }
        keyValueArray.push(keyValueString);
    }
    return "{" + keyValueArray.join(",") + "}";
};
