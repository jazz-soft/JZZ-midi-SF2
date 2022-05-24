(function(global, factory) {
  /* istanbul ignore next */
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory;
  }
  else if (typeof define === 'function' && define.amd) {
    define('JZZ.midi.SF2', ['JZZ'], factory);
  }
  else {
    factory(JZZ);
  }
})(this, function(JZZ) {

  /* istanbul ignore next */
  if (JZZ.MIDI.SF2) return;

  var _ver = '0.0.0';

  function _error(s) { throw new Error(s); }

  function _s2n(s) {
    return s.charCodeAt(0) + 0x100 * s.charCodeAt(1) + 0x10000 * s.charCodeAt(2) + 0x1000000 * s.charCodeAt(3);
  }

  var _info = {
    ifil: 'File version', isng: 'Target Sound Engine', INAM: 'Bank Name', irom: 'ROM Name', iver: 'ROM Version',
    ICRD: 'Date', IENG: 'Sound Designers', IPRD: 'Product', ICOP: 'Copyright', ICMT: 'Comments', ISFT: 'Tool'
  };
  var _pdta = {
    phdr: 'Preset Headers', pbag: 'Preset Index', pmod: 'Preset Modulators', pgen: 'Preset Generators',
    inst: 'Instrument Names', ibag: 'Instrument Index', imod: 'Instrument Modulators', igen: 'Instrument Generators', shdr: 'Sample Headers'
  };
  function SF2() {
    var self = this;
    if (!(self instanceof SF2)) {
      self = new SF2();
    }
    if (arguments.length == 1) {
      if (arguments[0] instanceof SF2) {
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
    }
  }
  SF2.version = function() { return _ver; };

  function _expect(a, b) { if (a != b) _error('Unexpected chunk type: ' + a); }

  SF2.prototype = [];
  SF2.prototype.constructor = SF2;
  SF2.prototype.load = function(s) {
    var len;
    var p;
    this.data = {};
    if (s.length < 12 || s.substr(0, 4) != 'RIFF' || s.substr(8, 4) != 'sfbk') _error('Wrong file type');
    len = _s2n(s.substr(4, 4));
    if (len != s.length - 8) _error('Corrupted file');
    p = 12;

    _expect(s.substr(p, 4), 'LIST');
    _expect(s.substr(p + 8, 4), 'INFO');
    len = _s2n(s.substr(p + 4, 4));
    _loadINFO(this.data, s.substr(p + 12, len - 4));
    p += len + 8;

    _expect(s.substr(p, 4), 'LIST');
    _expect(s.substr(p + 8, 4), 'sdta');
    len = _s2n(s.substr(p + 4, 4));
    _loadSDTA(this.data, s.substr(p + 12, len - 4));
    p += len + 8;

    _expect(s.substr(p, 4), 'LIST');
    _expect(s.substr(p + 8, 4), 'pdta');
    len = _s2n(s.substr(p + 4, 4));
    _loadPDTA(this.data, s.substr(p + 12, len - 4));
    p += len + 8;
  };

  function _loadList(s) {
    var a = [];
    var p = 0;
    var len;
    while (p < s.length) {
      len = _s2n(s.substr(p + 4, 4));
      a.push([s.substr(p, 4), s.substr(p + 8, len)]);
      p += len + 8;
    }
    // assert(p == s.length);
    return a;
  }

  function _loadINFO(d, s) {
    var a = _loadList(s);
    var i, n, t, x;
    for (i = 0; i < a.length; i++) {
      t = a[i][0];
      x = a[i][1];
      if (d[t]) _error('Duplicate chunk: ' + t);
      if (!_info[t]) _error('Unexpected chunk: ' + t);
      if (t == 'ifil' || t == 'iver') {
        x = [x.charCodeAt(0) + x.charCodeAt(1) * 256, x.charCodeAt(2) + x.charCodeAt(3) * 256];
      }
      else {
        for (n = 0; n < x.length; n++) if (!x.charCodeAt(n)) x = x.substr(0, n);
      }
      d[t] = x;
    }
  }

  function _loadSDTA(d, s) {
    var a = _loadList(s);
    var i, t, x;
    for (i = 0; i < a.length; i++) {
      t = a[i][0];
      x = a[i][1];
      if (d[t]) _error('Duplicate chunk: ' + t);
      if (t != 'smpl') _error('Unexpected chunk: ' + t);
      d[t] = x;
    }
  }

  function _loadPDTA(d, s) {
    var a = _loadList(s);
    var i, t, x;
    for (i = 0; i < a.length; i++) {
      t = a[i][0];
      x = a[i][1];
      if (d[t]) _error('Duplicate chunk: ' + t);
      if (!_pdta[t]) _error('Unexpected chunk: ' + t);
      d[t] = x;
    }
  }

  JZZ.MIDI.SF2 = SF2;
});
