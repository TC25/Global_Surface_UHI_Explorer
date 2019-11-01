/*Import shapefiles of all urban areas in the world*/
var urban=ee.FeatureCollection('users/tirthankar25/urban_Schneider');
 


/*World Geometry to export data and find global mean*/
var World=ee.Geometry.Rectangle(-180, -90, 180, 90);
var World=ee.Geometry(World, null, false);


/*Import the images containing the 16-year median values of daytime LST and nighttime LST, which you previously exported*/
var daytimeLST_TERRA = ee.Image("users/tirthankar25/DayTERRA_month_2017");
//var daytimeLST = ee.Image("USGS/GMTED2017");
var nighttimeLST_TERRA = ee.Image("users/tirthankar25/NightTERRA_month_2017");

/*Import the images containing the 16-year median values of daytime LST and nighttime LST, which you previously exported*/
var daytimeLST_AQUA = ee.Image("users/tirthankar25/DayAQUA_month_2017");
//var daytimeLST = ee.Image("USGS/GMTED2017");
var nighttimeLST_AQUA = ee.Image("users/tirthankar25/NightAQUA_month_2017");
//print(daytimeLST_TERRA)
/*Import ESA land cover classification
(International Geosphere‑Biosphere Programme classification)*/ //Ranges from b1 (1992) to b24 (for 2017)//
var landcover2001=ee.Image('users/tirthankarchakraborty/GOBLandcover1992_2015').select('b24');

/*Only keep values of land use and land cover within the predefined urban boundaries*/
var urban2001=landcover2001.clip(urban);

/*select all image pixels which represent urban and built up land cover*/
var urbanurban=urban2001.eq(190);

var DEM=(ee.Image('USGS/GMTED2010'));
var DEM_urban=DEM.updateMask(urbanurban);
//print(DEM)
/*Function to calculate area of each urban boundary*/
var Ar = function(feature) { 
  var Ar= ee.Number(DEM_urban.reduceRegion({reducer:ee.Reducer.median(), geometry: feature.geometry(), scale: 30, maxPixels: 10000000000000}).get('be75'))
  return feature.set({'City_DEM': Ar});
};

/*Apply function to find area of each urban boundary*/
var urban=urban.map(Ar);
//print((urban).limit(200))

var DEM_urban_median=urban.filter(ee.Filter.neq('City_DEM', null)).reduceToImage({properties: ['City_DEM'], reducer: ee.Reducer.first()});

//Map.addLayer(DEM_urban_median,{},'urban DEM')

var DEM_diff=(DEM.subtract(DEM_urban_median)).abs()

//Map.addLayer(DEM_diff,{},'DEM difference');
//Map.addLayer(urbanurban,{},'urban')
/*select all image pixels that represent any land use or land cover other than urban and built up land*/
var urbannonurban1=urban2001.neq(190);
var urbannonurban2=urban2001.neq(210);
var urbannonurban3=DEM_diff.lte(50);
//Map.addLayer(urbannonurban3,{},'DEM difference mask');
//Map.addLayer(urbannonurban1,{},'non-urban')
/*Create new image with daytime LST pixels where the land use pixel is urban and built up*/
var dayurbanLST_TERRA=daytimeLST_TERRA.updateMask(urbanurban);
//print(dayurbanLST_TERRA)
//Map.addLayer(dayurbanLST_TERRA,{},'test')
/*Create new image with daytime LST pixels where the land use pixel is anything but urban and built up*/
var dayruralLST_TERRA=daytimeLST_TERRA.updateMask(urbannonurban1).updateMask(urbannonurban2).updateMask(urbannonurban3);
//Map.addLayer(dayruralLST_TERRA,{},'test_rural')
/*Create new image with nighttime LST pixels where the land use pixel is urban and built up*/
var nighturbanLST_TERRA=nighttimeLST_TERRA.updateMask(urbanurban);

/*Create new image with nighttime LST pixels where the land use pixel is anything but urban and built up*/
var nightruralLST_TERRA=nighttimeLST_TERRA.updateMask(urbannonurban1).updateMask(urbannonurban2).updateMask(urbannonurban3);
//Map.addLayer(nightruralLST_TERRA)
//Map.addLayer(urbannonurban)
/*Create new image with daytime LST pixels where the land use pixel is urban and built up*/
var dayurbanLST_AQUA=daytimeLST_AQUA.updateMask(urbanurban);

/*Create new image with daytime LST pixels where the land use pixel is anything but urban and built up*/
var dayruralLST_AQUA=daytimeLST_AQUA.updateMask(urbannonurban1).updateMask(urbannonurban2).updateMask(urbannonurban3);

/*Create new image with nighttime LST pixels where the land use pixel is urban and built up*/
var nighturbanLST_AQUA=nighttimeLST_AQUA.updateMask(urbanurban);

/*Create new image with nighttime LST pixels where the land use pixel is anything but urban and built up*/
var nightruralLST_AQUA=nighttimeLST_AQUA.updateMask(urbannonurban1).updateMask(urbannonurban2).updateMask(urbannonurban3);
//Map.addLayer(nightruralLST_AQUA)
/*Function to replace all pixels within a feature with the mean of all the pixels.
This creates a feature collection with the mean property added for each feature*/
var regions = function(image){
  return image.reduceRegions({collection: urban,  reducer: ee.Reducer.mean(),  scale: 300,
});
}
/*Input DEM data*/
//var tpimin=ee.Image('users/tirthankarchakraborty/tpi_1KMmi_SRTM');
//var tpimax=ee.Image('users/tirthankarchakraborty/tpi_1KMma_SRTM');
/*Create and export image for mean DEM for each boundary*/
//var urbantpimax=regions(tpimax);
//var urbantpimin=regions(tpimin);
//Map.addLayer(urban)
//Map.addLayer(urban2001)
/*Create separate images for mean urban daytime LST, mean rural daytime LST, mean urban nighttime LST 
and mean rural nighttime LST for each feature (city)*/
var duLST_TERRA_Jan = regions(dayurbanLST_TERRA.select(0));
var drLST_TERRA_Jan = regions(dayruralLST_TERRA.select(0));
var nuLST_TERRA_Jan = regions(nighturbanLST_TERRA.select(0));
var nrLST_TERRA_Jan = regions(nightruralLST_TERRA.select(0));

var duLST_AQUA_Jan = regions(dayurbanLST_AQUA.select(0));
var drLST_AQUA_Jan = regions(dayruralLST_AQUA.select(0));
var nuLST_AQUA_Jan = regions(nighturbanLST_AQUA.select(0));
var nrLST_AQUA_Jan = regions(nightruralLST_AQUA.select(0));

