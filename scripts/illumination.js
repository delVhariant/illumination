function toggleGlobalLight(darkness)
{
    console.log(`Changing darkness to ${darkness}. GI threshold is ${canvas.scene.data.globalLight}`);
    
    if(game.settings.get("illumination","linkGlobalLight"))
    {
        if(darkness >= game.settings.get("illumination","darknessThreshold"))
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
    //return null;
}

Hooks.on('getSceneControlButtons', controls => {
    let control = controls.find(c => c.name === "lighting") || controls[5];

    // Day Button override
    control.tools[1].onClick = () =>
    {
        var level=game.settings.get("illumination","dayLevel");
        canvas.scene.update({darkness: level}, {animateDarkness: true}, toggleGlobalLight(level))
        canvas.scene.setFlag("core","darknessColor", game.settings.get("illumination","dayColor"))
    }

    // Night Button Override
    control.tools[2].onClick = () =>
    {
        var level=game.settings.get("illumination","nightLevel");
        canvas.scene.update({darkness: level}, {animateDarkness: true}, toggleGlobalLight(level))
        canvas.scene.setFlag("core","darknessColor", game.settings.get("illumination","nightColor"))
    }

    control.tools.splice(2, 0, {
		name: "dusk",
		title: "Transition to Dusk",
		icon: "far fa-moon",
		visible: game.settings.get("illumination", "showDawnDusk"),
		onClick: () => {
            var level=game.settings.get("illumination","duskLevel");
            canvas.scene.update({darkness: level}, {animateDarkness: true}, toggleGlobalLight(level))
            canvas.scene.setFlag("core","darknessColor", game.settings.get("illumination","duskColor"))
        }
	});
    control.tools.splice(1, 0, {
		name: "dawn",
		title: "Transition to Dawn",
		icon: "far fa-sun",
		visible: game.settings.get("illumination", "showDawnDusk"),
		onClick: () => {
            var level=game.settings.get("illumination","dawnLevel");
            canvas.scene.update({darkness: level}, {animateDarkness: true}, toggleGlobalLight(level))
            canvas.scene.setFlag("core","darknessColor", game.settings.get("illumination","dawnColor"));
        }
	});

});

Hooks.once("init", () => {

    game.settings.register("illumination", "linkGlobalLight", {
		name: game.i18n.localize("illumination.linkGlobalLight.name"),
		hint: game.i18n.localize("illumination.linkGlobalLight.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
    });
    if(game.settings.get("illumination", "linkGlobalLight"))
    {
        game.settings.register("illumination", "darknessThreshold", {
            name: game.i18n.localize("illumination.darknessThreshold.name"),
            hint: game.i18n.localize("illumination.darknessThreshold.hint"),
            scope: "world",
            config: true,
            default: 1.0,
            type: Number,
            range: {min: 0.0, max: 1.0, step: 0.05}
        });
    }
    game.settings.register("illumination", "showDawnDusk", {
		name: game.i18n.localize("illumination.showDawnDusk.name"),
		hint: game.i18n.localize("illumination.showDawnDusk.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
    });

    game.settings.register("illumination", "dawnColor", {
        name: game.i18n.localize("illumination.dawnColor.name"),
        hint: game.i18n.localize("illumination.dawnColor.hint"),
        scope: "world",
        config: true,
        default: "#db9f6d",
        type: String
    });
    

    game.settings.register("illumination", "dawnLevel", {
        name: game.i18n.localize("illumination.dawnLevel.name"),
        hint: game.i18n.localize("illumination.dawnLevel.hint"),
        scope: "world",
        config: true,
        default: 0.75,
        type: Number,
        range: {min: 0.0, max: 1.0, step: 0.05}
    });

    game.settings.register("illumination", "dayColor", {
		name: game.i18n.localize("illumination.dayColor.name"),
		hint: game.i18n.localize("illumination.dayColor.hint"),
		scope: "world",
		config: true,
		default: "#FFFEFE",
		type: String
    });
    
    game.settings.register("illumination", "dayLevel", {
		name: game.i18n.localize("illumination.dayLevel.name"),
		hint: game.i18n.localize("illumination.dayLevel.hint"),
		scope: "world",
		config: true,
		default: 0,
		type: Number,
        range: {min: 0.0, max: 1.0, step: 0.05}
    });
    
    game.settings.register("illumination", "duskColor", {
        name: game.i18n.localize("illumination.duskColor.name"),
        hint: game.i18n.localize("illumination.duskColor.hint"),
        scope: "world",
        config: true,
        default: "#ae6b6b",
        type: String
    });

    game.settings.register("illumination", "duskLevel", {
        name: game.i18n.localize("illumination.duskLevel.name"),
        hint: game.i18n.localize("illumination.duskLevel.hint"),
        scope: "world",
        config: true,
        default: 0.75,
        type: Number,
        range: {min: 0.0, max: 1.0, step: 0.05}
    });

    game.settings.register("illumination", "nightColor", {
		name: game.i18n.localize("illumination.nightColor.name"),
		hint: game.i18n.localize("illumination.nightColor.hint"),
		scope: "world",
		config: true,
		default: "#3c3351",
		type: String
    }); 

    game.settings.register("illumination", "nightLevel", {
		name: game.i18n.localize("illumination.nightLevel.name"),
		hint: game.i18n.localize("illumination.nightLevel.hint"),
		scope: "world",
		config: true,
		default: 1,
		type: Number,
        range: {min: 0.0, max: 1.0, step: 0.05}
    });
    
});
console.log("Illumination is loaded.")