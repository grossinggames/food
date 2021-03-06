'use strict';

/* *************** Отлавливаем необработанные исключения *************** */
process.on('uncaughtException', (err) => {
	console.log('Неотловленное исключение: ');
	console.log(err);
});

/* *************** Express *************** */
let express = require('express');
let app = express();

/* *************** Express Middleware *************** */
let gaikan = require('gaikan');

/* *************** Menu *************** */
let menuNames = {
	'rolls': 'Роллы',
	'sushi': 'Суши',
	'pizza': 'Пицца',
	'noodles': 'Лапша',
	'desserts': 'Десерты',
	'salads': 'Салаты',
	'soups': 'Супы'
};

/* *************** Express Routes *************** */
app.engine('html', gaikan);
app.set('view engine', '.html');
app.set('views', './views');
app.use(express.static('public'));

app.get('/:organization', (req, res) => {
	console.log('req.organization: ', req.params.organization);

	if (req.params.organization == 'favicon.ico') {
		return console.log('stop.favicon');
	}

	if (!req.params.organization) {
		return res.render('404');
	}

	function renderPage(files) {
		//console.log('Resolve files: ', files);

		let item = req.query.item || files[0].split('\\')[3] || ''; // Для Linux использовать '/' разделитель
		let menu = {};

		let menuView = '';
		let contentView = '';

		//console.log(files);

		for (let i = 0, len = files.length; i < len; i++) {
			//console.log(files[i].split('/')[0]);
			let key = files[i].split('\\')[3]; // Для Linux использовать '/' разделитель
			//console.log(key);

			if (!menu[key]) {
				menu[key] = 1;
				if (item == key) {
					menuView += "<li class='active' style='background-color: #bbdefb'>";
				} else {
					menuView += "<li>";
				}
				menuView += "<a href='?item=" + key + "' class='menu-item'>" + menuNames[key] + "</a></li>";

			}

			// Берем только нужный пункт к примеру [ пицца, роллы, суши ]
			if (item == key) {
				// let nameImg = files[i].split('/')[4];
				let cardGroup = i;
				let cardGroupSize = cardGroup + 'size';
				let cardGroupWeight = cardGroup + 'weight';
				let size30 = '<span style="position: absolute; top: 10px; left: 10px;"><input name=' + cardGroupSize + ' type="radio" id="' + cardGroupSize + '1' + '" checked="checked" /><label for="' + cardGroupSize + '1' + '">30 см</label></span>';
				let size40 = '<span style="position: absolute; top: 43px; left: 10px;"><input name=' + cardGroupSize + ' type="radio" id="' + cardGroupSize + '2' + '" /><label for="' + cardGroupSize + '2' + '">40 см</label></span>';
				let weight300 = '<span style="position: absolute; top: 10px; left: 200px;"><input name=' + cardGroupWeight + ' type="radio" id="' + cardGroupWeight + '1' + '" checked="checked" /><label for="' + cardGroupWeight + '1' + '">300 гр</label></span>';
				let weight400 = '<span style="position: absolute; top: 43px; left: 200px;"><input name=' + cardGroupWeight + ' type="radio" id="' + cardGroupWeight + '2' + '" /><label for="' + cardGroupWeight + '2' + '">400 гр</label></span>';
				contentView += "<div class='food'><div class='col s12 m6'><div class='card'><div class='card-image'><img class='food-img' src='" + files[i].replace('public\\', '') + "'>" + size30 + size40 + weight300 + weight400 + "<span class='card-title' style='color: #2196f3'>" + /*files[i]*/ menuNames[key] + /*' <br>Файл: ' + nameImg +*/ "</span><a class='btn-floating btn-large halfway-fab waves-effect waves-light red'><i class='material-icons add-food'>add</i></a></div><div class='card-content description'><p>Состав: Лосось, сыр фетакса, огурец, авакадо</p></div></div></div></div>";
			}
		}
		//console.log(menuView);
		//console.log(contentView);
		res.render('index', { menuView: menuView, item: item, contentView: contentView });
	}

	function renderPage404(files) {
		console.log('renderPage404 Error: ', err);
		res.render('404');
	}

	getFiles(req.params.organization)
		.then(renderPage, renderPage404);
});

const listener = app.listen(3000, () => {
	console.log('Start server port: ', listener.address().port, '!');
});

// ************************* Scandir *************************
function getFiles(organization, item) {
	organization = organization || '';
	item = item || '';

	return new Promise((resolve, reject) => {
		let scandir = require('scandir').create();
		let files = [];

		scandir.on('file', (file, stats) => {
			files.push(file);
		});

		scandir.on('error', (err) => {
			console.log('scandir err ', err);
			reject(err);
		});

		scandir.on('end', () => {
			resolve(files);
		});

		scandir.scan({
			dir: './public/organizations/' + organization + '/' + item,
			recursive: true,
			filter: /.png|.jpg|.jpeg/i
		});
	});
}