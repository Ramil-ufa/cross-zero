'use strict';

//Контейнер ячеек для игры
const container = document.querySelector('.container');
//Ячейки
const cells = document.querySelectorAll('.container>.container__cell');
//Выигрышные комбинации
const combinations = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6]
];
// name1 - Имя игрока 1 (по умолчанию "игрок1")
// name2 - Имя игрока 2 (по умолчанию "игрок2")
// stateFields - состояние полей (0 - поле свободно 1,2 - поле занято)
// possibleFields - возможные позиции ячеек, на которых можно поставить 
// history - история нажатых ячеек + история выигрышной комбинации + имя кто выиграл после окончании игры
// temp_history - история нажатых ячеек во время игры
// level - уровень (1 - легкий уровень; 2 - средний;)
// flagGame - состояние игры (true - играть можно; false - нельзя)
// variant - вариант игры (1 - с компьютером; 2 - c человеком)
// step - номер хода
// currentGamer - текущий элемент (x или 0)
// numberGame - количество сыгранных игр
let name1 = 'Игрок1',
	name2 = 'Игрок2',
	stateFields = [],
 	possibleFields = [],
 	history = [],
 	temp_history = [],
 	level = 1,
 	flagGame = false,
 	variant = 1,
 	step = 0,
	currentGamer = 'x',
 	numberGame = -1;

//запускаем игру 
startGame();

/**
 * Старт обработчиков
 * Устанавливает обработчик на изменения варианта игры и обработчик на отправки формы
 */
function startGame(){
	addClick('.form__optionType', toggleType);
	addClick('.form__send', sendData);
} 

/**
 * Устанавливает обработчик на кнопку
 * @param {selector} - селектор для нахождения элемента в DOM
 * @param {act} - действие на нажатие
 */
function addClick(selector, act){
	document.querySelector(selector).addEventListener('click', act);
}
/**
 * Удаляет обработчик на кнопку
 * @param {selector} - селектор для нахождения элемента в DOM
 * @param {act} - действие на нажатие
 */
function removeClick(selector, act){
	if (document.querySelector('selector')) {
		document.querySelector(selector).removeEventListener('click', act);
	}
}

/**
 * В зависимости от варианты игры изменяем форму, если вариант игры 1 (с компьютером), то добавляем сложность игры, если нет, то убираем.  
 */
function toggleType(){
	let variant = document.querySelector('.form__option [name="variant"]:checked');
	if ( variant.value === '1') {
		document.querySelectorAll('.form__player .form__title')[0].innerText = 'Игрок:';
		document.querySelectorAll('.form__player')[1].classList.add('form__player_none');
		document.querySelector('.form__optionLevel').classList.remove('form__optionLevel_none');
	}else if ( variant.value === '2') {
		document.querySelectorAll('.form__player .form__title')[0].innerText = 'Игрок 1:';
		document.querySelectorAll('.form__player')[1].classList.remove('form__player_none');
		document.querySelector('.form__optionLevel').classList.add('form__optionLevel_none');
	}
}

/**
 * Обработка данных с формы
 * @param {Object} - event - событие при клике 
 * @description name1 - имя первого игрок, variant - вариант игры, level - уровень игры
 * После обработки делаем инициализацию
 */
function sendData(event){
	event.preventDefault();
	name1 = document.querySelector('.form__player [name="player1"]').value || 'Игрок1',
	variant = Number(document.querySelector('.form__option [name="variant"]:checked').value),
	level = Number(document.querySelector('.form__option [name="level"]:checked').value);

	if (variant === 1) {
		name2 = 'Компьютер';
	}else{
		name2 = document.querySelector('.form__player [name="player2"]').value || 'Игрок2';
	}
	
	document.querySelectorAll('.score .score__title')[0].innerHTML = name1;
	document.querySelectorAll('.score .score__title')[0].setAttribute('title', name1); 
	document.querySelectorAll('.score .score__title')[1].innerHTML = name2;
	document.querySelectorAll('.score .score__title')[1].setAttribute('title', name2); 
	initialization();
}

