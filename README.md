# stringencoding [![Build Status](https://secure.travis-ci.org/shtylman/stringencoding.png?branch=master)](http://travis-ci.org/shtylman/stringencoding) #

## basic usage

```javascript
// encode a string into a typed array given an encoding
var uint8array = TextEncoder(encoding).encode(string);

// decode typed array into a string
var string = TextDecoder(encoding).decode(uint8array);
```

## streaming decode

```javascript
var string = '';
var decoder = TextDecoder(encoding), buffer;

while (buffer = next_chunk()) {
    string += decoder.decode(buffer, { stream:true });
}

string += decoder.decode(); // finish the stream
```

## install

```
npm install stringencoding
```