var duLST_TERRA_Feb = regions(dayurbanLST_TERRA.select(1));
var drLST_TERRA_Feb = regions(dayruralLST_TERRA.select(1));
var nuLST_TERRA_Feb = regions(nighturbanLST_TERRA.select(1));
var nrLST_TERRA_Feb = regions(nightruralLST_TERRA.select(1));

var duLST_AQUA_Feb = regions(dayurbanLST_AQUA.select(1));
var drLST_AQUA_Feb = regions(dayruralLST_AQUA.select(1));
var nuLST_AQUA_Feb = regions(nighturbanLST_AQUA.select(1));
var nrLST_AQUA_Feb = regions(nightruralLST_AQUA.select(1));

var duLST_TERRA_Mar = regions(dayurbanLST_TERRA.select(2));
var drLST_TERRA_Mar = regions(dayruralLST_TERRA.select(2));
var nuLST_TERRA_Mar = regions(nighturbanLST_TERRA.select(2));
var nrLST_TERRA_Mar = regions(nightruralLST_TERRA.select(2));

var duLST_AQUA_Mar = regions(dayurbanLST_AQUA.select(2));
var drLST_AQUA_Mar = regions(dayruralLST_AQUA.select(2));
var nuLST_AQUA_Mar = regions(nighturbanLST_AQUA.select(2));
var nrLST_AQUA_Mar = regions(nightruralLST_AQUA.select(2));

var duLST_TERRA_Apr = regions(dayurbanLST_TERRA.select(3));
var drLST_TERRA_Apr = regions(dayruralLST_TERRA.select(3));
var nuLST_TERRA_Apr = regions(nighturbanLST_TERRA.select(3));
var nrLST_TERRA_Apr = regions(nightruralLST_TERRA.select(3));

var duLST_AQUA_Apr = regions(dayurbanLST_AQUA.select(3));
var drLST_AQUA_Apr = regions(dayruralLST_AQUA.select(3));
var nuLST_AQUA_Apr = regions(nighturbanLST_AQUA.select(3));
var nrLST_AQUA_Apr = regions(nightruralLST_AQUA.select(3));

var duLST_TERRA_May = regions(dayurbanLST_TERRA.select(4));
var drLST_TERRA_May = regions(dayruralLST_TERRA.select(4));
var nuLST_TERRA_May = regions(nighturbanLST_TERRA.select(4));
var nrLST_TERRA_May = regions(nightruralLST_TERRA.select(4));

var duLST_AQUA_May = regions(dayurbanLST_AQUA.select(4));
var drLST_AQUA_May = regions(dayruralLST_AQUA.select(4));
var nuLST_AQUA_May = regions(nighturbanLST_AQUA.select(4));
var nrLST_AQUA_May = regions(nightruralLST_AQUA.select(4));

var duLST_TERRA_Jun = regions(dayurbanLST_TERRA.select(5));
var drLST_TERRA_Jun = regions(dayruralLST_TERRA.select(5));
var nuLST_TERRA_Jun = regions(nighturbanLST_TERRA.select(5));
var nrLST_TERRA_Jun = regions(nightruralLST_TERRA.select(5));

var duLST_AQUA_Jun = regions(dayurbanLST_AQUA.select(5));
var drLST_AQUA_Jun = regions(dayruralLST_AQUA.select(5));
var nuLST_AQUA_Jun = regions(nighturbanLST_AQUA.select(5));
var nrLST_AQUA_Jun = regions(nightruralLST_AQUA.select(5));

var duLST_TERRA_Jul = regions(dayurbanLST_TERRA.select(6));
var drLST_TERRA_Jul = regions(dayruralLST_TERRA.select(6));
var nuLST_TERRA_Jul = regions(nighturbanLST_TERRA.select(6));
var nrLST_TERRA_Jul = regions(nightruralLST_TERRA.select(6));

var duLST_AQUA_Jul = regions(dayurbanLST_AQUA.select(6));
var drLST_AQUA_Jul = regions(dayruralLST_AQUA.select(6));
var nuLST_AQUA_Jul = regions(nighturbanLST_AQUA.select(6));
var nrLST_AQUA_Jul = regions(nightruralLST_AQUA.select(6));

var duLST_TERRA_Aug = regions(dayurbanLST_TERRA.select(7));
var drLST_TERRA_Aug = regions(dayruralLST_TERRA.select(7));
var nuLST_TERRA_Aug = regions(nighturbanLST_TERRA.select(7));
var nrLST_TERRA_Aug = regions(nightruralLST_TERRA.select(7));

var duLST_AQUA_Aug = regions(dayurbanLST_AQUA.select(7));
var drLST_AQUA_Aug = regions(dayruralLST_AQUA.select(7));
var nuLST_AQUA_Aug = regions(nighturbanLST_AQUA.select(7));
var nrLST_AQUA_Aug = regions(nightruralLST_AQUA.select(7));

var duLST_TERRA_Sep = regions(dayurbanLST_TERRA.select(8));
var drLST_TERRA_Sep = regions(dayruralLST_TERRA.select(8));
var nuLST_TERRA_Sep = regions(nighturbanLST_TERRA.select(8));
var nrLST_TERRA_Sep = regions(nightruralLST_TERRA.select(8));

var duLST_AQUA_Sep = regions(dayurbanLST_AQUA.select(8));
var drLST_AQUA_Sep = regions(dayruralLST_AQUA.select(8));
var nuLST_AQUA_Sep = regions(nighturbanLST_AQUA.select(8));
var nrLST_AQUA_Sep = regions(nightruralLST_AQUA.select(8));

var duLST_TERRA_Oct = regions(dayurbanLST_TERRA.select(9));
var drLST_TERRA_Oct = regions(dayruralLST_TERRA.select(9));
var nuLST_TERRA_Oct = regions(nighturbanLST_TERRA.select(9));
var nrLST_TERRA_Oct = regions(nightruralLST_TERRA.select(9));

var duLST_AQUA_Oct = regions(dayurbanLST_AQUA.select(9));
var drLST_AQUA_Oct = regions(dayruralLST_AQUA.select(9));
var nuLST_AQUA_Oct = regions(nighturbanLST_AQUA.select(9));
var nrLST_AQUA_Oct = regions(nightruralLST_AQUA.select(9));

var duLST_TERRA_Nov = regions(dayurbanLST_TERRA.select(10));
var drLST_TERRA_Nov = regions(dayruralLST_TERRA.select(10));
var nuLST_TERRA_Nov = regions(nighturbanLST_TERRA.select(10));
var nrLST_TERRA_Nov = regions(nightruralLST_TERRA.select(10));

