/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FlatOwner, Vehicle } from '../types';

export const RAW_OWNERS_A: Record<number, { nameEn: string; nameGu: string; phone: string }> = {
  201: { nameEn: 'MADHURI NANDHA SANGHAVI', nameGu: 'માધુરી નાંઢા સંઘવી', phone: '' },
  202: { nameEn: 'YATINBHAI MASHRU', nameGu: 'યતિનભાઇ મશરૂ', phone: '9824329558' },
  203: { nameEn: 'VIJAY H. KARIA', nameGu: 'વિજય એચ. કારીયા', phone: '9825781900' },
  301: { nameEn: 'VISHAL BHAVINBHAI HINDOCHA', nameGu: 'વિશાલ ભાવીનભાઇ હીંડોચા', phone: '9825220709' },
  302: { nameEn: 'NIRAV VRUJLAL KARIA', nameGu: 'નિરવ વૃજલાલ કારીયા', phone: '9825225451' },
  303: { nameEn: 'VIVEK (RAJ) GANDUBHAI GADHIYA', nameGu: 'વિવેક (રાજ) ગાંડુભાઇ ગઢીયા', phone: '9624576760' },
  304: { nameEn: 'JAGDISH C. SHINGALA', nameGu: 'જગદિશ સી. શીંગાળા', phone: '9426135326' },
  401: { nameEn: 'KUSHAL VASANTRAY TIMBADIA', nameGu: 'કુશલ વસંતરાય ટીંબડીયા', phone: '9428441600' },
  402: { nameEn: 'DR. ARVIND SISODIYA', nameGu: 'ડૉ.ઓરવિંદ સીસોદીયા', phone: '9909187971' },
  403: { nameEn: 'VIMALBEN RASIKBHAI DAVDA', nameGu: 'વિમલબેન રસીકભાઇ દાવડા', phone: '7874151955' },
  501: { nameEn: 'SEEMA NIRAV PUROHIT', nameGu: 'સીમા નિરવ પુરોહીત', phone: '9825220311' },
  502: { nameEn: 'VIJAY RATILAL DHANESHA', nameGu: 'વિજય રતીલાલ ધનેશા', phone: '9428088707' },
  503: { nameEn: 'PRITESH JITENDRABHAI PAIDA', nameGu: 'પ્રિતેશ જીતેન્દ્રભાઇ પૈડા', phone: '8128273022' },
  504: { nameEn: 'JADAVBHAI KANABHAI RAM', nameGu: 'જાદવભાઇ કાનાભાઇ રામ', phone: '9428187694' },
  601: { nameEn: 'NITABEN MANISHBHAI YADAV', nameGu: 'નિતાબેન મનિષભાઇ યાદવ', phone: '9727715652' },
  602: { nameEn: 'GOVIND CHAVDA', nameGu: 'ગોવિંદ ચાવડા', phone: '9368411111' },
  603: { nameEn: 'RAMESHBHAI MULJIBHAI SODHA', nameGu: 'રમેશભાઇ મુળજીભાઇ સોઢા', phone: '9428249383' },
  604: { nameEn: 'BHARATBHAI PITHIYA', nameGu: 'ભરતભાઇ પીઠીયા', phone: '9904004522' },
  701: { nameEn: 'MITUL KIRITBHAI MAHETA', nameGu: 'મિતુલ કીરીટભાઇ મહેતા', phone: '9825858583' },
  702: { nameEn: 'DHRUVILBHAI MANIYAR', nameGu: 'ધ્રુવિલભાઇ મણીયાર', phone: '9979047471' },
  703: { nameEn: 'JITENDRA C. NATHWANI', nameGu: 'જીતેન્દ્ર સી. નથવાણી', phone: '9824187900' },
  704: { nameEn: 'PARESHBHAI DESAI', nameGu: 'પરેશભાઇ દેસાઇ', phone: '9825728082' },
  801: { nameEn: 'HASMUKHBHAI J. RATANPARA', nameGu: 'હસમુખભાઇ જે. રતનપરા', phone: '9824218600' },
  802: { nameEn: 'KETANKUMAR JAYANTILAL KACHHADIYA', nameGu: 'કેતનકુમાર જયંતિલાલ કાછડીયા', phone: '9727780905' },
  803: { nameEn: 'CHINTAN VRUJLAL KARIA', nameGu: 'ચિંતન વૃજલાલ કારીયા', phone: '9428262580' },
  804: { nameEn: 'PARESHBHAI KARIA', nameGu: 'પરેશભાઇ કારીયા', phone: '' },
  901: { nameEn: 'NALIN ALABHAI ODEDARA', nameGu: 'નલીન આલાભાઇ ઓડેદરા', phone: '9824295982' },
  902: { nameEn: 'SUNIL NARANDAS CHANIYARA', nameGu: 'સુનિલ નારણદાસ ચનીયારા', phone: '9426982191' },
  903: { nameEn: 'MOHIT PRAVINBHAI TANK', nameGu: 'મોહિત પ્રવિણભાઇ ટાંક', phone: '9537820006' },
  1001: { nameEn: 'BHAVIK MAHENDRABHAI JADAV', nameGu: 'ભાવિક મેહેન્દ્રભાઇ જાદવ', phone: '9824233655' },
  1002: { nameEn: 'DEVYANI B. KAMBALIYA', nameGu: 'નિરૂબેન કાંબલીયા', phone: '9998023380' },
  1003: { nameEn: 'PRAKASH MODHWADIA', nameGu: 'પ્રકાશ મોઢવાડીયા', phone: '9316662724' },
  1101: { nameEn: 'DR. JAYESH ALABHAI ODEDARA', nameGu: 'ડૉ.જયેશ આલાભાઇ ઓડેદરા', phone: '9824295982' },
  1102: { nameEn: 'DALSANIA NANDLALBHAI ANANDBHAI', nameGu: 'દલસાણીયા નંદલાલભાઇ આણંદભાઇ', phone: '9428378934' },
  1103: { nameEn: 'VINUBHAI CHANIYARA', nameGu: 'વિનુભાઇ ચનીયારા', phone: '9825142708' },
  1201: { nameEn: 'CHETNABEN SATISHBHAI DAVE', nameGu: 'ચેતનાબેન સતિષભાઇ દવે', phone: '9662513213' }
};

