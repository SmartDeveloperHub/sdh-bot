module.exports = function(core) {

    function InvalidArgument(message) {
        this.name = 'InvalidArgument';
        this.message = message || 'Default Message';
        this.stack = (new Error()).stack;
    }
    InvalidArgument.prototype = Object.create(Error.prototype);
    InvalidArgument.prototype.constructor = InvalidArgument;

    return {
        InvalidArgument: InvalidArgument
    }

}