var duLST_AQUA_Nov = regions(dayurbanLST_AQUA.select(10));
var drLST_AQUA_Nov = regions(dayruralLST_AQUA.select(10));
var nuLST_AQUA_Nov = regions(nighturbanLST_AQUA.select(10));
var nrLST_AQUA_Nov = regions(nightruralLST_AQUA.select(10));

var duLST_TERRA_Dec = regions(dayurbanLST_TERRA.select(11));
var drLST_TERRA_Dec = regions(dayruralLST_TERRA.select(11));
var nuLST_TERRA_Dec = regions(nighturbanLST_TERRA.select(11));
var nrLST_TERRA_Dec = regions(nightruralLST_TERRA.select(11));

var duLST_AQUA_Dec = regions(dayurbanLST_AQUA.select(11));
var drLST_AQUA_Dec = regions(dayruralLST_AQUA.select(11));
var nuLST_AQUA_Dec = regions(nighturbanLST_AQUA.select(11));
var nrLST_AQUA_Dec = regions(nightruralLST_AQUA.select(11));


// // /* Function to get centroids of each urban area*/
// var findCentroid = function(feature) {
  
// /*Keep this property for the new feature collection consisting of centroids*/
// var transferProperties = ['mean','City_DEM', 'Code'];
// var centroid = feature.geometry().centroid();
// return ee.Feature(centroid).copyProperties(feature, transferProperties);
// };

// /*Map the centroid finding function over the features.*/
// var  duLSTC_Jan =  duLST_AQUA_Jan.map(findCentroid);
// var  drLSTC_Jan =  drLST_AQUA_Jan.map(findCentroid);
// var  nuLSTC_Jan =  nuLST_AQUA_Jan.map(findCentroid);
// var  nrLSTC_Jan =  nrLST_AQUA_Jan.map(findCentroid);
// //print(duLSTC.limit(5))
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: drLSTC_Jan,  description: 'Rural_dayLST_mean_Jan_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: duLSTC_Jan,  description: 'Urban_dayLST_mean_Jan_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nuLSTC_Jan,  description: 'Urban_nightLST_mean_Jan_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nrLSTC_Jan,  description: 'Rural_nightLST_mean_Jan_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});

// /*Map the centroid finding function over the features.*/
// var  duLSTC_Feb =  duLST_AQUA_Feb.map(findCentroid);
// var  drLSTC_Feb =  drLST_AQUA_Feb.map(findCentroid);
// var  nuLSTC_Feb =  nuLST_AQUA_Feb.map(findCentroid);
// var  nrLSTC_Feb =  nrLST_AQUA_Feb.map(findCentroid);
// //print(duLSTC.limit(5))
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: drLSTC_Feb,  description: 'Rural_dayLST_mean_Feb_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: duLSTC_Feb,  description: 'Urban_dayLST_mean_Feb_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nuLSTC_Feb,  description: 'Urban_nightLST_mean_Feb_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nrLSTC_Feb,  description: 'Rural_nightLST_mean_Feb_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});


// /*Map the centroid finding function over the features.*/
// var  duLSTC_Mar =  duLST_AQUA_Mar.map(findCentroid);
// var  drLSTC_Mar =  drLST_AQUA_Mar.map(findCentroid);
// var  nuLSTC_Mar =  nuLST_AQUA_Mar.map(findCentroid);
// var  nrLSTC_Mar =  nrLST_AQUA_Mar.map(findCentroid);
// //print(duLSTC.limit(5))
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: drLSTC_Mar,  description: 'Rural_dayLST_mean_Mar_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: duLSTC_Mar,  description: 'Urban_dayLST_mean_Mar_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nuLSTC_Mar,  description: 'Urban_nightLST_mean_Mar_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nrLSTC_Mar,  description: 'Rural_nightLST_mean_Mar_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});


// /*Map the centroid finding function over the features.*/
// var  duLSTC_Apr =  duLST_AQUA_Apr.map(findCentroid);
// var  drLSTC_Apr =  drLST_AQUA_Apr.map(findCentroid);
// var  nuLSTC_Apr =  nuLST_AQUA_Apr.map(findCentroid);
// var  nrLSTC_Apr =  nrLST_AQUA_Apr.map(findCentroid);
// //print(duLSTC.limit(5))
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: drLSTC_Apr,  description: 'Rural_dayLST_mean_Apr_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: duLSTC_Apr,  description: 'Urban_dayLST_mean_Apr_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nuLSTC_Apr,  description: 'Urban_nightLST_mean_Apr_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nrLSTC_Apr,  description: 'Rural_nightLST_mean_Apr_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});


// /*Map the centroid finding function over the features.*/
// var  duLSTC_May =  duLST_AQUA_May.map(findCentroid);
// var  drLSTC_May =  drLST_AQUA_May.map(findCentroid);
// var  nuLSTC_May =  nuLST_AQUA_May.map(findCentroid);
// var  nrLSTC_May =  nrLST_AQUA_May.map(findCentroid);
// //print(duLSTC.limit(5))
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: drLSTC_May,  description: 'Rural_dayLST_mean_May_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: duLSTC_May,  description: 'Urban_dayLST_mean_May_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nuLSTC_May,  description: 'Urban_nightLST_mean_May_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nrLSTC_May,  description: 'Rural_nightLST_mean_May_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});


// /*Map the centroid finding function over the features.*/
// var  duLSTC_Jun =  duLST_AQUA_Jun.map(findCentroid);
// var  drLSTC_Jun =  drLST_AQUA_Jun.map(findCentroid);
// var  nuLSTC_Jun =  nuLST_AQUA_Jun.map(findCentroid);
// var  nrLSTC_Jun =  nrLST_AQUA_Jun.map(findCentroid);
// //print(duLSTC.limit(5))
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: drLSTC_Jun,  description: 'Rural_dayLST_mean_Jun_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: duLSTC_Jun,  description: 'Urban_dayLST_mean_Jun_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nuLSTC_Jun,  description: 'Urban_nightLST_mean_Jun_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nrLSTC_Jun,  description: 'Rural_nightLST_mean_Jun_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});


// /*Map the centroid finding function over the features.*/
// var  duLSTC_Jul =  duLST_AQUA_Jul.map(findCentroid);
// var  drLSTC_Jul =  drLST_AQUA_Jul.map(findCentroid);
// var  nuLSTC_Jul =  nuLST_AQUA_Jul.map(findCentroid);
// var  nrLSTC_Jul =  nrLST_AQUA_Jul.map(findCentroid);
// //print(duLSTC.limit(5))
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: drLSTC_Jul,  description: 'Rural_dayLST_mean_Jul_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: duLSTC_Jul,  description: 'Urban_dayLST_mean_Jul_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nuLSTC_Jul,  description: 'Urban_nightLST_mean_Jul_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nrLSTC_Jul,  description: 'Rural_nightLST_mean_Jul_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});


