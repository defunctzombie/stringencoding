
  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function ISO2022KREncoder(options) {
    var fatal = options.fatal;
    /** @enum */
    var state = {
      ASCII: 0,
      lead: 1
    };
    var /** @type {boolean} */ iso2022kr_initialization = false,
        /** @type {number} */ iso2022kr_state = state.ASCII;
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
      if (!iso2022kr_initialization) {
        iso2022kr_initialization = true;
        output_byte_stream.emit(0x1B, 0x24, 0x29, 0x43);
      }
      code_point_pointer.offset(1);
      if (inRange(code_point, 0x0000, 0x007F) &&
          iso2022kr_state !== state.ASCII) {
        code_point_pointer.offset(-1);
        iso2022kr_state = state.ASCII;
        return output_byte_stream.emit(0x0F);
      }
      if (inRange(code_point, 0x0000, 0x007F)) {
        return output_byte_stream.emit(code_point);
      }
      if (iso2022kr_state !== state.lead) {
        code_point_pointer.offset(-1);
        iso2022kr_state = state.lead;
        return output_byte_stream.emit(0x0E);
      }
      var pointer = indexPointerFor(code_point, indexes['euc-kr']);
      if (pointer === null) {
        return encoderError(code_point);
      }
      var lead, trail;
      if (pointer < (26 + 26 + 126) * (0xC7 - 0x81)) {
        lead = div(pointer, (26 + 26 + 126)) + 1;
        trail = pointer % (26 + 26 + 126) - 26 - 26 + 1;
        if (!inRange(lead, 0x21, 0x46) || !inRange(trail, 0x21, 0x7E)) {
          return encoderError(code_point);
        }
        return output_byte_stream.emit(lead, trail);
      }
      pointer = pointer - (26 + 26 + 126) * (0xC7 - 0x81);
      lead = div(pointer, 94) + 0x47;
      trail = pointer % 94 + 0x21;
      if (!inRange(lead, 0x47, 0x7E) || !inRange(trail, 0x21, 0x7E)) {
        return encoderError(code_point);
      }
      return output_byte_stream.emit(lead, trail);
    };
  }

