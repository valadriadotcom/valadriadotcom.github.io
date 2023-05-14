"use strict";

const BLACK = "#140C1C";
const SILVER = "#8595A1";
const URL = "https://play.valadria.com/game-dev-difficulty-tiers/";
const MAX_NAME_LEN = 256;
const TIERS = [{
	label: "S",
	subtitle: "@!#?@!",
	background: "#D04648", // Red
}, {
	label: "A",
	subtitle: "Brain Melting",
	background: "#D27D2C", // Orange
}, {
	label: "B",
	subtitle: "It Hurts",
	background: "#DAD45E", // Yellow
}, {
	label: "C",
	subtitle: "Very Hard",
	background: "#6DAA2C", // Green
}, {
	label: "D",
	subtitle: "Hard",
	background: "#597DCE", // Blue
}, {
	label: "E",
	subtitle: "Moderate",
	background: "#6DC2CA", // Teal
}, {
	label: "F",
	subtitle: "Easy",
	background: "#DEEED6", // White
}];

const DEFAULT_IMAGES = [
	"images/game-dev/gdt-animation.png",
	"images/game-dev/gdt-art.png",
	"images/game-dev/gdt-bizdev.png",
	"images/game-dev/gdt-cm.png",
	"images/game-dev/gdt-doors.png",
	"images/game-dev/gdt-elevators.png",
	"images/game-dev/gdt-finishing.png",
	"images/game-dev/gdt-funding.png",
	"images/game-dev/gdt-gamedesign.png",
	"images/game-dev/gdt-gamepad.png",
	"images/game-dev/gdt-ideas.png",
	"images/game-dev/gdt-ladders.png",
	"images/game-dev/gdt-legal.png",
	"images/game-dev/gdt-leveldesign.png",
	"images/game-dev/gdt-localization.png",
	"images/game-dev/gdt-marketing.png",
	"images/game-dev/gdt-movingplatforms.png",
	"images/game-dev/gdt-mp.png",
	"images/game-dev/gdt-music.png",
	"images/game-dev/gdt-narrative.png",
	"images/game-dev/gdt-optimization.png",
	"images/game-dev/gdt-production.png",
	"images/game-dev/gdt-programming.png",
	"images/game-dev/gdt-qa.png",
	"images/game-dev/gdt-quaternions.png",
	"images/game-dev/gdt-sounddesign.png",
	"images/game-dev/gdt-stairs.png",
	"images/game-dev/gdt-starting.png",
	"images/game-dev/gdt-techart.png",
	"images/game-dev/gdt-tutorials.png",
	"images/game-dev/gdt-ux.png",
	"images/game-dev/gdt-worklife.png",
];

let unique_id = 0;
let unsaved_changes = false;

// Contains [[header, input, label]]
let all_headers = [];
let headers_orig_min_width;

// DOM elems
let untiered_images;
let tierlist_div;
let dragged_image;

function reset_row (row) {
	row.querySelectorAll("span.item").forEach((item) => {
		for (let i = 0; i < item.children.length; ++i) {
			let img = item.children[i];
			item.removeChild(img);
			untiered_images.appendChild(img);
		}
		item.parentNode.removeChild(item);
	});
}

// Removes all rows from the tierlist, alongside their content.
// Also empties the untiered images.
function hard_reset_list () {
	tierlist_div.innerHTML = "";
	untiered_images.innerHTML = "";
}

// Places back all the tierlist content into the untiered pool.
function soft_reset_list () {
	tierlist_div.querySelectorAll(".row").forEach(reset_row);
	unsaved_changes = false;
}