// /*Map the centroid finding function over the features.*/
// var  duLSTC_Aug =  duLST_AQUA_Aug.map(findCentroid);
// var  drLSTC_Aug =  drLST_AQUA_Aug.map(findCentroid);
// var  nuLSTC_Aug =  nuLST_AQUA_Aug.map(findCentroid);
// var  nrLSTC_Aug =  nrLST_AQUA_Aug.map(findCentroid);
// //print(duLSTC.limit(5))
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: drLSTC_Aug,  description: 'Rural_dayLST_mean_Aug_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: duLSTC_Aug,  description: 'Urban_dayLST_mean_Aug_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nuLSTC_Aug,  description: 'Urban_nightLST_mean_Aug_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nrLSTC_Aug,  description: 'Rural_nightLST_mean_Aug_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});


// /*Map the centroid finding function over the features.*/
// var  duLSTC_Sep =  duLST_AQUA_Sep.map(findCentroid);
// var  drLSTC_Sep =  drLST_AQUA_Sep.map(findCentroid);
// var  nuLSTC_Sep =  nuLST_AQUA_Sep.map(findCentroid);
// var  nrLSTC_Sep =  nrLST_AQUA_Sep.map(findCentroid);
// //print(duLSTC.limit(5))
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: drLSTC_Sep,  description: 'Rural_dayLST_mean_Sep_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: duLSTC_Sep,  description: 'Urban_dayLST_mean_Sep_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nuLSTC_Sep,  description: 'Urban_nightLST_mean_Sep_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nrLSTC_Sep,  description: 'Rural_nightLST_mean_Sep_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});


// /*Map the centroid finding function over the features.*/
// var  duLSTC_Oct =  duLST_AQUA_Oct.map(findCentroid);
// var  drLSTC_Oct =  drLST_AQUA_Oct.map(findCentroid);
// var  nuLSTC_Oct =  nuLST_AQUA_Oct.map(findCentroid);
// var  nrLSTC_Oct =  nrLST_AQUA_Oct.map(findCentroid);
// //print(duLSTC.limit(5))
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: drLSTC_Oct,  description: 'Rural_dayLST_mean_Oct_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: duLSTC_Oct,  description: 'Urban_dayLST_mean_Oct_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nuLSTC_Oct,  description: 'Urban_nightLST_mean_Oct_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nrLSTC_Oct,  description: 'Rural_nightLST_mean_Oct_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});


// /*Map the centroid finding function over the features.*/
// var  duLSTC_Nov =  duLST_AQUA_Nov.map(findCentroid);
// var  drLSTC_Nov =  drLST_AQUA_Nov.map(findCentroid);
// var  nuLSTC_Nov =  nuLST_AQUA_Nov.map(findCentroid);
// var  nrLSTC_Nov =  nrLST_AQUA_Nov.map(findCentroid);
// //print(duLSTC.limit(5))
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: drLSTC_Nov,  description: 'Rural_dayLST_mean_Nov_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: duLSTC_Nov,  description: 'Urban_dayLST_mean_Nov_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nuLSTC_Nov,  description: 'Urban_nightLST_mean_Nov_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nrLSTC_Nov,  description: 'Rural_nightLST_mean_Nov_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});


// /*Map the centroid finding function over the features.*/
// var  duLSTC_Dec =  duLST_AQUA_Dec.map(findCentroid);
// var  drLSTC_Dec =  drLST_AQUA_Dec.map(findCentroid);
// var  nuLSTC_Dec =  nuLST_AQUA_Dec.map(findCentroid);
// var  nrLSTC_Dec =  nrLST_AQUA_Dec.map(findCentroid);
// //print(duLSTC.limit(5))
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: drLSTC_Dec,  description: 'Rural_dayLST_mean_Dec_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: duLSTC_Dec,  description: 'Urban_dayLST_mean_Dec_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nuLSTC_Dec,  description: 'Urban_nightLST_mean_Dec_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
//   /* Export the feature collection for further analysis*/
//   Export.table.toDrive({
//   collection: nrLSTC_Dec,  description: 'Rural_nightLST_mean_Dec_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});




// /* Create image from feature collection and subtract the rural daytime LST image from the urban 
// daytime LST image to get the daytime urban heat island*/
// //print(duLST.limit(100))
var dayUHI_TERRA_Jan = duLST_TERRA_Jan.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_TERRA_Jan.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

//Map.addLayer(dayUHI_TERRA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_TERRA_Jan = nuLST_TERRA_Jan.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_TERRA_Jan.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


var dayUHI_AQUA_Jan= duLST_AQUA_Jan.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_AQUA_Jan.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


//Map.addLayer(dayUHI_AQUA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_AQUA_Jan = nuLST_AQUA_Jan.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_AQUA_Jan.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

var dayUHI_Jan=ee.ImageCollection([dayUHI_TERRA_Jan, dayUHI_AQUA_Jan]).mean();
var nightUHI_Jan=ee.ImageCollection([nightUHI_TERRA_Jan, nightUHI_AQUA_Jan]).mean();

//Map.addLayer(dayUHI)
//print(dayUHI)

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: dayUHI_Jan, assetId: 'users/tirthankar25/dayUHI_Jan_2017_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: nightUHI_Jan, assetId: 'users/tirthankar25/nightUHI_Jan_2017_vfF', maxPixels:99999999999, region: World, scale:300} );


