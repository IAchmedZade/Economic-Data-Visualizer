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

class tradeGraph{
    constructor(){
        this.nodes = [];
        this.edges = {};
    }

    addNode = function(node){
        this.nodes.forEach(oldNode => this.edges[oldNode].push(node));
        this.edges[node] = this.nodes;
        this.nodes.push(node);       
    }

    removeNode = function(node){
        this.removeEdges;
        let n = this.nodes.length;
        for(let i = 0; i < n; i++){
            if(this.nodes[i] === node){
                this.nodes[i].splice(i,1);
                break;
            }
        }
    }

    removeEdges = function (node) {
        this.edges[node].forEach(neihgbor => {
            let n = this.edges[neihgbor].length;
            for(let i = 0; i < n; i++){
                if(this.edges[neihgbor][i] === node){
                    this.edges[neighbors].splice(i,1);
                    break;
                }
            }
        });
        delete(this.edges[node]);
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
            evt.target.style.fill = '#203030';            
            evt.target.querySelectorAll('*').forEach(element =>{
                element.style.fill = '#203030';
            });
        }
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
        },3000);
    }
}



/* <div class="progress">
<div class="indeterminate"></div>
</div> */


class tradeFlowManager{
    constructor(){
        this.activeCountries = [];
        this.graph = new tradeGraph;
        this.itemIds = [];
        this.shortIds = [];
        let exportsWithShortestIds = [];
        let importsWithShortestIds = [];
    }

    subscribe = function(country){
        this.activeCountries.push(country);
        this.graph.addNode(country);
        this.getData(country);    
    }

    unsubscribe = function(country){
        this.activeCountries.splice(this.activeCountries.indexOf(country),1);
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
            UIControl.removeLoadingBar();
            UIControl.message("Trade Mode is still under construction! PLease use global mode for now.");
        }
    }

    getGlobalData = function(country,year){
        const apiCall = new oecCall;
        apiCall.getGlobalImportsAndExports(country.iso, year).then(importsAndExports =>{
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