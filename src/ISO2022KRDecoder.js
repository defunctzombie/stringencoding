
  // 12.2 iso-2022-kr

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function ISO2022KRDecoder(options) {
    var fatal = options.fatal;
    /** @enum */
    var state = {
      ASCII: 0,
      escape_start: 1,
      escape_middle: 2,
      escape_end: 3,
      lead: 4,
      trail: 5
    };
    var /** @type {number} */ iso2022kr_state = state.ASCII,
        /** @type {number} */ iso2022kr_lead = 0x00;
    /**
     * @param {ByteInputStream} byte_pointer The byte stream to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      var bite = byte_pointer.get();
      if (bite !== EOF_byte) {
        byte_pointer.offset(1);
      }
      switch (iso2022kr_state) {
        default:
        case state.ASCII:
          if (bite === 0x0E) {
            iso2022kr_state = state.lead;
            return null;
          }
          if (bite === 0x0F) {
            return null;
          }
          if (bite === 0x1B) {
            iso2022kr_state = state.escape_start;
            return null;
          }
          if (inRange(bite, 0x00, 0x7F)) {
            return bite;
          }
          if (bite === EOF_byte) {
            return EOF_code_point;
          }
          return decoderError(fatal);
        case state.escape_start:
          if (bite === 0x24) {
            iso2022kr_state = state.escape_middle;
            return null;
          }
          if (bite !== EOF_byte) {
            byte_pointer.offset(-1);
          }
          iso2022kr_state = state.ASCII;
          return decoderError(fatal);
        case state.escape_middle:
          if (bite === 0x29) {
            iso2022kr_state = state.escape_end;
            return null;
          }
          if (bite === EOF_byte) {
            byte_pointer.offset(-1);
          } else {
            byte_pointer.offset(-2);
          }
          iso2022kr_state = state.ASCII;
          return decoderError(fatal);
        case state.escape_end:
          if (bite === 0x43) {
            iso2022kr_state = state.ASCII;
            return null;
          }
          if (bite === EOF_byte) {
            byte_pointer.offset(-2);
          } else {
            byte_pointer.offset(-3);
          }
          iso2022kr_state = state.ASCII;
          return decoderError(fatal);
        case state.lead:
          if (bite === 0x0A) {
            iso2022kr_state = state.ASCII;
            return decoderError(fatal, 0x000A);
          }
          if (bite === 0x0E) {
            return null;
          }
          if (bite === 0x0F) {
            iso2022kr_state = state.ASCII;
            return null;
          }
          if (bite === EOF_byte) {
            return EOF_code_point;
          }
          iso2022kr_lead = bite;
          iso2022kr_state = state.trail;
          return null;
        case state.trail:
          iso2022kr_state = state.lead;
          if (bite === EOF_byte) {
            return decoderError(fatal);
          }
          var code_point = null;
          if (inRange(iso2022kr_lead, 0x21, 0x46) &&
              inRange(bite, 0x21, 0x7E)) {
            code_point = indexCodePointFor((26 + 26 + 126) *
                (iso2022kr_lead - 1) +
                26 + 26 + bite - 1,
                indexes['euc-kr']);
          } else if (inRange(iso2022kr_lead, 0x47, 0x7E) &&
              inRange(bite, 0x21, 0x7E)) {
            code_point = indexCodePointFor((26 + 26 + 126) * (0xC7 - 0x81) +
                (iso2022kr_lead - 0x47) * 94 +
                (bite - 0x21),
                indexes['euc-kr']);
          }
          if (code_point !== null) {
            return code_point;
          }
          return decoderError(fatal);
      }
    };
  }

