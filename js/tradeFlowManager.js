class country{
    constructor(data){
        this.svg = data.svg;
        this.name = data.name;
        this.iso = data.iso;
        this.imports = [];
        this.exports = [];
        this.subscribed = false;
    }
}

class UIControl{
    
    static displayData(country){
        UIControl.removeLoadingBar();
        nameAndYear[0].style.color = 'white';
        nameAndYear[0].innerHTML = country.name;        
        UIControl.createCanvas();
        let ctx = document.getElementsByTagName('canvas')[0].getContext('2d');
        UIControl.createChart(ctx,country);
        
    }

    static createCanvas(){
        UIControl.removeAlreadyDisplayedData();
        displayBox.appendChild(document.createElement("canvas"));        
    }

    static createChart(ctx,country){
        let values = []; let names = [];
        country.exports.forEach(element =>{
            values.push(element.value);
            names.push(element.name);
        });        
        let pieChart = new Chart(ctx,{
                type: 'pie',
                data: {
                    datasets:[{
                        data: values,
                        backgroundColor: ['#F2F3F4', '#222222', '#F3C300', '#875692', '#F38400',
                                        '#A1CAF1', '#BE0032', '#C2B280', '#848482', '#008856',
                                        '#E68FAC', '#0067A5', '#F99379', '#604E97', '#F6A600', 
                                        '#B3446C', '#DCD300', '#882D17', '#8DB600', '#654522', 
                                        '#E25822', '#2B3D26']
                    }],
                    labels: names
                },
                options:{
                    responsive: false,
                    legend:{
                        display: false
                    },
                    title: {
                        display: true,
                        text: country.name + ': Global Exports in ' + document.getElementById("setYear").value
                    }
                }
            }            
        );      
    }

    static removeAlreadyDisplayedData(){
        let canvas = document.getElementsByTagName('canvas');
        if(canvas.length){
            canvas[0].remove();
        }        
    }

    static highlightCountry(evt,handle){         
        if((handle.subscribed === false) == true){            
            evt.target.style.fill = 'green';
            evt.target.querySelectorAll('*').forEach(element =>{
                element.style.fill = 'green';
            });
            if(nameAndYear[0].innerHTML != handle.name){
                nameAndYear[2].innerHTML = handle.name;
                nameAndYear[2].style.color = 'red';
            }
        }
        else{
            UIControl.displayData(handle);
        }
    }

    static unselectCountry(evt, handle){
        if(!handle.subscribed){
            if(evt == null){
                console.log('Evt was null');
                UIControl.colorGrey(handle);
            }
            else{
                UIControl.colorGrey(evt.target);
            }
            
        }
    }

    static colorGrey(htmlItem){
        htmlItem.style.fill = '#203030';            
        htmlItem.querySelectorAll('*').forEach(element =>{
            element.style.fill = '#203030';
        });
    }

    static selectCountry(evt, handle){
        if((handle.subscribed === false) == true){      
            tradeFlow.subscribe(handle);
            UIControl.highlightCountry(evt,handle);
            if(tradeMode.checked) {
                UIControl.unselectCountry(evt,handle);
                return;
            }
            handle.subscribed = true;
            nameAndYear[0].style.color = 'white';
        }    
        else{
            handle.subscribed = false;            
            tradeFlow.unsubscribe(handle);
            UIControl.unselectCountry(evt, handle);                        
        }
    }

    static loadingAnimation(){
        this.removeLoadingBar();
        UIControl.removeAlreadyDisplayedData();
        let loader = document.createElement("div");
        loader.className = 'progress';
        let loadingBar = document.createElement("div");
        loadingBar.className = "indeterminate";
        loader.appendChild(loadingBar);
        displayBox.appendChild(loader);
    }

    static removeLoadingBar(){
        if(document.getElementsByClassName('progress')[0] != undefined) document.getElementsByClassName('progress')[0].remove();
    }

