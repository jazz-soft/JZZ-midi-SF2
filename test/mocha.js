var assert = require('assert');
var JZZ = require('jzz');
require('..')(JZZ);
var version = require('../package.json').version;

describe('SF', function() {
  it('version', function() {
    assert.equal(JZZ.MIDI.SF2.version(), version);
  });
  it('empty', function() {
    var sf = JZZ.MIDI.SF2();
    var s = sf.toString();
    sf = JZZ.MIDI.SF2(sf.dump());
    assert.equal(sf.toString(), s);
  });
});
