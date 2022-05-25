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

  function _s22n(s) { return s.charCodeAt(0) + 0x100 * s.charCodeAt(1); }
  function _s42n(s) { return s.charCodeAt(0) + 0x100 * s.charCodeAt(1) + 0x10000 * s.charCodeAt(2) + 0x1000000 * s.charCodeAt(3); }

  var _info = {
    ifil: 'File version', isng: 'Target', INAM: 'Bank Name', irom: 'ROM Name', iver: 'ROM Version',
    ICRD: 'Date', IENG: 'Designers', IPRD: 'Product', ICOP: 'Copyright', ICMT: 'Comments', ISFT: 'Tool'
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
    len = _s42n(s.substr(4, 4));
    if (len != s.length - 8) _error('Corrupted file');
    p = 12;

    _expect(s.substr(p, 4), 'LIST');
    _expect(s.substr(p + 8, 4), 'INFO');
    len = _s42n(s.substr(p + 4, 4));
    _loadINFO(this.data, s.substr(p + 12, len - 4));
    p += len + 8;

    _expect(s.substr(p, 4), 'LIST');
    _expect(s.substr(p + 8, 4), 'sdta');
    len = _s42n(s.substr(p + 4, 4));
    _loadSDTA(this.data, s.substr(p + 12, len - 4));
    p += len + 8;

    _expect(s.substr(p, 4), 'LIST');
    _expect(s.substr(p + 8, 4), 'pdta');
    len = _s42n(s.substr(p + 4, 4));
    _loadPDTA(this.data, s.substr(p + 12, len - 4));
    p += len + 8;
  };

  function _loadList(s) {
    var a = [];
    var p = 0;
    var len;
    while (p < s.length) {
      len = _s42n(s.substr(p + 4, 4));
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
      d[t] = { phdr: _phdr, pbag: _pbag, pmod: _pmod, pgen: _pgen, inst: _inst, ibag: _ibag, imod: _imod, igen: _igen, shdr: _shdr }[t](x);
    }
  }

  function PHDR(a) {
    this.name = a[0];
    this.preset = a[1];
    this.bank = a[2];
    this.bag = a[3];
    this.library = a[4];
    this.genre = a[5];
    this.morph = a[6];
  }
  PHDR.prototype.toString = function() {
    return this.name;
  };
  function _phdr(s) {
    var a = [];
    var p = 0;
    var n, x;
    while (p < s.length) {
      x = s.substr(p, 20);
      for (n = 0; n < x.length; n++) if (!x.charCodeAt(n)) x = x.substr(0, n);
      x = [ x ];
      p += 20;
      x.push(_s22n(s.substr(p, 2)));
      p += 2;
      x.push(_s22n(s.substr(p, 2)));
      p += 2;
      x.push(_s22n(s.substr(p, 2)));
      p += 2;
      x.push(_s42n(s.substr(p, 4)));
      p += 4;
      x.push(_s42n(s.substr(p, 4)));
      p += 4;
      x.push(_s42n(s.substr(p, 4)));
      p += 4;
      a.push(new PHDR(x));
    }
    return a;
  }

  function PBAG(a, b) {
    this.gen = a;
    this.mod = b;
  }
  PBAG.prototype.toString = function() {
    return ['gen:', this.gen, 'mod:', this.mod].join(' ');
  };
  function _pbag(s) {
    var a = [];
    var p = 0;
    while (p < s.length) {
      a.push(new PBAG(_s22n(s.substr(p, 2)), _s22n(s.substr(p + 2, 4))));
      p += 4;
    }
    return a;
  }

  function _pmod(s) {
  }
  function _pgen(s) {
  }

  function INST(a, b) {
    this.name = a;
    this.bag = b;
  }
  INST.prototype.toString = function() {
    return this.name + ' ' + this.bag;
  };
  function _inst(s) {
    var a = [];
    var p = 0;
    var n, x;
    while (p < s.length) {
      x = s.substr(p, 20);
      for (n = 0; n < x.length; n++) if (!x.charCodeAt(n)) x = x.substr(0, n);
      a.push(new INST(x, _s22n(s.substr(p + 20, 2))));
      p += 22;
    }
    return a;
  }

  function IBAG(a, b) {
    this.gen = a;
    this.mod = b;
  }
  IBAG.prototype.toString = function() {
    return ['gen:', this.gen, 'mod:', this.mod].join(' ');
  };
  function _ibag(s) {
    var a = [];
    var p = 0;
    while (p < s.length) {
      a.push(new IBAG(_s22n(s.substr(p, 2)), _s22n(s.substr(p + 2, 4))));
      p += 4;
    }
    return a;
  }

  function _imod(s) {
  }
  function _igen(s) {
  }


  function SHDR(a) {
    this.name = a[0];
    this.start = a[1];
    this.end = a[2];
    this.startlp = a[3];
    this.endlp = a[4];
    this.rate = a[5];
    this.key = a[6];
    this.corr = a[7];
    this.link = a[8];
    this.type = a[9];
  }
  SHDR.prototype.toString = function() {
    return this.name;
  };
  function _shdr(s) {
    var a = [];
    var p = 0;
    var n, x;
    while (p < s.length) {
      x = s.substr(p, 20);
      for (n = 0; n < x.length; n++) if (!x.charCodeAt(n)) x = x.substr(0, n);
      x = [ x ];
      p += 20;
      x.push(_s42n(s.substr(p, 4)));
      p += 4;
      x.push(_s42n(s.substr(p, 4)));
      p += 4;
      x.push(_s42n(s.substr(p, 4)));
      p += 4;
      x.push(_s42n(s.substr(p, 4)));
      p += 4;
      x.push(_s42n(s.substr(p, 4)));
      p += 4;
      x.push(s.charCodeAt(p));
      p += 1;
      x.push(s.charCodeAt(p));
      p += 1;
      x.push(_s22n(s.substr(p, 2)));
      p += 2;
      x.push(_s22n(s.substr(p, 2)));
      p += 2;
      a.push(new SHDR(x));
    }
    return a;
  }

  function _n2v(a) { return a ? a[0] + ('.0' + a[1]).substr(0, 3) : ''; }
  var _info_tags = ['isng', 'INAM', 'irom', 'iver', 'ICRD', 'IENG', 'IPRD', 'ICOP', 'ICMT', 'ISFT'];
  var _pdta_tags = ['phdr', 'pbag',   'inst', 'ibag', 'shdr'];

  SF2.prototype.toString = function() {
    var i, j, x;
    var a = ['SOUNDFONT ' + _n2v(this.data.ifil)];
    for (i = 0; i < _info_tags.length; i++) if (this.data[_info_tags[i]]) a.push('  ' + (_info[_info_tags[i]] + ':        ').substr(0, 13) + this.data[_info_tags[i]]);
    a.push('  Sample data: [ ' + this.data.smpl.length + ' ]');
    for (i = 0; i < _pdta_tags.length; i++) {
      x = this.data[_pdta_tags[i]];
      a.push('  ' + (_pdta[_pdta_tags[i]] + ':        ').substr(0, 15) + '[ ' + x.length + ' ]');
      for (j = 0; j < x.length; j++) a.push('    ' + x[j]);
    }
    return a.join('\n');
  };

  JZZ.MIDI.SF2 = SF2;
});
