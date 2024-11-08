let opts = {};
var waitForEndTyping;
var saveIndicator = document.getElementById('saveIndicator');

// Get the options stored
chrome.storage.sync.get('opts', function(data) {
	if (data) {
		for (const property in data) {
			if(property == 'opts') {
				for (const [key, value] of Object.entries(data[property])) {
					opts[key] = value;
					if(key.indexOf('theme') > -1 && key != 'themeInvertLogo') {
						document.getElementById(key).value = value;
					} else {
						document.getElementById(key).checked = value;
					}
				}
			}
		}
	}
});

// Bind the checkbox action
const optsCheckboxes = document.querySelectorAll(".opt-checkbox");

for (let i = 0; i < optsCheckboxes.length; i++) {
	optsCheckboxes[i].addEventListener("click", function() {
		saveOpts(this.id, this.checked)
	});
}

 // Bind the checkbox action
const themeColorPicker = document.querySelectorAll(".colorpicker");

for (let i = 0; i < themeColorPicker.length; i++) {
   themeColorPicker[i].addEventListener("change", function() {
	   saveOpts(this.id, this.value)
   });
}

 // 
function saveOpts(nameOpt, value) {
	opts[nameOpt] = value;	
	chrome.storage.sync.set({'opts': opts});
}
