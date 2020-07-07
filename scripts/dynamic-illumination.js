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
    canvas.scene.update({darkness: level}, {animateDarkness: true}).then(() => {
        canvas.scene.setFlag("core","darknessColor", color);        
        });
}

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
    if(game.settings.get("dynamic-illumination", "linkGlobalLight"))
    {
        game.settings.register("dynamic-illumination", "darknessThreshold", {
            name: game.i18n.localize("dynamic-illumination.darknessThreshold.name"),
            hint: game.i18n.localize("dynamic-illumination.darknessThreshold.hint"),
            scope: "world",
            config: true,
            default: 1.0,
            type: Number,
            range: {min: 0.0, max: 1.0, step: 0.05}
        });
    }
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