    static message(msg){        
        nameAndYear[3].innerHTML = msg;
        setTimeout(function(){
            nameAndYear[3].innerHTML = '';
            UIControl.removeLoadingBar();
        },5000);
    }
}


class tradeFlowManager{
    constructor(){
        this.activeCountries = [];
        this.itemIds = [];
        this.shortIds = [];
        this.maxSize = 5;
        this.apiCall = new oecCall;
    }

    subscribe = function(country){
        let found = false;
        this.activeCountries.forEach(element => {
            if(element.name == country.name){
                found = true;
            }
        });
        if(!found){
            this.activeCountries.push(country);
            this.getData(country); 
        }
        if(this.activeCountries.length > 5){
            UIControl.colorGrey(this.activeCountries[0].svg);
            this.activeCountries.splice(0,1);
        }   
    }

    unsubscribe = function(country){
        let idx = this.activeCountries.indexOf(country);
        if(idx == -1) return;
        this.activeCountries.splice(idx,1);
        if(this.activeCountries.length == 0){
            UIControl.removeAlreadyDisplayedData();
        }
        else{
            let mostRecent = this.activeCountries[this.activeCountries.length-1]
            UIControl.displayData(mostRecent);
        }
    }

    notify = function(){
        this.activeCountries.forEach(element => this.getData(element));
    }

    getData = function(country){
        UIControl.loadingAnimation();
        let year = document.getElementById("setYear").value;
        if(!tradeMode.checked){
            this.getGlobalData(country,year);
        }
        else{
            //Implement trade mode furhter!            
            /*year = 2012;
            for(let i = 0; i < this.activeCountries.length-1; i++){
                for(let j = i+1; j < this.activeCountries.length; j++){
                    this.getLocalData(this.activeCountries[i],this.activeCountries[j], year);
                }
            }
            */
            UIControl.removeLoadingBar();
            UIControl.message("Trade Mode is still under construction! PLease use global mode for now.");
        }
    }


    // API still exhibiting strange behaviour :( 
    getLocalData = function(exporter, importer, year){
        this.apiCall.getExportsBetweenTwoCountries(exporter.name, importer.name, year).then(bilateralData =>{
            console.log(bilateralData);
        })
        .catch(err => {
            UIControl.message(err);
        });
    }

    getGlobalData = function(country,year){
        this.apiCall.getGlobalImportsAndExports(country.iso, year).then(importsAndExports =>{            
            let globalTradeFlow = importsAndExports.data;
            this.bundleDataByChapters(globalTradeFlow,country);
            UIControl.displayData(country);
        })
        .catch(err =>{
            UIControl.unselectCountry(null,country);
            UIControl.message(err);
        });
    }

    bundleDataByChapters = function(globalTradeFlow,country){
        
        country.exports = this.generateEmptyGoodArray();
        country.imports = this.generateEmptyGoodArray();
        
        this.bundleDataByChaptersHelper(globalTradeFlow, country.exports, country.imports);
        
        
    }

    generateEmptyGoodArray = function(){
        let GoodArray = [];
        for(let i = 0; i < 22; i++) GoodArray.push({name: this.shortIds[i].name, value: 0});
        return GoodArray;
    }

    bundleDataByChaptersHelper = function(globalTradeFlow, exports,imports){
        for(let j = 0; j < this.shortIds.length; j++){
            for(let i = 0; i < globalTradeFlow.length; i++){
                let candidate = globalTradeFlow[i];
                if(!isNaN(candidate.export_val) && candidate.hs02_id.substr(0,2) == this.shortIds[j].id){
                    exports[j].value += candidate.export_val;
                }
                if(!isNaN(candidate.import_val) && candidate.hs02_id.substr(0,2) == this.shortIds[j].id){
                    imports[j].value += candidate.import_val;
                }
            }
            exports[j].value = Math.floor(exports[j].value);
            imports[j].value = Math.floor(imports[j].value);
        }
    }
}