export const RAW_OWNERS_B: Record<number, { nameEn: string; nameGu: string; phone: string }> = {
  101: { nameEn: 'SHASIKANT JOSHI (RENTER)', nameGu: 'શશીકાત જોષી (ભાડુઆત)', phone: '9978441034' },
  102: { nameEn: 'MITESH V. HIRPARA', nameGu: 'મિતેષ વી. હિરપરા', phone: '8160698908' },
  103: { nameEn: 'DR. RAMYATA DAYATAR', nameGu: 'ડૉ.રમ્યતા દયાતર', phone: '9429047979' },
  104: { nameEn: 'RAVIBHAI PRAKASHCHANDRA KARIA', nameGu: 'રવિભાઇ પ્રકાશચંદ્ર કારીયા', phone: '8780163117' },
  201: { nameEn: 'CHETAN CHHAGANBHAI MARU', nameGu: 'ચેતન છગનભાઇ મારૂ', phone: '9427739252' },
  202: { nameEn: 'TEJASBHAI B. UNADKAT', nameGu: 'તેજસભાઇ બી. ઉનડકટ', phone: '9824510500' },
  203: { nameEn: 'YASH HITESHBHAI BHUPTANI', nameGu: 'યશ હિતેશભાઇ ભુપતાણી', phone: '9409123459' },
  204: { nameEn: 'DHARMENDRA BABULAL OZA', nameGu: 'ધર્મેન્દ્ર બાબુલાલ ઓઝા', phone: '9427446795' },
  301: { nameEn: 'DR.JIGNESH PRAVINBHAI SAMTA', nameGu: 'ડૉ.જીગ્નેશ પ્રવિણભાઇ સામતા', phone: '9426444290' },
  302: { nameEn: 'KETAN SURYAKANT KARIA', nameGu: 'કેતન સુર્યકાન્ત કારીયા', phone: '9227810111' },
  303: { nameEn: 'ATUL CHHAGANBHAI MARU', nameGu: 'અતુલ છગનભાઇ મારૂ', phone: '9924325716' },
  304: { nameEn: 'GIRISHBHAI S. ANADA', nameGu: 'ગીરીશભાઇ એસ. અનડા', phone: '9265377120' },
  401: { nameEn: 'SHANTILAL DRARKADAS UNADKAT', nameGu: 'શાંતિલાલ દ્વારકાદાસ ઉનડકટ', phone: '9824277076' },
  402: { nameEn: 'DINESHBHAI ZALA', nameGu: 'દિનેશભાઇ ઝાલા', phone: '9879477727' },
  403: { nameEn: 'VIJAYBHAI KAKUBHAI VYAS', nameGu: 'વિજયભાઇ કાકુભાઇ વ્યાસ', phone: '9427496836' },
  404: { nameEn: 'SANDIP JITEDNRABHAI SANGANI', nameGu: 'સંદિપ જીતેન્દ્રભાઇ સાંગાણી', phone: '9426732248' },
  501: { nameEn: 'CA PRATIK SURESHBHAI UNADKAT', nameGu: 'CA. પ્રતિક સુરેશભાઇ ઉનડકટ', phone: '9722802950' },
  502: { nameEn: 'DR.DHARMESH N. CHETARIYA', nameGu: 'ડૉ. ધર્મેશ એન. ચેતરીયા', phone: '9427268488' },
  503: { nameEn: 'PRAKASHBHAI HIRANI', nameGu: 'પ્રકાશભાઇ હિરાણી', phone: '9913236902' },
  504: { nameEn: 'KAUSHIKBHAI PUROHIT', nameGu: 'કૌશીકભાઇ પુરોહીતા', phone: '9909026986' },
  601: { nameEn: 'DIPTIBEN JITENDRA JHALA', nameGu: 'દિપ્તીબેન જીતેન્દ્ર ઝાલા', phone: '9428242708' },
  602: { nameEn: 'HIREN RAMESHBHAI POPAT', nameGu: 'હિરેન રમેશભાઇ પોપટ', phone: '9909231429' },
  603: { nameEn: 'JIGNESH CHIMANLAL KARIA', nameGu: 'જીગ્નેશ ચીમનલાલ કારીયા', phone: '9879129901' },
  604: { nameEn: 'KAMLESH M. RATHOD', nameGu: 'કમલેશ એમ. રાઠોડ', phone: '7874151955' },
  701: { nameEn: 'SURESHBHAI JAGDISHCHANDRA POPAT', nameGu: 'સુરેશભાઇ જગદીશચંદ્ર પોપટ', phone: '9408894883' },
  702: { nameEn: 'BHAVINBHAI MANEK', nameGu: 'ભાવીનભાઇ માણેક', phone: '9054625184' },
  703: { nameEn: 'MANOJ NANDLAL BHUPTANI', nameGu: 'મનોજ નંદલાલ ભુતપાની', phone: '9726066967' },
  704: { nameEn: 'CHETAN VINODRAI BHATT', nameGu: 'ચેતન વિનોદરાય ભટ્ટ', phone: '7801874000' },
  801: { nameEn: 'MANISHBHAI BUDHHBHATTI', nameGu: 'મનિષભાઇ બુધ્ધભટ્ટી', phone: '8160429850' },
  802: { nameEn: 'TANK NANJIBHAI KHIMJIBHAI', nameGu: 'ટાંક નાનજીભાઇ ખીમજીભાઇ', phone: '9327726259' },
  803: { nameEn: 'VIMAL ANILKUMAR LAKHANI', nameGu: 'વિમલ અનિલકુમાર લાખાણી', phone: '9879455150' },
  804: { nameEn: 'SURESH M. BHATT', nameGu: 'સુરેશ એમ. ભટ્ટ', phone: '9601032732' },
  901: { nameEn: 'BHIKHABHAI NARANBHAI MAKWANA', nameGu: 'ભીખાભાઇ નારણભાઇ મકવાણા', phone: '8849240127' },
  902: { nameEn: 'RAMBHAI BHIKHABHAI MAKWANA', nameGu: 'રામભાઇ ભીખાભાઇ મકવાણા', phone: '8849240127' },
  903: { nameEn: 'HITESHKUMAR C. KANTARIYA', nameGu: 'હિતેશકુમાર સી. કંટારીયા', phone: '9925393711' },
  904: { nameEn: 'ARUN BHUTAIYA', nameGu: 'અરૂણ ભુતૈયા', phone: '9825648395' },
  1001: { nameEn: 'KESHUBHAI D. PATEL', nameGu: 'કેશુભાઇ ડી. પટેલ', phone: '9426220937' },
  1002: { nameEn: 'DHARMESHBHAI KARSANBHAI DAVARA', nameGu: 'ધર્મેશભાઇ કરશનભાઇ ડાવરા', phone: '9427702124' },
  1003: { nameEn: 'PARESH RAVINDRABHAI DAVARA', nameGu: 'પરેશ રવિન્દ્રભાઇ ડાવરા', phone: '9879758627' },
  1004: { nameEn: 'DR. TRUPTIBEN K. VYAS', nameGu: 'ડૉ.તૃપ્તિબેન કે. વ્યાસ', phone: '9662030836' },
  1101: { nameEn: 'BAKULBHAI D. TAILI', nameGu: 'બકુલભાઇ ડી. તૈલી', phone: '7778959477' },
  1102: { nameEn: 'ASHVIN VITHALBHAI BHESANIYA', nameGu: 'અશ્વિન વિઠ્ઠલભાઇ ભેંસાણીયા', phone: '9974817482' },
  1103: { nameEn: 'SIHAL KESHUBHAI ODEDARA', nameGu: 'સિંહલ કેશુભાઇ ઓડેદરા', phone: '9825138905' },
  1104: { nameEn: 'RAHUL JASHVANTRAI POPAT', nameGu: 'રાહુલ જશવંતરાય પોપટ', phone: '9898180810' }, // This is the Admin too!
  1201: { nameEn: 'ATUL JERAMBHAI BUTANI', nameGu: 'અતુલ જેરામભાઇ બુટાણી', phone: '9979876303' },
  1202: { nameEn: 'CHANDRAKANT N. JADAV', nameGu: 'ચંદ્રકાન્ત એન. જાદવ', phone: '9909230477' },
  1203: { nameEn: 'MUKESH N. CHUDASAMA', nameGu: 'મુકેશ એન. ચુડાસમા', phone: '9892063606' },
  1204: { nameEn: 'BHARATBHAI MANDAVIYA', nameGu: 'ભરતભાઇ માંડવીયા', phone: '8347026516' }
};

