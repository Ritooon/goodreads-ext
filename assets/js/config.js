let opts = [];
var waitForEndTyping;
var saveIndicator = document.getElementById('saveIndicator');

// Get the options stored
chrome.storage.sync.get('opts', function(data) {
	if (data) {
			for (const property in data) {
				if(property == 'opts') {
					
					let savedOpts = data[property];

					for (let i = 0; i < savedOpts.length; i++) {

						opts.push(savedOpts[i]);

						if(savedOpts[i].value == true) {
							document.getElementById(savedOpts[i].index).checked = true;
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
			saveOpts(this.id, this.name, this.checked)
		});
 }

 // 
function saveOpts(index, nameOpt, value) {

	if(typeof opts[index] != 'undefined' && typeof opts[index] != null) {
		opts[index].value = value;
	} else {
		opts.push({'opt': nameOpt, 'value': value, 'index': index});
	}
	
	chrome.storage.sync.set({'opts': opts});
}


