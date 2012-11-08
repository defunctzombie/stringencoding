
/**
 * @constructor
 * @param {boolean} gb18030 True if decoding gb18030, false otherwise.
 * @param {{fatal: boolean}} options
 */
function GBKDecoder(gb18030, options) {
  var fatal = options.fatal;
  var /** @type {number} */ gbk_first = 0x00,
      /** @type {number} */ gbk_second = 0x00,
      /** @type {number} */ gbk_third = 0x00;
  /**
   * @param {ByteInputStream} byte_pointer The byte stream to decode.
   * @return {?number} The next code point decoded, or null if not enough
   *     data exists in the input stream to decode a complete code point.
   */
  this.decode = function(byte_pointer) {
    var bite = byte_pointer.get();
    if (bite === EOF_byte && gbk_first === 0x00 &&
        gbk_second === 0x00 && gbk_third === 0x00) {
      return EOF_code_point;
    }
    if (bite === EOF_byte &&
        (gbk_first !== 0x00 || gbk_second !== 0x00 || gbk_third !== 0x00)) {
      gbk_first = 0x00;
      gbk_second = 0x00;
      gbk_third = 0x00;
      decoderError(fatal);
    }
    byte_pointer.offset(1);
    var code_point;
    if (gbk_third !== 0x00) {
      code_point = null;
      if (inRange(bite, 0x30, 0x39)) {
        code_point = indexGB18030CodePointFor(
            (((gbk_first - 0x81) * 10 + (gbk_second - 0x30)) * 126 +
             (gbk_third - 0x81)) * 10 + bite - 0x30);
      }
      gbk_first = 0x00;
      gbk_second = 0x00;
      gbk_third = 0x00;
      if (code_point === null) {
        byte_pointer.offset(-3);
        return decoderError(fatal);
      }
      return code_point;
    }
    if (gbk_second !== 0x00) {
      if (inRange(bite, 0x81, 0xFE)) {
        gbk_third = bite;
        return null;
      }
      byte_pointer.offset(-2);
      gbk_first = 0x00;
      gbk_second = 0x00;
      return decoderError(fatal);
    }
    if (gbk_first !== 0x00) {
      if (inRange(bite, 0x30, 0x39) && gb18030) {
        gbk_second = bite;
        return null;
      }
      var lead = gbk_first;
      var pointer = null;
      gbk_first = 0x00;
      var offset = bite < 0x7F ? 0x40 : 0x41;
      if (inRange(bite, 0x40, 0x7E) || inRange(bite, 0x80, 0xFE)) {
        pointer = (lead - 0x81) * 190 + (bite - offset);
      }
      code_point = pointer === null ? null :
          indexCodePointFor(pointer, indexes['gbk']);
      if (pointer === null) {
        byte_pointer.offset(-1);
      }
      if (code_point === null) {
        return decoderError(fatal);
      }
      return code_point;
    }
    if (inRange(bite, 0x00, 0x7F)) {
      return bite;
    }
    if (bite === 0x80) {
      return 0x20AC;
    }
    if (inRange(bite, 0x81, 0xFE)) {
      gbk_first = bite;
      return null;
    }
    return decoderError(fatal);
  };
}

/**
 * @param {number} pointer The |pointer| to search for in the gb18030 index.
 * @return {?number} The code point corresponding to |pointer| in |index|,
 *     or null if |code point| is not in the gb18030 index.
 */
function indexGB18030CodePointFor(pointer) {
  if ((pointer > 39419 && pointer < 189000) || (pointer > 1237575)) {
    return null;
  }
  var /** @type {number} */ offset = 0,
      /** @type {number} */ code_point_offset = 0,
      /** @type {Array.<Array.<number>>} */ index = indexes['gb18030'];
  var i;
  for (i = 0; i < index.length; ++i) {
    var entry = index[i];
    if (entry[0] <= pointer) {
      offset = entry[0];
      code_point_offset = entry[1];
    } else {
      break;
    }
  }
  return code_point_offset + pointer - offset;
}

module.exports = GBKDecoder;

