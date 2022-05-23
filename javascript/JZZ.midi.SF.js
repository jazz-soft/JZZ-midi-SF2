(function(global, factory) {
  /* istanbul ignore next */
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory;
  }
  else if (typeof define === 'function' && define.amd) {
    define('JZZ.midi.SF', ['JZZ'], factory);
  }
  else {
    factory(JZZ);
  }
})(this, function(JZZ) {

  /* istanbul ignore next */
  if (JZZ.MIDI.SF) return;

  var _ver = '0.0.0';

  function _error(s) { throw new Error(s); }

  function _num(n) {
    var s = '';
    if (n > 0x1fffff) s += String.fromCharCode(((n >> 21) & 0x7f) + 0x80);
    if (n > 0x3fff) s += String.fromCharCode(((n >> 14) & 0x7f) + 0x80);
    if (n > 0x7f) s += String.fromCharCode(((n >> 7) & 0x7f) + 0x80);
    s += String.fromCharCode(n & 0x7f);
    return s;
  }
  function _num2(n) {
    return String.fromCharCode(n >> 8) + String.fromCharCode(n & 0xff);
  }
  function _num4(n) {
    return String.fromCharCode((n >> 24) & 0xff) + String.fromCharCode((n >> 16) & 0xff) + String.fromCharCode((n >> 8) & 0xff) + String.fromCharCode(n & 0xff);
  }
  function _num4le(n) {
    return String.fromCharCode(n & 0xff) + String.fromCharCode((n >> 8) & 0xff) + String.fromCharCode((n >> 16) & 0xff) + String.fromCharCode((n >> 24) & 0xff);
  }
  function _s2n(s) {
    return s.charCodeAt(0) + 0x100 * s.charCodeAt(1) + 0x10000 * s.charCodeAt(2) + 0x1000000 * s.charCodeAt(3);
  }

  function SF() {
    var self = this;
    if (!(self instanceof SF)) {
      self = new SF();
    }
    var type = 1;
    var ppqn = 96;
    var fps;
    var ppf;
    if (arguments.length == 1) {
      if (arguments[0] instanceof SF) {
        return arguments[0].copy();
      }
      try {
        if (arguments[0] instanceof ArrayBuffer) {
          self.load(String.fromCharCode.apply(null, new Uint8Array(arguments[0])));
          return self;
        }
      }
      catch (err) {/**/}
      try {
        if (arguments[0] instanceof Uint8Array || arguments[0] instanceof Int8Array) {
          self.load(String.fromCharCode.apply(null, new Uint8Array(arguments[0])));
          return self;
        }
      }
      catch (err) {/**/}
      try {
        /* istanbul ignore next */
        if (arguments[0] instanceof Buffer) {
          self.load(arguments[0].toString('binary'));
          return self;
        }
      }
      catch (err) {/**/}
      if (typeof arguments[0] == 'string' && arguments[0] != '0' && arguments[0] != '1' && arguments[0] != '2') {
        self.load(arguments[0]);
        return self;
      }
      type = parseInt(arguments[0]);
    }
  }
  SF.version = function() { return _ver; };

  function _expect(a, b) { if (a != b) _error('Unexpected chunk type: ' + a); }

  SF.prototype = [];
  SF.prototype.constructor = SF;
  SF.prototype.load = function(s) {
    var len;
    var p;
    if (s.length < 12 || s.substr(0, 4) != 'RIFF' || s.substr(8, 4) != 'sfbk') _error('Wrong file type');
    len = _s2n(s.substr(4, 4));
    if (len != s.length - 8) _error('Corrupted file');
    p = 12;

    _expect(s.substr(p, 4), 'LIST');
    _expect(s.substr(p + 8, 4), 'INFO');
    len = _s2n(s.substr(p + 4, 4));
    p += 8;
    _readList(s.substr(p + 4, len - 4));
    p += len;

    _expect(s.substr(p, 4), 'LIST');
    _expect(s.substr(p + 8, 4), 'sdta');
    len = _s2n(s.substr(p + 4, 4));
    p += 8;
    _readList(s.substr(p + 4, len - 4));
    p += len;

    _expect(s.substr(p, 4), 'LIST');
    _expect(s.substr(p + 8, 4), 'pdta');
    len = _s2n(s.substr(p + 4, 4));
    p += 8;
    _readList(s.substr(p + 4, len - 4));
    p += len;

  }

  function _readList(s) {
    var a = [];
    p = 0;
    while (p < s.length) {
      type = s.substr(p, 4);
      len = _s2n(s.substr(p + 4, 4));
      p += 8;
      data = s.substr(p + 4, len - 4);
      p += len;
    }
    // assert(p == s.length);
    return a;
  }

  JZZ.MIDI.SF = SF;
});
