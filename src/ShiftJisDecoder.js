var encoding = require('./encoding');
var inRange = require('./inRange');
var eof = require('./eof');

var EOF_byte = eof.byte;
var EOF_code_point = eof.code_point;

var indexes = encoding.indexes;
var indexCodePointFor = encoding.indexCodePointFor;

var decoderError = require('./error').decoderError;

/**
 * @constructor
 * @param {{fatal: boolean}} options
 */
function ShiftJISDecoder(options) {
  var fatal = options.fatal;
  var /** @type {number} */ shiftjis_lead = 0x00;
  /**
   * @param {ByteInputStream} byte_pointer The byte stream to decode.
   * @return {?number} The next code point decoded, or null if not enough
   *     data exists in the input stream to decode a complete code point.
   */
  this.decode = function(byte_pointer) {
    var bite = byte_pointer.get();
    if (bite === EOF_byte && shiftjis_lead === 0x00) {
      return EOF_code_point;
    }
    if (bite === EOF_byte && shiftjis_lead !== 0x00) {
      shiftjis_lead = 0x00;
      return decoderError(fatal);
    }
    byte_pointer.offset(1);
    if (shiftjis_lead !== 0x00) {
      var lead = shiftjis_lead;
      shiftjis_lead = 0x00;
      if (inRange(bite, 0x40, 0x7E) || inRange(bite, 0x80, 0xFC)) {
        var offset = (bite < 0x7F) ? 0x40 : 0x41;
        var lead_offset = (lead < 0xA0) ? 0x81 : 0xC1;
        var code_point = indexCodePointFor((lead - lead_offset) * 188 +
                                           bite - offset, indexes['jis0208']);
        if (code_point === null) {
          return decoderError(fatal);
        }
        return code_point;
      }
      byte_pointer.offset(-1);
      return decoderError(fatal);
    }
    if (inRange(bite, 0x00, 0x80)) {
      return bite;
    }
    if (inRange(bite, 0xA1, 0xDF)) {
      return 0xFF61 + bite - 0xA1;
    }
    if (inRange(bite, 0x81, 0x9F) || inRange(bite, 0xE0, 0xFC)) {
      shiftjis_lead = bite;
      return null;
    }
    return decoderError(fatal);
  };
}

module.exports = ShiftJISDecoder;
