test(
  function () {
    var encodings = ["utf-8", "ibm864", "ibm866", "iso-8859-2", "iso-8859-3", "iso-8859-4", "iso-8859-5", "iso-8859-6", "iso-8859-7", "iso-8859-8", "iso-8859-10", "iso-8859-13", "iso-8859-14", "iso-8859-15", "iso-8859-16", "koi8-r", "koi8-u", "macintosh", "windows-874", "windows-1250", "windows-1251", "windows-1252", "windows-1253", "windows-1254", "windows-1255", "windows-1256", "windows-1257", "windows-1258", "x-mac-cyrillic", "gbk", "gb18030", "hz-gb-2312", "big5", "euc-jp", "iso-2022-jp", "shift_jis", "euc-kr", "iso-2022-kr"];

    encodings.forEach(function (encoding) {
      var string = '', bytes = [];
      for (var i = 0; i < 128; ++i) {

        // Encodings that have escape codes in 0x00-0x7F
        if (encoding === "hz-gb-2312" && i === 0x7E)
          continue;
        if (encoding === "iso-2022-jp" && i === 0x1B)
          continue;
        if (encoding === "iso-2022-kr" && (i === 0x0E || i === 0x0F || i === 0x1B))
          continue;

        string += String.fromCharCode(i);
        bytes.push(i);
      }
      var ascii_encoded = TextEncoder('utf-8').encode(string);
      assert_equals(TextDecoder(encoding).decode(ascii_encoded), string, encoding);
      //assert_array_equals(TextEncoder(encoding).encode(string), bytes, encoding);
    });
  },
  "Supersets of ASCII decode ASCII correctly"
);