/**
 * Инициализации игры
 * Определяем вариант игры (если вариант игры 1 и нечетное количество игр, то первый ход производит компьютер)
 */
function initialization(){
	//Сбрасывает параметры для начала игры
	Default();

	if (variant === 1 && numberGame % 2 === 1) {
		computer();	
	}

	//Добавляет обработчик на нажатие ячейки 
	for (let i = 0; i < stateFields.length; i++){
		cells[i].addEventListener('click', clickOnCell);
	}
}

/**
 * Сбрасывает значения, оставшихся после последней игры
 */
function Default(){
	//Разрешает игру
	flagGame = true;
	//Скрывает форму
	document.querySelector('.wrapper').style.display = 'none';
	//Отображает игру
	document.querySelector('.game').style.display = 'block';
	//Удаляет обработчики кнопок на навигации и удаляет навигацию из DOM
	if (document.querySelector('nav')) {
		deleteNav();
	}
	//Удаляет обработчики кнопок в истории и удаляет историю из DOM
	deleteHistory();
	//Отчищает заполненные поля
	stateFields = [0, 0, 0, 0, 0, 0, 0, 0, 0];
	//Устанавливает возможные поля для кликов
	possibleFields = [0, 1, 2, 3, 4, 5, 6, 7, 8];
	//Обнуляет номер хода
	step = 0;
	//Увеличивает количество игр
	numberGame++;
	//Отчищает поля в DOM 
	cells.forEach(cell => {
		cell.classList.remove('win_row');
		cell.innerHTML = '';
	});
	//Сбрасывает текущий элемент
	currentGamer = 'x';
	//Функция, которая подсвечивает имя игрока, который должен ходить 
	switchStep();
}

/**
 * В зависимости от очереди хода подсвечивает имя игрока.
 */
function switchStep(){
	if (numberGame % 2 === 0) {
		if (step % 2 === 0) {
			document.querySelector('.score__player1 .score__title').classList.add('score__title_active');
			document.querySelector('.score__player2 .score__title').classList.remove('score__title_active');
		}else{
			document.querySelector('.score__player1 .score__title').classList.remove('score__title_active');
			document.querySelector('.score__player2 .score__title').classList.add('score__title_active');
		}
	}else{
		if (step % 2 === 1) {
			document.querySelector('.score__player1 .score__title').classList.add('score__title_active');
			document.querySelector('.score__player2 .score__title').classList.remove('score__title_active');
		}else{
			document.querySelector('.score__player1 .score__title').classList.remove('score__title_active');
			document.querySelector('.score__player2 .score__title').classList.add('score__title_active');
		}
	}
}

/**
 * Обработка клика по ячейки
 * @param {Object} - event - событие при клике 
 * @description position - позиция нажатой ячейки
 */
function clickOnCell(event){
	let position = getPosition(event.target);
	//Меняет состояние нажатой ячейки
	changeState(position);
	//Если вариант 1 (игра с компьютером), то вызываем компьютер
	if ( variant === 1 ) {
		computer();
	}
}

/**
 * Возвращает позицию нажатого элемента
 * @param {Object} - element - элемент, который был нажат
 */
function getPosition(element){
	let position = 0;
	while (element.previousSibling) {
	    element = element.previousSibling;
	    if ( element.nodeType === 1) {
	        position++;
	    }   
	}
	return position;
}

/**
 * Выдает рандомную позицию из возможных для хода ячеек
 * @param {array} - array - массив возможных ячеек 
 */
function randomPosition(array){
	return Math.floor( Math.random()*(array.length));
}

/**
 * Определяет действие в зависимости от уровня сложности
 */
function computer(){
	if (flagGame === false) {
		return;
	}
	if (level === 1) {
		easy();
	}else if (level === 2) {
		normal();
	}
}


/**
 * Легкий уровень сложности 
 * Определяет свободное положение и ставит на него символ
 */
function easy(){
	//указывает индекс в poosible
	let position = randomPosition(possibleFields);
	changeState(possibleFields[position]);
}


