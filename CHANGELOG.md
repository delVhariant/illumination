# Dynamic Illumination Changelog
***
## 0.2.2
* Added experimental feature to interpolate scene color instead of setting it. Seems to work ok, but does send a lot of scene updates.
* Fixed bug where color changes didn't occur correctly on button press.

## 0.2.0
* Added option to enable darkness level transitions (transition will still be instant if Global Illumination changes)
* Added configurable delay to color change during animated transitions (transition will still be instant if Global Illumination changes)
    * This is a pretty basic implementation using setTimeout, please raise an issue if you see any problems with this.
    * The color change always occurs first if the darkness level is currently set to 0.
* Moved Global Illumination change to occur on the 'updateScene' hook
    * This will mean global illumination change can be triggered by other modules that alter the scene darkness
* General code clean up - moved transitions into a shared function for neatness
* Replaced all cases of 'illumination' with 'dynamic-illumination' for consistency in settings/file names etc.

*Notes*  
I still haven't worked out why the module settings sometimes show under 'General Module Settings'. Looking at the foundry source code, that should only occur if the module title isn't set, which it is...  
The behaviour seems inconsistent, I suspect it's because I changed the title at some point. It might be worth uninstalling and reinstalling the module if you run into the issue.
***
## 0.1.11
* Renamed to Dynamic Illumination
* Updated README

***
## 0.1.10
* Initial version added to FoundryVTT modules list. Versions older than this alternated between working in a way I didn't want, or broken to hell :D

***
#### Donations
I have a patreon if you'd like to donate. You shouldn't, but I won't stop you:
https://www.patreon.com/delVhar