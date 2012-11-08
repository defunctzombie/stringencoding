var EOF_byte = require('./eof').byte;

/**
 * @constructor
 * @param {Uint8Array} bytes Array of bytes that provide the stream.
 */
function ByteInputStream(bytes) {
  /** @type {number} */
  var pos = 0;

  /** @return {number} Get the next byte from the stream. */
  this.get = function() {
    return (pos >= bytes.length) ? EOF_byte : Number(bytes[pos]);
  };

  /** @param {number} n Number (positive or negative) by which to
   *      offset the byte pointer. */
  this.offset = function(n) {
    pos += n;
    if (pos < 0) {
      throw new Error('Seeking past start of the buffer');
    }
    if (pos > bytes.length) {
      throw new Error('Seeking past EOF');
    }
  };

  /**
   * @param {Array.<number>} test Array of bytes to compare against.
   * @return {boolean} True if the start of the stream matches the test
   *     bytes.
   */
  this.match = function(test) {
    if (test.length > pos + bytes.length) {
      return false;
    }
    var i;
    for (i = 0; i < test.length; i += 1) {
      if (Number(bytes[pos + i]) !== test[i]) {
        return false;
      }
    }
    return true;
  };
}

module.exports = ByteInputStream;

