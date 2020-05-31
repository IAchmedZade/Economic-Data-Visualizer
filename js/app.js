const map = document.querySelector('.myMap');
const table = document.getElementById('tabulatedData');
const displayBox = document.getElementById('displayBox');
const updateButton = document.getElementById('updateBtn');
const tradeMode = document.getElementById("tradeMode");

var worldMap;
var countries = [];
const tradeFlow = new tradeFlowManager();

document.onreadystatechange = function () {
    if(document.readyState == 'complete'){
        worldMap = map.getSVGDocument();
        main();
    }
}

let nameAndYear = [document.getElementById('name'),
                 document.getElementById('year'),document.getElementById('nextCountry'), document.getElementById('message')];



async function getLocalData(){
    const countryIds = await fetch('data/countryIds.txt');
    const response = await countryIds.json();

    const goods = await fetch('data/goods.json');
    const responseGoods = await goods.json();
    return {countryData: response, goodsData: responseGoods};
}



function main(){
    getLocalData().then(function(localData){
        tradeFlow.itemIds= localData.goodsData.data;
        tradeFlow.itemIds.forEach(element=> {if(element["id"].length <=2) tradeFlow.shortIds.push(element);});
        localData.countryData.forEach(element=>{
            let svgHandle = element.svgItem;
            let countrySVG = worldMap.getElementById(svgHandle);
            let handle = new country({
                svg : countrySVG,
                name: element.name,
                iso: element.iso
            });
            if(!svgHandle.includes("0_") && !svgHandle.includes("_0")&&
               !svgHandle.includes("2_") && !svgHandle.includes("_2")){
                countries.push(handle);
                countrySVG.addEventListener('mouseenter',function(e){
                    UIControl.highlightCountry(e, handle);
                });          
                countrySVG.addEventListener('mouseleave',function(e){
                    UIControl.unselectCountry(e, handle);
                });
                countrySVG.addEventListener('click', function(e){
                    UIControl.selectCountry(e, handle);
                });
                countries.push(handle);
            }    
        });
        updateButton.addEventListener('click', function(){
            tradeFlow.notify();
        });
    })
    .catch(err => console.log(err));
}








