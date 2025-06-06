let opts = {};
var waitForEndTyping;
var saveIndicator = document.getElementById('saveIndicator');

// Get the options stored
chrome.storage.sync.get('opts', function(data) {
	if (data.opts) {
		for (const property in data) {
			if(property == 'opts') {
				for (const [key, value] of Object.entries(data[property])) {
					opts[key] = value;
					if((key.indexOf('theme') > -1 || key === 'editionLanguage') && key != 'themeInvertLogo') {
						document.getElementById(key).value = value;
					} else {
						document.getElementById(key).checked = value;
					}
				}
			}
		}
	}
});


// Bind the checkbox action : Save on click
const optsCheckboxes = document.querySelectorAll(".opt-checkbox");

for (let i = 0; i < optsCheckboxes.length; i++) {
	optsCheckboxes[i].addEventListener("click", function() {
		saveOpts(this.id, this.checked);
	});
}

 // Bind the color picker action : Save on change
const themeColorPicker = document.querySelectorAll(".colorpicker");

for (let i = 0; i < themeColorPicker.length; i++) {
   themeColorPicker[i].addEventListener("change", function() {
	   saveOpts(this.id, this.value);
   });
}

 // Bind the select action : Save on change
 const optsSelects = document.querySelectorAll(".opt-select");

 for (let i = 0; i < optsSelects.length; i++) {
	optsSelects[i].addEventListener("change", function() {
		saveOpts(this.id, this.value);
	});
 }

 // Save option function
function saveOpts(nameOpt, value) {
	opts[nameOpt] = value;	
	chrome.storage.sync.set({'opts': opts});
}

// Reset theme button
// document.getElementById('resetTheme').addEventListener("click", function() {
// 	for (const [opt, value] of Object.entries(opts)) {
// 		//
// 		if(opt.indexOf('theme') > -1) {
// 			delete opts[opt];
// 		}
// 	}

// 	chrome.storage.sync.set({'opts': opts});
// });
