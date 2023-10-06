(function(global, factory) {
  /* istanbul ignore next */
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory.SF2 = factory;
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

  var _ver = '0.0.4';

  function _nop() {}
  function _error(s) { throw new Error(s); }
  function _s22n(s) { return s.charCodeAt(0) + 0x100 * s.charCodeAt(1); }
  function _s42n(s) { return s.charCodeAt(0) + 0x100 * s.charCodeAt(1) + 0x10000 * s.charCodeAt(2) + 0x1000000 * s.charCodeAt(3); }
  function _s82n(s) { return s.charCodeAt(0) + 0x100 * s.charCodeAt(1) + 0x10000 * s.charCodeAt(2) + 0x1000000 * s.charCodeAt(3) + 0x100000000 * s.charCodeAt(4) + 0x10000000000 * s.charCodeAt(5) + 0x1000000000000 * s.charCodeAt(6) + 0x100000000000000 * s.charCodeAt(7); }
  function _n2s2(n) { return String.fromCharCode(n & 0xff) + String.fromCharCode(n >> 8); }
  function _s20(s) { return (s + '\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0').substring(0, 20); }
  function _n2s4(n) {
    return String.fromCharCode(n & 0xff) + String.fromCharCode((n >> 8) & 0xff) + String.fromCharCode((n >> 16) & 0xff) + String.fromCharCode((n >> 24) & 0xff);
  }

  var _r = 0;
  var _info = {
    ifil: 'File version', isng: 'Target', INAM: 'Bank Name', irom: 'ROM Name', iver: 'ROM Version',
    ICRD: 'Date', IENG: 'Designers', IPRD: 'Product', ICOP: 'Copyright', ICMT: 'Comments', ISFT: 'Software'
  };
  var _pdta = {
    phdr: 'Presets', pbag: 'Preset Index', pmod: 'Preset Mod', pgen: 'Preset Gen',
    inst: 'Instruments', ibag: 'Instr Index', imod: 'Instr Mod', igen: 'Instr Gen', shdr: 'Samples'
  };
  var _info_tags = ['ifil', 'isng', 'INAM', 'irom', 'iver', 'ICRD', 'IENG', 'IPRD', 'ICOP', 'ICMT', 'ISFT'];
  var _pdta_tags = ['phdr', 'pbag', 'pmod', 'pgen', 'inst', 'ibag', 'imod', 'igen', 'shdr'];

  function _u8a2s(u) {
    var s = '';
    var len = u.byteLength;
    // String.fromCharCode.apply(null, u) throws "RangeError: Maximum call stack size exceeded" on large files
    for (var i = 0; i < len; i++) s += String.fromCharCode(u[i]);
    return s;
  }
  function SF2() {
    var self = this;
    if (!(self instanceof SF2)) {
      self = new SF2();
    }
    if (arguments.length == 0) {
      self.Header = { ifil: [2, 1], isng: 'EMU8000', INAM: 'SF' };
      self.Samples = [];
      self.IGens = [];
      self.IMods = [];
      self.IZones = [];
      self.Instruments = [];
      self.PGens = [];
      self.PMods = [];
      self.PZones = [];
      self.data = {};
      return self;
    }
    if (arguments.length == 1) {
      if (arguments[0] instanceof SF2) {
        return arguments[0].copy();
      }
      var data;
      try {
        if (arguments[0] instanceof ArrayBuffer) {
          data = _u8a2s(new Uint8Array(arguments[0]));
        }
      }
      catch (err) {/**/}
      try {
        if (arguments[0] instanceof Uint8Array || arguments[0] instanceof Int8Array) {
          data = _u8a2s(new Uint8Array(arguments[0]));
        }
      }
      catch (err) {/**/}
      try {
        /* istanbul ignore next */
        if (arguments[0] instanceof Buffer) {
          data = arguments[0].toString('binary');
        }
      }
      catch (err) {/**/}
      if (typeof arguments[0] == 'string') {
        data = arguments[0];
      }
      self.load(data);
      return self;
    }
  }
  SF2.version = function() { return _ver; };

  function _expect(a, b) { if (a != b) _error('Unexpected chunk type: ' + a); }

  SF2.prototype = [];
  SF2.prototype.constructor = SF2;
  SF2.prototype.load = function(s) {
    var len;
    var p, i;
    this.data = {};
    if (s.length < 12 || s.substr(0, 4) != 'RIFF' || s.substr(8, 4) != 'sfbk') _error('Not a SoundFont file');
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

    this.Header = {};
    for (i = 0; i < _info_tags.length; i++) if (this.data[_info_tags[i]]) this.Header[_info_tags[i]] = this.data[_info_tags[i]];
    this.Samples = [];
    for (i = 0; i < this.data.shdr.length - 1; i++) this.Samples.push(new Sample(this.data.shdr[i], this));
    for (i = 0; i < this.data.shdr.length - 1; i++) if (this.data.shdr[i].type & 14) this.Samples[i].link = this.Samples[this.data.shdr[i].link];
    this.IGens = [];
    for (i = 0; i < this.data.igen.length - 1; i++) this.IGens.push(new IGen(this.data.igen[i], this));
    this.IMods = [];
    for (i = 0; i < this.data.imod.length - 1; i++) this.IMods.push(new IMod(this.data.imod[i]));
    this.IZones = [];
    for (i = 0; i < this.data.ibag.length - 1; i++) this.IZones.push(new IZone(this.data.ibag[i], this.data.ibag[i + 1], this));
    this.Instruments = [];
    for (i = 0; i < this.data.inst.length - 1; i++) this.Instruments.push(new Instrument(this.data.inst[i], this.data.inst[i + 1], this));
    this.PGens = [];
    for (i = 0; i < this.data.pgen.length - 1; i++) this.PGens.push(new PGen(this.data.pgen[i], this));
    this.PMods = [];
    for (i = 0; i < this.data.pmod.length - 1; i++) this.PMods.push(new PMod(this.data.pmod[i]));
    this.PZones = [];
    for (i = 0; i < this.data.pbag.length - 1; i++) this.PZones.push(new PZone(this.data.pbag[i], this.data.pbag[i + 1], this));
    for (i = 0; i < this.data.phdr.length - 1; i++) this.push(new Preset(this.data.phdr[i], this.data.phdr[i + 1], this));
  };

  function _refresh(self) {
    var i;
    _r++;
    for (i = 0; i < _info_tags.length; i++) if (self.Header[_info_tags[i]]) self.data[_info_tags[i]] = self.Header[_info_tags[i]];
    self.data.smpl = '';
    for (i = 0; i < _pdta_tags.length; i++) self.data[_pdta_tags[i]] = [];
    for (i = 0; i < self.length; i++) _refrPreset(self[i], self.data);
    self.data.phdr.push(new PHDR(['EOP', 0, 0, self.data.pbag.length, 0, 0, 0]));
    self.data.pbag.push(new PBAG(self.data.pgen.length, self.data.pmod.length));
    self.data.pgen.push(new PGEN(0, 0));
    self.data.pmod.push(new PMOD(0, 0, 0, 0, 0));
    self.data.inst.push(new INST('EOI', self.data.ibag.length));
    self.data.ibag.push(new IBAG(self.data.igen.length, self.data.imod.length));
    self.data.igen.push(new IGEN(0, 0));
    self.data.imod.push(new IMOD(0, 0, 0, 0, 0));
    self.data.shdr.push(new SHDR(['EOS', 0, 0, 0, 0, 0, 0, 0, 0, 0]));
  }

  SF2.prototype.dump = function() {
    _refresh(this);
    var s = _dumpINFO(this.data) + _dumpSDTA(this.data) + _dumpPDTA(this.data);
    s = 'RIFF' + _n2s4(s.length + 4) + 'sfbk' + s;
    return s;
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
  function _dumpINFO(d) {
    var i, t, z;
    var s = '';
    for (i = 0; i < _info_tags.length; i++) {
      t = _info_tags[i];
      if (t in d) {
        if (t == 'ifil' || t == 'iver') {
          s += t + _n2s4(4) + _n2s2(d[t][0]) + _n2s2(d[t][1]);
        }
        else {
          z = d[t] + '\0';
          if (z.length & 1) z += '\0';
          s += t + _n2s4(z.length) + z;
        }
      }
    }
    return 'LIST' + _n2s4(s.length + 4) + 'INFO' + s;
  }
  function _loadSDTA(d, s) {
    var a = _loadList(s);
    var i, t, x;
    d.smpl = '';
    for (i = 0; i < a.length; i++) {
      t = a[i][0];
      x = a[i][1];
      if (d[t]) _error('Duplicate chunk: ' + t);
      if (t != 'smpl') _error('Unexpected chunk: ' + t);
      if (x.substr(0, 4) == 'OggS') {
        d.ogg = x;
        x = OGG(x).smpl();
      }
      d.smpl = x;
    }
  }
  function _dumpSDTA(d) {
    var s = d.smpl ? 'smpl' + _n2s4(d.smpl.length) + d.smpl : '';
    return 'LIST' + _n2s4(s.length + 4) + 'sdta' + s;
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
  function _dumpPDTA(d) {
    var i, t;
    var s = '';
    for (i = 0; i <_pdta_tags.length; i++) {
      t = _pdta_tags[i];
      if (!d[t]) continue;
      s += { phdr: __phdr, pbag: __pbag, pmod: __pmod, pgen: __pgen, inst: __inst, ibag: __ibag, imod: __imod, igen: __igen, shdr: __shdr }[t](d[t]);
    }
    return 'LIST' + _n2s4(s.length + 4) + 'pdta' + s;
  }

  function PHDR(a) {
    this.name = a[0];
    this.preset = a[1];
    this.bank = a[2];
    this.idx = a[3];
    this.library = a[4];
    this.genre = a[5];
    this.morph = a[6];
  }
  PHDR.prototype.toString = function() {
    return [this.name, 'preset:', this.preset, 'bank:', this.bank, '#', this.idx].join(' ');
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
  function __phdr(d) {
    var i, x;
    var s = '';
    for (i = 0; i < d.length; i++) {
      x = d[i];
      s += _s20(x.name);
      s += _n2s2(x.preset);
      s += _n2s2(x.bank);
      s += _n2s2(x.idx);
      s += _n2s4(x.library);
      s += _n2s4(x.genre);
      s += _n2s4(x.morph);
    }
    return 'phdr' + _n2s4(s.length) + s;
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
  function __pbag(d) {
    var i, x;
    var s = '';
    for (i = 0; i < d.length; i++) {
      x = d[i];
      s += _n2s2(x.gen);
      s += _n2s2(x.mod);
    }
    return 'pbag' + _n2s4(s.length) + s;
  }

  function PMOD(a, b, c, d, e) {
    this.src = a;
    this.dest = b;
    this.val = c;
    this.mod = d;
    this.oper = e;
  }
  PMOD.prototype.toString = function() {
    return ['src:', this.src, 'dest:', this.dest, 'val:', this.val, 'mod:', this.mod, 'oper:', this.oper].join(' ');
  };
  function _pmod(s) {
    var a = [];
    var p = 0;
    while (p < s.length) {
      a.push(new PMOD(_s22n(s.substr(p, 2)), _s22n(s.substr(p + 2, 2)), _s22n(s.substr(p + 4, 2)), _s22n(s.substr(p + 6, 2)), _s22n(s.substr(p + 8, 2))));
      p += 10;
    }
    return a;
  }
  function __pmod(d) {
    var i, x;
    var s = '';
    for (i = 0; i < d.length; i++) {
      x = d[i];
      s += _n2s2(x.src);
      s += _n2s2(x.dest);
      s += _n2s2(x.val);
      s += _n2s2(x.mod);
      s += _n2s2(x.oper);
    }
    return 'pmod' + _n2s4(s.length) + s;
  }

  function PGEN(a, b) {
    this.oper = a;
    this.val = b;
  }
  PGEN.prototype.toString = function() {
    return ['oper:', this.oper, 'val:', this.val].join(' ');
  };
  function _pgen(s) {
    var a = [];
    var p = 0;
    while (p < s.length) {
      a.push(new PGEN(_s22n(s.substr(p, 2)), _s22n(s.substr(p + 2, 4))));
      p += 4;
    }
    return a;
  }
  function __pgen(d) {
    var i, x;
    var s = '';
    for (i = 0; i < d.length; i++) {
      x = d[i];
      s += _n2s2(x.oper);
      s += _n2s2(x.val);
    }
    return 'pgen' + _n2s4(s.length) + s;
  }

  function INST(a, b) {
    this.name = a;
    this.idx = b;
  }
  INST.prototype.toString = function() {
    return [this.name, '#', this.idx].join(' ');
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
  function __inst(d) {
    var i, x;
    var s = '';
    for (i = 0; i < d.length; i++) {
      x = d[i];
      s += _s20(x.name);
      s += _n2s2(x.idx);
    }
    return 'inst' + _n2s4(s.length) + s;
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
  function __ibag(d) {
    var i, x;
    var s = '';
    for (i = 0; i < d.length; i++) {
      x = d[i];
      s += _n2s2(x.gen);
      s += _n2s2(x.mod);
    }
    return 'ibag' + _n2s4(s.length) + s;
  }

  function IMOD(a, b, c, d, e) {
    this.src = a;
    this.dest = b;
    this.val = c;
    this.mod = d;
    this.oper = e;
  }
  IMOD.prototype.toString = function() {
    return ['src:', this.src, 'dest:', this.dest, 'val:', this.val, 'mod:', this.mod, 'oper:', this.oper].join(' ');
  };
  function _imod(s) {
    var a = [];
    var p = 0;
    while (p < s.length) {
      a.push(new IMOD(_s22n(s.substr(p, 2)), _s22n(s.substr(p + 2, 2)), _s22n(s.substr(p + 4, 2)), _s22n(s.substr(p + 6, 2)), _s22n(s.substr(p + 8, 2))));
      p += 10;
    }
    return a;
  }
  function __imod(d) {
    var i, x;
    var s = '';
    for (i = 0; i < d.length; i++) {
      x = d[i];
      s += _n2s2(x.src);
      s += _n2s2(x.dest);
      s += _n2s2(x.val);
      s += _n2s2(x.mod);
      s += _n2s2(x.oper);
    }
    return 'imod' + _n2s4(s.length) + s;
  }

  function IGEN(a, b) {
    this.oper = a;
    this.val = b;
  }
  IGEN.prototype.toString = function() {
    return ['oper:', this.oper, 'val:', this.val].join(' ');
  };
  function _igen(s) {
    var a = [];
    var p = 0;
    while (p < s.length) {
      a.push(new IGEN(_s22n(s.substr(p, 2)), _s22n(s.substr(p + 2, 4))));
      p += 4;
    }
    return a;
  }
  function __igen(d) {
    var i, x;
    var s = '';
    for (i = 0; i < d.length; i++) {
      x = d[i];
      s += _n2s2(x.oper);
      s += _n2s2(x.val);
    }
    return 'igen' + _n2s4(s.length) + s;
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
    return [this.name, this.start, '/', this.startlp, '/', this.endlp, '/', this.end, 'rate:', this.rate, 'key:', this.key, 'corr:', this.corr, 'link:', this.link, 'type:', this.type].join(' ');
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
  function __shdr(d) {
    var i, x;
    var s = '';
    for (i = 0; i < d.length; i++) {
      x = d[i];
      s += _s20(x.name);
      s += _n2s4(x.start);
      s += _n2s4(x.end);
      s += _n2s4(x.startlp);
      s += _n2s4(x.endlp);
      s += _n2s4(x.rate);
      s += String.fromCharCode(x.key);
      s += String.fromCharCode(x.corr);
      s += _n2s2(x.link);
      s += _n2s2(x.type);
    }
    return 'shdr' + _n2s4(s.length) + s;
  }

  function _n2v(a) { return a ? a[0] + ('.0' + a[1]).substr(0, 3) : ''; }

  SF2.prototype.toString = function() {
    _refresh(this);
    var i, j, x;
    var a = ['SOUNDFONT ' + _n2v(this.data.ifil)];
    for (i = 1; i < _info_tags.length; i++) if (this.data[_info_tags[i]]) a.push('  ' + (_info[_info_tags[i]] + ':         ').substr(0, 14) + this.data[_info_tags[i]]);
    a.push('  Sample data:  [ ' + this.data.smpl.length + ' ]');
    for (i = 0; i < _pdta_tags.length; i++) {
      x = this.data[_pdta_tags[i]];
      a.push('  ' + (_pdta[_pdta_tags[i]] + ':      ').substr(0, 14) + '[ ' + x.length + ' ]');
      for (j = 0; j < x.length; j++) a.push('    (' + j + ') ' + x[j]);
    }
    return a.join('\n');
  };
  SF2.prototype.freq = function() {
    var sps = 0;
    for (var i = 0; i < this.data.shdr.length; i++) if (sps < this.data.shdr[i].rate) sps = this.data.shdr[i].rate;
    return sps || 48000;
  };
  SF2.prototype.toWav = function() {
    _refresh(this);
    if (this.data.smpl.substr(0, 4) == 'OggS') return '';
    var sps = this.freq();
    var wav = new WAV();
    wav[0] = this.data.smpl;
    wav._format = 1;
    wav._nchan = 1;
    wav._sps = sps;
    wav._bps = sps * 2;
    wav._block = 2;
    wav._fspec = 16;
    return wav.dump();
  };
  SF2.prototype.toOgg = function() {
    if (this.data.smpl.substr(0, 4) == 'OggS') return this.data.smpl;
    return '';
  };

  function Sample(a, sf) {
    this.name = a.name;
    this.start = a.start;
    this.end = a.end;
    this.startlp = a.startlp;
    this.endlp = a.endlp;
    this.rate = a.rate;
    this.key = a.key;
    this.corr = a.corr;
    this.type = a.type;
    this.sample = sf.data.smpl.substring(this.start * 2, this.end * 2); // 16-bit samples
    this.end -= this.start;
    this.startlp -= this.start;
    this.endlp -= this.start;
    this.start = 0;
  }
  Sample.prototype.toWav = function() {
    if (this.sample.substr(0, 4) == 'OggS') return '';
    var wav = new WAV();
    wav[0] = this.sample;
    wav._format = 1;
    wav._nchan = 1;
    wav._sps = this.rate;
    wav._bps = this.rate * 2;
    wav._block = 2;
    wav._fspec = 16;
    return wav.dump();
  };
  SF2.Sample = Sample;
  function _refrSample(x, d) {
    if (x._r == _r) return x._n;
    var off = d.smpl.length / 2;
    d.smpl += x.sample;
    var z = new SHDR([x.name, x.start + off, x.end + off, x.startlp + off, x.endlp + off, x.rate, x.key, x.corr, 0, x.type]);
    x._n = d.shdr.length;
    x._r = _r;
    d.shdr.push(z);
    if (x.link) z.link = _refrSample(x.link, d);
    return x._n;
  }

  function genTitle(x) {
    return {
      2: 'Start Loop Offset',
      3: 'End Loop Offset',
      5: 'Mod to Pitch',
      6: 'Vibrato to Pitch',
      8: 'Filter Cutoff',
      9: 'Filter Resonance',
      11: 'Mod to Filter Cutoff',
      15: 'Chorus Send',
      16: 'Reverb Send',
      17: 'Pan',
      21: 'Mod Delay',
      22: 'Mod Frequency',
      23: 'Vibrato Delay',
      24: 'Vibrato Frequency',
      26: 'Mod Attack',
      27: 'Mod Hold',
      28: 'Mod Decay',
      29: 'Mod Sustain',
      34: 'Attack',
      35: 'Hold',
      36: 'Decay',
      37: 'Sustain',
      38: 'Release',
      41: 'Instrument',
      43: 'Key Range',
      44: 'Velocity Range',
      46: 'Key',
      47: 'Velocity',
      48: 'Attenuation',
      51: 'Tune Coarse',
      52: 'Tune Fine',
      53: 'Sample',
      54: 'Sample Flags',
      58: 'Root Key'
    }[x] || x;
  }

  function genText(op, v) {
    switch (op) {
      case 15: case 16: case 17:
        return ((v & 0x8000) ? v - 0x10000 : v) / 10 + '%'; 
      case 21: case 23: case 25: case 26: case 27: case 28: case 30: case 33: case 34: case 35: case 36: case 38:
        return v ? parseFloat((Math.pow(2, ((v & 0x8000) ? v - 0x10000 : v) / 1200)).toFixed(3)) + ' s' : 0; 
      case 43:
        return (v & 0xff) + ' - ' + (v >> 8);
    }
    return v;
  }
  function IGen(a, sf) {
    this.oper = a.oper;
    this.val = a.val;
    if (this.oper == 53) this.sample = sf.Samples[this.val];
    this.name = genTitle(this.oper);
    this.text = genText(this.oper, this.val);
  }
  SF2.IGen = IGen;
  function _refrIGen(x, d) {
    d.igen.push(new IGEN(x.oper, x.sample ? _refrSample(x.sample, d) : x.val));
  }

  function PGen(a, sf) {
    this.oper = a.oper;
    this.val = a.val;
    if (this.oper == 41) this.instr = sf.Instruments[this.val];
    this.name = genTitle(this.oper);
    this.text = genText(this.oper, this.val);
  }
  SF2.PGen = PGen;
  function _refrPGen(x, d) {
    d.pgen.push(new IGEN(x.oper, x.instr ? _refrInstr(x.instr, d) : x.val));
  }

  function initMod(g, a) {
    g.src = a.src;
    g.dest = a.dest;
    g.oper = a.oper;
    g.val = a.val;
    g.mod = a.mod;
    g.cc = !!(g.src & 0x80);
    if (g.cc) {
      g.name = 'xC ' + ('0' + (g.src & 0x7f).toString(16).toUpperCase()).substring(-2) + ' xx';
    }
    else {
        g.name = {
        0: 'None', 2: 'Velocity', 3: 'Key',
        10: 'xA xx xx', 13: 'xD xx',
        14: 'xE xx xx', 16: 'RPN 0'
      }[g.src & 0x7f] || 'Unknown ' + (g.src & 0x7f);
    }
    g.text = modText(g);
  }
  function modText(g) {
    var s = genTitle(g.dest);
    var m = (g.src & 0x20) ? -1 : 0;
    m = (g.src & 0x10) ? m + ' - 1' : '1 - ' + m;
    m = (['linear', 'concave', 'convex', 'switch'][g.src >> 10] || '*') + ' ' + m;
    return s + ' (' + m + '): ' + genText(g.dest, g.val);
  }
  function IMod(a) {
    initMod(this, a);
  }
  SF2.IMod = IMod;
  function _refrIMod(x, d) {
    d.imod.push(new IMOD(x.src, x.dest, x.oper, x.val, x.mod));
  }

  function PMod(a) {
    initMod(this, a);
  }
  SF2.PMod = PMod;
  function _refrPMod(x, d) {
    d.pmod.push(new PMOD(x.src, x.dest, x.oper, x.val, x.mod));
  }

  function IZone(a, b, sf) {
    var i;
    this.gen = [];
    this.mod = [];
    this.text = '';
    for (i = a.mod; i < b.mod; i++) this.mod.push(sf.IMods[i]);
    for (i = a.gen; i < b.gen; i++) {
      this.gen.push(sf.IGens[i]);
      if (sf.IGens[i].oper == 43 && !this.text) this.text = sf.IGens[i].text;
    }
  }
  SF2.IZone = IZone;
  function _refrIZone(x, d) {
    var i;
    d.ibag.push(new IBAG(d.igen.length, d.imod.length));
    for (i = 0; i < x.mod.length; i++) _refrIMod(x.mod[i], d);
    for (i = 0; i < x.gen.length; i++) _refrIGen(x.gen[i], d);
  }

  function PZone(a, b, sf) {
    var i;
    this.gen = [];
    this.mod = [];
    this.text = '';
    for (i = a.mod; i < b.mod; i++) this.mod.push(sf.PMods[i]);
    for (i = a.gen; i < b.gen; i++) {
      this.gen.push(sf.PGens[i]);
      if (sf.PGens[i].oper == 41 && !this.text) this.text = sf.PGens[i].instr.name;
    }
  }
  SF2.PZone = PZone;
  function _refrPZone(x, d) {
    var i;
    d.pbag.push(new PBAG(d.pgen.length, d.pmod.length));
    for (i = 0; i < x.mod.length; i++) _refrPMod(x.mod[i], d);
    for (i = 0; i < x.gen.length; i++) _refrPGen(x.gen[i], d);
  }

  function Instrument(a, b, sf) {
    this.name = a.name;
    this.idx = [];
    for (var i = a.idx; i < b.idx; i++) {
      if (sf.IZones[i].gen.length || sf.IZones[i].mod.length) this.idx.push(sf.IZones[i]);
    }
  }
  SF2.Instrument = Instrument;
  function _refrInstr(x, d) {
    if (x._r == _r) return x._n;
    x._n = d.inst.length;
    d.inst.push(new INST(x.name, d.ibag.length));
    for (var i = 0; i < x.idx.length; i++) _refrIZone(x.idx[i], d);
    x._r = _r;
    return x._n;
  }

  function Preset(a, b, sf) {
    this.name = a.name;
    this.prog = a.preset;
    this.bank = a.bank;
    this.idx = [];
    for (var i = a.idx; i < b.idx; i++) {
      if (sf.PZones[i].gen.length || sf.PZones[i].mod.length) this.idx.push(sf.PZones[i]);
    }
  }
  SF2.Preset = Preset;
  function _refrPreset(x, d) {
    d.phdr.push(new PHDR([x.name, x.prog, x.bank, d.pbag.length, 0, 0, 0]));
    for (var i = 0; i < x.idx.length; i++) _refrPZone(x.idx[i], d);
  }

  function WAV() {
    var self = this;
    if (!(self instanceof WAV)) {
      self = new WAV();
    }
    if (arguments.length == 1) {
      if (arguments[0] instanceof WAV) {
        return arguments[0].copy();
      }
      var data;
      try {
        if (arguments[0] instanceof ArrayBuffer) {
          data = _u8a2s(new Uint8Array(arguments[0]));
        }
      }
      catch (err) {/**/}
      try {
        if (arguments[0] instanceof Uint8Array || arguments[0] instanceof Int8Array) {
          data = _u8a2s(new Uint8Array(arguments[0]));
        }
      }
      catch (err) {/**/}
      try {
        /* istanbul ignore next */
        if (arguments[0] instanceof Buffer) {
          data = arguments[0].toString('binary');
        }
      }
      catch (err) {/**/}
      if (typeof arguments[0] == 'string') {
        data = arguments[0];
      }
      self.load(data);
      return self;
    }
  }
  WAV.prototype = [];
  WAV.prototype.constructor = WAV;
  WAV.prototype.load = function(s) {
    var len;
    var p, c;
    if (s.length < 12 || s.substr(0, 4) != 'RIFF' || s.substr(8, 4) != 'WAVE') _error('Not a WAV file');
    len = _s42n(s.substr(4, 4));
    if (len != s.length - 8) _error('Corrupted file');
    p = 12;
    while (p < s.length) {
      c = s.substr(p, 4);
      len = _s42n(s.substr(p + 4, 4));
      if (c == 'fmt ') {
        this._format = _s22n(s.substr(p + 8, 2));
        this._nchan = _s22n(s.substr(p + 10, 2));
        this._sps = _s42n(s.substr(p + 12, 4));
        this._bps = _s42n(s.substr(p + 16, 4));
        this._block = _s22n(s.substr(p + 20, 2));
        this._fspec = _s22n(s.substr(p + 22, 2));
      }
      if (c == 'data') {
        this.push(s.substr(p + 8, len));
      }
      p += len + 8;
    }
  };
  WAV.prototype.toString = function() {
    var i;
    var a = ['WAVE'];
    a.push('  Format:            ' + this._format);
    a.push('  Channels:          ' + this._format);
    a.push('  Samples / second:  ' + this._sps);
    a.push('  Bytes / second:    ' + this._bps);
    a.push('  Block alignment:   ' + this._block);
    a.push('  Format-specific:   ' + this._fspec);
    for (i = 0; i < this.length; i++) a.push('data:  [ ' + this[i].length + ' ]');
    return a.join('\n');
  };
  WAV.prototype.dump = function() {
    var s = 'fmt ' + _n2s4(16) + _n2s2(this._format) + _n2s2(this._nchan) + _n2s4(this._sps) + _n2s4(this._bps) + _n2s2(this._block) + _n2s2(this._fspec);
    s += 'data' + _n2s4(this[0].length) + this[0];
    s = 'RIFF' + _n2s4(s.length + 4) + 'WAVE' + s;
    return s;
  };
  SF2.WAV = WAV;

  function OGG() {
    var self = this;
    if (!(self instanceof OGG)) {
      self = new OGG();
    }
    if (arguments.length == 1) {
      if (arguments[0] instanceof OGG) {
        return arguments[0].copy();
      }
      var data;
      try {
        if (arguments[0] instanceof ArrayBuffer) {
          data = _u8a2s(new Uint8Array(arguments[0]));
        }
      }
      catch (err) {/**/}
      try {
        if (arguments[0] instanceof Uint8Array || arguments[0] instanceof Int8Array) {
          data = _u8a2s(new Uint8Array(arguments[0]));
        }
      }
      catch (err) {/**/}
      try {
        /* istanbul ignore next */
        if (arguments[0] instanceof Buffer) {
          data = arguments[0].toString('binary');
        }
      }
      catch (err) {/**/}
      if (typeof arguments[0] == 'string') {
        data = arguments[0];
      }
      self.load(data);
      return self;
    }
  }
  OGG.onChunk = _nop;
  OGG.prototype = [];
  OGG.prototype.constructor = OGG;
  function _vorbis1(s) {
    if (s.length != 30 || s.substr(0, 7) != '\x01vorbis') return;
    var x = {};
    var p = 7;
    x.ver = _s42n(s.substr(p, 4)); // = 0
    p += 4;
    x.chan = s.charCodeAt(p);
    p += 1;
    x.rate = _s42n(s.substr(p, 4));
    p += 4;
    x.max = _s42n(s.substr(p, 4));
    p += 4;
    x.nom = _s42n(s.substr(p, 4));
    p += 4;
    x.min = _s42n(s.substr(p, 4));
    p += 4;
    x.blk0 = 1 << (s.charCodeAt(p) & 15);
    x.blk1 = 1 << (s.charCodeAt(p) >> 4);
    p += 1;
    s.charCodeAt(p); // != 0
    return x;
  }
  function _vorbis2(s) {
    if (s.substr(0, 7) != '\x03vorbis') return;
    var x = {};
    var p = 7;
    var n = _s42n(s.substr(p, 4));
    p += 4;
    x.vendor = JZZ.lib.fromUTF8(s.substr(p, n));
    p += n;
    var k = _s42n(s.substr(p, 4));
    p += 4;
    for (var i = 0; i < k; i++) {
      n = _s42n(s.substr(p, 4));
      p += 4;
      x[i] = JZZ.lib.fromUTF8(s.substr(p, n));
      p += n;
    }
    return x;
  }
  function _bit(s, it) {
    var c = s.charCodeAt(it.p);
    var b = 1 << it.b;
    if (it.b == 7) {
      it.b = 0;
      it.p++;
    }
    else {
      it.b++;
    }
    return (c & b) ? 1 : 0;
  }
  function _bits(s, it, n) {
    var i;
    var k = 1;
    var x = 0;
    for (i = 0; i < n; i++) {
      var z = _bit(s, it);
      if (z) x += k;
      k <<= 1;
    }
    return x;
  }
  function _float32(s, it) {
    var x = _bits(s, it, 21);
    var e = _bits(s, it, 10) - 788;
    if (_bit(s, it)) x = - x;
    return x * Math.pow(2, e);
  }
  function _lkp1(e, d) {
    // x ^ d <= e
    for (var x = 1; ; x++) if (Math.pow(x, d) > e) return x - 1;
  }
  function _ilog(x) {
    var i = 0;
    var n = 1;
    while (n <= x) {
      i++; n <<= 1;
    }
    return i;
  }
  function _vorbis3(s, w) {
    if (s.substr(0, 7) != '\x05vorbis') return;
    var x = { cb: [], fl: [], re: [], mp: [], md: [] };
    var xx;
    var i, j, k, d, e, f;
    var p = 7;
    var n = s.charCodeAt(p) + 1;
    p += 1;
    var it = { p: p, b: 0 };
    for (i = 0; i < n; i++) {
      f = _bits(s, it, 24);
      if (f != 0x564342) return; // 'BCV'
      xx = {};
      d = _bits(s, it, 16);
      e = _bits(s, it, 24);
      xx.ll = [];
      xx.ordered = _bit(s, it);
      if (xx.ordered) {
        k = _bits(s, it, 5) + 1; // curret_length
        while (true) {
          f = _bits(s, it, _ilog(e - xx.ll.length));
          for (j = 0; j < f; j++) xx.ll.push(k);
          if (e == xx.ll.length) break;
          if (e < xx.ll.length) {
            console.log('Vorbis: corrupted file');
            return;
          }
          k++;
        }
      }
      else {
        xx.sparse = _bit(s, it);
        if (xx.sparse) {
          for (j = 0; j < e; j++) {
            f = _bit(s, it);
            xx.ll.push(f ? _bits(s, it, 5) + 1 : 0);
          }
        }
        else {
          for (j = 0; j < e; j++) {
            xx.ll.push(_bits(s, it, 5) + 1);
          }
        }
      }
      xx.lookup = _bits(s, it, 4);
      if (xx.lookup) {
        xx.min = _float32(s, it);
        xx.delta = _float32(s, it);
        xx.bits = _bits(s, it, 4) + 1;
        xx.seqp = _bit(s, it);
        if (xx.lookup == 1) {
          e = _lkp1(e, d);
        }
        else if (xx.lookup == 2) {
          e = e * d;
        }
        else {
          console.log('Vorbis: Codebook lookup type ' + xx.lookup + ' is not supported yet');
          return;
        }
        xx.mm  = [];
        for (j = 0; j < e; j++) {
          xx.mm.push(_bits(s, it, xx.bits));
        }
      }
      x.cb.push(xx);
    }
    // floors
    n = _bits(s, it, 6) + 1;
    for (i = 0; i < n; i++) {
      _bits(s, it, 16); // == 0
    }
    n = _bits(s, it, 6) + 1;
    for (i = 0; i < n; i++) {
      xx = {};
      xx.type = _bits(s, it, 16); // vorbis_floor_types
      if (xx.type == 0) {
        console.log('Floor type 0 - coming soon...');
        return;
      }
      else if (xx.type == 1) {
        d = _bits(s, it, 5);
        xx.cl = [];
        for (j = 0; j < d; j++) xx.cl.push(_bits(s, it, 4));
        e = 0;
        for (j = 0; j < d; j++) if (e < xx.cl[j]) e = xx.cl[j];
        xx.dd = [];
        xx.ss = [];
        xx.mb = [];
        xx.sb = [];
        for (j = 0; j <= e; j++) {
          xx.dd.push(_bits(s, it, 3) + 1);
          f = _bits(s, it, 2);
          xx.ss.push(f);
          xx.mb.push(f ? _bits(s, it, 8) : 0);
          f = Math.pow(2, f);
          xx.sb.push([]);
          for (k = 0; k < f; k++) xx.sb[j].push(_bits(s, it, 8) - 1);
        }
        xx.fm = _bits(s, it, 2) + 1;
        xx.rb = _bits(s, it, 4);
        xx.xl = [0, Math.pow(2, xx.rb)];
        for (j = 0; j < d; j++) {
          e = xx.dd[xx.cl[j]];
          for (k = 0; k < e; k++) xx.xl.push(_bits(s, it, xx.rb));
        }
      }
      else {
        console.log('Vorbis: Floor type ' + xx.type + ' is not supported');
        return;
      }
      x.fl.push(xx);
    }
    // residues
    n = _bits(s, it, 6) + 1;
    for (i = 0; i < n; i++) {
      xx = {};
      xx.type = _bits(s, it, 16);
      xx.begin = _bits(s, it, 24);
      xx.end = _bits(s, it, 24);
      xx.sz = _bits(s, it, 24) + 1;
      d = _bits(s, it, 6) + 1;
      xx.cb = _bits(s, it, 8);
      xx.rc = [];
      xx.rb = [];
      for (j = 0; j < d; j++) {
        xx.rc.push(_bits(s, it, 3) + (_bit(s, it) ? _bits(s, it, 5) * 8 : 0));
      }
      for (j = 0; j < d; j++) {
        xx.rb.push([]);
        for (k = 0; k < 8; k++) {
          if (xx.rc[j] & (1 << k)) xx.rb[j][k] = _bits(s, it, 8);
        }
      }
      if (xx.type < 0 || xx.type > 2) {
        console.log('Vorbis: Residue type ' + xx.type + ' is not supported');
        return;
      }
      x.re.push(xx);
    }
    // mappings
    n = _bits(s, it, 6) + 1;
    for (i = 0; i < n; i++) {
      xx = {};
      xx.type = _bits(s, it, 16);
      if (xx.type) {
        console.log('Vorbis: Mapping type ' + xx.type + ' is not supported');
        return;
      }
      xx.sm = _bit(s, it) ? _bits(s, it, 4) + 1 : 1; // vorbis_mapping_submaps
      d = _bit(s, it) ? _bits(s, it, 8) + 1 : 0; // vorbis_mapping_coupling_steps
      f = w.chan ? _ilog(w.chan - 1) : 0;
      xx.mm = [];
      xx.ma = [];
      xx.fl = [];
      xx.re = [];
      for (j = 0; j < d; j++) {
        xx.mm.push(_bits(s, it, f)); // vorbis_mapping_magnitude
        xx.ma.push(_bits(s, it, f)); // vorbis_mapping_angle
      }
      d = _bits(s, it, 2); // reserved = 0
      if (xx.sm > 1) {
        console.log('Vorbis: Multiple submaps are not yet supported');
        return;
      }
      for (j = 0; j < xx.sm; j++) {
        _bits(s, it, 8); // ignore
        xx.fl.push(_bits(s, it, 8)); // vorbis_mapping_submap_floor
        xx.re.push(_bits(s, it, 8)); // vorbis_mapping_submap_residue
      }
      x.mp.push(xx);
    }
    // modes
    n = _bits(s, it, 6) + 1;
    for (i = 0; i < n; i++) {
      xx = {};
      xx.bl = _bit(s, it);
      xx.wt = _bits(s, it, 16);
      xx.tt = _bits(s, it, 16);
      xx.mp = _bits(s, it, 8);
      f = _bit(s, it);
      x.md.push(xx);
    }
    return x;
  }
  function _vorbis(s, w) {
    var i, m, n, f;
    var it = { p: 0, b: 0 };
    f = _bit(s, it);
    if (f) return;
    m = _ilog(w.md.length - 1);
    m = m ? _bits(s, it, m) : 0; // mode_number
//console.log(w.md[m]);
    if (w.md[m].bl) {
      n = w.blk1;
      console.log('Vorbis: long windows are not yet supported');
      return;
    }
    else {
      n = w.blk0;
//console.log(n);
    }
    //console.log(w.mp[[w.md[m].mp]]);
    //console.log(w);
    //console.log('audio');
    for (i = 0; i < w.chan; i++) {

    }
    return true;
  }
  OGG.prototype.load = function(s) {
    var i, p, f, t, m, n, a, x;
    var b = '';
    var current = {};
    var all = [];
    for (p = 0; p != -1; p = s.indexOf('OggS', p)) {
      p += 4;
      //s.charCodeAt(p); // version = 0
      p += 1;
      f = s.charCodeAt(p); // flag: f&1 - cont/fresh; f&2 - first; f&4 - last
      p += 1;
      t = _s82n(s.substr(p, 8)); // time
      p += 8;
      m = _s42n(s.substr(p, 4)); // stream id
      p += 4;
      //_s42n(s.substr(p, 4)); // seq num
      p += 4;
      // checksum
      p += 4;
      n = s.charCodeAt(p);
      p += 1;
      a = [];
      for (i = 0; i < n; i++) {
        a.push(s.charCodeAt(p));
        p += 1;
      }
      for (i = 0; i < a.length; i++) {
        b += s.substr(p, a[i]);
        if (a[i] < 255) {
          if (current[m]) {
            if (!current[m].comm) {
              x = _vorbis2(b);
              if (!x) throw new Error('Bad OGG file');
              OGG.onChunk(b);
              current[m].comm = x;
            }
            else if (!current[m].cb) {
              x = _vorbis3(b, current[m]);
              if (!x) throw new Error('Bad OGG file');
              OGG.onChunk(b);
              current[m].cb = x.cb;
              current[m].fl = x.fl;
              current[m].re = x.re;
              current[m].mp = x.mp;
              current[m].md = x.md;
            }
            else {
              //console.log(i, a[i], f);
              x = _vorbis(b, current[m]);
              if (!x) continue;
              OGG.onChunk(b);
            }
          }
          else {
            x = _vorbis1(b);
            current[m] = x;
            OGG.onChunk(b);
          }
          b = '';
        }
        p += a[i];
      }
      if ((f&4) && current[m]) {
        all.push(current[m]);
        delete current[m];
      }
    }
  };
  OGG.prototype.smpl = function() {
    return '';
  };
  SF2.OGG = OGG;

  JZZ.MIDI.SF2 = SF2;
});
