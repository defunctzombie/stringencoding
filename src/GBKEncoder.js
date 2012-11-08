
/**
 * @constructor
 * @param {boolean} gb18030 True if decoding gb18030, false otherwise.
 * @param {{fatal: boolean}} options
 */
function GBKEncoder(gb18030, options) {
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
    var pointer = indexPointerFor(code_point, indexes['gbk']);
    if (pointer !== null) {
      var lead = div(pointer, 190) + 0x81;
      var trail = pointer % 190;
      var offset = trail < 0x3F ? 0x40 : 0x41;
      return output_byte_stream.emit(lead, trail + offset);
    }
    if (pointer === null && !gb18030) {
      return encoderError(code_point);
    }
    pointer = indexGB18030PointerFor(code_point);
    var byte1 = div(div(div(pointer, 10), 126), 10);
    pointer = pointer - byte1 * 10 * 126 * 10;
    var byte2 = div(div(pointer, 10), 126);
    pointer = pointer - byte2 * 10 * 126;
    var byte3 = div(pointer, 10);
    var byte4 = pointer - byte3 * 10;
    return output_byte_stream.emit(byte1 + 0x81,
                                   byte2 + 0x30,
                                   byte3 + 0x81,
                                   byte4 + 0x30);
  };
}

/**
 * @param {number} code_point The |code point| to locate in the gb18030 index.
 * @return {number} The first pointer corresponding to |code point| in the
 *     gb18030 index.
 */
function indexGB18030PointerFor(code_point) {
  var /** @type {number} */ offset = 0,
      /** @type {number} */ pointer_offset = 0,
      /** @type {Array.<Array.<number>>} */ index = indexes['gb18030'];
  var i;
  for (i = 0; i < index.length; ++i) {
    var entry = index[i];
    if (entry[1] <= code_point) {
      offset = entry[1];
      pointer_offset = entry[0];
    } else {
      break;
    }
  }
  return pointer_offset + code_point - offset;
}

module.exports = GBKEncoder;