window.addEventListener("load", () => {
	untiered_images = document.querySelector(".images");
	tierlist_div = document.querySelector(".tierlist");

	TIERS.forEach((tier, index) => {
		add_row(index, tier.label, tier.subtitle);
	});
	recompute_header_colors();

	headers_orig_min_width = all_headers[0][0].clientWidth;

	make_accept_drop(document.querySelector(".images"));

	bind_title_events();

	/*
	document.getElementById('load-img-input').addEventListener('input', (evt) => {
		// @Speed: maybe we can do some async stuff to optimize this
		let images = document.querySelector('.images');
		for (let file of evt.target.files) {
			let reader = new FileReader();
			reader.addEventListener('load', (load_evt) => {
				let img = create_img_with_src(load_evt.target.result);
				images.appendChild(img);
				unsaved_changes = true;
			});
			reader.readAsDataURL(file);
		}
	});

	document.getElementById("randomize").addEventListener("click", () => {
		if (unsaved_changes) {
			if (!confirm("Reset your choices?")) {
				return;
			}
			soft_reset_list();
		}

		const imagesNode = document.querySelector(".images");
		imagesNode.replaceChildren();

		shuffleArray(DEFAULT_IMAGES);
		DEFAULT_IMAGES.forEach((defaultImage) => {
			const imageNode = create_img_with_src(defaultImage);
			imagesNode.appendChild(imageNode);
		});
	});
	*/

	document.getElementById("reset-list-input").addEventListener("click", () => {
		if (!unsaved_changes) { return; }

		if (confirm("Reset your choices?")) {
			soft_reset_list();
		}
	});

	document.getElementById("share").addEventListener("click", () => {
		// Try to compile get vars
		const rows = [];
		let itemCount = 0;
		let suffix = "";
		tierlist_div.querySelectorAll(".row").forEach(function (rowNode) {
			const row = [];
			rowNode.querySelectorAll("span.item").forEach((item) => {
				for (let i = 0; i < item.children.length; ++i) {
					let img = item.children[i];
					const imageIndex = imageSourceToIndex(img.src);
					if (imageIndex > -1) {
						itemCount++;
						row.push(imageIndex);
					}
				}
			});
			rows.push(row);
		});
		let tweetText = `Show me your Game Dev Difficulty Tiers: ${URL} via @richtaur`;
		if (itemCount > 0) {
			const rowStrings = [];
			rows.forEach((row) => {
				rowStrings.push(row.join(","));
			});
			const vars = rowStrings.join(".");
			suffix = encodeURIComponent(`?tiers=${vars}`);
			tweetText = `Here are MY Game Dev Difficulty Tiers: ${URL}${suffix} via @richtaur`;
		} else {
			console.log("Nothing to share!");
		}

		// Open a new window with the URL
		const url = `https://twitter.com/intent/tweet?text=${tweetText}`;
		// console.log(url);
		window.open(url);
	});

	function imageSourceToIndex (imageSource) {
		for (let i = 0; i < DEFAULT_IMAGES.length; i++) {
			const defaultImage = DEFAULT_IMAGES[i];
			if (imageSource.includes(defaultImage)) {
				return i;
			}
		}

		return -1;
	}

	document.getElementById("download").addEventListener("click", () => {
		// Create a canvas on which to draw the image
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");

		// Title
		let title_label = document.querySelector(".title-label");

		// Render ...

		// Set canvas dimensions
		const padding = 20;
		const width = 1000;
		const height = 1000;
		const rowWidth = (width - (padding * 2));
		const rowHeight = 100;
		const columnWidth = 100;
		const halfCanvasWidth = (width / 2);
		canvas.width = width;
		canvas.height = height;

		// Background
		context.fillStyle = "#fff";
		context.fillRect(0, 0, width, height);

		// Title
		const titleFontSize = 64;
		const titleString = title_label.innerHTML;
		context.fillStyle = BLACK;
		context.font = `${titleFontSize}px Varial-Bold`;
		const titleWidth = context.measureText(titleString).width;
		const titleX = (halfCanvasWidth - (titleWidth / 2));
		context.fillText(titleString, titleX, titleFontSize);

		// Subtitle
		const subtitleFontSize = (titleFontSize / 2);
		const subtitleString = "play.valadria.com";
		context.fillStyle = SILVER;
		context.font = `${titleFontSize / 2}px Varial-Bold`;
		const subtitleWidth = context.measureText(subtitleString).width;
		const subtitleX = (halfCanvasWidth - (subtitleWidth / 2));
		const subtitleY = (titleFontSize + subtitleFontSize);
		context.fillText(subtitleString, subtitleX, subtitleY);

		// Compile list of user tiers
		const rows = [];
		let hasItems = false;
		tierlist_div.querySelectorAll(".row").forEach(function (rowNode) {
			const rowImages = [];
			rowNode.querySelectorAll("span.item img").forEach((item) => {
				rowImages.push(item);
				hasItems = true;
			});
			rows.push(rowImages);
		});
		if (!hasItems) {
			console.log("you got NOTHING");
		}

		// Chrome OL
		let x = padding;
		let y = 110;
		context.lineWidth = 4;
		context.strokeStyle = BLACK;
		TIERS.forEach((tier, tierIndex) => {
			// Column
			context.fillStyle = tier.background;
			context.fillRect(x, y, columnWidth, rowHeight);

			context.fillStyle = BLACK;

			// Label
			const labelFontSize = 48;
			const labelString = tier.label;
			context.font = `${labelFontSize}px Varial-Bold`;
			const labelWidth = context.measureText(labelString).width;
			const labelX = (x + (columnWidth / 2) - (labelWidth / 2));
			const labelY = (y + labelFontSize);
			context.fillText(labelString, labelX, labelY);

			// Label subtitle
			const labelSubtitleFontSize = 20;
			const labelSubtitleString = tier.subtitle;
			context.fillStyle = BLACK;
			context.font = `${labelSubtitleFontSize}px Varial-Bold`;
			const labelSubtitleWidth = context.measureText(labelSubtitleString).width;
			const labelSubtitleX = (x + (columnWidth / 2) - (labelSubtitleWidth / 2));
			const labelSubtitleY = (y + labelFontSize + labelSubtitleFontSize);
			context.fillText(labelSubtitleString, labelSubtitleX, labelSubtitleY);

			// Row
			context.strokeRect(x, y, columnWidth, rowHeight);
			context.strokeRect(x, y, rowWidth, rowHeight);

			// Images
			const row = rows[tierIndex];
			if (row) {
				console.log("i see a row here", row);
				row.forEach((image, imageIndex) => {
					console.log("image", image);
					const imageX = ((x + columnWidth) + (imageIndex * columnWidth));
					context.drawImage(image, imageX, y);
				});
			}

			y += rowHeight;
		});

		// CTA
		const ctaImage = document.querySelector("#cta");
		const ctaX = (halfCanvasWidth - (ctaImage.width / 2));
		const ctaY = (canvas.height - padding) - (ctaImage.height);
		context.drawImage(ctaImage, ctaX, ctaY);
		/*
		const ctaScale = 0.75;
		context.drawImage(
			ctaImage,
			0, 0, ctaImage.width, ctaImage.height,
			ctaX, ctaY, (ctaImage.width * ctaScale), (ctaImage.height * ctaScale)
		);
		*/

		// Footer ...
		/*
		const footerSize = 20;
		context.fillStyle = SILVER;

		// valadria.com
		const footerLeftString = "valadria.com";
		context.font = `${titleFontSize}px Varial-Bold`;
		const titleWidth = context.measureText(titleString).width;
		const titleX = (halfCanvasWidth - (titleWidth / 2));
		context.fillText(titleString, titleX, titleFontSize);
		*/

		// Open a new window containing the image
		// return;
		const dataURL = canvas.toDataURL("image/png");
		const openedWindow = window.open();
		try {
			openedWindow.document.write(`<img src="${dataURL}">`);
		} catch (error) {
			console.log(`[download error]`, error);
		}
	});

	/*
	document.getElementById('export-input').addEventListener('click', () => {
		let name = prompt('Please give a name to this tierlist');
		if (name) {
			save_tierlist(`${name}.json`);
		}
	});

	document.getElementById('import-input').addEventListener('input', (evt) => {
		if (!evt.target.files) {
			return;
		}
		let file = evt.target.files[0];
		let reader = new FileReader();
		reader.addEventListener('load', (load_evt) => {
			let raw = load_evt.target.result;
			let parsed = JSON.parse(raw);
			if (!parsed) {
				alert("Failed to parse data");
				return;
			}
			hard_reset_list();
			load_tierlist(parsed);
		});
		reader.readAsText(file);
	});
	*/

	// bind_trash_events();

	/*
	window.addEventListener("beforeunload", (evt) => {
		if (!unsaved_changes) { return null; }

		var msg = "You have unsaved changes. Leave anyway?";
		(evt || window.event).returnValue = msg;
		return msg;
	});
	*/

	// Default tier list
	const imagesNode = document.querySelector(".images");
	DEFAULT_IMAGES.forEach((defaultImage) => {
		const imageNode = create_img_with_src(defaultImage);
		imagesNode.appendChild(imageNode);
	});

	loadGetVars();
});

