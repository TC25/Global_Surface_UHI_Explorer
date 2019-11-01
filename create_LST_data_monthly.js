/*Function to calculate area of each urban boundary*/
//var Ar = function(feature) {
//  var Ar= feature.area();
//  return feature.set({'City area': Ar});
//};
 
/*Import shapefiles of all urban areas in the world*/
//var urban=ee.FeatureCollection('ft:1ioS-xI9_uG41Lx1CRDfJEtMdfa3YjsNOWbs43nND');


/*Apply function to find area of each urban boundary*/
//var urban=urban.map(Ar);

/*World Geometry to export data and find global mean*/
var World=ee.Geometry.Rectangle(-180, -90, 180, 90);
var World=ee.Geometry(World, null, false);


//Regular years
// var JanFilter=ee.Filter.dayOfYear(1,31);
// var FebFilter=ee.Filter.dayOfYear(32,59);
// var MarFilter=ee.Filter.dayOfYear(60,90);
// var AprFilter=ee.Filter.dayOfYear(91,120);
// var MayFilter=ee.Filter.dayOfYear(121,151);
// var JunFilter=ee.Filter.dayOfYear(152,181);
// var JulFilter=ee.Filter.dayOfYear(182,212);
// var AugFilter=ee.Filter.dayOfYear(213,243);
// var SepFilter=ee.Filter.dayOfYear(244,273);
// var OctFilter=ee.Filter.dayOfYear(274,304);
// var NovFilter=ee.Filter.dayOfYear(305,334);
// var DecFilter=ee.Filter.dayOfYear(335,365);

//Leap years
var JanFilter=ee.Filter.dayOfYear(1,31);
var FebFilter=ee.Filter.dayOfYear(32,60);
var MarFilter=ee.Filter.dayOfYear(61,91);
var AprFilter=ee.Filter.dayOfYear(92,121);
var MayFilter=ee.Filter.dayOfYear(122,152);
var JunFilter=ee.Filter.dayOfYear(153,182);
var JulFilter=ee.Filter.dayOfYear(183,213);
var AugFilter=ee.Filter.dayOfYear(214,244);
var SepFilter=ee.Filter.dayOfYear(245,274);
var OctFilter=ee.Filter.dayOfYear(275,305);
var NovFilter=ee.Filter.dayOfYear(306,335);
var DecFilter=ee.Filter.dayOfYear(336,366);


/*Import the images containing the 16-year median values of daytime LST and nighttime LST, which you previously exported*/
var TERRALST = ee.ImageCollection("MODIS/006/MOD11A2").filterDate('2016-01-01','2016-12-31');
var AQUALST = ee.ImageCollection("MODIS/006/MYD11A2").filterDate('2016-01-01','2016-12-31');



function qc_modis_lst_day(image){
  var manqa = image.select('QC_Day').mod(4).lte(1);
  var err2k = image.select('QC_Day').lt(192);
  var valid = image.select('LST_Day_1km').gt(7500);
  var mask  = manqa.and(err2k).and(valid);
  return image.select('LST_Day_1km').mask(mask);
}
function qc_modis_lst_night(image){
  var manqa = image.select('QC_Night').mod(4).lte(1);
  var err2k = image.select('QC_Night').lt(192);
  var valid = image.select('LST_Night_1km').gt(7500);
  var mask  = manqa.and(err2k).and(valid);
  return image.select('LST_Night_1km').mask(mask);
}


/*World Geometry to export data*/
var World=ee.Geometry.Rectangle(-180, -90, 180, 90);
var World=ee.Geometry(World, null, false);


