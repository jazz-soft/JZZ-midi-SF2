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
  function _n2s2(n) { return String.fromCharCode(n & 0xff) + String.fromCharCode(n >> 8); }
  function _n2s4(n) {
    return String.fromCharCode(n & 0xff) + String.fromCharCode((n >> 8) & 0xff) + String.fromCharCode((n >> 16) & 0xff) + String.fromCharCode((n >> 24) & 0xff);
  }

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

    this.Samples = [];
    for (i = 0; i < this.data.shdr.length - 1; i++) this.Samples.push(new Sample(this.data.shdr[i], this));
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

  SF2.prototype.dump = function() {
    var s = _dumpINFO(this.data);
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

  function _n2v(a) { return a ? a[0] + ('.0' + a[1]).substr(0, 3) : ''; }

  SF2.prototype.toString = function() {
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
    if (this.type & 14) this.link =  sf.Samples[a.link];
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
      22: 'Mod Frequency',
      24: 'Vibrato Frequency',
      34: 'Attack (v)',
      35: 'Hold (v)',
      36: 'Decay (v)',
      37: 'Sustain (v)',
      38: 'Release (v)',
      41: 'Instrument',
      43: 'Key Range',
      44: 'Velocity Range',
      46: 'Key',
      47: 'Velocity',
      48: 'Attenuation',
      53: 'Sample',
      54: 'Sample Flags'
    }[x] || x;
  }

  function genText(op, v) {
    switch (op) {
      case 15: case 16: case 17:
        return ((v & 0x8000) ? v - 0x10000 : v) / 10 + '%'; 
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

  function PGen(a, sf) {
    this.oper = a.oper;
    this.val = a.val;
    if (this.oper == 41) this.instr = sf.Instruments[this.val];
    this.name = genTitle(this.oper);
    this.text = genText(this.oper, this.val);
  }
  SF2.PGen = PGen;

  function initMod(g, a) {
    g.src = a.src;
    g.dest = a.dest;
    g.oper = a.oper;
    g.val = a.val;
    g.mod = a.mod;
    g.cc = !!(g.src & 0x80);
    if (g.cc) {
      g.name = 'xC ' + ('0' + (g.src & 0x7f).toString(16).toUpperCase()).substr(-2) + ' xx';
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

  function PMod(a) {
    initMod(this, a);
  }
  SF2.PMod = PMod;

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

  function Instrument(a, b, sf) {
    this.name = a.name;
    this.idx = [];
    for (var i = a.idx; i < b.idx; i++) {
      if (sf.IZones[i].gen.length || sf.IZones[i].mod.length) this.idx.push(sf.IZones[i]);
    }
  }
  SF2.Instrument = Instrument;

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
  JZZ.MIDI.SF2 = SF2;
});
