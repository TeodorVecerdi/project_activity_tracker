String.prototype.format = function () {
    let a = this;
    let b;
    for (b in arguments) {
        a = a.replace(/%[a-z]/, arguments[b]);
    }
    return a;
};

function pad(string, size, padChar = '0') {
    let padded = string;
    while (padded.length < size) padded = `0${padded}`;
    return padded;
}

function zeroPad(n) {
    return pad(n.toString(), 2);
}

function formatDate(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let timezone = date.toTimeString().split(' ')[1].slice(0, 6);
    return `${zeroPad(day)}/${zeroPad(month)}/${zeroPad(year)} ${zeroPad(hours)}:${zeroPad(minutes)}:${zeroPad(seconds)} ${timezone}`;
}

function millisToDuration(ms) {
    let seconds = Math.floor((ms / 1000) % 60);
    if(seconds < 0) seconds = 0;
    let minutes = Math.floor((ms / 1000 / 60) % 60);
    if(minutes < 0) minutes = 0;
    let hours = Math.floor(ms / 1000 / 60 / 60);
    if(hours < 0) hours = 0;
    return `${pad(hours.toString(), 2)}:${pad(minutes.toString(), 2)}:${pad(seconds.toString(), 2)}`
}

function uuid4(pattern) {
    let array = new Uint8Array(16)
    crypto.getRandomValues(array)

    // manipulate 9th byte
    array[8] &= 0b00111111 // clear first two bits
    array[8] |= 0b10000000 // set first two bits to 10

    // manipulate 7th byte
    array[6] &= 0b00001111 // clear first four bits
    array[6] |= 0b01000000 // set first four bits to 0100

    pattern = pattern || "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX";
    let idx = 0;

    return pattern.replace(
        /XX/g,
        () => array[idx++].toString(16).padStart(2, "0"), // padStart ensures leading zero, if needed
    )
}

function htmlEncode(s) {
    return s
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}