/**
 * @constructor
 * @param {{fatal: boolean}} options
 */
function Big5Decoder(options) {
  var fatal = options.fatal;
  var /** @type {number} */ big5_lead = 0x00,
      /** @type {?number} */ big5_pending = null;

  /**
   * @param {ByteInputStream} byte_pointer The byte steram to decode.
   * @return {?number} The next code point decoded, or null if not enough
   *     data exists in the input stream to decode a complete code point.
   */
  this.decode = function(byte_pointer) {
    // NOTE: Hack to support emitting two code points
    if (big5_pending !== null) {
      var pending = big5_pending;
      big5_pending = null;
      return pending;
    }
    var bite = byte_pointer.get();
    if (bite === EOF_byte && big5_lead === 0x00) {
      return EOF_code_point;
    }
    if (bite === EOF_byte && big5_lead !== 0x00) {
      big5_lead = 0x00;
      return decoderError(fatal);
    }
    byte_pointer.offset(1);
    if (big5_lead !== 0x00) {
      var lead = big5_lead;
      var pointer = null;
      big5_lead = 0x00;
      var offset = bite < 0x7F ? 0x40 : 0x62;
      if (inRange(bite, 0x40, 0x7E) || inRange(bite, 0xA1, 0xFE)) {
        pointer = (lead - 0x81) * 157 + (bite - offset);
      }
      if (pointer === 1133) {
        big5_pending = 0x0304;
        return 0x00CA;
      }
      if (pointer === 1135) {
        big5_pending = 0x030C;
        return 0x00CA;
      }
      if (pointer === 1164) {
        big5_pending = 0x0304;
        return 0x00EA;
      }
      if (pointer === 1166) {
        big5_pending = 0x030C;
        return 0x00EA;
      }
      var code_point = (pointer === null) ? null :
          indexCodePointFor(pointer, indexes['big5']);
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
    if (inRange(bite, 0x81, 0xFE)) {
      big5_lead = bite;
      return null;
    }
    return decoderError(fatal);
  };
}

module.exports = Big5Decoder;
