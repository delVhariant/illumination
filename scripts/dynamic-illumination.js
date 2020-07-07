function toggleGlobalLight(darkness)
{
    //console.log(`Changing darkness to ${darkness}. GI threshold is ${game.settings.get("dynamic-illumination","darknessThreshold")}. Current GI is: ${canvas.scene.data.globalLight}`);
    if(game.settings.get("dynamic-illumination","linkGlobalLight"))
    {
        if(darkness >= game.settings.get("dynamic-illumination","darknessThreshold"))
        {
            if(canvas.scene.data.globalLight)
            {
                return {globalLight: false}
            }
        }
        else if(!canvas.scene.data.globalLight)
        {
            return {globalLight: true}
        }
    }
    return {}
}

function changeLighting(level, color)
{
    if(game.settings.get("dynamic-illumination","animateDarknessChange") && !toggleGlobalLight(level).hasOwnProperty('globalLight'))
    {
        if(canvas.scene.data.darkness == 0) // We are at 0, so first change color then get darker.
        {
            canvas.scene.setFlag("core","darknessColor", color);
            canvas.scene.update({darkness: level}, {animateDarkness: ftruealse});
        }
        else if(game.settings.get("dynamic-illumination","interpolateColor"))
        {
            canvas.scene.update({darkness: level}, {animateDarkness: true}).then(() => {
                interpolateSceneColor(color)
            })
        }
        else
        {
            canvas.scene.update({darkness: level}, {animateDarkness: true}).then(
                setTimeout(() => {
                    canvas.scene.setFlag("core","darknessColor", color)
                },game.settings.get("dynamic-illumination","animationColorChangeDelay") * 1000)        
            );
        }
    }
    else
    {
        canvas.scene.update({darkness: level}, {animateDarkness: false}).then(
            canvas.scene.setFlag("core","darknessColor", color)
        );
    }
}

async function interpolateSceneColor(target="#FFFEFF")
{    
    const interpolationData = [{
        parent: {interpolationSteps: 0},
        attribute: "interpolationSteps",
        to: 20
    }];
    return CanvasAnimation.animateLinear(interpolationData, {
        name: "lighting.darknessColor",
        duration: 10000,
        ontick: (dt, attributes) => {
            color = interpolateColor(canvas.scene.getFlag("core","darknessColor"), target, attributes[0].parent.interpolationSteps/attributes[0].to)
            canvas.scene.setFlag("core","darknessColor", color);
        }
    });
}

function interpolateColor(color1, color2, factor) {
    if (arguments.length < 3) { 
        factor = 0.5; 
    }
    var c1 = convertHexRGB(color1);
    var c2 = convertHexRGB(color2);
    result=c1;
    for (var i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (c2[i] - c1[i]));
    }
    return convertRGBHex(result[0], result[1], result[2]);
};

 // Converts hex string to RGB array 
const convertHexRGB = hex => hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,(m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1).match(/.{2}/g)
    .map(x => parseInt(x, 16));
// Converts RGB array to hex string  
const convertRGBHex = (r, g, b) => '#' + [r, g, b]
    .map(x => x.toString(16).padStart(2, '0')).join('');

Hooks.on('updateScene', (scene, change, diff, token) => {
    if(change.hasOwnProperty('darkness') && diff.diff)
    {
        var global = toggleGlobalLight(change.darkness);
        if(global.hasOwnProperty("globalLight"))
            scene.update(global)
    }
})

Hooks.on('getSceneControlButtons', controls => {
    let control = controls.find(c => c.name === "lighting");
    if(control == undefined)
        return;

    // Day Button override
    let dayButton = control.tools.findIndex(t => t.name === "day")
    if(dayButton)
    {
        control.tools[dayButton].onClick = () => {changeLighting(game.settings.get("dynamic-illumination","dayLevel"), game.settings.get("dynamic-illumination","dayColor"))};
        control.tools.splice(dayButton, 0, {
            name: "dawn",
            title: "Transition to Dawn",
            icon: "far fa-sun",
            visible: game.settings.get("dynamic-illumination", "showDawnDusk"),
            onClick: () => {changeLighting(game.settings.get("dynamic-illumination","dawnLevel"), game.settings.get("dynamic-illumination","dawnColor"))}
        });
    }
    else
    {
        console.error("Unable to locate button for 'Day' in lighting toolbar.");
    }

    // Night Button Override
    let nightButton = control.tools.findIndex(t => t.name === "night")
    if(nightButton)
    {
        control.tools[nightButton].onClick = () => {changeLighting(game.settings.get("dynamic-illumination","nightLevel"), game.settings.get("dynamic-illumination","nightColor"))};
        control.tools.splice(nightButton, 0, {
            name: "dusk",
            title: "Transition to Dusk",
            icon: "far fa-moon",
            visible: game.settings.get("dynamic-illumination", "showDawnDusk"),
            onClick: () => {changeLighting(game.settings.get("dynamic-illumination","duskLevel"), game.settings.get("dynamic-illumination","duskColor"))}
        });
    }
    else
    {
        console.error("Unable to locate button for 'Night' in lighting toolbar.");
    }

});