//Filter monthly data
var DaytimeLST_TERRAJan=ee.ImageCollection(TERRALST.filter(JanFilter)).map(qc_modis_lst_day).mean();
var DaytimeLST_TERRAFeb=ee.ImageCollection(TERRALST.filter(FebFilter)).map(qc_modis_lst_day).mean();
var DaytimeLST_TERRAMar=ee.ImageCollection(TERRALST.filter(MarFilter)).map(qc_modis_lst_day).mean();
var DaytimeLST_TERRAApr=ee.ImageCollection(TERRALST.filter(AprFilter)).map(qc_modis_lst_day).mean();
var DaytimeLST_TERRAMay=ee.ImageCollection(TERRALST.filter(MayFilter)).map(qc_modis_lst_day).mean();
var DaytimeLST_TERRAJun=ee.ImageCollection(TERRALST.filter(JunFilter)).map(qc_modis_lst_day).mean();
var DaytimeLST_TERRAJul=ee.ImageCollection(TERRALST.filter(JulFilter)).map(qc_modis_lst_day).mean();
var DaytimeLST_TERRAAug=ee.ImageCollection(TERRALST.filter(AugFilter)).map(qc_modis_lst_day).mean();
var DaytimeLST_TERRASep=ee.ImageCollection(TERRALST.filter(SepFilter)).map(qc_modis_lst_day).mean();
var DaytimeLST_TERRAOct=ee.ImageCollection(TERRALST.filter(OctFilter)).map(qc_modis_lst_day).mean();
var DaytimeLST_TERRANov=ee.ImageCollection(TERRALST.filter(NovFilter)).map(qc_modis_lst_day).mean();
var DaytimeLST_TERRADec=ee.ImageCollection(TERRALST.filter(DecFilter)).map(qc_modis_lst_day).mean();
//print(DaytimeLST_TERRANov)
var DaytimeLST_AQUAJan=ee.ImageCollection(AQUALST.filter(JanFilter)).map(qc_modis_lst_day).mean();
var DaytimeLST_AQUAFeb=ee.ImageCollection(AQUALST.filter(FebFilter)).map(qc_modis_lst_day).mean();
var DaytimeLST_AQUAMar=ee.ImageCollection(AQUALST.filter(MarFilter)).map(qc_modis_lst_day).mean();
var DaytimeLST_AQUAApr=ee.ImageCollection(AQUALST.filter(AprFilter)).map(qc_modis_lst_day).mean();
var DaytimeLST_AQUAMay=ee.ImageCollection(AQUALST.filter(MayFilter)).map(qc_modis_lst_day).mean();
var DaytimeLST_AQUAJun=ee.ImageCollection(AQUALST.filter(JunFilter)).map(qc_modis_lst_day).mean();
var DaytimeLST_AQUAJul=ee.ImageCollection(AQUALST.filter(JulFilter)).map(qc_modis_lst_day).mean();
var DaytimeLST_AQUAAug=ee.ImageCollection(AQUALST.filter(AugFilter)).map(qc_modis_lst_day).mean();
var DaytimeLST_AQUASep=ee.ImageCollection(AQUALST.filter(SepFilter)).map(qc_modis_lst_day).mean();
var DaytimeLST_AQUAOct=ee.ImageCollection(AQUALST.filter(OctFilter)).map(qc_modis_lst_day).mean();
var DaytimeLST_AQUANov=ee.ImageCollection(AQUALST.filter(NovFilter)).map(qc_modis_lst_day).mean();
var DaytimeLST_AQUADec=ee.ImageCollection(AQUALST.filter(DecFilter)).map(qc_modis_lst_day).mean();


//Filter monthly data
var NighttimeLST_TERRAJan=ee.ImageCollection(TERRALST.filter(JanFilter)).map(qc_modis_lst_night).mean();
var NighttimeLST_TERRAFeb=ee.ImageCollection(TERRALST.filter(FebFilter)).map(qc_modis_lst_night).mean();
var NighttimeLST_TERRAMar=ee.ImageCollection(TERRALST.filter(MarFilter)).map(qc_modis_lst_night).mean();
var NighttimeLST_TERRAApr=ee.ImageCollection(TERRALST.filter(AprFilter)).map(qc_modis_lst_night).mean();
var NighttimeLST_TERRAMay=ee.ImageCollection(TERRALST.filter(MayFilter)).map(qc_modis_lst_night).mean();
var NighttimeLST_TERRAJun=ee.ImageCollection(TERRALST.filter(JunFilter)).map(qc_modis_lst_night).mean();
var NighttimeLST_TERRAJul=ee.ImageCollection(TERRALST.filter(JulFilter)).map(qc_modis_lst_night).mean();
var NighttimeLST_TERRAAug=ee.ImageCollection(TERRALST.filter(AugFilter)).map(qc_modis_lst_night).mean();
var NighttimeLST_TERRASep=ee.ImageCollection(TERRALST.filter(SepFilter)).map(qc_modis_lst_night).mean();
var NighttimeLST_TERRAOct=ee.ImageCollection(TERRALST.filter(OctFilter)).map(qc_modis_lst_night).mean();
var NighttimeLST_TERRANov=ee.ImageCollection(TERRALST.filter(NovFilter)).map(qc_modis_lst_night).mean();
var NighttimeLST_TERRADec=ee.ImageCollection(TERRALST.filter(DecFilter)).map(qc_modis_lst_night).mean();

var NighttimeLST_AQUAJan=ee.ImageCollection(AQUALST.filter(JanFilter)).map(qc_modis_lst_night).mean();
var NighttimeLST_AQUAFeb=ee.ImageCollection(AQUALST.filter(FebFilter)).map(qc_modis_lst_night).mean();
var NighttimeLST_AQUAMar=ee.ImageCollection(AQUALST.filter(MarFilter)).map(qc_modis_lst_night).mean();
var NighttimeLST_AQUAApr=ee.ImageCollection(AQUALST.filter(AprFilter)).map(qc_modis_lst_night).mean();
var NighttimeLST_AQUAMay=ee.ImageCollection(AQUALST.filter(MayFilter)).map(qc_modis_lst_night).mean();
var NighttimeLST_AQUAJun=ee.ImageCollection(AQUALST.filter(JunFilter)).map(qc_modis_lst_night).mean();
var NighttimeLST_AQUAJul=ee.ImageCollection(AQUALST.filter(JulFilter)).map(qc_modis_lst_night).mean();
var NighttimeLST_AQUAAug=ee.ImageCollection(AQUALST.filter(AugFilter)).map(qc_modis_lst_night).mean();
var NighttimeLST_AQUASep=ee.ImageCollection(AQUALST.filter(SepFilter)).map(qc_modis_lst_night).mean();
var NighttimeLST_AQUAOct=ee.ImageCollection(AQUALST.filter(OctFilter)).map(qc_modis_lst_night).mean();
var NighttimeLST_AQUANov=ee.ImageCollection(AQUALST.filter(NovFilter)).map(qc_modis_lst_night).mean();
var NighttimeLST_AQUADec=ee.ImageCollection(AQUALST.filter(DecFilter)).map(qc_modis_lst_night).mean(); 


function finalize_d(image){
var image_temp = image.select('LST_Day_1km').multiply(0.02).subtract(273.15);
return image_temp.updateMask(image_temp.gt(-273.15));
}

function finalize_n(image){
var image_temp = image.select('LST_Night_1km').multiply(0.02).subtract(273.15);
return image_temp.updateMask(image_temp.gt(-273.15));
}

print(NighttimeLST_AQUADec)

//Finalize all image collections
var DaytimeTERRALSTJan=finalize_d(DaytimeLST_TERRAJan);
var DaytimeTERRALSTFeb=finalize_d(DaytimeLST_TERRAFeb);
var DaytimeTERRALSTMar=finalize_d(DaytimeLST_TERRAMar);
var DaytimeTERRALSTApr=finalize_d(DaytimeLST_TERRAApr);
var DaytimeTERRALSTMay=finalize_d(DaytimeLST_TERRAMay);
var DaytimeTERRALSTJun=finalize_d(DaytimeLST_TERRAJun);
var DaytimeTERRALSTJul=finalize_d(DaytimeLST_TERRAJul);
var DaytimeTERRALSTAug=finalize_d(DaytimeLST_TERRAAug);
var DaytimeTERRALSTSep=finalize_d(DaytimeLST_TERRASep);
var DaytimeTERRALSTOct=finalize_d(DaytimeLST_TERRAOct);
var DaytimeTERRALSTNov=finalize_d(DaytimeLST_TERRANov);
var DaytimeTERRALSTDec=finalize_d(DaytimeLST_TERRADec);

var DaytimeAQUALSTJan=finalize_d(DaytimeLST_AQUAJan);
var DaytimeAQUALSTFeb=finalize_d(DaytimeLST_AQUAFeb);
var DaytimeAQUALSTMar=finalize_d(DaytimeLST_AQUAMar);
var DaytimeAQUALSTApr=finalize_d(DaytimeLST_AQUAApr);
var DaytimeAQUALSTMay=finalize_d(DaytimeLST_AQUAMay);
var DaytimeAQUALSTJun=finalize_d(DaytimeLST_AQUAJun);
var DaytimeAQUALSTJul=finalize_d(DaytimeLST_AQUAJul);
var DaytimeAQUALSTAug=finalize_d(DaytimeLST_AQUAAug);
var DaytimeAQUALSTSep=finalize_d(DaytimeLST_AQUASep);
var DaytimeAQUALSTOct=finalize_d(DaytimeLST_AQUAOct);
var DaytimeAQUALSTNov=finalize_d(DaytimeLST_AQUANov);
var DaytimeAQUALSTDec=finalize_d(DaytimeLST_AQUADec);

