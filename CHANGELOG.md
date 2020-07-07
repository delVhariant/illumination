# Dynamic Illumination Changelog
***
## 0.1.12
* Used promise to trigger color change after darkness transition.
    * This should let the animation transition remain (Unless Global Illumination changes)
* Moved Global Illumination change to occur on the 'updateScene' hook
    * This will mean global illumination change can be triggered by other modules that alter the scene darkness
* General code clean up - moved everything into a function for neatness
* Replaced all cases of 'illumination' with 'dynamic-illumination' for consistency in settings/file names etc.

*Notes*  
I still haven't worked out why the module settings sometiomes show under 'General Module Settings'. Looking at the foudnry source code, that should only occur if the module title isn't set, which it is...
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