Hooks.once("init", () => {

    game.settings.register("dynamic-illumination", "linkGlobalLight", {
		name: game.i18n.localize("dynamic-illumination.linkGlobalLight.name"),
		hint: game.i18n.localize("dynamic-illumination.linkGlobalLight.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
    });

    game.settings.register("dynamic-illumination", "darknessThreshold", {
        name: game.i18n.localize("dynamic-illumination.darknessThreshold.name"),
        hint: game.i18n.localize("dynamic-illumination.darknessThreshold.hint"),
        scope: "world",
        config: true,
        default: 1.0,
        type: Number,
        range: {min: 0.0, max: 1.0, step: 0.05}
    });

    game.settings.register("dynamic-illumination", "animateDarknessChange", {
		name: game.i18n.localize("dynamic-illumination.animateDarknessChange.name"),
		hint: game.i18n.localize("dynamic-illumination.animateDarknessChange.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
    });

    game.settings.register("dynamic-illumination", "interpolateColor", {
		name: game.i18n.localize("dynamic-illumination.interpolateColor.name"),
		hint: game.i18n.localize("dynamic-illumination.interpolateColor.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
    });

    game.settings.register("dynamic-illumination", "animationColorChangeDelay", {
		name: game.i18n.localize("dynamic-illumination.animationColorChangeDelay.name"),
		hint: game.i18n.localize("dynamic-illumination.animationColorChangeDelay.hint"),
		scope: "world",
		config: true,
		default: 7.5,
        type: Number,
        range: {min: 0.0, max: 10.0, step: 0.5}
    });

    game.settings.register("dynamic-illumination", "showDawnDusk", {
		name: game.i18n.localize("dynamic-illumination.showDawnDusk.name"),
		hint: game.i18n.localize("dynamic-illumination.showDawnDusk.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
    });

    game.settings.register("dynamic-illumination", "dawnColor", {
        name: game.i18n.localize("dynamic-illumination.dawnColor.name"),
        hint: game.i18n.localize("dynamic-illumination.dawnColor.hint"),
        scope: "world",
        config: true,
        default: "#db9f6d",
        type: String
    });
    

    game.settings.register("dynamic-illumination", "dawnLevel", {
        name: game.i18n.localize("dynamic-illumination.dawnLevel.name"),
        hint: game.i18n.localize("dynamic-illumination.dawnLevel.hint"),
        scope: "world",
        config: true,
        default: 0.75,
        type: Number,
        range: {min: 0.0, max: 1.0, step: 0.05}
    });

    game.settings.register("dynamic-illumination", "dayColor", {
		name: game.i18n.localize("dynamic-illumination.dayColor.name"),
		hint: game.i18n.localize("dynamic-illumination.dayColor.hint"),
		scope: "world",
		config: true,
		default: "#FFFEFE",
		type: String
    });
    
    game.settings.register("dynamic-illumination", "dayLevel", {
		name: game.i18n.localize("dynamic-illumination.dayLevel.name"),
		hint: game.i18n.localize("dynamic-illumination.dayLevel.hint"),
		scope: "world",
		config: true,
		default: 0,
		type: Number,
        range: {min: 0.0, max: 1.0, step: 0.05}
    });
    
    game.settings.register("dynamic-illumination", "duskColor", {
        name: game.i18n.localize("dynamic-illumination.duskColor.name"),
        hint: game.i18n.localize("dynamic-illumination.duskColor.hint"),
        scope: "world",
        config: true,
        default: "#ae6b6b",
        type: String
    });

    game.settings.register("dynamic-illumination", "duskLevel", {
        name: game.i18n.localize("dynamic-illumination.duskLevel.name"),
        hint: game.i18n.localize("dynamic-illumination.duskLevel.hint"),
        scope: "world",
        config: true,
        default: 0.75,
        type: Number,
        range: {min: 0.0, max: 1.0, step: 0.05}
    });

    game.settings.register("dynamic-illumination", "nightColor", {
		name: game.i18n.localize("dynamic-illumination.nightColor.name"),
		hint: game.i18n.localize("dynamic-illumination.nightColor.hint"),
		scope: "world",
		config: true,
		default: "#3c3351",
		type: String
    }); 

    game.settings.register("dynamic-illumination", "nightLevel", {
		name: game.i18n.localize("dynamic-illumination.nightLevel.name"),
		hint: game.i18n.localize("dynamic-illumination.nightLevel.hint"),
		scope: "world",
		config: true,
		default: 1,
		type: Number,
        range: {min: 0.0, max: 1.0, step: 0.05}
    });
    
});