export function getInitialOwners(): FlatOwner[] {
  const list: FlatOwner[] = [];
  const wings: ('A' | 'B')[] = ['A', 'B'];

  for (const wing of wings) {
    const rawMap = wing === 'A' ? RAW_OWNERS_A : RAW_OWNERS_B;
    // Generate 12 floors x 4 flats = 48 flats per wing
    for (let floor = 1; floor <= 12; floor++) {
      for (let flatIndex = 1; flatIndex <= 4; flatIndex++) {
        const flatNo = floor * 100 + flatIndex;
        const raw = rawMap[flatNo];
        const flatKey = `${wing}-${flatNo}`;
        const rawVehicles = VEHICLES_DATA_MAP[flatKey] || [];
        const vehicles = rawVehicles.map(v => ({
          ...v,
          parkingPlot: v.type === 'fourwheeler' ? v.parkingPlot : undefined
        }));

        if (raw) {
          list.push({
            wing,
            flatNo,
            nameEn: raw.nameEn,
            nameGu: raw.nameGu,
            phone: raw.phone,
            secondaryContact: '',
            members: [],
            vehicles
          });
        } else {
          list.push({
            wing,
            flatNo,
            nameEn: `Vacant / Owner Flat ${wing}-${flatNo}`,
            nameGu: `ખાલી ફ્લેટ ${wing}-${flatNo}`,
            phone: '',
            secondaryContact: '',
            members: [],
            vehicles
          });
        }
      }
    }
  }

  return list;
}

