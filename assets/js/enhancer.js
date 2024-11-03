var opts = [];

// Observer : Reload when infinite scroll
if(document.getElementById('booksBody') != null && document.getElementById('booksBody') != 'null') {

	const observer = new MutationObserver(() => {
		setOptions(true);
	});

	observer.observe(document.getElementById("booksBody"), { childList: true });
}

// to initialize the all data using the storage
chrome.storage.sync.get('opts', function(data) {
	if (data) {
		for (const property in data) {
			if(property == 'opts') {
				
				let savedOpts = data[property];

				for (let i = 0; i < savedOpts.length; i++) {

					opts.push(savedOpts[i]);
				}

				setOptions();
			}
		}
	}
});


function setOptions(reset = false) {

	opts.forEach(function(option) {
		if(option.opt == 'expandDetailsCheck' && option.value == true) {
			setExpanded();
		} else if(option.opt == 'titleCoverGrid' && option.value == true) {
			setCoverTitle(reset);
		}  else if(option.opt == 'hideAnnouncements' && option.value == true) {
			if(!reset) {
				hideAnnoucements();
			}
		}
	});
}

function setExpanded() {
	setTimeout(function(){
		let editionLinks = document.querySelectorAll('a.Button');
		let tooltipID, matches;
	
		// Loop each tooltips to find
		editionLinks.forEach(function(link, index) {
			if(link.href.indexOf('editions')) {
				link.href += '?expanded=true&per_page=100';
			}
		});
	}, 500);
}

function setCoverTitle(reset) {

	if(document.getElementById('books') != null && document.getElementById('books') != 'null') {
		
		if(document.getElementById('books').classList.value.indexOf('covers') > -1) {
			let bookslist = document.querySelectorAll('.bookalike');
			let bookName = '';
			let bookNameDiv = '';

			// If not the 1st time preferences are loaded, delete fom injected
			if(reset) {
				let elements = document.getElementsByClassName('div-title-ext');
				while(elements.length > 0) {
					elements[0].parentNode.removeChild(elements[0]);
				}
			}

			bookslist.forEach(function(book, index) {
				//
				bookName = book.querySelector('.title > .value > a').innerText;
				//
				bookNameDiv = document.createElement('div');
				bookNameDiv.setAttribute('class', 'div-title-ext');
				bookNameDiv.append(document.createTextNode(bookName));
				//
				book.querySelector('.field.cover').append(bookNameDiv);
			});
		}
	}
}


function hideAnnoucements() {
	if(document.querySelector('.siteHeader__topFullImageContainer') != null && document.querySelector('.siteHeader__topFullImageContainer') != 'null') {
		document.querySelector('.siteHeader__topFullImageContainer').style.display = 'none';
	}

	if(document.querySelector('.SiteHeaderBanner') != null && document.querySelector('.SiteHeaderBanner') != 'null') {
		document.querySelector('.SiteHeaderBanner').style.display = 'none';
	}
}