String.prototype.format = function() {
    let a = this;
    let b;
    for (b in arguments) {
        a = a.replace(/%[a-z]/, arguments[b]);
    }
    return a;
};

function zeroPad(n) {
    return `${n < 10 ? "0":""}${n}`;
}

function formatDate(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let timezone = date.toTimeString().split(' ')[1].slice(0,6);
    return `${zeroPad(day)}/${zeroPad(month)}/${zeroPad(year)} ${zeroPad(hours)}:${zeroPad(minutes)}:${zeroPad(seconds)} ${timezone}`;
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
    let idx = 0

    return pattern.replace(
        /XX/g,
        () => array[idx++].toString(16).padStart(2, "0"), // padStart ensures leading zero, if needed
    )
}