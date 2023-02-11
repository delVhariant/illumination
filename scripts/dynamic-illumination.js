class SceneColorChange
{
    constructor()
    {
        this.messageDialog = null;  
    }

    displayWindow()
    {
        var current = {"color": canvas.scene.getFlag("dynamic-illumination","darknessColor"), "darknessLevel": canvas.lighting.darknessLevel}
        renderTemplate("modules/dynamic-illumination/templates/color_template.html", current).then((selections) => {
          let d = new Dialog({
            title: "Monologue",
            content: selections,
            buttons: {
             select: {
              icon: '<i class="fas fa-check"></i>',
              label: "Change Color",
              callback: () => {changeLighting($('#di-level').val(), $('#di-color').val())}
             }
            },
            default: "select",
            close: () => {console.log("This always is logged no matter which option is chosen")}
           });
           d.render(true);
        });    
    }
}


function changeLighting(level, color)
{
    //console.log(`Called with col: ${color} and level: ${level}`);
    const scene = canvas.scene;
    
    if (game.settings.get("dynamic-illumination","animateDarknessChange"))
    {
        if(canvas.lighting._animating || scene.getFlag("dynamic-illumination","_animating"))
        {
            
            if(game.settings.get("dynamic-illumination","allowInterrupt"))
            {
                // An attempt to gracefully interrupt ongoing changes that doesn't quite work correctly.
                // console.log(CanvasAnimation.animations)
                // console.log("Cancelling darkness animation");
                CanvasAnimation.terminateAnimation("lighting.animateDarkness");
                CanvasAnimation.terminateAnimation("lighting.darknessColor")
                canvas.lighting._animating = false;
                scene.setFlag("dynamic-illumination","_animating", false);
                // console.log(CanvasAnimation.animations)
                // console.log(canvas.lighting._animating);
            }
            else
            {
                ui.notifications.notify('Scene color/darkness already animating. You can enable interrupting ongiong changes in settings.', "warning");
                return;
            }
        }

        scene.update({darkness: level}, {animateDarkness: true}).then(() => {
            interpolateSceneColor(scene, color)
            });
    }
    else
    {
        scene.update({darkness: level}, {animateDarkness: false}).then(() => {
            SendColorChange(scene, color);
        });
    }
}


async function interpolateSceneColor(scene, target="#FFFEFF")
{   
    const interpolationData = [{
        parent: {interpolationSteps: 0},
        attribute: "interpolationSteps",
        to: 20
    }];

    scene.setFlag("dynamic-illumination", "_animating", true);
    return CanvasAnimation.animate(
        interpolationData,
        {
            name: "lighting.darknessColor",
            duration: game.settings.get("dynamic-illumination", "animationColorChangeDelay") * 1000,
            ontick: (dt, attributes) => {
                color = interpolateColor(scene.getFlag("dynamic-illumination", "darknessColor"), target, interpolationData[0].parent.interpolationSteps / interpolationData[0].to)
                // Only update if we actually changed color
                if (color.toLowerCase() != scene.getFlag("dynamic-illumination", "darknessColor").toLowerCase()) {
                    SendColorChange(scene, color);
                }
            }
        }
    ).then(() => {
        scene.setFlag("dynamic-illumination", "_animating", false);
        //Set it to the target at the end in case it wasn't there for some reason
        SendColorChange(scene, target);
        console.log("finished color change");
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


function SendColorChange(scene, color)
{
    return new Promise(function(resolve) {
        var convertedColor = PIXI.utils.string2hex(color);
        scene.setFlag("dynamic-illumination","darknessColor", color).then(()=> {
            CONFIG.Canvas.darknessColor = convertedColor;
            if(game.settings.get("dynamic-illumination", "changeFogColor"))
            {
                scene.fogExploredColor = convertedColor;
            }
            game.socket.emit("module.dynamic-illumination");
            canvas.effects.refreshLighting();
        }).then(() => {
            resolve()
        });
    });
}

function ReceiveColorChange()
{
    var convertedColor =  PIXI.utils.string2hex(canvas.scene.getFlag("dynamic-illumination","darknessColor"));
    CONFIG.Canvas.darknessColor = convertedColor;
    if(game.settings.get("dynamic-illumination", "changeFogColor"))
    {
        scene.fogExploredColor = convertedColor;
    }
    canvas.effects.refreshLighting();
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
            onClick: () => {changeLighting(game.settings.get("dynamic-illumination","dawnLevel"), game.settings.get("dynamic-illumination","dawnColor"))},
            button: true
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
            onClick: () => {changeLighting(game.settings.get("dynamic-illumination","duskLevel"), game.settings.get("dynamic-illumination","duskColor"))},
            button: true
        });

        control.tools.splice(nightButton+2, 0, {
            name: "custom",
            title: "Set to Custom",
            icon: "fas fa-sliders-h",
            visible: game.settings.get("dynamic-illumination", "showDawnDusk"),
            onClick: () => {
                
                if(!colorChange)
                    var colorChange = new SceneColorChange();

                colorChange.displayWindow()
            },
            button: true
        });
    }
    else
    {
        console.error("Unable to locate button for 'Night' in lighting toolbar.");
    }

});

Hooks.once("init", () => 
{
    loadTemplates(["modules/dynamic-illumination/templates/color_template.html"]); // Load the popup template
    
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

    game.settings.register("dynamic-illumination", "allowInterrupt", {
        name: game.i18n.localize("dynamic-illumination.allowInterrupt.name"),
        hint: game.i18n.localize("dynamic-illumination.allowInterrupt.hint"),
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("dynamic-illumination", "animateDarknessChange", {
        name: game.i18n.localize("dynamic-illumination.animateDarknessChange.name"),
        hint: game.i18n.localize("dynamic-illumination.animateDarknessChange.hint"),
        scope: "world",
        config: true,
        default: true,
        type: Boolean
    });

    game.settings.register("dynamic-illumination", "changeFogColor", {
        name: game.i18n.localize("dynamic-illumination.changeFogColor.name"),
        hint: game.i18n.localize("dynamic-illumination.changeFogColor.hint"),
        scope: "world",
        config: true,
        default: false,
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

})

Hooks.on("canvasReady", () => {
    let scene = canvas.scene;
    var color = scene.getFlag("dynamic-illumination","darknessColor");
    if(game.user.isGM)
    {
        scene.unsetFlag("core","darknessColor");  // Delete darknessColor Flag to clean up old usage...Replace this with a button in options?
        scene.setFlag("dynamic-illumination","_animating", false); // Get rid of any left over animating flags
        // Set Canvas Darkness color to match flag
        
        if(color == undefined)
        {
            scene.setFlag("dynamic-illumination","darknessColor", "#110033");
            color = "#110033";
        }
        SendColorChange(scene, color);
    }
    else // We aren't the GM, so lets just make sure our color matches the flag.
    {
        if(CONFIG.Canvas.darknessColor != color)
        {
            ReceiveColorChange(color);
        }
    }
});