function loadGetVars () {
	// Validate the get vars
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const tiers = urlParams.get("tiers")
	if (tiers == null) { return; }

	// Try to apply the get var values
	const rows = tiers.split(".");
	rows.forEach((row, rowIndex) => {
		const imageIndexes = row.split(",");
		imageIndexes.forEach((imageIndex) => {
			dragged_image = null;

			// Validate the image index
			const imageIndexNumber = parseInt(imageIndex);
			if (isNaN(imageIndexNumber)) { return; }

			// Validate the image
			const defaultImage = DEFAULT_IMAGES[imageIndexNumber];
			if (!defaultImage) { return; }

			// Search for the sidebar image
			// let items_container = elem.querySelector(".items");
			untiered_images.querySelectorAll("img").forEach((imageNode) => {
				if (dragged_image) { return; }

				if (imageNode.src.includes(defaultImage)) {
					dragged_image = imageNode;
				}
			});

			// Add image to tier
			if (dragged_image) {
				const rowNode = tierlist_div.querySelectorAll(".row")[rowIndex];
				dropDraggedImage(rowNode);
			}
		});
	});
}

function create_img_with_src (src) {
	let img = document.createElement("img");
	img.src = src;
	img.style.userSelect = "none";
	img.classList.add("draggable");
	img.draggable = true;
	img.ondragstart = `event.dataTransfer.setData("text/plain", null)`;
	img.addEventListener("mousedown", (evt) => {
		dragged_image = evt.target;
		dragged_image.classList.add("dragged");
	});
	return img;
}

/*
function save (filename, text) {
	unsaved_changes = false;

	var el = document.createElement('a');
	el.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(text));
	el.setAttribute('download', filename);
	el.style.display = 'none';
	document.body.appendChild(el);
	el.click();
	document.body.removeChild(el);
}

function save_tierlist(filename) {
	let serialized_tierlist = {
		title: document.querySelector('.title-label').innerText,
		rows: [],
	};
	tierlist_div.querySelectorAll('.row').forEach((row, i) => {
		serialized_tierlist.rows.push({
			name: row.querySelector('.header label').innerText.substr(0, MAX_NAME_LEN)
		});
		serialized_tierlist.rows[i].imgs = [];
		row.querySelectorAll('img').forEach((img) => {
			serialized_tierlist.rows[i].imgs.push(img.src);
		});
	});

	let untiered_imgs = document.querySelectorAll('.images img');
	if (untiered_imgs.length > 0) {
		serialized_tierlist.untiered = [];
		untiered_imgs.forEach((img) => {
			serialized_tierlist.untiered.push(img.src);
		});
	}

	save(filename, JSON.stringify(serialized_tierlist));
}

function load_tierlist (serialized_tierlist) {
	document.querySelector('.title-label').innerText = serialized_tierlist.title;
	for (let idx in serialized_tierlist.rows) {
		let ser_row = serialized_tierlist.rows[idx];
		let elem = add_row(idx, ser_row.name);

		for (let img_src of ser_row.imgs ?? []) {
			let img = create_img_with_src(img_src);
			let td = document.createElement('span');
			td.classList.add('item');
			td.appendChild(img);
			let items_container = elem.querySelector('.items');
			items_container.appendChild(td);
		}

		elem.querySelector('label').innerText = ser_row.name;
	}
	recompute_header_colors();

	if (serialized_tierlist.untiered) {
		let images = document.querySelector('.images');
		for (let img_src of serialized_tierlist.untiered) {
			let img = create_img_with_src(img_src);
			images.appendChild(img);
		}
	}

	resize_headers();

	unsaved_changes = false;
}
*/

