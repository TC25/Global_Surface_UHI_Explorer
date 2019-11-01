/*Import shapefiles of all urban areas in the world*/
var urban=ee.FeatureCollection('users/tirthankar25/urban_Schneider');



/*World Geometry to export data and find global mean*/
var World=ee.Geometry.Rectangle(-180, -90, 180, 90);
var World=ee.Geometry(World, null, false);


/*Import the images containing the 16-year median values of daytime LST and nighttime LST, which you previously exported*/
var daytimeLST_TERRA = ee.Image("users/tirthankar25/LST_Day_TERRA_mean_summer_2017_vfF");
//var daytimeLST = ee.Image("USGS/GMTED2017");
var nighttimeLST_TERRA = ee.Image("users/tirthankar25/LST_Night_TERRA_mean_summer_2017_vfF");

/*Import the images containing the 16-year median values of daytime LST and nighttime LST, which you previously exported*/
var daytimeLST_AQUA = ee.Image("users/tirthankar25/LST_Day_AQUA_mean_summer_2017_vfF");
//var daytimeLST = ee.Image("USGS/GMTED2017");
var nighttimeLST_AQUA = ee.Image("users/tirthankar25/LST_Night_AQUA_mean_summer_2017_vfF");

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

Map.addLayer(DEM_diff,{},'DEM difference');
//Map.addLayer(urbanurban,{},'urban')
/*select all image pixels that represent any land use or land cover other than urban and built up land*/
var urbannonurban1=urban2001.neq(190);
var urbannonurban2=urban2001.neq(210);
var urbannonurban3=DEM_diff.lte(50);
//Map.addLayer(urbannonurban3,{},'DEM difference mask');
//Map.addLayer(urbannonurban1,{},'non-urban')
/*Create new image with daytime LST pixels where the land use pixel is urban and built up*/
var dayurbanLST_TERRA=daytimeLST_TERRA.updateMask(urbanurban);

/*Create new image with daytime LST pixels where the land use pixel is anything but urban and built up*/
var dayruralLST_TERRA=daytimeLST_TERRA.updateMask(urbannonurban1).updateMask(urbannonurban2).updateMask(urbannonurban3);

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
var duLST_TERRA = regions(dayurbanLST_TERRA)
var drLST_TERRA = regions(dayruralLST_TERRA)
var nuLST_TERRA = regions(nighturbanLST_TERRA);
var nrLST_TERRA = regions(nightruralLST_TERRA);

var duLST_AQUA = regions(dayurbanLST_AQUA)
var drLST_AQUA = regions(dayruralLST_AQUA)
var nuLST_AQUA = regions(nighturbanLST_AQUA);
var nrLST_AQUA = regions(nightruralLST_AQUA);


// /* Function to get centroids of each urban area*/
var findCentroid = function(feature) {
  
/*Keep this property for the new feature collection consisting of centroids*/
var transferProperties = ['mean','City_DEM', 'Code'];
var centroid = feature.geometry().centroid();
return ee.Feature(centroid).copyProperties(feature, transferProperties);
};

/*Map the centroid finding function over the features.*/
var  duLSTC =  duLST_AQUA.map(findCentroid);
var  drLSTC =  drLST_AQUA.map(findCentroid);
var  nuLSTC =  nuLST_AQUA.map(findCentroid);
var  nrLSTC =  nrLST_AQUA.map(findCentroid);

  /* Export the feature collection for further analysis*/
  Export.table.toDrive({
  collection: drLSTC,  description: 'Rural_dayLST_mean_summer_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
  /* Export the feature collection for further analysis*/
  Export.table.toDrive({
  collection: duLSTC,  description: 'Urban_dayLST_mean_summer_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
  /* Export the feature collection for further analysis*/
  Export.table.toDrive({
  collection: nuLSTC,  description: 'Urban_nightLST_mean_summer_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});
  
  /* Export the feature collection for further analysis*/
  Export.table.toDrive({
  collection: nrLSTC,  description: 'Rural_nightLST_mean_summer_2017_vfF',  folder: 'UHI map final version', fileFormat: 'CSV'});

// /* Create image from feature collection and subtract the rural daytime LST image from the urban 
// daytime LST image to get the daytime urban heat island*/
// //print(duLST.limit(100))
var dayUHI_TERRA = duLST_TERRA.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_TERRA.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

//Map.addLayer(dayUHI_TERRA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_TERRA = nuLST_TERRA.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_TERRA.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


var dayUHI_AQUA= duLST_AQUA.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(drLST_AQUA.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));


//Map.addLayer(dayUHI_AQUA)

/* Create image from feature collection and subtract the rural nighttime LST image from the urban 
nighttime LST image to get the nighttime urban heat island*/
var nightUHI_AQUA = nuLST_AQUA.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})
.subtract(nrLST_AQUA.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}));

var dayUHI=ee.ImageCollection([dayUHI_TERRA, dayUHI_AQUA]).mean();
var nightUHI=ee.ImageCollection([nightUHI_TERRA, nightUHI_AQUA]).mean();

//Map.addLayer(dayUHI)


/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: dayUHI, assetId: 'users/tirthankar25/dayUHI_summer_2017_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: nightUHI, assetId: 'users/tirthankar25/nightUHI_summer_2017_vfF', maxPixels:99999999999, region: World, scale:300} );


//Create spatially disaggregated data
var Ruralref_day=ee.ImageCollection([drLST_AQUA.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), drLST_TERRA.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Ruralref_night=ee.ImageCollection([nrLST_AQUA.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()}), nrLST_TERRA.filter(ee.Filter.neq('mean', null)).reduceToImage({properties: ['mean'],reducer: ee.Reducer.first()})]).mean();
var Urbanref_day=ee.ImageCollection([daytimeLST_TERRA, daytimeLST_AQUA]).mean().updateMask(urbanurban);
var Urbanref_night=ee.ImageCollection([nighttimeLST_TERRA, nighttimeLST_AQUA]).mean().updateMask(urbanurban);
 
var dayUHI_1km = Urbanref_day.subtract(Ruralref_day);
var nightUHI_1km = Urbanref_night.subtract(Ruralref_night);
Map.addLayer(dayUHI_1km)

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: dayUHI_1km, assetId: 'users/tirthankar25/dayUHI_summer_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );

/*Export image as an asset so that it can used in the Zonal analysis*/
Export.image.toAsset({image: nightUHI_1km, assetId: 'users/tirthankar25/nightUHI_summer_2017_1km_vfF', maxPixels:99999999999, region: World, scale:300} );