var NighttimeTERRALSTJan=finalize_n(NighttimeLST_TERRAJan);
var NighttimeTERRALSTFeb=finalize_n(NighttimeLST_TERRAFeb);
var NighttimeTERRALSTMar=finalize_n(NighttimeLST_TERRAMar);
var NighttimeTERRALSTApr=finalize_n(NighttimeLST_TERRAApr);
var NighttimeTERRALSTMay=finalize_n(NighttimeLST_TERRAMay);
var NighttimeTERRALSTJun=finalize_n(NighttimeLST_TERRAJun);
var NighttimeTERRALSTJul=finalize_n(NighttimeLST_TERRAJul);
var NighttimeTERRALSTAug=finalize_n(NighttimeLST_TERRAAug);
var NighttimeTERRALSTSep=finalize_n(NighttimeLST_TERRASep);
var NighttimeTERRALSTOct=finalize_n(NighttimeLST_TERRAOct);
var NighttimeTERRALSTNov=finalize_n(NighttimeLST_TERRANov);
var NighttimeTERRALSTDec=finalize_n(NighttimeLST_TERRADec);

var NighttimeAQUALSTJan=finalize_n(NighttimeLST_AQUAJan);
var NighttimeAQUALSTFeb=finalize_n(NighttimeLST_AQUAFeb);
var NighttimeAQUALSTMar=finalize_n(NighttimeLST_AQUAMar);
var NighttimeAQUALSTApr=finalize_n(NighttimeLST_AQUAApr);
var NighttimeAQUALSTMay=finalize_n(NighttimeLST_AQUAMay);
var NighttimeAQUALSTJun=finalize_n(NighttimeLST_AQUAJun);
var NighttimeAQUALSTJul=finalize_n(NighttimeLST_AQUAJul);
var NighttimeAQUALSTAug=finalize_n(NighttimeLST_AQUAAug);
var NighttimeAQUALSTSep=finalize_n(NighttimeLST_AQUASep);
var NighttimeAQUALSTOct=finalize_n(NighttimeLST_AQUAOct);
var NighttimeAQUALSTNov=finalize_n(NighttimeLST_AQUANov);
var NighttimeAQUALSTDec=finalize_n(NighttimeLST_AQUADec);


print(NighttimeAQUALSTDec)

var DayTERRA_month=(DaytimeTERRALSTJan).addBands(DaytimeTERRALSTFeb).addBands(DaytimeTERRALSTMar).addBands(DaytimeTERRALSTApr).addBands(DaytimeTERRALSTMay).addBands(DaytimeTERRALSTJun).addBands(DaytimeTERRALSTJul).addBands(DaytimeTERRALSTAug).addBands(DaytimeTERRALSTSep).addBands(DaytimeTERRALSTOct).addBands(DaytimeTERRALSTNov).addBands(DaytimeTERRALSTDec);
var NightTERRA_month=(NighttimeTERRALSTJan).addBands(NighttimeTERRALSTFeb).addBands(NighttimeTERRALSTMar).addBands(NighttimeTERRALSTApr).addBands(NighttimeTERRALSTMay).addBands(NighttimeTERRALSTJun).addBands(NighttimeTERRALSTJul).addBands(NighttimeTERRALSTAug).addBands(NighttimeTERRALSTSep).addBands(NighttimeTERRALSTOct).addBands(NighttimeTERRALSTNov).addBands(NighttimeTERRALSTDec)
var NightAQUA_month=(NighttimeAQUALSTJan).addBands(NighttimeAQUALSTFeb).addBands(NighttimeAQUALSTMar).addBands(NighttimeAQUALSTApr).addBands(NighttimeAQUALSTMay).addBands(NighttimeAQUALSTJun).addBands(NighttimeAQUALSTJul).addBands(NighttimeAQUALSTAug).addBands(NighttimeAQUALSTSep).addBands(NighttimeAQUALSTOct).addBands(NighttimeAQUALSTNov).addBands(NighttimeAQUALSTDec);
var DayAQUA_month=(DaytimeAQUALSTJan).addBands(DaytimeAQUALSTFeb).addBands(DaytimeAQUALSTMar).addBands(DaytimeAQUALSTApr).addBands(DaytimeAQUALSTMay).addBands(DaytimeAQUALSTJun).addBands(DaytimeAQUALSTJul).addBands(DaytimeAQUALSTAug).addBands(DaytimeAQUALSTSep).addBands(DaytimeAQUALSTOct).addBands(DaytimeAQUALSTNov).addBands(DaytimeAQUALSTDec)

print(NightTERRA_month)

Export.image.toAsset({image: DayTERRA_month, assetId: 'DayTERRA_month_2016', region: World, maxPixels:99999999999, scale:1000} );
Export.image.toAsset({image: NightTERRA_month, assetId: 'NightTERRA_month_2016', region: World, maxPixels:99999999999, scale:1000} );
Export.image.toAsset({image: NightAQUA_month, assetId: 'NightAQUA_month_2016', region: World, maxPixels:99999999999, scale:1000} );
Export.image.toAsset({image: DayAQUA_month, assetId: 'DayAQUA_month_2016', region: World, maxPixels:99999999999, scale:1000} );


