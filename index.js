// ==UserScript==
// @name         SeizedBots
// @namespace    https://seizedbots.com/
// @version      1.0.1
// @description  try to take over the world!
// @author       SeizedThoughts
// @match        https://backpack.tf/*
// @icon         https://www.google.com/s2/favicons?domain=backpack.tf
// @grant        none
// ==/UserScript==

(function() {
    var qualities = document.getElementsByClassName("stats-quality-list")[0];
    if(qualities && qualities.children[0]){
        //redirect from improper crate
        var components = window.location.href.split("/");
        if(components[components.length - 1] == "") components.pop();
        var firstType = qualities.children[0].textContent.trim();
        if(firstType[0] == "#" && !document.getElementsByClassName("stats-header-title")[0].textContent.trim().includes("#")){
            components.push(firstType.substr(1));
            location.href = components.join("/");
        }
    }

    function getAttributeValue(item, attr){
        if(item[attr]){
            return item[attr].value;
        }
    }

    function getWear(item){
        let wearName = getAttributeValue(item, "data-wear_tier");

        if(wearName){
            return ["Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle Scarred"].indexOf(wearName) + 1;
        }
    }

    function getTargetAndOutput(item){
        let baseName = getAttributeValue(item, "data-base_name");
        let priceIndexElements = (getAttributeValue(item, "data-priceindex") || "").split('-').map((elem) => parseInt(elem));
        let targetAndOutput = {};

        switch(baseName){
            case "Kit":
                targetAndOutput.defindex = [6527, 6523, 6526][priceIndexElements[0] - 1];
                targetAndOutput.targetDefindex = priceIndexElements[1];
                break;
            case "Chemistry Set":
                targetAndOutput.defindex = (priceIndexElements[2] ? 20005 : 20006);
                targetAndOutput.outputDefindex = priceIndexElements[0];
                targetAndOutput.outputQuality = priceIndexElements[1];
                targetAndOutput.targetDefindex = priceIndexElements[2];
                break;
            case "Fabricator":
                targetAndOutput.defindex = [20002, 20003][parseInt(getAttributeValue(item, "data-ks_tier")) - 2];
                targetAndOutput.outputDefindex = priceIndexElements[0];
                targetAndOutput.outputQuality = priceIndexElements[1];
                targetAndOutput.targetDefindex = priceIndexElements[2];
                break;
            case "Strangifier":
                targetAndOutput.defindex = 6522;
                targetAndOutput.targetDefindex = priceIndexElements[0];
                break;
            case "Unusualifier":
                targetAndOutput.defindex = 9258;
                targetAndOutput.targetDefindex = priceIndexElements[0];
                break;
        }

        return targetAndOutput;
    }

    function itemToAttributes(item){
        let {attributes} = item;

        return Object.assign({
            defindex: ({"War Paint": "9536", "Mann Co. Supply Munition": "5735", "Mann Co. Supply Crate": "5022"}[getAttributeValue(attributes, "data-base_name")] || getAttributeValue(attributes, "data-defindex")),
            quality: (getWear(attributes) && getAttributeValue(attributes, "data-effect_id") ? 5 : getAttributeValue(attributes, "data-quality")),
            effect: getAttributeValue(attributes, "data-effect_id"),
            australium: (getAttributeValue(attributes, "data-australium") === "1"),
            craftable: (getAttributeValue(attributes, "data-craftable") === "1"),
            wear: getWear(attributes),
            texture: (getWear(attributes) ? parseInt(item.children[0].style.backgroundImage.split("_")[1]) : undefined),
            elevated: (getAttributeValue(attributes, "data-quality_elevated") || (getWear(attributes) && getAttributeValue(attributes, "data-effect_id") && getAttributeValue(attributes, "data-quality") === "11") ? 11 : false),
            killstreak: getAttributeValue(attributes, "data-ks_tier"),
            festivized: getAttributeValue(attributes, "data-festivized"),
            itemNumber: getAttributeValue(attributes, "data-crate")
        }, getTargetAndOutput(attributes));
    }

    function attributesToSku(item){
        let sku = `${item.defindex};${item.quality}`;

        if (item.effect) {
            sku += `;u${item.effect}`;
        }
        if (item.australium) {
            sku += ';australium';
        }
        if (!item.craftable) {
            sku += ';uncraftable';
        }
        if (item.wear) {
            sku += `;w${item.wear}`;
        }
        if (item.texture) {
            sku += `;pk${item.texture}`;
        }
        if (item.elevated) {
            sku += ';strange';
        }
        if (item.killstreak && item.killstreak !== 0) {
            sku += `;kt-${item.killstreak}`;
        }
        if (item.targetDefindex) {
            sku += `;td-${item.targetDefindex}`;
        }
        if (item.festivized) {
            sku += ';festive';
        }

        if (item.itemNumber) {
            sku += `;c${item.itemNumber}`;
        }

        if (item.outputDefindex) {
            sku += `;od-${item.outputDefindex}`;
        }
        if (item.outputQuality) {
            sku += `;oq-${item.outputQuality}`;
        }

        return sku;
    }

    function getSku(item){
        return attributesToSku(itemToAttributes(item));
    }

    function makePopOverButton(urls){
        var button = document.createElement("a");
        button.classList = "btn btn-default btn-xs";
        button.title = "SeizedBots";
        button.onclick = function(){
            for(let i = 0; i < urls.length; i++){
                window.open(urls[i], "_blank");
            }
        }

        var logo = document.createElement("img");
        logo.src = "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/c0/c0fe2bef847c38b5c5240407f6829a62ab7b98f7_full.jpg";
        button.appendChild(logo);

        button.style.display = "block";

        return button;
    }

    function makePriceBoxButton(urls){
        var button = document.createElement("a");
        button.classList = "price-box";
        button.title = urls.length === 1 ? "SeizedBots" : "Open " + urls.length + " SeizedBots Pages";
        button.onclick = function(){
            for(let i = 0; i < urls.length; i++){
                window.open(urls[i], "_blank");
            }
        }
        button.setAttribute("data-tip", "top");

        var logo = document.createElement("img");
        logo.src = "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/c0/c0fe2bef847c38b5c5240407f6829a62ab7b98f7_full.jpg";
        logo.width = 50;
        logo.height = 50;
        button.appendChild(logo);

        return button;
    }

    if($(".price-boxes").length > 0){
        $(".price-boxes")[0].appendChild(makePriceBoxButton(["https://seizedbots.com/items/" + getSku($(".item")[0])]));
    }

    setInterval(() => {
        Array.from($(".popover")).forEach((element) => {
            if(!Array.from(element.children[2].children[1].children).some((link) => link.title === "SeizedBots")){
                element.children[2].children[1].appendChild(makePopOverButton(["https://seizedbots.com/items/" + getSku(Array.from(element.parentNode.children).find((item) => getAttributeValue(item.attributes, "aria-describedby") === element.id))]));
            }
        });
    }, 100);

    //bulk open pages

    var parts = window.location.pathname.split("/");

    if(["effect", "unusual"].includes(parts[1]) && parts.length === 3){
        document.getElementsByClassName("input-group-btn")[0].appendChild(makePriceBoxButton(Array.from(document.getElementsByClassName("item")).map((item) => "https://seizedbots.com/items/" + getSku(item))));
    }
})();

/*
    © SeizedBots 2022
*/