function end_drag (evt) {
	dragged_image?.classList.remove("dragged");
	dragged_image = null;
}

/*
window.addEventListener("mouseup", () => {
	console.log("mouseup");
	end_drag();
});
*/

window.addEventListener("dragend", () => {
	end_drag();
});

function make_accept_drop (elem) {
	elem.classList.add("droppable");

	elem.addEventListener("dragenter", (evt) => {
		evt.target.classList.add("drag-entered");
	});
	elem.addEventListener("dragleave", (evt) => {
		evt.target.classList.remove("drag-entered");
	});
	elem.addEventListener("dragover", (evt) => {
		evt.preventDefault();
	});
	elem.addEventListener("drop", (evt) => {
		evt.preventDefault();
		evt.target.classList.remove("drag-entered");

		if (!dragged_image) { return; }

		dropDraggedImage(elem);

		unsaved_changes = true;
	});
}

function dropDraggedImage (elem) {
	let dragged_image_parent = dragged_image.parentNode;
	if (dragged_image_parent.tagName.toUpperCase() === "SPAN" &&
			dragged_image_parent.classList.contains("item")) {
		// We were already in a tier
		let containing_tr = dragged_image_parent.parentNode;
		containing_tr.removeChild(dragged_image_parent);
	} else {
		dragged_image_parent.removeChild(dragged_image);
	}
	let td = document.createElement("span");
	td.classList.add("item");
	td.appendChild(dragged_image);
	let items_container = elem.querySelector(".items");
	if (!items_container) {
		// Quite lazy hack for <section class='images'>
		items_container = elem;
	}
	items_container.appendChild(td);
}

function enable_edit_on_click (container, input, label) {
	function change_label (evt) {
		input.style.display = "none";
		label.innerText = input.value;
		label.style.display = "inline";
		unsaved_changes = true;
	}

	input.addEventListener("change", change_label);
	input.addEventListener("focusout", change_label);

	container.addEventListener("click", (evt) => {
		label.style.display = "none";
		input.value = label.innerText.substr(0, MAX_NAME_LEN);
		input.style.display = "inline";
		input.select();
	});
}

function bind_title_events () {
	let title_label = document.querySelector(".title-label");
	let title_input = document.getElementById("title-input");
	let title = document.querySelector(".title");

	enable_edit_on_click(title, title_input, title_label);
}

function resize_headers () {
	let max_width = headers_orig_min_width;
	for (let [other_header, _i, label] of all_headers) {
		max_width = Math.max(max_width, label.clientWidth);
	}

	for (let [other_header, _i2, _l2] of all_headers) {
		other_header.style.minWidth = `${max_width}px`;
	}
}

