

Hooks.on('ready', () => {
    Hooks.on('updateScene', (scene, darkness, anim, token) => {
        if(scene.data.tokenVision && anim.diff)
        {
            if(darkness.darkness >= game.settings.get("illumination","darknessThreshold"))
            {
                scene.update({globalLight: false})
            }
            else
            {
                scene.update({globalLight: true})
            }
        }
    });
});

Hooks.once("init", () => {
	
	game.settings.register("illumination", "darknessThreshold", {
		name: game.i18n.localize("illumination.darknessThreshold.name"),
		hint: game.i18n.localize("illumination.darknessThreshold.hint"),
		scope: "world",
		config: true,
		default: 1,
		type: Number
	});
});
console.log("Illumination is loaded.")