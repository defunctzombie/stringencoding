
var SingleByteDecoder = require('./SingleByteDecoder');

/** @type {Object.<string, (Array.<number>|Array.<Array.<number>>)>} */
var indexes = global['encoding-indexes'] || {};

/**
 * @param {number} pointer The |pointer| to search for.
 * @param {Array.<?number>} index The |index| to search within.
 * @return {?number} The code point corresponding to |pointer| in |index|,
 *     or null if |code point| is not in |index|.
 */
function indexCodePointFor(pointer, index) {
  return (index || [])[pointer] || null;
}

/**
 * @param {number} code_point The |code point| to search for.
 * @param {Array.<?number>} index The |index| to search within.
 * @return {?number} The first pointer corresponding to |code point| in
 *     |index|, or null if |code point| is not in |index|.
 */
function indexPointerFor(code_point, index) {
  var pointer = index.indexOf(code_point);
  return pointer === -1 ? null : pointer;
}

module.exports.indexes = indexes;
module.exports.indexCodePointFor = indexCodePointFor;
module.exports.indexPointerFor = indexPointerFor;

var encodings = require('./encodings');

var name_to_encoding = {};
var label_to_encoding = {};
encodings.forEach(function(category) {
  category.encodings.forEach(function(encoding) {
    name_to_encoding[encoding.name] = encoding;
    encoding.labels.forEach(function(label) {
      label_to_encoding[label] = encoding;
    });
  });
});

/**
 * @param {string} label The encoding label.
 * @return {?{name:string,labels:Array.<string>}}
 */
function getEncoding(label) {
  label = String(label).trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(label_to_encoding, label)) {
    return label_to_encoding[label];
  }
  return null;
}

(function() {
  ['ibm864', 'ibm866', 'iso-8859-2', 'iso-8859-3', 'iso-8859-4',
   'iso-8859-5', 'iso-8859-6', 'iso-8859-7', 'iso-8859-8', 'iso-8859-10',
   'iso-8859-13', 'iso-8859-14', 'iso-8859-15', 'iso-8859-16', 'koi8-r',
   'koi8-u', 'macintosh', 'windows-874', 'windows-1250', 'windows-1251',
   'windows-1252', 'windows-1253', 'windows-1254', 'windows-1255',
   'windows-1256', 'windows-1257', 'windows-1258', 'x-mac-cyrillic'
  ].forEach(function(name) {
    var encoding = name_to_encoding[name];
    var index = indexes[name];
    encoding.getDecoder = function(options) {
      return new SingleByteDecoder(index, options);
    };
    encoding.getEncoder = function(options) {
      return new SingleByteEncoder(index, options);
    };
  });
}());

module.exports.encodings = encodings;
module.exports.getEncoding = getEncoding;

name_to_encoding['utf-8'].getEncoder = function(options) {
  return new (require('./Utf8Encoder'))(options);
};

name_to_encoding['utf-8'].getDecoder = function(options) {
  return new (require('./Utf8Decoder'))(options);
};

//
// 13. Legacy utf-16 encodings
//

name_to_encoding['utf-16'].getEncoder = function(options) {
  return new (require('./Utf16Encoder'))(false, options);
};
name_to_encoding['utf-16'].getDecoder = function(options) {
  return new (require('./Utf16Decoder'))(false, options);
};

// 13.2 utf-16be
name_to_encoding['utf-16be'].getEncoder = function(options) {
  return new (require('./Utf16Encoder'))(true, options);
};
name_to_encoding['utf-16be'].getDecoder = function(options) {
  return new (require('./Utf16Decoder'))(true, options);
};

name_to_encoding['shift_jis'].getEncoder = function(options) {
  return new (require('./ShiftJisEncoder'))(options);
};
name_to_encoding['shift_jis'].getDecoder = function(options) {
  return new (require('./ShiftJisDecoder'))(options);
};

/* TODO
name_to_encoding['gbk'].getEncoder = function(options) {
  return new GBKEncoder(false, options);
};
name_to_encoding['gbk'].getDecoder = function(options) {
  return new GBKDecoder(false, options);
};

// 9.2 gb18030
name_to_encoding['gb18030'].getEncoder = function(options) {
  return new GBKEncoder(true, options);
};
name_to_encoding['gb18030'].getDecoder = function(options) {
  return new GBKDecoder(true, options);
};

name_to_encoding['hz-gb-2312'].getEncoder = function(options) {
  return new HZGB2312Encoder(options);
};
name_to_encoding['hz-gb-2312'].getDecoder = function(options) {
  return new HZGB2312Decoder(options);
};

name_to_encoding['big5'].getEncoder = function(options) {
  return new Big5Encoder(options);
};
name_to_encoding['big5'].getDecoder = function(options) {
  return new Big5Decoder(options);
};


//
// 11. Legacy multi-byte Japanese encodings
//


name_to_encoding['euc-jp'].getEncoder = function(options) {
  return new EUCJPEncoder(options);
};
name_to_encoding['euc-jp'].getDecoder = function(options) {
  return new EUCJPDecoder(options);
};



name_to_encoding['iso-2022-jp'].getEncoder = function(options) {
  return new ISO2022JPEncoder(options);
};
name_to_encoding['iso-2022-jp'].getDecoder = function(options) {
  return new ISO2022JPDecoder(options);
};


//
// 12. Legacy multi-byte Korean encodings
//

// 12.1 euc-kr


name_to_encoding['euc-kr'].getEncoder = function(options) {
  return new EUCKREncoder(options);
};
name_to_encoding['euc-kr'].getDecoder = function(options) {
  return new EUCKRDecoder(options);
};

name_to_encoding['iso-2022-kr'].getEncoder = function(options) {
  return new ISO2022KREncoder(options);
};
name_to_encoding['iso-2022-kr'].getDecoder = function(options) {
  return new ISO2022KRDecoder(options);
};
*/