//Create spatially disaggregated data
var Ruralref_day_Jan=ee.ImageCollection([drLST_AQUA_Jan.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), drLST_TERRA_Jan.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Ruralref_night_Jan=ee.ImageCollection([nrLST_AQUA_Jan.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), nrLST_TERRA_Jan.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Urbanref_day_Jan=ee.ImageCollection([daytimeLST_TERRA.select(0), daytimeLST_AQUA.select(0)]).mean().updateMask(urbanurban);
var Urbanref_night_Jan=ee.ImageCollection([nighttimeLST_TERRA.select(0), nighttimeLST_AQUA.select(0)]).mean().updateMask(urbanurban);
 
var dayUHI_1km_Jan = Urbanref_day_Jan.subtract(Ruralref_day_Jan);
var nightUHI_1km_Jan = Urbanref_night_Jan.subtract(Ruralref_night_Jan);
//Map.addLayer(dayUHI_1km)

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: dayUHI_1km_Jan, assetId: 'users/tirthankar25/dayUHI_Jan_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: nightUHI_1km_Jan, assetId: 'users/tirthankar25/nightUHI_Jan_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );





// /* Create image from feature collection and subtract the rural daytime LST image from the urban 
// daytime LST image to get the daytime urban heat island*/
// //print(duLST.limit(100))
var dayUHI_TERRA_Feb = duLST_TERRA_Feb.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_TERRA_Feb.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

//Map.addLayer(dayUHI_TERRA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_TERRA_Feb = nuLST_TERRA_Feb.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_TERRA_Feb.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


var dayUHI_AQUA_Feb= duLST_AQUA_Feb.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_AQUA_Feb.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


//Map.addLayer(dayUHI_AQUA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_AQUA_Feb = nuLST_AQUA_Feb.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_AQUA_Feb.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

var dayUHI_Feb=ee.ImageCollection([dayUHI_TERRA_Feb, dayUHI_AQUA_Feb]).mean();
var nightUHI_Feb=ee.ImageCollection([nightUHI_TERRA_Feb, nightUHI_AQUA_Feb]).mean();

//Map.addLayer(dayUHI)
//print(dayUHI)

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: dayUHI_Feb, assetId: 'users/tirthankar25/dayUHI_Feb_2017_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: nightUHI_Feb, assetId: 'users/tirthankar25/nightUHI_Feb_2017_vfF', maxPixels:99999999999, region: World, scale:300} );


//Create spatially disaggregated data
var Ruralref_day_Feb=ee.ImageCollection([drLST_AQUA_Feb.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), drLST_TERRA_Feb.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Ruralref_night_Feb=ee.ImageCollection([nrLST_AQUA_Feb.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), nrLST_TERRA_Feb.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Urbanref_day_Feb=ee.ImageCollection([daytimeLST_TERRA.select(1), daytimeLST_AQUA.select(1)]).mean().updateMask(urbanurban);
var Urbanref_night_Feb=ee.ImageCollection([nighttimeLST_TERRA.select(1), nighttimeLST_AQUA.select(1)]).mean().updateMask(urbanurban);
 
var dayUHI_1km_Feb = Urbanref_day_Feb.subtract(Ruralref_day_Feb);
var nightUHI_1km_Feb = Urbanref_night_Feb.subtract(Ruralref_night_Feb);
//Map.addLayer(dayUHI_1km)

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: dayUHI_1km_Feb, assetId: 'users/tirthankar25/dayUHI_Feb_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: nightUHI_1km_Feb, assetId: 'users/tirthankar25/nightUHI_Feb_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );





// /* Create image from feature collection and subtract the rural daytime LST image from the urban 
// daytime LST image to get the daytime urban heat island*/
// //print(duLST.limit(100))
var dayUHI_TERRA_Mar = duLST_TERRA_Mar.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_TERRA_Mar.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

//Map.addLayer(dayUHI_TERRA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_TERRA_Mar = nuLST_TERRA_Mar.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_TERRA_Mar.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


var dayUHI_AQUA_Mar= duLST_AQUA_Mar.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_AQUA_Mar.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


//Map.addLayer(dayUHI_AQUA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_AQUA_Mar = nuLST_AQUA_Mar.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_AQUA_Mar.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

var dayUHI_Mar=ee.ImageCollection([dayUHI_TERRA_Mar, dayUHI_AQUA_Mar]).mean();
var nightUHI_Mar=ee.ImageCollection([nightUHI_TERRA_Mar, nightUHI_AQUA_Mar]).mean();

//Map.addLayer(dayUHI)
//print(dayUHI)

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: dayUHI_Mar, assetId: 'users/tirthankar25/dayUHI_Mar_2017_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: nightUHI_Mar, assetId: 'users/tirthankar25/nightUHI_Mar_2017_vfF', maxPixels:99999999999, region: World, scale:300} );


//Create spatially disaggregated data
var Ruralref_day_Mar=ee.ImageCollection([drLST_AQUA_Mar.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), drLST_TERRA_Mar.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Ruralref_night_Mar=ee.ImageCollection([nrLST_AQUA_Mar.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), nrLST_TERRA_Mar.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Urbanref_day_Mar=ee.ImageCollection([daytimeLST_TERRA.select(2), daytimeLST_AQUA.select(2)]).mean().updateMask(urbanurban);
var Urbanref_night_Mar=ee.ImageCollection([nighttimeLST_TERRA.select(2), nighttimeLST_AQUA.select(2)]).mean().updateMask(urbanurban);
 
var dayUHI_1km_Mar = Urbanref_day_Mar.subtract(Ruralref_day_Mar);
var nightUHI_1km_Mar = Urbanref_night_Mar.subtract(Ruralref_night_Mar);
//Map.addLayer(dayUHI_1km)

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: dayUHI_1km_Mar, assetId: 'users/tirthankar25/dayUHI_Mar_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: nightUHI_1km_Mar, assetId: 'users/tirthankar25/nightUHI_Mar_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );





// /* Create image from feature collection and subtract the rural daytime LST image from the urban 
// daytime LST image to get the daytime urban heat island*/
// //print(duLST.limit(100))
var dayUHI_TERRA_Apr = duLST_TERRA_Apr.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_TERRA_Apr.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

//Map.addLayer(dayUHI_TERRA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_TERRA_Apr = nuLST_TERRA_Apr.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_TERRA_Apr.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


var dayUHI_AQUA_Apr= duLST_AQUA_Apr.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_AQUA_Apr.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


//Map.addLayer(dayUHI_AQUA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_AQUA_Apr = nuLST_AQUA_Apr.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_AQUA_Apr.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

var dayUHI_Apr=ee.ImageCollection([dayUHI_TERRA_Apr, dayUHI_AQUA_Apr]).mean();
var nightUHI_Apr=ee.ImageCollection([nightUHI_TERRA_Apr, nightUHI_AQUA_Apr]).mean();

//Map.addLayer(dayUHI)
//print(dayUHI)

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: dayUHI_Apr, assetId: 'users/tirthankar25/dayUHI_Apr_2017_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: nightUHI_Apr, assetId: 'users/tirthankar25/nightUHI_Apr_2017_vfF', maxPixels:99999999999, region: World, scale:300} );


//Create spatially disaggregated data
var Ruralref_day_Apr=ee.ImageCollection([drLST_AQUA_Apr.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), drLST_TERRA_Apr.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Ruralref_night_Apr=ee.ImageCollection([nrLST_AQUA_Apr.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), nrLST_TERRA_Apr.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Urbanref_day_Apr=ee.ImageCollection([daytimeLST_TERRA.select(3), daytimeLST_AQUA.select(3)]).mean().updateMask(urbanurban);
var Urbanref_night_Apr=ee.ImageCollection([nighttimeLST_TERRA.select(3), nighttimeLST_AQUA.select(3)]).mean().updateMask(urbanurban);
 
var dayUHI_1km_Apr = Urbanref_day_Apr.subtract(Ruralref_day_Apr);
var nightUHI_1km_Apr = Urbanref_night_Apr.subtract(Ruralref_night_Apr);
//Map.addLayer(dayUHI_1km)

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: dayUHI_1km_Apr, assetId: 'users/tirthankar25/dayUHI_Apr_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: nightUHI_1km_Apr, assetId: 'users/tirthankar25/nightUHI_Apr_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );





// /* Create image from feature collection and subtract the rural daytime LST image from the urban 
// daytime LST image to get the daytime urban heat island*/
// //print(duLST.limit(100))
var dayUHI_TERRA_May = duLST_TERRA_May.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_TERRA_May.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

//Map.addLayer(dayUHI_TERRA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_TERRA_May = nuLST_TERRA_May.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_TERRA_May.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


var dayUHI_AQUA_May= duLST_AQUA_May.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_AQUA_May.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


//Map.addLayer(dayUHI_AQUA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_AQUA_May = nuLST_AQUA_May.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_AQUA_May.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

var dayUHI_May=ee.ImageCollection([dayUHI_TERRA_May, dayUHI_AQUA_May]).mean();
var nightUHI_May=ee.ImageCollection([nightUHI_TERRA_May, nightUHI_AQUA_May]).mean();

//Map.addLayer(dayUHI)
//print(dayUHI)

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: dayUHI_May, assetId: 'users/tirthankar25/dayUHI_May_2017_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: nightUHI_May, assetId: 'users/tirthankar25/nightUHI_May_2017_vfF', maxPixels:99999999999, region: World, scale:300} );


//Create spatially disaggregated data
var Ruralref_day_May=ee.ImageCollection([drLST_AQUA_May.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), drLST_TERRA_May.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Ruralref_night_May=ee.ImageCollection([nrLST_AQUA_May.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), nrLST_TERRA_May.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Urbanref_day_May=ee.ImageCollection([daytimeLST_TERRA.select(4), daytimeLST_AQUA.select(4)]).mean().updateMask(urbanurban);
var Urbanref_night_May=ee.ImageCollection([nighttimeLST_TERRA.select(4), nighttimeLST_AQUA.select(4)]).mean().updateMask(urbanurban);
 
var dayUHI_1km_May = Urbanref_day_May.subtract(Ruralref_day_May);
var nightUHI_1km_May = Urbanref_night_May.subtract(Ruralref_night_May);
//Map.addLayer(dayUHI_1km)

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: dayUHI_1km_May, assetId: 'users/tirthankar25/dayUHI_May_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: nightUHI_1km_May, assetId: 'users/tirthankar25/nightUHI_May_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );





// /* Create image from feature collection and subtract the rural daytime LST image from the urban 
// daytime LST image to get the daytime urban heat island*/
// //print(duLST.limit(100))
var dayUHI_TERRA_Jun = duLST_TERRA_Jun.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_TERRA_Jun.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

//Map.addLayer(dayUHI_TERRA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_TERRA_Jun = nuLST_TERRA_Jun.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_TERRA_Jun.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


var dayUHI_AQUA_Jun= duLST_AQUA_Jun.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_AQUA_Jun.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


//Map.addLayer(dayUHI_AQUA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_AQUA_Jun = nuLST_AQUA_Jun.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_AQUA_Jun.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

var dayUHI_Jun=ee.ImageCollection([dayUHI_TERRA_Jun, dayUHI_AQUA_Jun]).mean();
var nightUHI_Jun=ee.ImageCollection([nightUHI_TERRA_Jun, nightUHI_AQUA_Jun]).mean();

//Map.addLayer(dayUHI)
//print(dayUHI)

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: dayUHI_Jun, assetId: 'users/tirthankar25/dayUHI_Jun_2017_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: nightUHI_Jun, assetId: 'users/tirthankar25/nightUHI_Jun_2017_vfF', maxPixels:99999999999, region: World, scale:300} );


//Create spatially disaggregated data
var Ruralref_day_Jun=ee.ImageCollection([drLST_AQUA_Jun.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), drLST_TERRA_Jun.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Ruralref_night_Jun=ee.ImageCollection([nrLST_AQUA_Jun.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), nrLST_TERRA_Jun.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Urbanref_day_Jun=ee.ImageCollection([daytimeLST_TERRA.select(5), daytimeLST_AQUA.select(5)]).mean().updateMask(urbanurban);
var Urbanref_night_Jun=ee.ImageCollection([nighttimeLST_TERRA.select(5), nighttimeLST_AQUA.select(5)]).mean().updateMask(urbanurban);
 
var dayUHI_1km_Jun = Urbanref_day_Jun.subtract(Ruralref_day_Jun);
var nightUHI_1km_Jun = Urbanref_night_Jun.subtract(Ruralref_night_Jun);
//Map.addLayer(dayUHI_1km)

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: dayUHI_1km_Jun, assetId: 'users/tirthankar25/dayUHI_Jun_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: nightUHI_1km_Jun, assetId: 'users/tirthankar25/nightUHI_Jun_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );





// /* Create image from feature collection and subtract the rural daytime LST image from the urban 
// daytime LST image to get the daytime urban heat island*/
// //print(duLST.limit(100))
var dayUHI_TERRA_Jul = duLST_TERRA_Jul.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_TERRA_Jul.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

//Map.addLayer(dayUHI_TERRA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_TERRA_Jul = nuLST_TERRA_Jul.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_TERRA_Jul.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


var dayUHI_AQUA_Jul= duLST_AQUA_Jul.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_AQUA_Jul.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


//Map.addLayer(dayUHI_AQUA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_AQUA_Jul = nuLST_AQUA_Jul.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_AQUA_Jul.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

var dayUHI_Jul=ee.ImageCollection([dayUHI_TERRA_Jul, dayUHI_AQUA_Jul]).mean();
var nightUHI_Jul=ee.ImageCollection([nightUHI_TERRA_Jul, nightUHI_AQUA_Jul]).mean();

//Map.addLayer(dayUHI)
//print(dayUHI)

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: dayUHI_Jul, assetId: 'users/tirthankar25/dayUHI_Jul_2017_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: nightUHI_Jul, assetId: 'users/tirthankar25/nightUHI_Jul_2017_vfF', maxPixels:99999999999, region: World, scale:300} );


//Create spatially disaggregated data
var Ruralref_day_Jul=ee.ImageCollection([drLST_AQUA_Jul.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), drLST_TERRA_Jul.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Ruralref_night_Jul=ee.ImageCollection([nrLST_AQUA_Jul.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), nrLST_TERRA_Jul.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Urbanref_day_Jul=ee.ImageCollection([daytimeLST_TERRA.select(6), daytimeLST_AQUA.select(6)]).mean().updateMask(urbanurban);
var Urbanref_night_Jul=ee.ImageCollection([nighttimeLST_TERRA.select(6), nighttimeLST_AQUA.select(6)]).mean().updateMask(urbanurban);
 
var dayUHI_1km_Jul = Urbanref_day_Jul.subtract(Ruralref_day_Jul);
var nightUHI_1km_Jul = Urbanref_night_Jul.subtract(Ruralref_night_Jul);
//Map.addLayer(dayUHI_1km)

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: dayUHI_1km_Jul, assetId: 'users/tirthankar25/dayUHI_Jul_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: nightUHI_1km_Jul, assetId: 'users/tirthankar25/nightUHI_Jul_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );





// /* Create image from feature collection and subtract the rural daytime LST image from the urban 
// daytime LST image to get the daytime urban heat island*/
// //print(duLST.limit(100))
var dayUHI_TERRA_Aug = duLST_TERRA_Aug.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_TERRA_Aug.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

//Map.addLayer(dayUHI_TERRA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_TERRA_Aug = nuLST_TERRA_Aug.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_TERRA_Aug.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


var dayUHI_AQUA_Aug= duLST_AQUA_Aug.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_AQUA_Aug.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


//Map.addLayer(dayUHI_AQUA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_AQUA_Aug = nuLST_AQUA_Aug.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_AQUA_Aug.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

var dayUHI_Aug=ee.ImageCollection([dayUHI_TERRA_Aug, dayUHI_AQUA_Aug]).mean();
var nightUHI_Aug=ee.ImageCollection([nightUHI_TERRA_Aug, nightUHI_AQUA_Aug]).mean();

//Map.addLayer(dayUHI)
//print(dayUHI)

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: dayUHI_Aug, assetId: 'users/tirthankar25/dayUHI_Aug_2017_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: nightUHI_Aug, assetId: 'users/tirthankar25/nightUHI_Aug_2017_vfF', maxPixels:99999999999, region: World, scale:300} );


//Create spatially disaggregated data
var Ruralref_day_Aug=ee.ImageCollection([drLST_AQUA_Aug.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), drLST_TERRA_Aug.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Ruralref_night_Aug=ee.ImageCollection([nrLST_AQUA_Aug.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), nrLST_TERRA_Aug.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Urbanref_day_Aug=ee.ImageCollection([daytimeLST_TERRA.select(7), daytimeLST_AQUA.select(7)]).mean().updateMask(urbanurban);
var Urbanref_night_Aug=ee.ImageCollection([nighttimeLST_TERRA.select(7), nighttimeLST_AQUA.select(7)]).mean().updateMask(urbanurban);
 
var dayUHI_1km_Aug = Urbanref_day_Aug.subtract(Ruralref_day_Aug);
var nightUHI_1km_Aug = Urbanref_night_Aug.subtract(Ruralref_night_Aug);
//Map.addLayer(dayUHI_1km)

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: dayUHI_1km_Aug, assetId: 'users/tirthankar25/dayUHI_Aug_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: nightUHI_1km_Aug, assetId: 'users/tirthankar25/nightUHI_Aug_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );





// /* Create image from feature collection and subtract the rural daytime LST image from the urban 
// daytime LST image to get the daytime urban heat island*/
// //print(duLST.limit(100))
var dayUHI_TERRA_Sep = duLST_TERRA_Sep.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_TERRA_Sep.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

//Map.addLayer(dayUHI_TERRA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_TERRA_Sep = nuLST_TERRA_Sep.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_TERRA_Sep.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


var dayUHI_AQUA_Sep= duLST_AQUA_Sep.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_AQUA_Sep.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


//Map.addLayer(dayUHI_AQUA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_AQUA_Sep = nuLST_AQUA_Sep.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_AQUA_Sep.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

var dayUHI_Sep=ee.ImageCollection([dayUHI_TERRA_Sep, dayUHI_AQUA_Sep]).mean();
var nightUHI_Sep=ee.ImageCollection([nightUHI_TERRA_Sep, nightUHI_AQUA_Sep]).mean();

//Map.addLayer(dayUHI)
//print(dayUHI)

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: dayUHI_Sep, assetId: 'users/tirthankar25/dayUHI_Sep_2017_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: nightUHI_Sep, assetId: 'users/tirthankar25/nightUHI_Sep_2017_vfF', maxPixels:99999999999, region: World, scale:300} );


//Create spatially disaggregated data
var Ruralref_day_Sep=ee.ImageCollection([drLST_AQUA_Sep.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), drLST_TERRA_Sep.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Ruralref_night_Sep=ee.ImageCollection([nrLST_AQUA_Sep.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), nrLST_TERRA_Sep.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Urbanref_day_Sep=ee.ImageCollection([daytimeLST_TERRA.select(8), daytimeLST_AQUA.select(8)]).mean().updateMask(urbanurban);
var Urbanref_night_Sep=ee.ImageCollection([nighttimeLST_TERRA.select(8), nighttimeLST_AQUA.select(8)]).mean().updateMask(urbanurban);
 
var dayUHI_1km_Sep = Urbanref_day_Sep.subtract(Ruralref_day_Sep);
var nightUHI_1km_Sep = Urbanref_night_Sep.subtract(Ruralref_night_Sep);
//Map.addLayer(dayUHI_1km)

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: dayUHI_1km_Sep, assetId: 'users/tirthankar25/dayUHI_Sep_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: nightUHI_1km_Sep, assetId: 'users/tirthankar25/nightUHI_Sep_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );





// /* Create image from feature collection and subtract the rural daytime LST image from the urban 
// daytime LST image to get the daytime urban heat island*/
// //print(duLST.limit(100))
var dayUHI_TERRA_Oct = duLST_TERRA_Oct.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_TERRA_Oct.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

//Map.addLayer(dayUHI_TERRA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_TERRA_Oct = nuLST_TERRA_Oct.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_TERRA_Oct.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


var dayUHI_AQUA_Oct= duLST_AQUA_Oct.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_AQUA_Oct.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


//Map.addLayer(dayUHI_AQUA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_AQUA_Oct = nuLST_AQUA_Oct.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_AQUA_Oct.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

var dayUHI_Oct=ee.ImageCollection([dayUHI_TERRA_Oct, dayUHI_AQUA_Oct]).mean();
var nightUHI_Oct=ee.ImageCollection([nightUHI_TERRA_Oct, nightUHI_AQUA_Oct]).mean();

//Map.addLayer(dayUHI)
//print(dayUHI)

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: dayUHI_Oct, assetId: 'users/tirthankar25/dayUHI_Oct_2017_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: nightUHI_Oct, assetId: 'users/tirthankar25/nightUHI_Oct_2017_vfF', maxPixels:99999999999, region: World, scale:300} );


//Create spatially disaggregated data
var Ruralref_day_Oct=ee.ImageCollection([drLST_AQUA_Oct.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), drLST_TERRA_Oct.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Ruralref_night_Oct=ee.ImageCollection([nrLST_AQUA_Oct.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), nrLST_TERRA_Oct.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Urbanref_day_Oct=ee.ImageCollection([daytimeLST_TERRA.select(9), daytimeLST_AQUA.select(9)]).mean().updateMask(urbanurban);
var Urbanref_night_Oct=ee.ImageCollection([nighttimeLST_TERRA.select(9), nighttimeLST_AQUA.select(9)]).mean().updateMask(urbanurban);
 
var dayUHI_1km_Oct = Urbanref_day_Oct.subtract(Ruralref_day_Oct);
var nightUHI_1km_Oct = Urbanref_night_Oct.subtract(Ruralref_night_Oct);
//Map.addLayer(dayUHI_1km)

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: dayUHI_1km_Oct, assetId: 'users/tirthankar25/dayUHI_Oct_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: nightUHI_1km_Oct, assetId: 'users/tirthankar25/nightUHI_Oct_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );





// /* Create image from feature collection and subtract the rural daytime LST image from the urban 
// daytime LST image to get the daytime urban heat island*/
// //print(duLST.limit(100))
var dayUHI_TERRA_Nov = duLST_TERRA_Nov.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_TERRA_Nov.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

//Map.addLayer(dayUHI_TERRA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_TERRA_Nov = nuLST_TERRA_Nov.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_TERRA_Nov.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


var dayUHI_AQUA_Nov= duLST_AQUA_Nov.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_AQUA_Nov.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


//Map.addLayer(dayUHI_AQUA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_AQUA_Nov = nuLST_AQUA_Nov.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_AQUA_Nov.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

var dayUHI_Nov=ee.ImageCollection([dayUHI_TERRA_Nov, dayUHI_AQUA_Nov]).mean();
var nightUHI_Nov=ee.ImageCollection([nightUHI_TERRA_Nov, nightUHI_AQUA_Nov]).mean();

//Map.addLayer(dayUHI)
//print(dayUHI)

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: dayUHI_Nov, assetId: 'users/tirthankar25/dayUHI_Nov_2017_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: nightUHI_Nov, assetId: 'users/tirthankar25/nightUHI_Nov_2017_vfF', maxPixels:99999999999, region: World, scale:300} );


//Create spatially disaggregated data
var Ruralref_day_Nov=ee.ImageCollection([drLST_AQUA_Nov.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), drLST_TERRA_Nov.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Ruralref_night_Nov=ee.ImageCollection([nrLST_AQUA_Nov.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), nrLST_TERRA_Nov.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Urbanref_day_Nov=ee.ImageCollection([daytimeLST_TERRA.select(10), daytimeLST_AQUA.select(10)]).mean().updateMask(urbanurban);
var Urbanref_night_Nov=ee.ImageCollection([nighttimeLST_TERRA.select(10), nighttimeLST_AQUA.select(10)]).mean().updateMask(urbanurban);
 
var dayUHI_1km_Nov = Urbanref_day_Nov.subtract(Ruralref_day_Nov);
var nightUHI_1km_Nov = Urbanref_night_Nov.subtract(Ruralref_night_Nov);
//Map.addLayer(dayUHI_1km)

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: dayUHI_1km_Nov, assetId: 'users/tirthankar25/dayUHI_Nov_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: nightUHI_1km_Nov, assetId: 'users/tirthankar25/nightUHI_Nov_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );





// /* Create image from feature collection and subtract the rural daytime LST image from the urban 
// daytime LST image to get the daytime urban heat island*/
// //print(duLST.limit(100))
var dayUHI_TERRA_Dec = duLST_TERRA_Dec.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_TERRA_Dec.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

//Map.addLayer(dayUHI_TERRA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_TERRA_Dec = nuLST_TERRA_Dec.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_TERRA_Dec.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


var dayUHI_AQUA_Dec= duLST_AQUA_Dec.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_AQUA_Dec.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


//Map.addLayer(dayUHI_AQUA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_AQUA_Dec = nuLST_AQUA_Dec.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_AQUA_Dec.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

var dayUHI_Dec=ee.ImageCollection([dayUHI_TERRA_Dec, dayUHI_AQUA_Dec]).mean();
var nightUHI_Dec=ee.ImageCollection([nightUHI_TERRA_Dec, nightUHI_AQUA_Dec]).mean();

//Map.addLayer(dayUHI)
//print(dayUHI)

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: dayUHI_Dec, assetId: 'users/tirthankar25/dayUHI_Dec_2017_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: nightUHI_Dec, assetId: 'users/tirthankar25/nightUHI_Dec_2017_vfF', maxPixels:99999999999, region: World, scale:300} );


//Create spatially disaggregated data
var Ruralref_day_Dec=ee.ImageCollection([drLST_AQUA_Dec.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), drLST_TERRA_Dec.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Ruralref_night_Dec=ee.ImageCollection([nrLST_AQUA_Dec.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), nrLST_TERRA_Dec.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Urbanref_day_Dec=ee.ImageCollection([daytimeLST_TERRA.select(11), daytimeLST_AQUA.select(11)]).mean().updateMask(urbanurban);
var Urbanref_night_Dec=ee.ImageCollection([nighttimeLST_TERRA.select(11), nighttimeLST_AQUA.select(11)]).mean().updateMask(urbanurban);
 
var dayUHI_1km_Dec = Urbanref_day_Dec.subtract(Ruralref_day_Dec);
var nightUHI_1km_Dec = Urbanref_night_Dec.subtract(Ruralref_night_Dec);
//Map.addLayer(dayUHI_1km)

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: dayUHI_1km_Dec, assetId: 'users/tirthankar25/dayUHI_Dec_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
//Export.image.toAsset({image: nightUHI_1km_Dec, assetId: 'users/tirthankar25/nightUHI_Dec_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );

