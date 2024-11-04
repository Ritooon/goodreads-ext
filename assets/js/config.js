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
					document.getElementById(key).checked = value;
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

 // 
function saveOpts(nameOpt, value) {
	opts[nameOpt] = value;	
	chrome.storage.sync.set({'opts': opts});
}


