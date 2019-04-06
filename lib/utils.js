String.prototype.allReplace = function(replaces) {
    var retStr = this;
    return Object.keys(replaces).reduce(
        (acc, search) => acc.replace(new RegExp(search, 'g'), replaces[search]), retStr );
};

Date.prototype.toIsoString = function() {
    var tzo = -this.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function(num) {
            var norm = Math.floor(Math.abs(num));
            return (norm < 10 ? '0' : '') + norm;
        };
    return this.getFullYear() +
        '-' + pad(this.getMonth() + 1) +
        '-' + pad(this.getDate()) +
        'T' + pad(this.getHours()) +
        ':' + pad(this.getMinutes()) +
        ':' + pad(this.getSeconds()) +
        dif + pad(tzo / 60) +
        ':' + pad(tzo % 60);
};

Date.prototype.subTime= function(h,m){
    this.setHours(this.getHours()-h);
    this.setMinutes(this.getMinutes()-m);
    return this;
};

Date.prototype.addTime= function(h,m){
    this.setHours(this.getHours()+h);
    this.setMinutes(this.getMinutes()+m);
    return this;
};