export const VEHICLES_DATA_MAP: Record<string, Vehicle[]> = {
  // Wing A
  'A-201': [
    { id: 'v_a201_1', type: 'fourwheeler', plateNumber: 'GJ11-CQ-9963', brandModel: 'Car' },
    { id: 'v_a201_2', type: 'twowheeler', plateNumber: 'GJ-11-CN-9963', brandModel: 'Bike' },
    { id: 'v_a201_3', type: 'twowheeler', plateNumber: 'GJ-11-CJ-9963', brandModel: 'Bike' }
  ],
  'A-301': [
    { id: 'v_a301_1', type: 'fourwheeler', plateNumber: 'GJ-11-CQ-9450', brandModel: 'Car' },
    { id: 'v_a301_2', type: 'twowheeler', plateNumber: 'GJ-11-AM-9450', brandModel: 'Bike' },
    { id: 'v_a301_3', type: 'twowheeler', plateNumber: 'GJ-11-BS-9450', brandModel: 'Bike' }
  ],
  'A-302': [
    { id: 'v_a302_1', type: 'fourwheeler', plateNumber: 'GJ-11-BR-8660', brandModel: 'Car' },
    { id: 'v_a302_2', type: 'twowheeler', plateNumber: 'GJ-11-CJ-3687', brandModel: 'Bike' },
    { id: 'v_a302_3', type: 'twowheeler', plateNumber: 'GJ-11-CP-7894', brandModel: 'Bike' }
  ],
  'A-303': [
    { id: 'v_a303_1', type: 'fourwheeler', plateNumber: 'GJ-11-DB-4290', brandModel: 'Car' },
    { id: 'v_a303_2', type: 'twowheeler', plateNumber: 'GJ-11-BG-4290', brandModel: 'Bike' },
    { id: 'v_a303_3', type: 'twowheeler', plateNumber: 'GJ-11-CP-4290', brandModel: 'Bike' }
  ],
  'A-304': [
    { id: 'v_a304_1', type: 'fourwheeler', plateNumber: 'GJ-11-CD-6422', brandModel: 'Car' },
    { id: 'v_a304_2', type: 'twowheeler', plateNumber: 'GJ-11-AM-5795', brandModel: 'Bike' },
    { id: 'v_a304_3', type: 'twowheeler', plateNumber: 'GJ-11-CB-0226', brandModel: 'Bike' },
    { id: 'v_a304_4', type: 'twowheeler', plateNumber: 'E-BIKE', brandModel: 'E-Bike' }
  ],
  'A-401': [
    { id: 'v_a401_1', type: 'fourwheeler', plateNumber: 'GJ-11-CQ-4572', brandModel: 'Car' },
    { id: 'v_a401_2', type: 'fourwheeler', plateNumber: 'GJ-11-BR-8811', brandModel: 'Car' },
    { id: 'v_a401_3', type: 'twowheeler', plateNumber: 'GJ-03-LQ-9988', brandModel: 'Bike' },
    { id: 'v_a401_4', type: 'twowheeler', plateNumber: 'GJ-11-CN-0900', brandModel: 'Bike' },
    { id: 'v_a401_5', type: 'twowheeler', plateNumber: 'GJ-11-CR-9990', brandModel: 'Bike' }
  ],
  'A-402': [
    { id: 'v_a402_1', type: 'fourwheeler', plateNumber: 'GJ-11-CL-6410', brandModel: 'Car' },
    { id: 'v_a402_2', type: 'fourwheeler', plateNumber: 'GJ-11-CQ-8651', brandModel: 'Car' },
    { id: 'v_a402_3', type: 'twowheeler', plateNumber: 'GJ-03-PH-1989', brandModel: 'Bike' }
  ],
  'A-501': [
    { id: 'v_a501_1', type: 'fourwheeler', plateNumber: 'GJ-11-CQ-4952', brandModel: 'Car' },
    { id: 'v_a501_2', type: 'fourwheeler', plateNumber: 'GJ-11-CQ-5063', brandModel: 'Car' },
    { id: 'v_a501_3', type: 'twowheeler', plateNumber: 'GJ-11-LL-6456', brandModel: 'Bike' },
    { id: 'v_a501_4', type: 'twowheeler', plateNumber: 'GJ-11-CJ-0260', brandModel: 'Bike' }
  ],
  'A-502': [
    { id: 'v_a502_1', type: 'fourwheeler', plateNumber: 'GJ-11-CL-2070', brandModel: 'Car' },
    { id: 'v_a502_2', type: 'twowheeler', plateNumber: 'GJ-11-BM-6404', brandModel: 'Bike' },
    { id: 'v_a502_3', type: 'twowheeler', plateNumber: 'GJ-11-CR-4041', brandModel: 'Bike' },
    { id: 'v_a502_4', type: 'twowheeler', plateNumber: 'GJ-11-BS-1812', brandModel: 'Bike' }
  ],
  'A-503': [
    { id: 'v_a503_1', type: 'fourwheeler', plateNumber: 'GJ-27-DM-6143', brandModel: 'Car' },
    { id: 'v_a503_2', type: 'twowheeler', plateNumber: 'GJ-11-CJ-7181', brandModel: 'Bike' },
    { id: 'v_a503_3', type: 'twowheeler', plateNumber: 'GJ-11-QQ-9897', brandModel: 'Bike' }
  ],
  'A-504': [
    { id: 'v_a504_1', type: 'fourwheeler', plateNumber: 'GJ-11-BR-2509', brandModel: 'Car' },
    { id: 'v_a504_2', type: 'twowheeler', plateNumber: 'GJ-11-AE-1853', brandModel: 'Bike' },
    { id: 'v_a504_3', type: 'twowheeler', plateNumber: 'GJ-11-CN-8736', brandModel: 'Bike' }
  ],
  'A-602': [
    { id: 'v_a602_1', type: 'fourwheeler', plateNumber: 'GJ-11-CH-8000', brandModel: 'Car' },
    { id: 'v_a602_2', type: 'fourwheeler', plateNumber: 'GJ-11-BR-9009', brandModel: 'Car' },
    { id: 'v_a602_3', type: 'twowheeler', plateNumber: 'GJ-11-EB-8000', brandModel: 'Bike' },
    { id: 'v_a602_4', type: 'twowheeler', plateNumber: 'GJ-11-AF-8000', brandModel: 'Bike' }
  ],
  'A-603': [
    { id: 'v_a603_1', type: 'fourwheeler', plateNumber: 'GJ-11-BR-2095', brandModel: 'Car' },
    { id: 'v_a603_2', type: 'twowheeler', plateNumber: 'GJ-11-CA-0153', brandModel: 'Bike' },
    { id: 'v_a603_3', type: 'twowheeler', plateNumber: 'GJ-11-CS-1954', brandModel: 'Bike' },
    { id: 'v_a603_4', type: 'twowheeler', plateNumber: 'GJ-11-CF-9769', brandModel: 'Bike' }
  ],
  'A-702': [
    { id: 'v_a702_1', type: 'fourwheeler', plateNumber: 'GJ-05-JC-0437', brandModel: 'Car' },
    { id: 'v_a702_2', type: 'twowheeler', plateNumber: 'GJ-11-AJ-1095', brandModel: 'Bike' },
    { id: 'v_a702_3', type: 'twowheeler', plateNumber: 'GJ-11-BD-5898', brandModel: 'Bike' },
    { id: 'v_a702_4', type: 'twowheeler', plateNumber: 'GJ-11-L-5994', brandModel: 'Bike' }
  ],
  'A-704': [
    { id: 'v_a704_1', type: 'fourwheeler', plateNumber: 'GJ-11-AB-5790', brandModel: 'Car' },
    { id: 'v_a704_2', type: 'twowheeler', plateNumber: 'GJ-11-CG-0773', brandModel: 'Bike' },
    { id: 'v_a704_3', type: 'twowheeler', plateNumber: 'GJ-11-CP-7813', brandModel: 'Bike' }
  ],
  'A-801': [
    { id: 'v_a801_1', type: 'fourwheeler', plateNumber: 'GJ-11-S-3949', brandModel: 'Car' },
    { id: 'v_a801_2', type: 'twowheeler', plateNumber: 'GJ-11-CR-0934', brandModel: 'Bike' },
    { id: 'v_a801_3', type: 'twowheeler', plateNumber: 'GJ-11-BF-3931', brandModel: 'Bike' }
  ],
  'A-802': [
    { id: 'v_a802_1', type: 'fourwheeler', plateNumber: 'GJ-11-S-8651', brandModel: 'Car' },
    { id: 'v_a802_2', type: 'twowheeler', plateNumber: 'GJ-11-AM-8651', brandModel: 'Bike' },
    { id: 'v_a802_3', type: 'twowheeler', plateNumber: 'GJ-11-CF-4966', brandModel: 'Bike' }
  ],
  'A-803': [
    { id: 'v_a803_1', type: 'twowheeler', plateNumber: 'GJ-11-CF-1461', brandModel: 'Bike' },
    { id: 'v_a803_2', type: 'twowheeler', plateNumber: 'GJ-11-BG-6981', brandModel: 'Bike' }
  ],
  'A-901': [
    { id: 'v_a901_1', type: 'fourwheeler', plateNumber: 'GJ-11-CH-2900', brandModel: 'Car' },
    { id: 'v_a901_2', type: 'twowheeler', plateNumber: 'GJ-11-CG-3305', brandModel: 'Bike' },
    { id: 'v_a901_3', type: 'twowheeler', plateNumber: 'GJ-11-EA-48736', brandModel: 'Bike' },
    { id: 'v_a901_4', type: 'twowheeler', plateNumber: 'GJ-11-BM-4674', brandModel: 'Bike' }
  ],
  'A-902': [
    { id: 'v_a902_1', type: 'fourwheeler', plateNumber: 'GJ-03-LM-6801', brandModel: 'Car' },
    { id: 'v_a902_2', type: 'twowheeler', plateNumber: 'GJ-11-CE-2508', brandModel: 'Bike' },
    { id: 'v_a902_3', type: 'twowheeler', plateNumber: 'GJ-11-PP-2164', brandModel: 'Bike' }
  ],
  'A-903': [
    { id: 'v_a903_1', type: 'fourwheeler', plateNumber: 'GJ-11-BR-2668', brandModel: 'Car' },
    { id: 'v_a903_2', type: 'twowheeler', plateNumber: 'GJ-11-BG-6222', brandModel: 'Bike' },
    { id: 'v_a903_3', type: 'twowheeler', plateNumber: 'GJ-11-BA-3555', brandModel: 'Bike' }
  ],
  'A-1001': [
    { id: 'v_a1001_1', type: 'fourwheeler', plateNumber: 'GJ-11-AS-6929', brandModel: 'Car' },
    { id: 'v_a1001_2', type: 'twowheeler', plateNumber: 'GJ-11-CK-4590', brandModel: 'Bike' },
    { id: 'v_a1001_3', type: 'twowheeler', plateNumber: 'GJ-11-CP-4590', brandModel: 'Bike' },
    { id: 'v_a1001_4', type: 'twowheeler', plateNumber: 'GJ-11-CF-4590', brandModel: 'Bike' },
    { id: 'v_a1001_5', type: 'twowheeler', plateNumber: 'GJ-11-CN-4590', brandModel: 'Bike' }
  ],
  'A-1003': [
    { id: 'v_a1003_1', type: 'fourwheeler', plateNumber: 'GJ-11-CQ-6780', brandModel: 'Car' },
    { id: 'v_a1003_2', type: 'twowheeler', plateNumber: 'GJ-11-CE-0650', brandModel: 'Bike' },
    { id: 'v_a1003_3', type: 'twowheeler', plateNumber: 'GJ-20-AJ-0111', brandModel: 'Bike' }
  ],
  'A-1102': [
    { id: 'v_a1102_1', type: 'fourwheeler', plateNumber: 'GJ-06-KH-7598', brandModel: 'Car' },
    { id: 'v_a1102_2', type: 'twowheeler', plateNumber: 'GJ-11-AP-5671', brandModel: 'Bike' },
    { id: 'v_a1102_3', type: 'twowheeler', plateNumber: 'GJ-11-CM-1693', brandModel: 'Bike' },
    { id: 'v_a1102_4', type: 'twowheeler', plateNumber: 'GJ11BM6456', brandModel: 'Bike' }
  ],
  'A-1103': [
    { id: 'v_a1103_1', type: 'fourwheeler', plateNumber: 'GJ-03-2700', brandModel: 'Car' },
    { id: 'v_a1103_2', type: 'twowheeler', plateNumber: 'GJ-11-2700', brandModel: 'Bike' }
  ],
  'A-1201': [
    { id: 'v_a1201_1', type: 'fourwheeler', plateNumber: 'GJ-11-AB-8324', brandModel: 'Car' },
    { id: 'v_a1201_2', type: 'twowheeler', plateNumber: 'GJ-11-AC-0603', brandModel: 'Bike' },
    { id: 'v_a1201_3', type: 'twowheeler', plateNumber: 'GJ-23-BF-9338', brandModel: 'Bike' }
  ],

  // Wing B
  'B-101': [
    { id: 'v_b101_1', type: 'fourwheeler', plateNumber: 'GJ-11-9525', brandModel: 'Car', parkingPlot: 'G-8' },
    { id: 'v_b101_2', type: 'fourwheeler', plateNumber: 'GJ-10-BR-1936', brandModel: 'Car', parkingPlot: 'G-8' },
    { id: 'v_b101_3', type: 'twowheeler', plateNumber: 'GJ-11-C-5582', brandModel: 'Bike' }
  ],
  'B-102': [
    { id: 'v_b102_1', type: 'fourwheeler', plateNumber: 'GJ-11-CL-7709', brandModel: 'Car', parkingPlot: 'G-7' },
    { id: 'v_b102_2', type: 'twowheeler', plateNumber: 'GJ-11-CK-1396', brandModel: 'Bike' },
    { id: 'v_b102_3', type: 'twowheeler', plateNumber: 'GJ-27-FV-6662', brandModel: 'Bike' }
  ],
  'B-103': [
    { id: 'v_b103_1', type: 'fourwheeler', plateNumber: 'GJ-11-CH-2265', brandModel: 'Car', parkingPlot: 'G-21' },
    { id: 'v_b103_2', type: 'fourwheeler', plateNumber: 'GJ-3-KC-3995', brandModel: 'Car', parkingPlot: 'G-21' },
    { id: 'v_b103_3', type: 'twowheeler', plateNumber: 'GJ-3-DM-0032', brandModel: 'Bike' }
  ],
  'B-104': [
    { id: 'v_b104_1', type: 'fourwheeler', plateNumber: 'GJ-11-AS-9754', brandModel: 'Car', parkingPlot: 'G-14' },
    { id: 'v_b104_2', type: 'twowheeler', plateNumber: 'GJ-11-AQ-9874', brandModel: 'Bike' },
    { id: 'v_b104_3', type: 'twowheeler', plateNumber: 'GJ-11-AJ-5550', brandModel: 'Bike' }
  ],
  'B-201': [
    { id: 'v_b201_1', type: 'fourwheeler', plateNumber: 'GJ-11-DB-8939', brandModel: 'Car', parkingPlot: 'B-20' },
    { id: 'v_b201_2', type: 'twowheeler', plateNumber: 'GJ-11-BK-8939', brandModel: 'Bike' },
    { id: 'v_b201_3', type: 'twowheeler', plateNumber: 'GJ-11-CA-8939', brandModel: 'Bike' }
  ],
  'B-202': [
    { id: 'v_b202_1', type: 'fourwheeler', plateNumber: 'GJ-18-BB-3661', brandModel: 'Car', parkingPlot: 'G-2' },
    { id: 'v_b202_2', type: 'twowheeler', plateNumber: 'GJ-11-AE-9801', brandModel: 'Bike' },
    { id: 'v_b202_3', type: 'twowheeler', plateNumber: 'GJ-11-BL-9801', brandModel: 'Bike' }
  ],
  'B-203': [
    { id: 'v_b203_1', type: 'fourwheeler', plateNumber: 'GJ-32-B-3820', brandModel: 'Car', parkingPlot: 'B-22' },
    { id: 'v_b203_2', type: 'twowheeler', plateNumber: 'GJ-01-SV-5734', brandModel: 'Bike' },
    { id: 'v_b203_3', type: 'twowheeler', plateNumber: 'GJ-32-P-1969', brandModel: 'Bike' },
    { id: 'v_b203_4', type: 'twowheeler', plateNumber: 'GJ-11AC-3976', brandModel: 'Bike' }
  ],
  'B-204': [
    { id: 'v_b204_1', type: 'fourwheeler', plateNumber: 'GJ-11-CD-7227', brandModel: 'Car', parkingPlot: 'B-15' },
    { id: 'v_b204_2', type: 'twowheeler', plateNumber: 'GJ-21-C-2435', brandModel: 'Bike' },
    { id: 'v_b204_3', type: 'twowheeler', plateNumber: 'GJ-11-L-8428', brandModel: 'Bike' },
    { id: 'v_b204_4', type: 'twowheeler', plateNumber: 'GJ-21-C-2435', brandModel: 'Bike' }
  ],
  'B-301': [
    { id: 'v_b301_1', type: 'fourwheeler', plateNumber: 'GJ-11-BR-1801', brandModel: 'Car', parkingPlot: 'G-10' },
    { id: 'v_b301_2', type: 'fourwheeler', plateNumber: 'GJ-11-AS-0376', brandModel: 'Car', parkingPlot: 'G-10' },
    { id: 'v_b301_3', type: 'twowheeler', plateNumber: 'GJ-11-BN-6389', brandModel: 'Bike' },
    { id: 'v_b301_4', type: 'twowheeler', plateNumber: 'GJ-11-AE-3689', brandModel: 'Bike' }
  ],
  'B-302': [
    { id: 'v_b302_1', type: 'fourwheeler', plateNumber: 'GJ-11-CH-2895', brandModel: 'Car', parkingPlot: 'G-20' },
    { id: 'v_b302_2', type: 'twowheeler', plateNumber: 'GJ-11-BP-8688', brandModel: 'Bike' },
    { id: 'v_b302_3', type: 'twowheeler', plateNumber: 'GJ-11-BN-6066', brandModel: 'Bike' }
  ],
  'B-303': [
    { id: 'v_b303_1', type: 'fourwheeler', plateNumber: 'GJ-11-AB-8939', brandModel: 'Car', parkingPlot: 'B-25' },
    { id: 'v_b303_2', type: 'twowheeler', plateNumber: 'GJ-11-CE-8939', brandModel: 'Bike' },
    { id: 'v_b303_3', type: 'twowheeler', plateNumber: 'GJ-11-CJ-2406', brandModel: 'Bike' }
  ],
  'B-304': [
    { id: 'v_b304_1', type: 'fourwheeler', plateNumber: 'GJ-11-CQ-7282', brandModel: 'Car', parkingPlot: 'B-16' },
    { id: 'v_b304_2', type: 'twowheeler', plateNumber: 'GJ-11-BG-2186', brandModel: 'Bike' },
    { id: 'v_b304_3', type: 'twowheeler', plateNumber: 'GJ-11-CG-0243', brandModel: 'Bike' },
    { id: 'v_b304_4', type: 'twowheeler', plateNumber: 'GJ-11-CK-2223', brandModel: 'Bike' }
  ],
  'B-401': [
    { id: 'v_b401_1', type: 'fourwheeler', plateNumber: 'GJ-11-BH-9306', brandModel: 'Car', parkingPlot: 'B-3' },
    { id: 'v_b401_2', type: 'twowheeler', plateNumber: 'GJ-11-CM-5432', brandModel: 'Bike' },
    { id: 'v_b401_3', type: 'twowheeler', plateNumber: 'GJ-11-CB-5432', brandModel: 'Bike' }
  ],
  'B-402': [
    { id: 'v_b402_1', type: 'fourwheeler', plateNumber: 'GJ-01-RP-1576', brandModel: 'Car', parkingPlot: 'B-12' },
    { id: 'v_b402_2', type: 'twowheeler', plateNumber: 'GJ-11-AE-4446', brandModel: 'Bike' },
    { id: 'v_b402_3', type: 'twowheeler', plateNumber: 'GJ-11-AJ-6998', brandModel: 'Bike' }
  ],
  'B-403': [
    { id: 'v_b403_1', type: 'fourwheeler', plateNumber: 'GJ-01-HZ-4950', brandModel: 'Car', parkingPlot: 'B-4' },
    { id: 'v_b403_2', type: 'twowheeler', plateNumber: 'GJ-11-PP-5346', brandModel: 'Bike' },
    { id: 'v_b403_3', type: 'twowheeler', plateNumber: 'GJ-11-BN-6506', brandModel: 'Bike' }
  ],
  'B-404': [
    { id: 'v_b404_1', type: 'fourwheeler', plateNumber: 'GJ-03-ML-4809', brandModel: 'Car', parkingPlot: 'G-5' },
    { id: 'v_b404_2', type: 'twowheeler', plateNumber: 'GJ-03-LN-3313', brandModel: 'Bike' }
  ],
  'B-501': [
    { id: 'v_b501_1', type: 'fourwheeler', plateNumber: 'GJ-11-AB-4972', brandModel: 'Car', parkingPlot: 'B-11' },
    { id: 'v_b501_2', type: 'twowheeler', plateNumber: 'GJ-11-BL-5179', brandModel: 'Bike' },
    { id: 'v_b501_3', type: 'twowheeler', plateNumber: 'GJ-01-NM-9087', brandModel: 'Bike' }
  ],
  'B-502': [
    { id: 'v_b502_1', type: 'fourwheeler', plateNumber: 'GJ-36-AJ-5684', brandModel: 'Car', parkingPlot: 'G-19' },
    { id: 'v_b502_2', type: 'twowheeler', plateNumber: 'GJ-03-HN-1745', brandModel: 'Bike' }
  ],
  'B-503': [
    { id: 'v_b503_1', type: 'fourwheeler', plateNumber: 'GJ-11-CQ-3136', brandModel: 'Car', parkingPlot: 'G-3' },
    { id: 'v_b503_2', type: 'twowheeler', plateNumber: 'GJ-11-CB-1362', brandModel: 'Bike' },
    { id: 'v_b503_3', type: 'twowheeler', plateNumber: 'GJ-11-BN-6125', brandModel: 'Bike' }
  ],
  'B-504': [
    { id: 'v_b504_1', type: 'fourwheeler', plateNumber: 'GJ-11-CQ-5030', brandModel: 'Car', parkingPlot: 'G-6' },
    { id: 'v_b504_2', type: 'twowheeler', plateNumber: 'GJ-11-BC-3173', brandModel: 'Bike' },
    { id: 'v_b504_3', type: 'twowheeler', plateNumber: 'GJ-11-CF-5030', brandModel: 'Bike' }
  ],
  'B-601': [
    { id: 'v_b601_1', type: 'fourwheeler', plateNumber: 'GJ-11-CL-1793', brandModel: 'Car', parkingPlot: 'G-4' },
    { id: 'v_b601_2', type: 'twowheeler', plateNumber: 'GJ-11-BS-9624', brandModel: 'Bike' }
  ],
  'B-602': [
    { id: 'v_b602_1', type: 'twowheeler', plateNumber: 'GJ-25-N-7103', brandModel: 'Bike' },
    { id: 'v_b602_2', type: 'twowheeler', plateNumber: 'GJ-11-CG-7817', brandModel: 'Bike' }
  ],
  'B-603': [
    { id: 'v_b603_1', type: 'fourwheeler', plateNumber: 'GJ-12-FC-0225', brandModel: 'Car', parkingPlot: 'B-8' },
    { id: 'v_b603_2', type: 'twowheeler', plateNumber: 'GJ-32-F-7914', brandModel: 'Bike' },
    { id: 'v_b603_3', type: 'twowheeler', plateNumber: 'GJ-32-Q-2690', brandModel: 'Bike' }
  ],
  'B-604': [
    { id: 'v_b604_1', type: 'fourwheeler', plateNumber: 'GJ-11-CL-9986', brandModel: 'Car', parkingPlot: 'B-2' },
    { id: 'v_b604_2', type: 'twowheeler', plateNumber: 'GJ-01-VU-9367', brandModel: 'Bike' }
  ],
  'B-701': [
    { id: 'v_b701_1', type: 'fourwheeler', plateNumber: 'GJ-11-CQ-5590', brandModel: 'Car', parkingPlot: 'B-13' },
    { id: 'v_b701_2', type: 'twowheeler', plateNumber: 'GJ-11-AK-5503', brandModel: 'Bike' },
    { id: 'v_b701_3', type: 'twowheeler', plateNumber: 'E-BIKE', brandModel: 'E-Bike' }
  ],
  'B-702': [
    { id: 'v_b702_1', type: 'fourwheeler', plateNumber: 'GJ-11-BR-9835', brandModel: 'Car', parkingPlot: 'G-1' },
    { id: 'v_b702_2', type: 'twowheeler', plateNumber: 'GJ-11-CB-8089', brandModel: 'Bike' },
    { id: 'v_b702_3', type: 'twowheeler', plateNumber: 'GJ-11-CN-9506', brandModel: 'Bike' }
  ],
  'B-704': [
    { id: 'v_b704_1', type: 'fourwheeler', plateNumber: 'GJ-11-BH-9414', brandModel: 'Car', parkingPlot: 'B-6' },
    { id: 'v_b704_2', type: 'twowheeler', plateNumber: 'GJ-11-CE-1611', brandModel: 'Bike' },
    { id: 'v_b704_3', type: 'twowheeler', plateNumber: 'GJ-11-CK-9772', brandModel: 'Bike' }
  ],
  'B-801': [
    { id: 'v_b801_1', type: 'fourwheeler', plateNumber: 'GJ-11-CH-3079', brandModel: 'Car', parkingPlot: 'B-9' },
    { id: 'v_b801_2', type: 'twowheeler', plateNumber: 'GJ-11-CF-6557', brandModel: 'Bike' },
    { id: 'v_b801_3', type: 'twowheeler', plateNumber: 'GJ-11-BM-8463', brandModel: 'Bike' },
    { id: 'v_b801_4', type: 'twowheeler', plateNumber: 'GJ-11-CF-1866', brandModel: 'Bike' }
  ],
  'B-802': [
    { id: 'v_b802_1', type: 'fourwheeler', plateNumber: 'GJ-11-DB-8869', brandModel: 'Car', parkingPlot: 'B-10' },
    { id: 'v_b802_2', type: 'twowheeler', plateNumber: 'GJ-11-AL-5000', brandModel: 'Bike' },
    { id: 'v_b802_3', type: 'twowheeler', plateNumber: 'GJ-11-CL-8869', brandModel: 'Bike' }
  ],
  'B-803': [
    { id: 'v_b803_1', type: 'fourwheeler', plateNumber: 'GJ-11-CL-6202', brandModel: 'Car', parkingPlot: 'B-18' },
    { id: 'v_b803_2', type: 'twowheeler', plateNumber: 'GJ-11-CF-6756', brandModel: 'Bike' },
    { id: 'v_b803_3', type: 'twowheeler', plateNumber: 'GJ-11-CS-5109', brandModel: 'Bike' }
  ],
  'B-804': [
    { id: 'v_b804_1', type: 'fourwheeler', plateNumber: 'GJ-01-WA-2897', brandModel: 'Car', parkingPlot: 'G-11' },
    { id: 'v_b804_2', type: 'twowheeler', plateNumber: 'GJ-11-BK-3413', brandModel: 'Bike' },
    { id: 'v_b804_3', type: 'twowheeler', plateNumber: 'GJ-11-BB-7429', brandModel: 'Bike' },
    { id: 'v_b804_4', type: 'twowheeler', plateNumber: 'GJ-11-MM-1377', brandModel: 'Bike' }
  ],
  'B-901': [
    { id: 'v_b901_1', type: 'fourwheeler', plateNumber: 'GJ-11-CD-0930', brandModel: 'Car', parkingPlot: 'B-17' },
    { id: 'v_b901_2', type: 'twowheeler', plateNumber: 'GJ-11-CS-0930', brandModel: 'Bike' },
    { id: 'v_b901_3', type: 'twowheeler', plateNumber: 'GJ-03-PH-0930', brandModel: 'Bike' }
  ],
  'B-902': [
    { id: 'v_b902_1', type: 'twowheeler', plateNumber: 'GJ-03-NM-9030', brandModel: 'Bike' },
    { id: 'v_b902_2', type: 'twowheeler', plateNumber: 'GJ-11-AS-7455', brandModel: 'Bike' }
  ],
  'B-903': [
    { id: 'v_b903_1', type: 'fourwheeler', plateNumber: 'GJ-06-PN-0261', brandModel: 'Car', parkingPlot: 'G-23' },
    { id: 'v_b903_2', type: 'twowheeler', plateNumber: 'GJ-07-EJ-9420', brandModel: 'Bike' },
    { id: 'v_b903_3', type: 'twowheeler', plateNumber: 'GJ-10-DS-6813', brandModel: 'Bike' }
  ],
  'B-904': [
    { id: 'v_b904_1', type: 'fourwheeler', plateNumber: 'GJ-11-AB-3292', brandModel: 'Car', parkingPlot: 'B-23' },
    { id: 'v_b904_2', type: 'twowheeler', plateNumber: 'GJ-11-CM-4841', brandModel: 'Bike' }
  ],
  'B-1001': [
    { id: 'v_b1001_1', type: 'fourwheeler', plateNumber: 'GJ-38-BA-2151', brandModel: 'Car', parkingPlot: 'B-14' },
    { id: 'v_b1001_2', type: 'twowheeler', plateNumber: 'GJ-11-BL-5833', brandModel: 'Bike' }
  ],
  'B-1002': [
    { id: 'v_b1002_1', type: 'fourwheeler', plateNumber: 'GJ-11-BR-3207', brandModel: 'Car', parkingPlot: 'B-19' },
    { id: 'v_b1002_2', type: 'twowheeler', plateNumber: 'GJ-11-QR-9748', brandModel: 'Bike' },
    { id: 'v_b1002_3', type: 'twowheeler', plateNumber: 'GJ-11-DA-3309', brandModel: 'Bike' },
    { id: 'v_b1002_4', type: 'twowheeler', plateNumber: 'E-BIKE', brandModel: 'E-Bike' }
  ],
  'B-1003': [
    { id: 'v_b1003_1', type: 'fourwheeler', plateNumber: 'GJ-11-CD-2832', brandModel: 'Car', parkingPlot: 'G-22' },
    { id: 'v_b1003_2', type: 'twowheeler', plateNumber: 'GJ-11-BS-4293', brandModel: 'Bike' },
    { id: 'v_b1003_3', type: 'twowheeler', plateNumber: 'GJ-04-DF-1440', brandModel: 'Bike' }
  ],
  'B-1004': [
    { id: 'v_b1004_1', type: 'twowheeler', plateNumber: 'GJ-11-7521', brandModel: 'Bike' }
  ],
  'B-1101': [
    { id: 'v_b1101_1', type: 'fourwheeler', plateNumber: 'GJ-03-EC-3631', brandModel: 'Car', parkingPlot: 'G-9' },
    { id: 'v_b1101_2', type: 'twowheeler', plateNumber: 'GJ-03-JG-7406', brandModel: 'Bike' },
    { id: 'v_b1101_3', type: 'twowheeler', plateNumber: 'GJ-03-EN-9513', brandModel: 'Bike' }
  ],
  'B-1102': [
    { id: 'v_b1102_1', type: 'fourwheeler', plateNumber: 'GJ-11-BH-7089', brandModel: 'Car', parkingPlot: 'G-13' },
    { id: 'v_b1102_2', type: 'twowheeler', plateNumber: 'GJ-11-BL-4549', brandModel: 'Bike' },
    { id: 'v_b1102_3', type: 'twowheeler', plateNumber: 'GJ-11-CJ-8559', brandModel: 'Bike' },
    { id: 'v_b1102_4', type: 'twowheeler', plateNumber: 'GJ-11-BP-6740', brandModel: 'Bike' }
  ],
  'B-1103': [
    { id: 'v_b1103_1', type: 'fourwheeler', plateNumber: 'GJ-11-CL-6696', brandModel: 'Car', parkingPlot: 'B-21' },
    { id: 'v_b1103_2', type: 'fourwheeler', plateNumber: 'GJ-01-KR-5263', brandModel: 'Car', parkingPlot: 'B-21' },
    { id: 'v_b1103_3', type: 'fourwheeler', plateNumber: 'GJ-11-S-5963', brandModel: 'Car', parkingPlot: 'B-21' },
    { id: 'v_b1103_4', type: 'twowheeler', plateNumber: 'GJ-11-BM-6696', brandModel: 'Bike' },
    { id: 'v_b1103_5', type: 'twowheeler', plateNumber: 'GJ-25-F-6696', brandModel: 'Bike' }
  ],
  'B-1104': [
    { id: 'v_b1104_1', type: 'fourwheeler', plateNumber: 'GJ-06-FC-3887', brandModel: 'Car', parkingPlot: 'B-24' },
    { id: 'v_b1104_2', type: 'twowheeler', plateNumber: 'GJ-11-CE-4499', brandModel: 'Bike' },
    { id: 'v_b1104_3', type: 'twowheeler', plateNumber: 'GJ-11-AE-5610', brandModel: 'Bike' }
  ],
  'B-1201': [
    { id: 'v_b1201_1', type: 'fourwheeler', plateNumber: 'GJ-05-RQ-6582', brandModel: 'Car', parkingPlot: 'B-5' },
    { id: 'v_b1201_2', type: 'twowheeler', plateNumber: 'GJ-27-AF-3655', brandModel: 'Bike' }
  ],
  'B-1202': [
    { id: 'v_b1202_1', type: 'fourwheeler', plateNumber: 'GJ-11-AB-4079', brandModel: 'Car', parkingPlot: 'B-7' },
    { id: 'v_b1202_2', type: 'twowheeler', plateNumber: 'GJ-11-AK-1527', brandModel: 'Bike' },
    { id: 'v_b1202_3', type: 'twowheeler', plateNumber: 'GJ-11-AP-5473', brandModel: 'Bike' }
  ],
  'B-1203': [
    { id: 'v_b1203_1', type: 'fourwheeler', plateNumber: 'MH-02-EE-1526', brandModel: 'Car', parkingPlot: 'G-17' },
    { id: 'v_b1203_2', type: 'twowheeler', plateNumber: 'MH-02-FK-0256', brandModel: 'Bike' }
  ],
  'B-1204': [
    { id: 'v_b1204_1', type: 'twowheeler', plateNumber: 'GJ-11-CR-9416', brandModel: 'Bike' },
    { id: 'v_b1204_2', type: 'twowheeler', plateNumber: 'GJ-11-BS-5961', brandModel: 'Bike' }
  ]
};
