 /*World Geometry to export data and find global mean*/
var World=ee.Geometry.Rectangle(-180, -90, 180, 90); 
var World=ee.Geometry(World, null, false);

var landcover2015=ee.Image('users/tirthankarchakraborty/GOBLandcover1992_2015').eq(190);

var urb=ee.FeatureCollection('users/tirthankar25/urban_Schneider_final_paper_vfF')

var dd=ee.Image('users/tirthankar25/UHI_yearly_1km_vfF')//.updateMask(landcover2015.select('b24'));



Export.image.toAsset({image: dd.clip(urb), assetId: 'UHI_yearly_1km_vfF_v3', region: World, maxPixels:99999999999, scale:300} );
//Export.image.toAsset({image: UHItime, assetId: 'UHI_yearly', region: World, maxPixels:999999999, scale:1000} );
//Export.image.toAsset({image: AllUHI, assetId: 'UHI_all_seasons', region: World, maxPixels:999999999, scale:1000} );
//Export.image.toAsset({image: AllUHI_1km, assetId: 'UHI_all_seasons_1km', region: World, maxPixels:999999999, scale:1000} );



print(urb.limit(1))
Export.table.toAsset({collection:urb, description: 'urban_Schneider_final_paper_vfF'})
