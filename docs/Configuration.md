# Configuration

The object where all the configuration logic happens is sofia.config.
There's an example file in the [/src/js/core/config-default.js](/src/js/core/config-default.js).

Currently there are a # of configuration options.

- **enableOnlineSources**
	- type: *Boolean*
	- purpose: A quick way to disable all online interactions. Useful if you're working on an offline app that will be delivered where online connectivity could pose a potential hazard to the user.
- **settingsPrefix**
	- type: *String*
	- purpose: Cache Busting
- **windows**
	- type: *Array*
	- purpose: windows opened on first load
	- example:
	```
	windows: [
		{type: 'bible', data: {textid: 'ENGKJV', fragmentid: 'JN1_1'}},
		{type: 'search', data: {textid: 'ENGKJV', searchtext:'truth love'}}
	],
	```
- **baseContentUrl**
	- type: *String*
	- purpose: URL to content. Leave blank to use local content folder. Enter URL for CORS enabled sites
	- example:
	```
	baseContentUrl: 'http://bible.cloud/',
	```
- **baseContentApiPath**
	- type: *String*
	- purpose: Leave blank for local files or for CORS enabled CDN.
	- example:
	```
	baseContentApiPath: 'http://api.bible.cloud/',
	```
- **baseContentApiPath**
	- type: *String*
	- purpose: if your are creating a CDN for your content and want to send a key
	- example:
	```
	baseContentApiKey: 'atr31gar',
	```

	// file name of texts lists
	textsIndexPath: 'texts.json',

	// URL to about page
	aboutPagePath: 'about.html',

	// (1) Leave blank for JSON search
	// (2) Enter path of script that will return JSON data
	serverSearchPath: '',

	// texts shown before the "MORE" button ("eng-NASB1995", "eng-kjv", "eng_net")
	topTexts: [],

	// new window
	newBibleWindowVersion: 'eng_kjv',

	// new bible verse
	newWindowFragmentid: 'JN1_1',

	// new commentary window
	newCommentaryWindowTextId: 'comm_eng_wesley',

	// language for top
	pinnedLanguage: 'English',

	// language(s) for top
	pinnedLanguages: ['English', 'Spanish'],

	// Override the browser and user's choice for UI language
	defaultLanguage: '',

	// URL to custom CSS
	customCssUrl: '',

	// Faith Comes by Hearing
	fcbhKey: '',

	// any texts you want to ignore from FCBH
	fcbhTextExclusions: [''],

	// true: live parse all versions
	// false: loads texts_fcbh.json
	fcbhLoadVersions: false,

	// jesus film media
	jfmKey: ''
