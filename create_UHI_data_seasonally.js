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

var NH=ee.Geometry.Rectangle(-180,0,180,90);
var NH=ee.Geometry(NH, null, false);
var SH=ee.Geometry.Rectangle(-180,-90,180,0);
var SH=ee.Geometry(SH, null, false);
/*Import the images containing the 16-year median values of daytime LST and nighttime LST, which you previously exported*/
var TERRALST = ee.ImageCollection("MODIS/006/MOD11A2").filterDate('2015-10-01', '2016-10-01');;
var AQUALST = ee.ImageCollection("MODIS/006/MYD11A2").filterDate('2015-10-01', '2016-10-01');;

/*Import MODIS land use and land cover data for 2013 and select the 1st land cover classification type 
(International Geosphere‑Biosphere Programme classification)*/
//var landcover2013=ee.Image('MODIS/051/MCD12Q1/2013_01_01').select('Land_Cover_Type_1');

/*Only keep values of land use and land cover within the predefined urban boundaries*/
//var urban2013=landcover2013.clip(urban);

/*select all image pixels which represent urban and built up land cover*/
//var urbanurban=urban2013.eq(13);

//Map.addLayer(urbanurban)
/*select all image pixels that represent any land use or land cover other than urban and built up land*/
//var urbannonurban=urban2013.neq(13).neq(0);

//var LC_2013      = ee.Image('MODIS/051/MCD12Q1/2013_01_01').select('Land_Cover_Type_1');
//var mask_land    = LC_2013.neq(0);

function qc_modis_lst_day(image){
  var manqa = image.select('QC_Day').mod(4).lte(1);
  var err2k = image.select('QC_Day').lt(192);
  var valid = image.select('LST_Day_1km').gt(7500);
  var mask  = manqa.and(err2k).and(valid);
  return image.select('LST_Day_1km').mask(mask);
}
function qc_modis_lst_nig(image){
  var manqa = image.select('QC_Night').mod(4).lte(1);
  var err2k = image.select('QC_Night').lt(192);
  var valid = image.select('LST_Night_1km').gt(7500);
  var mask  = manqa.and(err2k).and(valid);
  return image.select('LST_Night_1km').mask(mask);
}


var SummerFilterNH=ee.Filter.dayOfYear(153,244);
var WinterFilterNH=ee.Filter.dayOfYear(336,59);
//print(TERRALST.filter(WinterFilterNH))
var TERRASummerLSTday=ee.ImageCollection(TERRALST.filter(SummerFilterNH)).map(qc_modis_lst_day).mean();
var TERRAWinterLSTday=ee.ImageCollection(TERRALST.filter(WinterFilterNH)).map(qc_modis_lst_day).mean();

var TERRASummerLSTnight=ee.ImageCollection(TERRALST.filter(SummerFilterNH)).map(qc_modis_lst_nig).mean();
var TERRAWinterLSTnight=ee.ImageCollection(TERRALST.filter(WinterFilterNH)).map(qc_modis_lst_nig).mean();

var TERRASummerLSTdayNH=TERRASummerLSTday.clip(NH);
var TERRASummerLSTdaySH=TERRAWinterLSTday.clip(SH);

var TERRAWinterLSTdayNH=TERRAWinterLSTday.clip(NH);
var TERRAWinterLSTdaySH=TERRASummerLSTday.clip(SH);

var TERRASummerLSTnightNH=TERRASummerLSTnight.clip(NH);
var TERRASummerLSTnightSH=TERRAWinterLSTnight.clip(SH);

var TERRAWinterLSTnightNH=TERRAWinterLSTnight.clip(NH);
var TERRAWinterLSTnightSH=TERRASummerLSTnight.clip(SH);



var TERRASummerLSTday=ee.ImageCollection([TERRASummerLSTdayNH,TERRASummerLSTdaySH]);
var TERRASummerLSTnight=ee.ImageCollection([TERRASummerLSTnightNH,TERRASummerLSTnightSH]);
var TERRAWinterLSTday=ee.ImageCollection([TERRAWinterLSTdayNH,TERRAWinterLSTdaySH]);
var TERRAWinterLSTnight=ee.ImageCollection([TERRAWinterLSTnightNH,TERRAWinterLSTnightSH]);

var TERRASummerLSTday=TERRASummerLSTday.mosaic();
var TERRASummerLSTnight=TERRASummerLSTnight.mosaic();
var TERRAWinterLSTday=TERRAWinterLSTday.mosaic();
var TERRAWinterLSTnight=TERRAWinterLSTnight.mosaic();

var AQUASummerLSTday=ee.ImageCollection(AQUALST.filter(SummerFilterNH)).map(qc_modis_lst_day).mean();
var AQUAWinterLSTday=ee.ImageCollection(AQUALST.filter(WinterFilterNH)).map(qc_modis_lst_day).mean();

var AQUASummerLSTnight=ee.ImageCollection(AQUALST.filter(SummerFilterNH)).map(qc_modis_lst_nig).mean();
var AQUAWinterLSTnight=ee.ImageCollection(AQUALST.filter(WinterFilterNH)).map(qc_modis_lst_nig).mean();

var AQUASummerLSTdayNH=AQUASummerLSTday.clip(NH);
var AQUASummerLSTdaySH=AQUAWinterLSTday.clip(SH);

