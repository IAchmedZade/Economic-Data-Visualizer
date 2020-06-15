class oecCall{
    
       async getKeys(){
        const countries = await fetch('https://oec.world/attr/country');
        const names = await countries.json(); // eudeu

        const goods = await fetch('https://oec.world/attr/hs02');
        const goodIds = await goods.json(); // 0101 --> horses

        return{
            names: names,
            goodIds: goodIds
        }
    }
    // The API has been rerouted to legacy.oec.world !!
    //
    // async getImports(origin, destination, year){
    //     const importPromise = await fetch(destination ?`https://oec.world/hs02/import/${year}/${origin}/${destination}/show/` :
    //                                                    `https://oec.world/hs02/import/${year}/${origin}/all/show/`);
    //     const imports = await importPromise.json();

    //     return imports;
    // }
    
    // Structure of API:
    // `https://legacy.oec.world/hs02/${year}/export/${origin}/${destination}/show`

    async getExportsBetweenTwoCountries(origin, destination, year){
        const exportPromise = await fetch(`https://oec.world/hs02/export/${year}/${origin}/${destination}/show`);
        console.log(exportPromise);
        const exports = await exportPromise.json();

        return exports;
    }

    async getGlobalImportsAndExports(origin, year){
        if(! (year < 2018 && year > 2002)) year = 2017;
        const importsAndExportsPromise = await fetch(`https://legacy.oec.world/hs02/export/${year}/${origin}/all/show/`);
        
        if(importsAndExportsPromise.status !== 200){
            return importsAndExportsPromise;
        }
        // console.log(importsAndExportsPromise);
        const importsAndExports = await importsAndExportsPromise.json();

        return importsAndExports;
    }
}