/**
 * Средний уровень сложности  
 * Состоит из 3 этапов для заполнения ячейки
 * 1 этап - в начале игры пытаемся поставить в центр, если не получается, то ставим по другим позициям.
 * 2 этап - если уже есть по два элемента "х" или "0", то мы сначала пытаемся найти выигрышный ход. Если его нету, то мы проверяем беспроигрышные ходы
 * 3 этап - если нету победных и проигрышных ходов, то возвращаемся к начальной стратегии.
 * @description step - номер хода, currentGamer - текущий элемент; x - 1 || 2 (т.е, если компьютер ставит 1 в массиве possibleFields, то проверяет сначала 1, потом 2 или же наоборот)
 */
function normal(){
	if (step === 0 || step === 1) {
		initialStrategy(step);
		return;
	}
	let x = (currentGamer === 'x' ) ? 1 : 2;
	if (selection(x) === false) {
		x = (x === 1) ? 2 : 1;
		if (selection(x) === false) {
			initialStrategy(step);
		}
	}	
}

/**
 * Начальная стратегия
 * @description safeField - массив безопасных ячеек в начале игры, counter - счетчик цикла while (защита от зацикливания)
 * @description position - рандомная позиция из безопасных ячеек
 */
function initialStrategy(step = -1){
	let safeField = [0, 2, 6, 8];
	if (step === 0 || step === 1) {
		safeField = [4];
	}else if (step === 2 || step === 3) {
		safeField = [1, 3, 5, 7];
	}
	
	let counter = 0;
	while (true){
		let position = randomPosition(safeField);
		//Если ячейка свободная, то ставим на нее символ, если нет, то пробует еще раз
		if ( stateFields[safeField[position]] === 0) {
			changeState(safeField[position]);
			break;
		}
		if (step === 0 || step === 1) {
			safeField = [0, 2, 6, 8];
		}
		
		//Если сделано 10 попыток и не нашел свободную ячейку, то переходим на уровень ниже
		if (counter > 10) {
			easy();
			break;
		}
		//Прибавляет счетчик
		counter++;
	}
}

/**
 * Находит 2 позиции переменной x (x===1||2) в stateFields и отправляет их на проверку выигранных полей, если ничего не нашел, то возвращает false, если нашел, то меняет состояние ячейки
 * @param {х} - определяемое значение 1 || 2
 */
function selection(x){
	for (let i = 0; i < stateFields.length-1; i++){
		if (stateFields[i] === x) {
			for (let j = i + 1; j < stateFields.length; j++){
				if (stateFields[j] === x) {
					let position = checkWinnigField(i, j);
					if (position !== false) {
						changeState(position);
						return true;
					}
				}
			}
		}
	}
	return false;
}


/**
 * Проверяет выигрышное поле. На вход номер ячейки 1 и 2. Потом определяет совпадения этих двух позиции с выигрышными комбинациями. Если совпадение есть, то возвращает позицию ячейки, на которую компьютер сходит. Если нету выигрышных комбинаций, то false 
 * @param {position1} - позиция заполненной ячейки 1
 * @param {position1} - позиция заполненной ячейки 2
 */
function checkWinnigField(position1, position2){
	for (let i = 0; i < combinations.length; i++){
		if (combinations[i][0] === position1 && combinations[i][1] === position2 && stateFields[combinations[i][2]] === 0 ) {
			return combinations[i][2];
		}	
		if (combinations[i][0] === position1 && combinations[i][2] === position2 && stateFields[combinations[i][1]] === 0 ) {
			return combinations[i][1];
		}	
		if (combinations[i][1] === position1 && combinations[i][2] === position2 && stateFields[combinations[i][0]] === 0 ) {
			return combinations[i][0];
		}
	}
	return false;
}

/**
 * Меняет состояние ячейки 
 * @param {position} - позиция ячейки
 */
function changeState(position){
	//Проставляет в эту ячейку текущий символ
	cells[position].innerHTML = currentGamer;
	//Удаляет эту позицию из массива возможных ячеек
	possibleFields.splice(possibleFields.indexOf(position), 1);
	//Удаляет обработчик события на эту ячейку
	cells[position].removeEventListener('click', clickOnCell);

	let name = name1;
	//Определяет какой игрок сейчас сходил
	if (numberGame % 2 === 0) {
		name = (step % 2 === 0) ? name1 : name2; 
	}else{
		name = (step % 2 === 0) ? name2 : name1; 
	}

	//Заносит данные в историю
	temp_history.push({name: name,position : position, symbol : currentGamer});
	if ( currentGamer === 'x' ) {
		currentGamer = '0';
		stateFields[position] = 1;
	}else{
		currentGamer = 'x';
		stateFields[position] = 2;
	}
	//Проверяет, является ли нажатая ячейка выигранной 
	checkWin();
}


/**
 * Проверяет, образовалась ли на поле выигранная комбинация, если да, то останавливает игру. Если ничья, то тоже останавливает  игру
 * @param {position} - позиция ячейки
 */
function checkWin(){
	for (let i = 0; i < combinations.length; i++){
		if (cells[combinations[i][0]].innerHTML === 'x' && cells[combinations[i][1]].innerHTML === 'x' && cells[combinations[i][2]].innerHTML === 'x') {
			console.log('победили крестики');
			stopGame(1, combinations[i]);
			return;
		}else if (cells[combinations[i][0]].innerHTML === '0' && cells[combinations[i][1]].innerHTML === '0' && cells[combinations[i][2]].innerHTML === '0') {
			console.log('победили нолики');
			stopGame(2, combinations[i]);
			return;
		}
	}
	//увеличивает номер хода
	step++;
	if (step >= stateFields.length) {
		stopGame(3);
		console.log('Ничья');
		return;
	}
	//подсвечивает имя, который сейчас должен ходить
	switchStep();
}


/**
 * Останавливает игру
 * @param {result} - результат игры 1 - победили крестики, 2 - победили нолики, 3 - ничья
 * @param {comb} - выигрышная комбинация
 */
function stopGame(result, comb = []){
	flagGame = false;

	//Выделяет выигрышную линию
	for (let i = 0; i < comb.length; i++){
		cells[comb[i]].classList.add('win_row');
	}
	//Удаляет оставшиеся обработчики события на ячейки
	for (let i = 0; i < stateFields.length; i++){
		cells[i].removeEventListener('click', clickOnCell);
	}

	// Имя, кто последний ходил.
	let title = '';
	// Имя в DOM, кто последний ходил, т.е. кто последний ходил, если не ничья, то значит он выиграл
	let lastStep = document.querySelector('.score .score__title_active');
	if (result === 1 || result === 2) {
		//Увеличивает очко того, кто выиграл
		let score = lastStep.parentElement.querySelector('.score__number');
		score.innerHTML = Number(score.innerHTML) + 1;
		if (numberGame % 2 === 0) {
			title = (step % 2 === 0) ? `${name1} выиграл` : `${name2} выйграл`;
		}else{
			title = (step % 2 === 0) ? `${name2} выиграл` : `${name1} выйграл`;
		}
	}else{
		//Если ничья, то удаляет подсвечиваемый элемент 
		lastStep.classList.remove('score__title_active');
		title = 'Ничья';
	}
	// добавляем, кто выиграл и комбинацию
	temp_history.push({
		title : title, 
		combination: comb
	});
	// Заносим историю текущей игры  в историю текущей сессии.
	history.push(temp_history);
	// Обнуляем temp_history
	temp_history = [];
	// Создаем навигацию
	renderNav();
}

/**
 * Создает навигацию и добавляет обработчики на кнопки
 */
function renderNav(){
	let nav = document.createElement('nav');
	nav.className = 'nav';
	nav.innerHTML = `
		<button class="button nav__button" id="continueGame">Играть еще</button>
		<button class="button nav__button" id="resetResult">Сбросить результаты</button>
		<button class="button nav__button" id="backSetting">Вернуться к настройкам</button>
		<button class="button nav__button" id="showHistory" data-act="show">Показать историю</button>
	`;
	document.querySelector('.game').append(nav);
	addClick('#continueGame', continueGame);
	addClick('#resetResult', resetResult);
	addClick('#backSetting', backSetting);
	addClick('#showHistory', historyController);
}

/**
 * Удаляет обработчики кнопок на навигации и удаляет навигацию
 */
function deleteNav(){
	removeClick('#continueGame', continueGame);
	removeClick('#resetResult', resetResult);
	removeClick('#backSetting', backSetting);
	removeClick('#showHistory', historyController);
	document.querySelector('nav').remove();
}



/**
 * Кнопка "играть еще"
 * Запускает процесс инициализации при продолжении игры
 */
function continueGame(){
	initialization();
}

/**
 * Кнопка "сброса результата"
 * Сбрасывает параметры, которые не очищаются в Default()
 */
function resetResult(){
	history = [];
	currentGamer = 'x';
	numberGame = -1;
	//Удаляет историю
	deleteHistory();
	removeClick('#showHistory', historyController);
	//Удаляет кнопку "показать историю"
	document.querySelector('#showHistory').remove();
	removeClick('#resetResult', resetResult);
	//Удалаяет кнопку reset
	this.remove();
	//Очищает очки игроков
	let scores =  document.querySelectorAll('.score .score__number');
	scores.forEach(score => score.innerHTML = '0');
}

/**
 * Открывает настройки для изменения параметров
 * Скрывает игру
 */
function backSetting(){
	document.querySelector('.game').style.display = 'none';
	document.querySelector('.wrapper').style.display = 'block';
	document.querySelector('.wrapper .form__send').innerHTML = 'Изменить параметры';
	document.querySelector('.wrapper .form__back').style.display = 'block';
	addClick('.wrapper .form__back', backGame);
}

/**
 * Закрывает настройки для изменения параметров
 * Открывает игру
 */
function backGame(){
	event.preventDefault();
	document.querySelector('.game').style.display = 'block';
	document.querySelector('.wrapper').style.display = 'none';
	document.querySelector('.wrapper .form__back').style.display = 'none';
	removeClick('.wrapper .form__back', backGame);
}

/**
 * Определяет и устанавливает действие: показать или скрыть историю 
 * @description data - данные для определения состояние кнопки
 */
function historyController(){
	let dataAct = this.getAttribute('data-act');
	if (dataAct === 'show') {
		this.innerHTML = 'Скрыть историю';
		this.setAttribute('data-act', 'hide');
		showHistory();
	}else{
		this.innerHTML = 'Показать историю';
		this.setAttribute('data-act', 'show');
		document.querySelector('.history').style.display = 'none';
	}	
}

/**
 * Удаляет обработчики кнопок в истории и удаляет историю
 */
function deleteHistory(){
	if (document.querySelector('.history')) {
		removeClick('.history', clickController);
		document.querySelector('.history').remove();
	}
}

/**
 * Показывает историю игр. Если ее нет в DOM, то создает
 * Устанавливает обработчик при нажатии на историю 
 */
function showHistory(){
	if ( !document.querySelector('.history') ) {
		createHistory();
	}
	document.querySelector('.history').style.display = 'block';
	addClick('.history', clickController);
}	

/**
 * Создает историю и добавляет в DOM
 */
function createHistory(){
	let historyHtml = document.createElement('div');
	historyHtml.className = 'history';
	let historyItems = '';
	for (let i = 0; i < history.length; i++){
		historyItems += `
			<div class="history-item" data-id="${i}">
				<div class="history-item__link">
					<div class="history-item__title" title="${history[i][history[i].length - 1].title}">${history[i][history[i].length - 1].title}</div>
					<div class="history-item__show" data-act="show">Показать детали</div>
				</div>
			</div>
		`;
	}
	historyHtml.innerHTML = historyItems;
	document.querySelector('.game').append(historyHtml)
}


/**
 * Определяет на какую кнопку нажали в истории: детали отдельной игры или детали определенного хода в отдельной игры
 */
function clickController(event) {
	if (event.target.classList.contains('history-item__show')) {
		contollerDetails(event);
	}else if (event.target.classList.contains('history-nav__step')) {
		DetailsStep(event.target);
	}
}

/**
 * Определяет и устанавливает действие: показать детали игры или скрыть
 * @description itemShow - кнопка конкретной игры
 */
function contollerDetails(event){
	let itemShow = event.target;
	if (itemShow.getAttribute('data-act') === 'show') {
		itemShow.innerHTML = 'Скрыть детали';
		itemShow.setAttribute('data-act', 'hide');
		showDetails(itemShow.closest('.history-item'));
	}else{
		itemShow.innerHTML = 'Показать детали';
		itemShow.setAttribute('data-act', 'show');
		itemShow.closest('.history-item').querySelector('.history-item__details').style.display = 'none';
	}
}

/**
 * Показывает детали конкретной игры. Если ее нет в DOM, то создает
 * @param {historyItem} контайнер истории конкретной игры
 * @description {dataId} - id игры
 * @description {details} - детали игры с id = dataId
 */
function showDetails(historyItem){
	let dataId = historyItem.getAttribute('data-id');
	let details = historyItem.querySelector('.history-item__details');
	// Если детали нет в DOM, то создает и заново находим
	if ( !details ) {
		renderDetail(historyItem, dataId);
		details = historyItem.querySelector('.history-item__details');
	}
	// Показать ходы в этой игре
	showStep(historyItem, dataId);
	// Отображает на странице
	details.style.display = 'block';
}

/**
 * Отображает детали конкретного хода
 * @param {element} кнопка хода на которую нажали
 * @description dataId - id конкретной игры, historyCells - ячейки таблицы конкретной игры
 */
function DetailsStep(element){
	let numberStep = element.getAttribute('data-step');
	let historyItem = element.closest('.history-item');
	let dataId = historyItem.getAttribute('data-id');
	let historyCells = historyItem.querySelectorAll('.history-desk__cell');
	//Очищает предыдущие изменения 
	historyCells.forEach(cell =>{
		cell.innerHTML = '';
		cell.classList.remove('win_row');
	});
	//Отрисовывает ходы
	showStep(historyItem, dataId, numberStep);
}

/**
 * Отрисовывает ходы от первого до того, которого нажали
 * @param {element} - контайнер конкретной истории
 * @param {dataId} - id конкретной истории
 * @param {numberStep} - номер последнего хода, до которого отрисовывает таблицу 
 */
function showStep(element, dataId, numberStep = 0){
	numberStep = Number(numberStep);
	let historyCells = element.querySelectorAll('.history-desk__cell');
	for (let i = 0; i < numberStep + 1; i++){
		let historyElement = history[dataId][i];
		historyCells[historyElement.position].innerHTML = history[dataId][i].symbol;
	}
	// Если мы нажали кнопку последнего хода игры, то выделяет выигрышную комбинацию, которую занесли в историю
	if ( numberStep === history[dataId].length - 2 ) {
		let combination = history[dataId][history[dataId].length - 1].combination;
		for (let i = 0; i < combination.length; i++){
			historyCells[combination[i]].classList.add('win_row');
		}
	}
}


/**
 * Создает историю с id
 * @param {element} - контайнер конкретной истории, куда вставлять детали
 * @param {id} - id конкретной истории
 */
function renderDetail(element, id){
	let detail = document.createElement('div');
	detail.className = 'history-item__details';

	let navContainer = '';
	for (let i = 0; i < history[id].length - 1; i++){
		navContainer += `
			<span class="history-nav__title" title="${history[id][i].name}">${history[id][i].name}:</span>
			<button class="history-nav__step" data-step="${i}">Ход${i+1}</button>
		`;
	}
	detail.innerHTML = `
		<div class="history-nav">
			${navContainer}
		</div>
		<div class="history-desk">
			<div class="history-desk__container">
				<div class="history-desk__cell"></div>
				<div class="history-desk__cell"></div>
				<div class="history-desk__cell"></div>
				<div class="history-desk__cell"></div>
				<div class="history-desk__cell"></div>
				<div class="history-desk__cell"></div>
				<div class="history-desk__cell"></div>
				<div class="history-desk__cell"></div>
				<div class="history-desk__cell"></div>
			</div>
		</div>
	`;
	//Добавляет детали в DOM
	element.append(detail);	
}	