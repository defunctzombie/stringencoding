
var eof = require('./eof');
var encoderError = require('./error').encoderError;

var EOF_byte = eof.byte;
var EOF_code_point = eof.code_point;

/**
 * @constructor
 * @param {Array.<?number>} index The encoding index.
 * @param {{fatal: boolean}} options
 */
function SingleByteEncoder(index, options) {
  var fatal = options.fatal;
  /**
   * @param {ByteOutputStream} output_byte_stream Output byte stream.
   * @param {CodePointInputStream} code_point_pointer Input stream.
   * @return {number} The last byte emitted.
   */
  this.encode = function(output_byte_stream, code_point_pointer) {
    var code_point = code_point_pointer.get();
    if (code_point === EOF_code_point) {
      return EOF_byte;
    }
    code_point_pointer.offset(1);
    if (inRange(code_point, 0x0000, 0x007F)) {
      return output_byte_stream.emit(code_point);
    }
    var pointer = indexPointerFor(code_point, index);
    if (pointer === null) {
      encoderError(code_point);
    }
    return output_byte_stream.emit(pointer + 0x80);
  };
}

module.exports = SingleByteEncoder;

