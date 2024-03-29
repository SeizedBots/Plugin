// ==UserScript==
// @name         SeizedBots
// @namespace    https://seizedbots.com/
// @version      1.2.1
// @description  Allow users of SeizedBots to add items from backpack.tf pages.
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

        button.style.display = "block";
        button.appendChild(logo);

        return button;
    }

    if($(".price-boxes").length > 0){
        let attributes = itemToAttributes($(".item")[0]);
        $(".price-boxes")[0].appendChild(makePriceBoxButton(["https://seizedbots.com/items/" + attributesToSku(attributes)]));

        let killstreakLinks = [];
        //can_basic_killstreak
        if([
            0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,29,35,36,37,38,39,40,41,43,44,45,56,61,127,128,130,131,132,141,142,153,154,155,160,161,169,171,172,173,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,214,215,220,221,224,225,226,228,230,232,239,264,266,294,298,304,305,307,308,310,312,317,325,326,327,329,331,348,349,351,355,356,357,401,402,404,406,411,412,413,414,415,416,424,425,426,441,442,444,447,448,449,450,452,457,460,461,466,474,482,513,525,526,527,528,572,574,587,588,589,593,594,595,609,638,648,649,654,656,658,659,660,661,662,663,664,665,669,727,730,739,740,741,751,752,772,773,775,792,793,794,795,796,797,798,799,800,801,802,803,804,805,806,807,808,809,811,812,813,832,833,834,851,880,881,882,883,884,885,886,887,888,889,890,891,892,893,894,895,896,897,898,899,900,901,902,903,904,905,906,907,908,909,910,911,912,913,914,915,916,939,957,958,959,960,961,962,963,964,965,966,967,968,969,970,971,972,973,974,996,997,998,999,1000,1003,1004,1005,1006,1007,1013,1071,1078,1079,1081,1082,1084,1085,1092,1098,1099,1100,1103,1104,1123,1141,1142,1143,1144,1146,1149,1150,1151,1153,1178,1181,1184,15000,15001,15002,15003,15004,15005,15006,15007,15008,15009,15010,15011,15012,15013,15014,15015,15016,15017,15018,15019,15020,15021,15022,15023,15024,15025,15026,15027,15028,15029,15030,15031,15032,15033,15034,15035,15036,15037,15038,15039,15040,15041,15042,15043,15044,15045,15046,15047,15048,15049,15050,15051,15052,15053,15054,15055,15056,15057,15058,15059,15060,15061,15062,15063,15064,15065,15066,15067,15068,15069,15070,15071,15072,15073,15074,15075,15076,15077,15078,15079,15080,15081,15082,15083,15084,15085,15086,15087,15088,15089,15090,15091,15092,15094,15095,15096,15097,15098,15099,15100,15101,15102,15103,15104,15105,15106,15107,15108,15109,15110,15111,15112,15113,15114,15115,15116,15117,15118,15119,15120,15121,15122,15123,15124,15125,15126,15127,15128,15129,15130,15131,15132,15133,15134,15135,15136,15137,15138,15139,15140,15141,15142,15143,15144,15145,15146,15147,15148,15149,15150,15151,15152,15153,15154,15155,15156,15157,15158,30474,30665,30666,30667
        ].includes(parseInt(attributes.defindex))){
            attributes.killstreak = 1;
            killstreakLinks.push("https://seizedbots.com/items/" + attributesToSku(attributes));
        }

        attributes.killstreak = 2;
        killstreakLinks.push("https://seizedbots.com/items/" + attributesToSku(attributes));
        attributes.killstreak = 3;
        killstreakLinks.push("https://seizedbots.com/items/" + attributesToSku(attributes));
        let text = document.createElement("p");
        text.innerHTML = "Open Killstreak Variants";
        $(".price-boxes")[0].appendChild(makePriceBoxButton(killstreakLinks)).appendChild(text);
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