String.prototype.format = function() {
    let a = this;
    let b;
    for (b in arguments) {
        a = a.replace(/%[a-z]/, arguments[b]);
    }
    return a;
};