function changeLighting(level, color)
{
	if(game.settings.get("dynamic-illumination","animateDarknessChange"))
	{
		canvas.scene.update({darkness: level}, {animateDarkness: true}).then(() => {
                interpolateSceneColor(color)
            });
	}
	else
	{
		canvas.scene.update({darkness: level}, {animateDarkness: false}).then(() => {
            SendColorChange(color);
        });
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
        duration: game.settings.get("dynamic-illumination","animationColorChangeDelay") * 1000,
        ontick: (dt, attributes) => {
            color = interpolateColor(canvas.scene.getFlag("dynamic-illumination","darknessColor"), target, attributes[0].parent.interpolationSteps/attributes[0].to)
            // Only update if we actually changed color
            if(color.toLowerCase() != canvas.scene.getFlag("dynamic-illumination","darknessColor").toLowerCase())
            {                
                SendColorChange(color);
            } 
        }
    }).then(() => {
         //Set it to the target at the end in case it wasn't there for some reason
         SendColorChange(target);
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


function SendColorChange(color)
{
    return new Promise(function(resolve) {
        var convertedColor = PIXI.utils.string2hex(color);
		canvas.scene.setFlag("dynamic-illumination","darknessColor", color).then(()=> {
            CONFIG.Canvas.darknessColor = convertedColor;
            CONFIG.canvas.unexploredColor = convertedColor;
            CONFIG.canvas.exploredColor = convertedColor;
            game.socket.emit("module.dynamic-illumination");
            canvas.getLayer("LightingLayer").refresh();
        }).then(() => {
            resolve()
        });
    });
}

function ReceiveColorChange()
{
    var convertedColor =  PIXI.utils.string2hex(canvas.scene.getFlag("dynamic-illumination","darknessColor"));
    CONFIG.Canvas.darknessColor = convertedColor;
    CONFIG.canvas.unexploredColor = convertedColor;
    CONFIG.canvas.exploredColor = convertedColor;
    canvas.getLayer("LightingLayer").refresh();
}

Hooks.on('ready', () => {game.socket.on('module.dynamic-illumination', ReceiveColorChange)});

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

Hooks.once("init", () => 
{
    /*game.settings.register("dynamic-illumination", "linkGlobalLight", {
		name: game.i18n.localize("dynamic-illumination.linkGlobalLight.name"),
		hint: game.i18n.localize("dynamic-illumination.linkGlobalLight.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
    });*/

    /*game.settings.register("dynamic-illumination", "darknessThreshold", {
        name: game.i18n.localize("dynamic-illumination.darknessThreshold.name"),
        hint: game.i18n.localize("dynamic-illumination.darknessThreshold.hint"),
        scope: "world",
        config: true,
        default: 1.0,
        type: Number,
        range: {min: 0.0, max: 1.0, step: 0.05}
    });*/

    game.settings.register("dynamic-illumination", "animateDarknessChange", {
		name: game.i18n.localize("dynamic-illumination.animateDarknessChange.name"),
		hint: game.i18n.localize("dynamic-illumination.animateDarknessChange.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
    });

    /*game.settings.register("dynamic-illumination", "interpolateColor", {
		name: game.i18n.localize("dynamic-illumination.interpolateColor.name"),
		hint: game.i18n.localize("dynamic-illumination.interpolateColor.hint"),
		scope: "world",
		config: true,
		default: false,
		type: Boolean
    });*/

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

})

Hooks.once("canvasInit", () => {
    var color = canvas.scene.getFlag("dynamic-illumination","darknessColor");
    if(game.user.isGM)
    {
        canvas.scene.unsetFlag("core","darknessColor");  // Delete darknessColor Flag to clean up old usage...Replace this with a button in options?
        // Set Canvas Darkness color to match flag
        
        if(color == undefined)
        {
            canvas.scene.setFlag("dynamic-illumination","darknessColor", "#110033");
            color = "#110033";
        }
        SendColorChange(color);
    }
    else // We aren't the GM, so lets just make sure our color matches the flag.
    {
        if(CONFIG.Canvas.darknessColor != color)
        {
            ReceiveColorChange(color);
        }
    }
});