function add_row (index, name, subtitle) {
	let div = document.createElement("div");
	let header = document.createElement("span");
	let items = document.createElement("span");
	div.classList.add("row");
	header.classList.add("header");
	items.classList.add("items");
	div.appendChild(header);
	div.appendChild(items);

	/*
	let row_buttons = document.createElement("div");
	row_buttons.classList.add("row-buttons");
	let btn_plus_up = document.createElement("input");
	btn_plus_up.type = "button";
	btn_plus_up.value = "+";
	btn_plus_up.title = "Add row above";
	btn_plus_up.addEventListener("click", (evt) => {
		let parent_div = evt.target.parentNode.parentNode;
		let rows = Array.from(tierlist_div.children);
		let idx = rows.indexOf(parent_div);
		console.assert(idx >= 0);
		add_row(idx, "");
		recompute_header_colors();
	});
	let btn_rm = document.createElement("input");
	btn_rm.type = "button";
	btn_rm.value = "-";
	btn_rm.title = "Remove row";
	btn_rm.addEventListener("click", (evt) => {
		let rows = Array.from(tierlist_div.querySelectorAll(".row"));
		if (rows.length < 2) return;
		let parent_div = evt.target.parentNode.parentNode;
		let idx = rows.indexOf(parent_div);
		console.assert(idx >= 0);
		if (rows[idx].querySelectorAll("img").length === 0 ||
			confirm(`Remove tier ${rows[idx].querySelector(".header label").innerText} ? (This will move back all its content to the untiered pool)`))
		{
			rm_row(idx);
		}
		recompute_header_colors();
	});
	let btn_plus_down = document.createElement("input");
	btn_plus_down.type = "button";
	btn_plus_down.value = "+";
	btn_plus_down.title = "Add row below";
	btn_plus_down.addEventListener("click", (evt) => {
		let parent_div = evt.target.parentNode.parentNode;
		let rows = Array.from(tierlist_div.children);
		let idx = rows.indexOf(parent_div);
		console.assert(idx >= 0);
		add_row(idx + 1, name);
		recompute_header_colors();
	});
	row_buttons.appendChild(btn_plus_up);
	row_buttons.appendChild(btn_rm);
	row_buttons.appendChild(btn_plus_down);
	div.appendChild(row_buttons);
	*/

	let rows = tierlist_div.children;
	if (index === rows.length) {
		tierlist_div.appendChild(div);
	} else {
		let nxt_child = rows[index];
		tierlist_div.insertBefore(div, nxt_child);
	}

	make_accept_drop(div);
	create_label_input(div, index, name, subtitle);

	return div;
}

function create_label_input (row, row_idx, row_name, subtitle) {
	let input = document.createElement("input");
	input.id = `input-tier-${unique_id++}`;
	input.type = "text";
	input.addEventListener("change", resize_headers);
	let label = document.createElement("label");
	label.htmlFor = input.id;
	let innerHTML = row_name;
	if (subtitle) {
		innerHTML += `<br><em>${subtitle}</em>`;
	}
	label.innerHTML = innerHTML;

	let header = row.querySelector(".header");
	all_headers.splice(row_idx, 0, [header, input, label]);
	header.appendChild(label);
	header.appendChild(input);

	/*
	const subtitleNode = document.createElement("em");
	subtitleNode.innerText = "test123";
	header.appendChild(subtitleNode);
	*/

	// enable_edit_on_click(header, input, label);
}

/*
function rm_row (idx) {
	let row = tierlist_div.children[idx];
	reset_row(row);
	tierlist_div.removeChild(row);
}
*/

function recompute_header_colors () {
	tierlist_div.querySelectorAll(".row").forEach((row, row_idx) => {
		const tier = TIERS[row_idx % TIERS.length];
		row.querySelector(".header").style.backgroundColor = tier.background;
	});
}

/*
function bind_trash_events() {
	let trash = document.getElementById('trash');
	trash.classList.add('droppable');
	trash.addEventListener('dragenter', (evt) => {
		evt.preventDefault();
		evt.target.src = 'trash_bin_open.png';
	});
	trash.addEventListener('dragexit', (evt) => {
		evt.preventDefault();
		evt.target.src = 'trash_bin.png';
	});
	trash.addEventListener('dragover', (evt) => {
		evt.preventDefault();
	});
	trash.addEventListener('drop', (evt) => {
		evt.preventDefault();
		evt.target.src = 'trash_bin.png';
		if (dragged_image) {
			let dragged_image_parent = dragged_image.parentNode;
			if (dragged_image_parent.tagName.toUpperCase() === 'SPAN' &&
					dragged_image_parent.classList.contains('item'))
			{
				// We were already in a tier
				let containing_tr = dragged_image_parent.parentNode;
				containing_tr.removeChild(dragged_image_parent);
			}
			dragged_image.remove();
		}
	});
}
*/

const shuffleArray = array => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}