var AQUAWinterLSTdayNH=AQUAWinterLSTday.clip(NH);
var AQUAWinterLSTdaySH=AQUASummerLSTday.clip(SH);

var AQUASummerLSTnightNH=AQUASummerLSTnight.clip(NH);
var AQUASummerLSTnightSH=AQUAWinterLSTnight.clip(SH);

var AQUAWinterLSTnightNH=AQUAWinterLSTnight.clip(NH);
var AQUAWinterLSTnightSH=AQUASummerLSTnight.clip(SH);



var AQUASummerLSTday=ee.ImageCollection([AQUASummerLSTdayNH,AQUASummerLSTdaySH]);
var AQUASummerLSTnight=ee.ImageCollection([AQUASummerLSTnightNH,AQUASummerLSTnightSH]);
var AQUAWinterLSTday=ee.ImageCollection([AQUAWinterLSTdayNH,AQUAWinterLSTdaySH]);
var AQUAWinterLSTnight=ee.ImageCollection([AQUAWinterLSTnightNH,AQUAWinterLSTnightSH]);

var AQUASummerLSTday=AQUASummerLSTday.mosaic();
var AQUASummerLSTnight=AQUASummerLSTnight.mosaic();
var AQUAWinterLSTday=AQUAWinterLSTday.mosaic();
var AQUAWinterLSTnight=AQUAWinterLSTnight.mosaic();

//Add scale and convert to degree Celcius
var LST_Day_TERRA_summer = TERRASummerLSTday.multiply(0.02).subtract(273.15);
var LST_Night_TERRA_summer = TERRASummerLSTnight.multiply(0.02).subtract(273.15);
var LST_Day_TERRA_summer = LST_Day_TERRA_summer.updateMask(LST_Day_TERRA_summer.gt(-273.15));
var LST_Night_TERRA_summer = LST_Night_TERRA_summer.updateMask(LST_Night_TERRA_summer.gt(-273.15));

var LST_Day_TERRA_winter = TERRAWinterLSTday.multiply(0.02).subtract(273.15);
var LST_Night_TERRA_winter = TERRAWinterLSTnight.multiply(0.02).subtract(273.15);
var LST_Day_TERRA_winter = LST_Day_TERRA_winter.updateMask(LST_Day_TERRA_winter.gt(-273.15));
var LST_Night_TERRA_winter = LST_Night_TERRA_winter.updateMask(LST_Night_TERRA_winter.gt(-273.15));


var LST_Day_AQUA_summer = AQUASummerLSTday.multiply(0.02).subtract(273.15);
var LST_Night_AQUA_summer = AQUASummerLSTnight.multiply(0.02).subtract(273.15);
var LST_Day_AQUA_summer = LST_Day_AQUA_summer.updateMask(LST_Day_AQUA_summer.gt(-273.15));
var LST_Night_AQUA_summer = LST_Night_AQUA_summer.updateMask(LST_Night_AQUA_summer.gt(-273.15));

var LST_Day_AQUA_winter = AQUAWinterLSTday.multiply(0.02).subtract(273.15);
var LST_Night_AQUA_winter = AQUAWinterLSTnight.multiply(0.02).subtract(273.15);
var LST_Day_AQUA_winter = LST_Day_AQUA_winter.updateMask(LST_Day_AQUA_winter.gt(-273.15));
var LST_Night_AQUA_winter = LST_Night_AQUA_winter.updateMask(LST_Night_AQUA_winter.gt(-273.15));


 
//Map.addLayer(LST_Night_AQUA_winter,{min:0, max: 20, palette:['yellow', 'blue','green', 'orange','red', 'purple']});

Export.image.toAsset({image: LST_Night_TERRA_summer, assetId: 'LST_Night_TERRA_mean_summer_2016_vfF', region: World, maxPixels:999999999, scale:1000} );
Export.image.toAsset({image: LST_Night_AQUA_summer, assetId: 'LST_Night_AQUA_mean_summer_2016_vfF', region: World, maxPixels:999999999, scale:1000} );
Export.image.toAsset({image: LST_Day_AQUA_summer, assetId: 'LST_Day_AQUA_mean_summer_2016_vfF', region: World, maxPixels:999999999, scale:1000} );
Export.image.toAsset({image: LST_Day_TERRA_summer, assetId: 'LST_Day_TERRA_mean_summer_2016_vfF', region: World, maxPixels:999999999, scale:1000} );
Export.image.toAsset({image: LST_Night_TERRA_winter, assetId: 'LST_Night_TERRA_mean_winter_2016_vfF', region: World, maxPixels:999999999, scale:1000} );
Export.image.toAsset({image: LST_Night_AQUA_winter, assetId: 'LST_Night_AQUA_mean_winter_2016_vfF', region: World, maxPixels:999999999, scale:1000} );
Export.image.toAsset({image: LST_Day_AQUA_winter, assetId: 'LST_Day_AQUA_mean_winter_2016_vfF', region: World, maxPixels:999999999, scale:1000} );
Export.image.toAsset({image: LST_Day_TERRA_winter, assetId: 'LST_Day_TERRA_mean_winter_2016_vfF', region: World, maxPixels:999999999, scale:1000} );

