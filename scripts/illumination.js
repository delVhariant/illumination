

Hooks.on('ready', () => {
    Hooks.on('preUpdateScene', (scene, darkness, anim, token) => {
        if(darkness.darkness && anim.diff)
        {
            if(darkness.darkness == 0.25) // Dawn
            {
                scene.setFlag("core","darknessColor", game.settings.get("illumination","dawnColor"))
            }
            else if(darkness.darkness == 0.75) // Dusk
            {
                scene.setFlag("core","darknessColor", game.settings.get("illumination","duskColor"))
            }
            else if(darkness.darkness == 1) // Dusk
            {
                scene.setFlag("core","darknessColor", game.settings.get("illumination","nightColor"))
            }
        }
    });
});

Hooks.on('getSceneControlButtons', controls => {
    let control = controls.find(c => c.name === "lighting") || controls[5];
    control.tools.splice(2, 0, {
		name: "dusk",
		title: "dusk",
		icon: "fas fa-sun-o",
		visible: game.settings.get("illumination", "showDawnDusk"),
		onClick: () => canvas.scene.update({darkness: 0.75}, {animateDarkness: true}),
	});
    control.tools.splice(1, 0, {
		name: "dawn",
		title: "dawn",
		icon: "fas fa-moon-o",
		visible: game.settings.get("illumination", "showDawnDusk"),
		onClick: () => canvas.scene.update({darkness: 0.25}, {animateDarkness: true}),
	});

});

Hooks.once("init", () => {
	
	/*game.settings.register("illumination", "darknessThreshold", {
		name: game.i18n.localize("illumination.darknessThreshold.name"),
		hint: game.i18n.localize("illumination.darknessThreshold.hint"),
		scope: "world",
		config: true,
		default: 1,
		type: Number
    });*/
    game.settings.register("illumination", "showDawnDusk", {
		name: game.i18n.localize("illumination.showDawnDusk.name"),
		hint: game.i18n.localize("illumination.showDawnDusk.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
    });
    
    game.settings.register("illumination", "nightColor", {
		name: game.i18n.localize("illumination.nightColor.name"),
		hint: game.i18n.localize("illumination.nightColor.hint"),
		scope: "world",
		config: true,
		default: "#3c3351",
		type: String
    });
    
    game.settings.register("illumination", "dawnColor", {
		name: game.i18n.localize("illumination.dawnColor.name"),
		hint: game.i18n.localize("illumination.dawnColor.hint"),
		scope: "world",
		config: true,
		default: "#db9f6d",
		type: String
    });
    
    game.settings.register("illumination", "duskColor", {
		name: game.i18n.localize("illumination.duskColor.name"),
		hint: game.i18n.localize("illumination.duskColor.hint"),
		scope: "world",
		config: true,
		default: "#ae6b6b",
		type: String
	});
});
console.log("Illumination is loaded.")