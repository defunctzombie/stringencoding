var inRange = require('./inRange');
var eof = require('./eof');

var EOF_byte = eof.byte;
var EOF_code_point = eof.code_point;

/**
 * @constructor
 * @param {{fatal: boolean}} options
 */
function ShiftJISEncoder(options) {
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
    if (inRange(code_point, 0x0000, 0x0080)) {
      return output_byte_stream.emit(code_point);
    }
    if (code_point === 0x00A5) {
      return output_byte_stream.emit(0x5C);
    }
    if (code_point === 0x203E) {
      return output_byte_stream.emit(0x7E);
    }
    if (inRange(code_point, 0xFF61, 0xFF9F)) {
      return output_byte_stream.emit(code_point - 0xFF61 + 0xA1);
    }
    var pointer = indexPointerFor(code_point, indexes['jis0208']);
    if (pointer === null) {
      return encoderError(code_point);
    }
    var lead = div(pointer, 188);
    var lead_offset = lead < 0x1F ? 0x81 : 0xC1;
    var trail = pointer % 188;
    var offset = trail < 0x3F ? 0x40 : 0x41;
    return output_byte_stream.emit(lead + lead_offset, trail + offset);
  };
}

module.exports = ShiftJISEncoder;

