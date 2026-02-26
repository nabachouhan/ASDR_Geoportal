const config = {
    // appName: 'MyApp',
    // port: 3000,
    // apiUrl: 'https://api.example.com',
    geoserverurl : 'http://localhost:8080/geoserver',
    workspacename : 'agis',
    storename : 'repository',
    mapStorename: 'openlayer',

    // colors
      // colors
      queryLayerColor: '#000',
      villageShapefile: "assam_village",
      stateDistShapefile: 'assam_state_dist',
      assamBoundary: 'assam_boundary',
      // assamSSAShapefile: 'assam_ssa2022',
      assamSSAShapefile: 'ssa_data_2022_flt',

      assamSSADist: 'district',
      assamSSABlock:'block',
      assamSSAVill:'village',
      assamSSASchl:'school',
      fieldnameDisplay: 'school'
};

export default config;
