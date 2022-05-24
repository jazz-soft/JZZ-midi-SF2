var JZZ = require('jzz');
require('.')(JZZ);

var file = process.argv[2];
if (typeof file == 'undefined') file = 'test.sf2';
var data = require('fs').readFileSync(file, 'binary');
var sf = new JZZ.MIDI.SF2(data);
