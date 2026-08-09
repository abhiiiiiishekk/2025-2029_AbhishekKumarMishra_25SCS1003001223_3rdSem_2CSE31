import kaziranga from './kaziranga';
import corbett from './corbett';
import ranthambore from './ranthambore';
import bandipur from './bandipur';
import nagarhole from './nagarhole';
import kanha from './kanha';
import sundarbans from './sundarbans';
import periyar from './periyar';
import gir from './gir';
import manas from './manas';

export const ALL_PARKS = [kaziranga, corbett, ranthambore, bandipur, nagarhole, kanha, sundarbans, periyar, gir, manas];

export const getParkById = (id) => ALL_PARKS.find(p => p.id === id);

export default ALL_PARKS;
